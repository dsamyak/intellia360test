import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CompleteActivityDto {
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsString()
  @IsNotEmpty()
  activityType: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  xpReward?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  gemsReward?: number;
}
