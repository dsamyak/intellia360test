import { Module } from '@nestjs/common';
import { StudentService } from './student.service';
import { StudentController } from './student.controller';
import { LeaderboardController } from './leaderboard.controller';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StudentController, LeaderboardController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
