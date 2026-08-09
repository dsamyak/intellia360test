import { Role } from '@prisma/client';

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  studentProfile?: any;
  teacherProfile?: any;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: Partial<UserResponseDto>) {
    Object.assign(this, user);
  }
}
