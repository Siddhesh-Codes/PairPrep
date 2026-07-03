import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../common/guards';
import { CurrentUser, JwtPayload } from '../common/decorators';
import { UserService } from './user.service';
import { UpdateProfileDto, UpdateInterestsDto, UpdateAvailabilityDto } from './user.dto';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('interview-types')
  getInterviewTypes() {
    return this.userService.getInterviewTypes();
  }

  @Get('profiles/me')
  @UseGuards(JwtGuard)
  getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.userService.getProfile(user.sub);
  }

  @Put('profiles/me')
  @UseGuards(JwtGuard)
  updateMyProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(user.sub, dto);
  }

  @Put('profiles/me/interests')
  @UseGuards(JwtGuard)
  updateMyInterests(@CurrentUser() user: JwtPayload, @Body() dto: UpdateInterestsDto) {
    return this.userService.updateInterests(user.sub, dto);
  }

  @Put('profiles/me/availability')
  @UseGuards(JwtGuard)
  updateMyAvailability(@CurrentUser() user: JwtPayload, @Body() dto: UpdateAvailabilityDto) {
    return this.userService.updateAvailability(user.sub, dto);
  }
}
