import { IsInt, IsBoolean, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateFeedbackDto {
  @IsInt()
  match_id!: number;

  @IsInt()
  reviewer_id!: number;

  @IsInt()
  reviewee_id!: number;

  @IsInt()
  suggestion_id!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  place_rating!: number;

  @IsBoolean()
  go_again!: boolean;

  @IsOptional()
  @IsString()
  comment?: string;
}