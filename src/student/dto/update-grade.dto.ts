import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateGradeDto {
  @IsString()
  @IsNotEmpty()
  grade: string;
}
