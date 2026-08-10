import { IsInt, Min } from 'class-validator';

export class UpdateMissionDto {
  @IsInt()
  @Min(0)
  progress: number;
}
