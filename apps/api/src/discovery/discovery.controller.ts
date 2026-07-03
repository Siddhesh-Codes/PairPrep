import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../common/guards';
import { CurrentUser, JwtPayload } from '../common/decorators';
import { DiscoveryService } from './discovery.service';

@Controller('discover')
@UseGuards(JwtGuard)
export class DiscoveryController {
  constructor(private discoveryService: DiscoveryService) {}

  @Get()
  discover(
    @CurrentUser() user: JwtPayload,
    @Query('types') types?: string,
    @Query('level') level?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    console.log('[API] /discover called', { userId: user?.sub, types, level, search, page, limit });
    const typeIds = types ? types.split(',').filter(Boolean) : undefined;
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.discoveryService.discover(user?.sub, typeIds, level, search, pageNum, limitNum);
  }
}

