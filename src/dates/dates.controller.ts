import { Controller, Param, ParseIntPipe, Post, Body } from '@nestjs/common';
import { DatesService } from './dates.service';

@Controller('dates')
export class DatesController {
  constructor(private readonly datesService: DatesService) {}

  @Post(':suggestionId/accept')
  acceptDate(
    @Param('suggestionId', ParseIntPipe) suggestionId: number,
    @Body('userId') userId: number, // In a real app this would come from an auth guard
  ) {
    if (!userId) {
      throw new Error('userId is required in the body');
    }
    return this.datesService.acceptDate(suggestionId, userId);
  }
}
