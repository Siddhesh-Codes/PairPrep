import { Controller, Post, Get, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { JwtGuard } from '../common/guards';
import { CurrentUser, JwtPayload } from '../common/decorators';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './feedback.dto';

@Controller()
@UseGuards(JwtGuard)
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @Post('sessions/:id/feedback')
  create(
    @Param('id', ParseUUIDPipe) sessionId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.feedbackService.create(sessionId, user.sub, dto);
  }

  @Get('sessions/:id/feedback')
  getForSession(@Param('id', ParseUUIDPipe) sessionId: string, @CurrentUser() user: JwtPayload) {
    return this.feedbackService.getForSession(sessionId, user.sub);
  }

  @Get('profiles/:id/feedback-summary')
  getFeedbackSummary(@Param('id', ParseUUIDPipe) profileUserId: string) {
    return this.feedbackService.getFeedbackSummary(profileUserId);
  }
}
