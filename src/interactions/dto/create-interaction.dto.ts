import { IsEnum, IsInt } from 'class-validator';

export class CreateInteractionDto {
  @IsInt()
  senderId!: number;

  @IsInt()
  receiverId!: number;

  @IsEnum(['like', 'dislike'])
  actionType!: 'like' | 'dislike';
}

