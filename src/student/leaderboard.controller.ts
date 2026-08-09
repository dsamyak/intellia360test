import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(private readonly studentService: StudentService) {}

  @Get()
  @ResponseMessage('Leaderboard retrieved successfully')
  getLeaderboard(
    @GetUser() user: UserResponseDto,
    @Query('grade') grade?: string,
    @Query('limit') limit?: number,
  ) {
    return this.studentService.getLeaderboard(user.id, grade, limit);
  }
}
