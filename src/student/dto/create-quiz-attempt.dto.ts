import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateQuizAttemptDto {
  @IsString()
  @IsNotEmpty()
  lessonId: string;

  @IsString()
  @IsNotEmpty()
  quizId: string;

  @IsInt()
  @Min(0)
  @Max(100)
  scorePercent: number;
}
