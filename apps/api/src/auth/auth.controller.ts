import { Controller, Post, Body, Res, Req, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response, Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from './auth.dto';

const isDeployed =
  process.env.NODE_ENV === 'production' ||
  process.env.RENDER === 'true' ||
  (process.env.CORS_ORIGINS && process.env.CORS_ORIGINS.includes('https://'));

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: !!isDeployed,
  sameSite: (isDeployed ? 'none' : 'lax') as 'none' | 'lax',
  path: '/',
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('forgot-password')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  // Strict rate limit: 5 registration attempts per minute
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    this.setTokenCookies(res, result.accessToken, result.refreshToken);
    return result.user;
  }

  // Strict rate limit: 5 login attempts per minute
  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto);
    this.setTokenCookies(res, result.accessToken, result.refreshToken);
    return result.user;
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    const result = await this.authService.refresh(refreshToken);
    this.setTokenCookies(res, result.accessToken, result.refreshToken);
    return result.user;
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refresh_token;
    const accessToken = req.cookies?.access_token;

    let userId: string | undefined;
    if (accessToken) {
      try {
        const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
        const payload = jwt.verify(accessToken, secret, { ignoreExpiration: true }) as any;
        userId = payload?.sub;
      } catch {
        // Ignore verify errors for logout
      }
    }

    if (userId || refreshToken) {
      await this.authService.logout(userId, refreshToken);
    }

    res.clearCookie('access_token', COOKIE_OPTIONS);
    res.clearCookie('refresh_token', COOKIE_OPTIONS);
    return { message: 'Logged out' };
  }

  private setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('access_token', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 min
    });
    res.cookie('refresh_token', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
