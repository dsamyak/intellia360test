import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class SubmitAssignmentDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  scorePercent?: number;
}
