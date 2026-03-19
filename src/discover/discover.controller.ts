import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { DiscoverService } from './discover.service';

@Controller('discover')
export class DiscoverController {
  constructor(private readonly discoverService: DiscoverService) {}

  @Get(':userId')
  getForUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.discoverService.getCandidateProfiles(userId);
  }

  @Post(':userId/regenerate')
  regenerate(@Param('userId', ParseIntPipe) userId: number) {
    return this.discoverService.regenerateForUser(userId);
  }
}

