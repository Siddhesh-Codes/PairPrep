import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { CreateMatchRequestDto } from './matching.dto';

@Injectable()
export class MatchingService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async createRequest(requesterId: string, dto: CreateMatchRequestDto) {
    if (requesterId === dto.recipientId) {
      throw new BadRequestException('Cannot send request to yourself');
    }

    // Check for existing pending request between these users
    const existing = await this.prisma.matchRequest.findFirst({
      where: {
        requesterId,
        recipientId: dto.recipientId,
        status: 'pending',
      },
    });
    if (existing) {
      throw new ConflictException('Pending request already exists');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const request = await this.prisma.matchRequest.create({
      data: {
        requesterId,
        recipientId: dto.recipientId,
        interviewTypeId: dto.interviewTypeId,
        message: dto.message,
        expiresAt,
      },
      include: {
        requester: { include: { profile: true } },
        recipient: { include: { profile: true } },
        interviewType: true,
        sessions: true,
      },
    });

    await this.notificationService.create(dto.recipientId, {
      type: 'match_requested',
      title: 'New match request',
      body: `${request.requester.displayName} wants to practice ${request.interviewType.name}`,
      referenceId: request.id,
      referenceType: 'match_request',
    });

    return this.formatRequest(request);
  }

  async getIncoming(userId: string) {
    const requests = await this.prisma.matchRequest.findMany({
      where: { recipientId: userId },
      include: {
        requester: { include: { profile: true } },
        recipient: { include: { profile: true } },
        interviewType: true,
        sessions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return { content: requests.map((r) => this.formatRequest(r)), totalElements: requests.length };
  }

  async getOutgoing(userId: string) {
    const requests = await this.prisma.matchRequest.findMany({
      where: { requesterId: userId },
      include: {
        requester: { include: { profile: true } },
        recipient: { include: { profile: true } },
        interviewType: true,
        sessions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return { content: requests.map((r) => this.formatRequest(r)), totalElements: requests.length };
  }

  async accept(id: string, userId: string) {
    const request = await this.findRequest(id);
    if (request.recipientId !== userId) throw new ForbiddenException();
    if (request.status !== 'pending') throw new BadRequestException('Request is not pending');

    const updated = await this.prisma.matchRequest.update({
      where: { id },
      data: { status: 'accepted' },
      include: {
        requester: { include: { profile: true } },
        recipient: { include: { profile: true } },
        interviewType: true,
        sessions: true,
      },
    });

    await this.notificationService.create(request.requesterId, {
      type: 'match_accepted',
      title: 'Match request accepted!',
      body: `${updated.recipient.displayName} accepted your ${updated.interviewType.name} request`,
      referenceId: id,
      referenceType: 'match_request',
    });

    return this.formatRequest(updated);
  }

  async decline(id: string, userId: string) {
    const request = await this.findRequest(id);
    if (request.recipientId !== userId) throw new ForbiddenException();
    if (request.status !== 'pending') throw new BadRequestException('Request is not pending');

    const updated = await this.prisma.matchRequest.update({
      where: { id },
      data: { status: 'declined' },
      include: {
        requester: { include: { profile: true } },
        recipient: { include: { profile: true } },
        interviewType: true,
        sessions: true,
      },
    });

    await this.notificationService.create(request.requesterId, {
      type: 'match_declined',
      title: 'Match request declined',
      body: `${updated.recipient.displayName} declined your request`,
      referenceId: id,
      referenceType: 'match_request',
    });

    return this.formatRequest(updated);
  }

  async cancel(id: string, userId: string) {
    const request = await this.findRequest(id);
    if (request.requesterId !== userId) throw new ForbiddenException();
    if (request.status !== 'pending') throw new BadRequestException('Request is not pending');

    await this.prisma.matchRequest.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return { message: 'Request cancelled' };
  }

  private async findRequest(id: string) {
    const request = await this.prisma.matchRequest.findUnique({
      where: { id },
      include: {
        requester: { include: { profile: true } },
        recipient: { include: { profile: true } },
        interviewType: true,
        sessions: true,
      },
    });
    if (!request) throw new NotFoundException('Match request not found');
    return request;
  }

  private formatRequest(r: any) {
    let status = r.status;
    if (r.status === 'accepted' && r.sessions && r.sessions.some((s: any) => s.status === 'scheduled' || s.status === 'completed')) {
      status = 'scheduled';
    }
    return {
      id: r.id,
      requesterId: r.requesterId,
      requesterDisplayName: r.requester?.displayName,
      requesterAvatarUrl: r.requester?.profile?.avatarUrl,
      requesterLinkedin: r.requester?.profile?.isLinkedinPublic ? r.requester?.profile?.linkedin : null,
      requesterGithub: r.requester?.profile?.isGithubPublic ? r.requester?.profile?.github : null,
      requesterLeetcode: r.requester?.profile?.isLeetcodePublic ? r.requester?.profile?.leetcode : null,
      
      recipientId: r.recipientId,
      recipientDisplayName: r.recipient?.displayName,
      recipientAvatarUrl: r.recipient?.profile?.avatarUrl,
      recipientLinkedin: r.recipient?.profile?.isLinkedinPublic ? r.recipient?.profile?.linkedin : null,
      recipientGithub: r.recipient?.profile?.isGithubPublic ? r.recipient?.profile?.github : null,
      recipientLeetcode: r.recipient?.profile?.isLeetcodePublic ? r.recipient?.profile?.leetcode : null,
      
      interviewTypeId: r.interviewTypeId,
      interviewTypeName: r.interviewType?.name,
      status,
      message: r.message,
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
    };
  }
}
