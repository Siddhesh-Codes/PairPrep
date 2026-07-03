import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateSessionDto, CancelSessionDto } from './session.dto';

@Injectable()
export class SessionService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async create(schedulerId: string, dto: CreateSessionDto) {
    const session = await this.prisma.session.create({
      data: {
        schedulerId,
        partnerId: dto.partnerId,
        interviewTypeId: dto.interviewTypeId,
        matchRequestId: dto.matchRequestId,
        scheduledAt: new Date(dto.scheduledAt),
        durationMinutes: dto.durationMinutes || 60,
        meetingLink: dto.meetingLink || '',
        notes: dto.notes,
      },
      include: {
        scheduler: true,
        partner: true,
        interviewType: true,
      },
    });

    await this.notificationService.create(dto.partnerId, {
      type: 'session_scheduled',
      title: 'Session scheduled',
      body: `${session.scheduler.displayName} scheduled a ${session.interviewType.name} session`,
      referenceId: session.id,
      referenceType: 'session',
    });

    return this.formatSession(session);
  }

  async findAll(userId: string, status?: string) {
    const where: any = {
      OR: [{ schedulerId: userId }, { partnerId: userId }],
    };
    if (status) where.status = status;

    const sessions = await this.prisma.session.findMany({
      where,
      include: { scheduler: true, partner: true, interviewType: true, feedback: { select: { reviewerId: true } } },
      orderBy: { scheduledAt: 'desc' },
    });

    return {
      content: sessions.map((s) => this.formatSession(s, userId)),
      totalElements: sessions.length,
    };
  }

  async findOne(id: string, userId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: { scheduler: true, partner: true, interviewType: true, feedback: true },
    });
    if (!session) throw new NotFoundException();
    if (session.schedulerId !== userId && session.partnerId !== userId) {
      throw new ForbiddenException();
    }
    return this.formatSession(session);
  }

  async complete(id: string, userId: string) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) throw new NotFoundException();
    if (session.schedulerId !== userId && session.partnerId !== userId) {
      throw new ForbiddenException();
    }
    if (session.status !== 'scheduled') throw new BadRequestException('Session is not scheduled');

    const updated = await this.prisma.session.update({
      where: { id },
      data: { status: 'completed' },
      include: { scheduler: true, partner: true, interviewType: true },
    });

    // Update session counts
    await this.prisma.profile.updateMany({
      where: { userId: { in: [session.schedulerId, session.partnerId] } },
      data: { sessionsCompleted: { increment: 1 } },
    });

    const otherId = session.schedulerId === userId ? session.partnerId : session.schedulerId;
    await this.notificationService.create(otherId, {
      type: 'session_completed',
      title: 'Session completed',
      body: `Your ${updated.interviewType.name} session has been marked complete. Leave feedback!`,
      referenceId: id,
      referenceType: 'session',
    });

    return this.formatSession(updated);
  }

  async cancel(id: string, userId: string, dto: CancelSessionDto) {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) throw new NotFoundException();
    if (session.schedulerId !== userId && session.partnerId !== userId) {
      throw new ForbiddenException();
    }
    if (session.status !== 'scheduled') throw new BadRequestException('Session is not scheduled');

    const updated = await this.prisma.session.update({
      where: { id },
      data: { status: 'cancelled', notes: dto.reason || session.notes },
      include: { scheduler: true, partner: true, interviewType: true },
    });

    const otherId = session.schedulerId === userId ? session.partnerId : session.schedulerId;
    await this.notificationService.create(otherId, {
      type: 'session_cancelled',
      title: 'Session cancelled',
      body: `${updated.interviewType.name} session has been cancelled`,
      referenceId: id,
      referenceType: 'session',
    });

    return this.formatSession(updated);
  }

  private formatSession(s: any, currentUserId?: string) {
    const formatted: any = {
      id: s.id,
      schedulerId: s.schedulerId,
      schedulerDisplayName: s.scheduler?.displayName,
      partnerId: s.partnerId,
      partnerDisplayName: s.partner?.displayName,
      interviewTypeId: s.interviewTypeId,
      interviewTypeName: s.interviewType?.name,
      matchRequestId: s.matchRequestId,
      status: s.status,
      scheduledAt: s.scheduledAt,
      durationMinutes: s.durationMinutes,
      meetingLink: s.meetingLink,
      notes: s.notes,
      createdAt: s.createdAt,
    };
    if (s.feedback && currentUserId) {
      formatted.myFeedbackSubmitted = s.feedback.some(
        (f: any) => f.reviewerId === currentUserId,
      );
    }
    return formatted;
  }
}
