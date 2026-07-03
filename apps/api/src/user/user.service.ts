import { Injectable, NotFoundException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, UpdateInterestsDto, UpdateAvailabilityDto } from './user.dto';
import { DayOfWeek, TimeSlot, ExperienceLevel } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            interests: { include: { interviewType: true } },
            availability: true,
          },
        },
      },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    return {
      id: profile.id,
      userId: profile.userId,
      displayName: profile.user.displayName,
      bio: profile.bio,
      experienceLevel: profile.experienceLevel,
      avatarUrl: profile.avatarUrl,
      timezone: profile.timezone,
      profileComplete: profile.profileComplete,
      sessionsCompleted: profile.sessionsCompleted,
      avgRating: profile.avgRating,
      ratingCount: profile.ratingCount,
      linkedin: profile.linkedin,
      github: profile.github,
      leetcode: profile.leetcode,
      isLinkedinPublic: profile.isLinkedinPublic,
      isGithubPublic: profile.isGithubPublic,
      isLeetcodePublic: profile.isLeetcodePublic,
      interests: profile.user.interests.map((i) => ({
        id: i.interviewType.id,
        name: i.interviewType.name,
        slug: i.interviewType.slug,
      })),
      availability: profile.user.availability.map((a) => ({
        day: a.day,
        slot: a.slot,
      })),
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.displayName) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { displayName: dto.displayName },
      });
    }

    let avatarUrl = dto.avatarUrl;
    if (avatarUrl && avatarUrl.startsWith('data:image/')) {
      avatarUrl = await this.saveBase64Avatar(userId, avatarUrl);
    }

    await this.prisma.profile.update({
      where: { userId },
      data: {
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.experienceLevel && { experienceLevel: dto.experienceLevel as ExperienceLevel }),
        ...(dto.avatarUrl !== undefined && { avatarUrl }),
        ...(dto.linkedin !== undefined && { linkedin: dto.linkedin }),
        ...(dto.github !== undefined && { github: dto.github }),
        ...(dto.leetcode !== undefined && { leetcode: dto.leetcode }),
        ...(dto.isLinkedinPublic !== undefined && { isLinkedinPublic: dto.isLinkedinPublic }),
        ...(dto.isGithubPublic !== undefined && { isGithubPublic: dto.isGithubPublic }),
        ...(dto.isLeetcodePublic !== undefined && { isLeetcodePublic: dto.isLeetcodePublic }),
      },
    });

    await this.checkProfileComplete(userId);

    return this.getProfile(userId);
  }

  private async saveBase64Avatar(userId: string, dataUrl: string): Promise<string> {
    try {
      const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return dataUrl;
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(base64Data, 'base64');

      let ext = 'png';
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
      else if (mimeType.includes('gif')) ext = 'gif';
      else if (mimeType.includes('webp')) ext = 'webp';

      const fileName = `avatar-${userId}.${ext}`;
      const uploadsDir = join(process.cwd(), 'public', 'uploads');

      await fs.mkdir(uploadsDir, { recursive: true });

      const filePath = join(uploadsDir, fileName);
      await fs.writeFile(filePath, buffer);

      console.log(`[AVATAR_UPLOAD] Avatar saved to disk: ${filePath}`);

      return `/uploads/${fileName}?v=${Date.now()}`;
    } catch (err) {
      console.error('[AVATAR_UPLOAD] Error saving base64 avatar:', err);
      return dataUrl;
    }
  }

  async updateInterests(userId: string, dto: UpdateInterestsDto) {
    await this.prisma.userInterviewInterest.deleteMany({
      where: { userId },
    });

    if (dto.interviewTypeIds.length > 0) {
      await this.prisma.userInterviewInterest.createMany({
        data: dto.interviewTypeIds.map((interviewTypeId) => ({
          userId,
          interviewTypeId,
        })),
      });
    }

    await this.checkProfileComplete(userId);
    return this.getProfile(userId);
  }

  async updateAvailability(userId: string, dto: UpdateAvailabilityDto) {
    await this.prisma.userAvailability.deleteMany({
      where: { userId },
    });

    if (dto.slots.length > 0) {
      await this.prisma.userAvailability.createMany({
        data: dto.slots.map((s) => ({
          userId,
          day: s.day as DayOfWeek,
          slot: s.slot as TimeSlot,
        })),
      });
    }

    await this.checkProfileComplete(userId);
    return this.getProfile(userId);
  }

  async getInterviewTypes() {
    return this.prisma.interviewType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  private async checkProfileComplete(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    const interests = await this.prisma.userInterviewInterest.count({ where: { userId } });
    const availability = await this.prisma.userAvailability.count({ where: { userId } });

    const isComplete =
      !!profile?.bio &&
      profile.bio.length >= 10 &&
      !!profile.experienceLevel &&
      interests > 0 &&
      availability > 0;

    if (profile?.profileComplete !== isComplete) {
      await this.prisma.profile.update({
        where: { userId },
        data: { profileComplete: isComplete },
      });
    }
  }
}
