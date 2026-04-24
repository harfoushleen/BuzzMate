import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DateFeedbackController } from './date-feedback.controller';
import { DateFeedbackService } from './date-feedback.service';
import { DateFeedback } from './date-feedback.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DateFeedback])],
  controllers: [DateFeedbackController],
  providers: [DateFeedbackService],
})
export class DateFeedbackModule {}