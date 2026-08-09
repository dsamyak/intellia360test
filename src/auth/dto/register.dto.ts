import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be ADMIN, STUDENT, PARENT, TEACHER, or SCHOOL' })
  role?: Role;

  @IsOptional()
  @IsString({ message: 'Grade must be a string' })
  grade?: string;

  @IsOptional()
  @IsString({ message: 'School name must be a string' })
  schoolName?: string;
}
