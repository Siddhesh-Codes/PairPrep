import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateFeedbackDto } from './feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(sessionId: string, reviewerId: string, dto: CreateFeedbackDto) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { scheduler: true, partner: true, interviewType: true },
    });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status !== 'completed') throw new BadRequestException('Session is not completed');
    if (session.schedulerId !== reviewerId && session.partnerId !== reviewerId) {
      throw new ForbiddenException();
    }

    const revieweeId = session.schedulerId === reviewerId ? session.partnerId : session.schedulerId;

    // Check for existing feedback
    const existing = await this.prisma.feedback.findUnique({
      where: { sessionId_reviewerId: { sessionId, reviewerId } },
    });
    if (existing) throw new ConflictException('Feedback already submitted');

    const feedback = await this.prisma.feedback.create({
      data: {
        sessionId,
        reviewerId,
        revieweeId,
        technicalScore: dto.technicalScore,
        communicationScore: dto.communicationScore,
        problemSolvingScore: dto.problemSolvingScore,
        overallRating: dto.overallRating,
        strengths: dto.strengths || '',
        improvements: dto.improvements || '',
        notes: dto.notes || '',
      },
    });

    // Update reviewee's aggregate rating
    const aggregate = await this.prisma.feedback.aggregate({
      where: { revieweeId },
      _avg: {
        overallRating: true,
      },
      _count: {
        id: true,
      },
    });

    const avgRating = aggregate._avg.overallRating || 0;
    const ratingCount = aggregate._count.id || 0;

    await this.prisma.profile.update({
      where: { userId: revieweeId },
      data: {
        avgRating: Math.round(avgRating * 10) / 10,
        ratingCount,
      },
    });

    await this.notificationService.create(revieweeId, {
      type: 'feedback_received',
      title: 'New feedback received',
      body: `You received feedback for your ${session.interviewType.name} session`,
      referenceId: sessionId,
      referenceType: 'session',
    });

    return feedback;
  }

  async getForSession(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException();
    if (session.schedulerId !== userId && session.partnerId !== userId) {
      throw new ForbiddenException();
    }

    return this.prisma.feedback.findMany({
      where: { sessionId },
      include: { reviewer: { select: { displayName: true } } },
    });
  }

  async getFeedbackSummary(profileUserId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId: profileUserId },
    });
    if (!profile) throw new NotFoundException();

    const feedback = await this.prisma.feedback.findMany({
      where: { revieweeId: profileUserId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { reviewer: { select: { displayName: true } } },
    });

    return {
      avgRating: profile.avgRating,
      ratingCount: profile.ratingCount,
      recentFeedback: feedback,
    };
  }
}
