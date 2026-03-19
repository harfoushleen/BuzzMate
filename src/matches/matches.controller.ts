import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { MatchesService } from './matches.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get('user/:userId')
  listForUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.matchesService.listForUser(userId);
  }
}

