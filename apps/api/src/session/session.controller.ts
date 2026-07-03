import { Controller, Post, Get, Put, Param, Query, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { JwtGuard } from '../common/guards';
import { CurrentUser, JwtPayload } from '../common/decorators';
import { SessionService } from './session.service';
import { CreateSessionDto, CancelSessionDto } from './session.dto';

@Controller('sessions')
@UseGuards(JwtGuard)
export class SessionController {
  constructor(private sessionService: SessionService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateSessionDto) {
    return this.sessionService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query('status') status?: string) {
    return this.sessionService.findAll(user.sub, status);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.sessionService.findOne(id, user.sub);
  }

  @Put(':id/complete')
  complete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload) {
    return this.sessionService.complete(id, user.sub);
  }

  @Put(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CancelSessionDto,
  ) {
    return this.sessionService.cancel(id, user.sub, dto);
  }
}
