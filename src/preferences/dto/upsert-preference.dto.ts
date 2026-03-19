import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpsertPreferenceDto {
  @IsInt()
  @Min(18)
  minAge!: number;

  @IsInt()
  @Max(120)
  maxAge!: number;

  @IsInt()
  @Min(1)
  @Max(500)
  maxDistance!: number;

  @IsEnum(['male', 'female', 'other', 'any'])
  preferredGender!: 'male' | 'female' | 'other' | 'any';

  @IsEnum(['casual', 'romantic', 'adventurous', 'unsure'])
  dateMood!: 'casual' | 'romantic' | 'adventurous' | 'unsure';

  @IsInt()
  @Min(1)
  @Max(5)
  maxPriceTier!: number;

  @IsOptional()
  @IsString({ each: true })
  hobbies?: string[];

  @IsOptional()
  @IsString()
  opener?: string;
}

