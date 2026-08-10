import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  classId: string;

  @IsOptional()
  @IsString()
  lessonId?: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;
}
