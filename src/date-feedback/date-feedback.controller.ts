import { Controller, Post, Get, Body, Param, ParseIntPipe } from '@nestjs/common';
import { DateFeedbackService } from './date-feedback.service';
import { CreateFeedbackDto } from './date-feedback.dto';

@Controller('feedback')
export class DateFeedbackController {
  constructor(private readonly feedbackService: DateFeedbackService) {}

  // POST /feedback → submit feedback
  @Post()
  submitFeedback(@Body() dto: CreateFeedbackDto) {
    return this.feedbackService.submitFeedback(dto);
  }

  // GET /feedback/check/:matchId/:reviewerId → check if already submitted
 @Get('check/:suggestionId/:reviewerId')
async checkFeedback(
  @Param('suggestionId', ParseIntPipe) suggestionId: number,
  @Param('reviewerId',   ParseIntPipe) reviewerId:   number,
) {
  const submitted = await this.feedbackService.hasSubmittedFeedback(suggestionId, reviewerId);
  return { submitted };
}
}