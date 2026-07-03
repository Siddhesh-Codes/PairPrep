import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './auth.dto';

const JWT_SECRET = () => process.env.JWT_SECRET || 'dev-secret-change-me';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        displayName: dto.displayName,
        profile: { create: {} },
      },
      include: { profile: true },
    });

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: this.formatUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: this.formatUser(user),
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    const tokenHash = this.hashToken(refreshToken);

    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: { include: { profile: true } },
      },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Delete old token (rotation)
    await this.prisma.refreshToken.delete({ where: { id: stored.id } });

    const tokens = await this.generateTokens(stored.user.id, stored.user.email);

    return {
      user: this.formatUser(stored.user),
      ...tokens,
    };
  }

  async logout(userId?: string, refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.prisma.refreshToken.deleteMany({
        where: {
          tokenHash,
          ...(userId && { userId }),
        },
      });
    } else if (userId) {
      // Delete all refresh tokens for user
      await this.prisma.refreshToken.deleteMany({
        where: { userId },
      });
    }
  }

  private async generateTokens(userId: string, email: string) {
    const accessToken = jwt.sign(
      { sub: userId, email },
      JWT_SECRET(),
      { expiresIn: ACCESS_TOKEN_EXPIRY },
    );

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = this.hashToken(rawRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private formatUser(user: any) {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      profileId: user.profile?.id || null,
      profileComplete: user.profile?.profileComplete || false,
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // To prevent enumeration, return success even if user is not found.
    if (!user) {
      return { message: 'If the email exists, a reset link has been generated.' };
    }

    // Generate reset token using JWT secret + user's current password hash
    const resetSecret = JWT_SECRET() + user.passwordHash;
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      resetSecret,
      { expiresIn: '1h' },
    );

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    console.log(`[PASSWORD_RESET] Link generated for ${user.email}: ${resetLink}`);

    // Return the token in non-production/development to facilitate testing!
    if (process.env.NODE_ENV !== 'production') {
      return {
        message: 'If the email exists, a reset link has been generated.',
        resetLink,
        token, // Return token for development/automated testing
      };
    }

    return { message: 'If the email exists, a reset link has been generated.' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    // 1. Decode token to get user ID without verification first
    const decoded = jwt.decode(dto.token) as any;
    if (!decoded || !decoded.sub) {
      throw new BadRequestException('Invalid or malformed token');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[45][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(decoded.sub)) {
      throw new BadRequestException('Invalid or malformed token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      throw new BadRequestException('Invalid token or user does not exist');
    }

    // 2. Verify token using JWT secret + user's password hash
    try {
      jwt.verify(dto.token, JWT_SECRET() + user.passwordHash);
    } catch {
      throw new BadRequestException('Token has expired or is invalid');
    }

    // 3. Hash new password and update user
    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // 4. Revoke all active sessions (refresh tokens) so they must login again
    await this.prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    return { message: 'Password has been reset successfully' };
  }
}
