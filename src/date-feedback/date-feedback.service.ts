import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DateFeedback } from './date-feedback.entity';
import { CreateFeedbackDto } from './date-feedback.dto';

@Injectable()
export class DateFeedbackService {
  constructor(
    @InjectRepository(DateFeedback)
    private readonly feedbackRepo: Repository<DateFeedback>,
  ) {}

  async submitFeedback(dto: CreateFeedbackDto): Promise<{ message: string }> {
  const existing = await this.feedbackRepo.findOne({
    where: {
      suggestion_id: dto.suggestion_id,   
      reviewer_id:   dto.reviewer_id,
    },
  });

  if (existing)
    throw new BadRequestException('You already submitted feedback for this date.');

  const feedback = this.feedbackRepo.create({
    suggestion_id: dto.suggestion_id,    
    match_id:      dto.match_id,
    reviewer_id:   dto.reviewer_id,
    reviewee_id:   dto.reviewee_id,
    rating:        dto.rating,
    place_rating:  dto.place_rating,
    go_again:      dto.go_again,
    comment:       dto.comment ?? null,
  });

  await this.feedbackRepo.save(feedback);
  return { message: 'Feedback submitted successfully!' };
}

async hasSubmittedFeedback(suggestionId: number, reviewerId: number): Promise<boolean> {
  const existing = await this.feedbackRepo.findOne({
    where: {
      suggestion_id: suggestionId,     
      reviewer_id:   reviewerId,
    },
  });
  return !!existing;
}
}