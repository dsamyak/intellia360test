import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, name, role, grade, schoolName } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userRole = role || Role.STUDENT;

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: userRole,
        },
      });

      if (userRole === Role.TEACHER) {
        await tx.teacherProfile.create({
          data: {
            userId: newUser.id,
            schoolName: schoolName || null,
          },
        });
      } else {
        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            grade: grade || 'grade1',
            xpPoints: 0,
            learningGems: 0,
            streakDays: 1,
            lastActiveDate: new Date(),
          },
        });
      }

      return tx.user.findUnique({
        where: { id: newUser.id },
        include: {
          studentProfile: true,
          teacherProfile: true,
        },
      });
    });

    return this.sanitizeUser(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return this.sanitizeUser(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    return users.map((user) => this.sanitizeUser(user));
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    await this.findById(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        studentProfile: true,
        teacherProfile: true,
      },
    });

    return this.sanitizeUser(updatedUser);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Helper function to sanitize user object by removing sensitive fields (password hash)
   */
  private sanitizeUser(user: any): UserResponseDto {
    if (!user) return null as any;
    const { password, ...sanitized } = user;
    return new UserResponseDto(sanitized);
  }
}
