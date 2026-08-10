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
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { CompleteActivityDto } from './dto/complete-activity.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';

@Controller('student')
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get('me')
  @ResponseMessage('Student profile retrieved successfully')
  getProfile(@GetUser() user: UserResponseDto) {
    return this.studentService.getProfile(user.id);
  }

  @Patch('grade')
  @ResponseMessage('Student grade updated successfully')
  updateGrade(
    @GetUser() user: UserResponseDto,
    @Body() dto: UpdateGradeDto,
  ) {
    return this.studentService.updateGrade(user.id, dto.grade);
  }

  @Get('progress')
  @ResponseMessage('Student progress retrieved successfully')
  getProgress(
    @GetUser() user: UserResponseDto,
    @Query('grade') grade?: string,
  ) {
    return this.studentService.getProgress(user.id, grade);
  }

  @Post('activities/complete')
  @ResponseMessage('Activity completed successfully')
  completeActivity(
    @GetUser() user: UserResponseDto,
    @Body() dto: CompleteActivityDto,
  ) {
    return this.studentService.completeActivity(user.id, dto);
  }

  @Get('badges')
  @ResponseMessage('Student badges retrieved successfully')
  getBadges(@GetUser() user: UserResponseDto) {
    return this.studentService.getBadges(user.id);
  }

  @Post('badges/:badgeId/unlock')
  @ResponseMessage('Badge unlocked successfully')
  unlockBadge(
    @GetUser() user: UserResponseDto,
    @Param('badgeId') badgeId: string,
  ) {
    return this.studentService.unlockBadge(user.id, badgeId);
  }

  @Get('missions')
  @ResponseMessage('Student missions retrieved successfully')
  getMissions(@GetUser() user: UserResponseDto) {
    return this.studentService.getMissions(user.id);
  }

  @Patch('missions/:missionId')
  @ResponseMessage('Mission progress updated successfully')
  updateMission(
    @GetUser() user: UserResponseDto,
    @Param('missionId') missionId: string,
    @Body() dto: UpdateMissionDto,
  ) {
    return this.studentService.updateMission(user.id, missionId, dto.progress);
  }

  @Post('quiz-attempts')
  @ResponseMessage('Quiz attempt recorded successfully')
  createQuizAttempt(
    @GetUser() user: UserResponseDto,
    @Body() dto: CreateQuizAttemptDto,
  ) {
    return this.studentService.createQuizAttempt(user.id, dto);
  }

  @Get('leaderboard')
  @ResponseMessage('Leaderboard retrieved successfully')
  getLeaderboard(
    @GetUser() user: UserResponseDto,
    @Query('grade') grade?: string,
    @Query('limit') limit?: number,
  ) {
    return this.studentService.getLeaderboard(user.id, grade, limit);
  }
}
