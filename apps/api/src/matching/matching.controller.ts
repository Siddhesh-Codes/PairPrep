import { Controller, Post, Get, Put, Delete, Param, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { JwtGuard } from '../common/guards';
import { CurrentUser, JwtPayload } from '../common/decorators';
import { MatchingService } from './matching.service';
import { CreateMatchRequestDto } from './matching.dto';

@Controller('match-requests')
@UseGuards(JwtGuard)
export class MatchingController {
  constructor(private matchingService: MatchingService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateMatchRequestDto) {
    return this.matchingService.createRequest(user.sub, dto);
  }

  @Get('incoming')
  getIncoming(@CurrentUser() user: JwtPayload) {
    return this.matchingService.getIncoming(user.sub);
  }

  @Get('outgoing')
  getOutgoing(@CurrentUser() user: JwtPayload) {
    return this.matchingService.getOutgoing(user.sub);
  }

  @Put(':id/accept')
  accept(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.matchingService.accept(id, user.sub);
  }

  @Put(':id/decline')
  decline(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.matchingService.decline(id, user.sub);
  }

  @Delete(':id')
  cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.matchingService.cancel(id, user.sub);
  }
}
