import { Controller, Get, Put, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { JwtGuard } from '../common/guards';
import { CurrentUser, JwtPayload } from '../common/decorators';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(JwtGuard)
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.notificationService.findAll(user.sub);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: JwtPayload) {
    return this.notificationService.getUnreadCount(user.sub);
  }

  @Put(':id/read')
  markRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.notificationService.markRead(id, user.sub);
  }

  @Put('read-all')
  markAllRead(@CurrentUser() user: JwtPayload) {
    return this.notificationService.markAllRead(user.sub);
  }
}
