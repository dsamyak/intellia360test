import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { TeacherService } from './teacher.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';

@Controller('teacher')
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ResponseMessage('Teacher profile retrieved successfully')
  getProfile(@GetUser() user: UserResponseDto) {
    return this.teacherService.getProfile(user.id);
  }

  @Get('classes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ResponseMessage('Teacher classes retrieved successfully')
  getClasses(@GetUser() user: UserResponseDto) {
    return this.teacherService.getClasses(user.id);
  }

  @Post('classes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ResponseMessage('Class created successfully')
  createClass(
    @GetUser() user: UserResponseDto,
    @Body() dto: CreateClassDto,
  ) {
    return this.teacherService.createClass(user.id, dto);
  }

  @Get('classes/:id/roster')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ResponseMessage('Class roster retrieved successfully')
  getRoster(
    @GetUser() user: UserResponseDto,
    @Param('id') classId: string,
  ) {
    return this.teacherService.getRoster(user.id, classId);
  }

  @Get('classes/:id/topic-analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ResponseMessage('Topic analytics retrieved successfully')
  getTopicAnalytics(
    @GetUser() user: UserResponseDto,
    @Param('id') classId: string,
  ) {
    return this.teacherService.getTopicAnalytics(user.id, classId);
  }

  @Get('assignments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ResponseMessage('Assignments retrieved successfully')
  getAssignments(
    @GetUser() user: UserResponseDto,
    @Query('classId') classId?: string,
  ) {
    return this.teacherService.getAssignments(user.id, classId);
  }

  @Post('assignments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ResponseMessage('Assignment created successfully')
  createAssignment(
    @GetUser() user: UserResponseDto,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.teacherService.createAssignment(user.id, dto);
  }

  @Patch('assignments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ResponseMessage('Assignment updated successfully')
  updateAssignment(
    @GetUser() user: UserResponseDto,
    @Param('id') assignmentId: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.teacherService.updateAssignment(user.id, assignmentId, dto);
  }

  @Post('assignments/:id/submissions')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Assignment submitted successfully')
  submitAssignment(
    @GetUser() user: UserResponseDto,
    @Param('id') assignmentId: string,
    @Body() dto: SubmitAssignmentDto,
  ) {
    return this.teacherService.submitAssignment(user.id, assignmentId, dto);
  }
}
