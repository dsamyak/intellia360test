import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CompleteActivityDto } from './dto/complete-activity.dto';
import { CreateQuizAttemptDto } from './dto/create-quiz-attempt.dto';

@Injectable()
export class StudentService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    let profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    if (!profile) {
      profile = await this.prisma.studentProfile.create({
        data: {
          userId,
          grade: 'grade1',
          xpPoints: 0,
          learningGems: 0,
          streakDays: 1,
          lastActiveDate: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          },
        },
      });
    }

    return profile;
  }

  async updateGrade(userId: string, grade: string) {
    const profile = await this.getProfile(userId);
    return this.prisma.studentProfile.update({
      where: { id: profile.id },
      data: { grade },
    });
  }

  async getProgress(userId: string, grade?: string) {
    const completedLessons = await this.prisma.completedLesson.findMany({
      where: {
        userId,
        ...(grade ? { grade } : {}),
      },
      select: { lessonId: true },
    });

    const completedActivities = await this.prisma.completedActivity.findMany({
      where: { userId },
      select: { lessonId: true, activityType: true },
    });

    return {
      completedLessons: completedLessons.map((l) => l.lessonId),
      completedActivities,
    };
  }

  async completeActivity(userId: string, dto: CompleteActivityDto) {
    const { lessonId, activityType, xpReward = 0, gemsReward = 0 } = dto;

    const existingActivity = await this.prisma.completedActivity.findUnique({
      where: {
        userId_lessonId_activityType: {
          userId,
          lessonId,
          activityType,
        },
      },
    });

    if (existingActivity) {
      return this.getProfile(userId);
    }

    const studentProfile = await this.getProfile(userId);

    return this.prisma.$transaction(async (tx) => {
      await tx.completedActivity.create({
        data: {
          userId,
          lessonId,
          activityType,
          xpAwarded: xpReward,
          gemsAwarded: gemsReward,
        },
      });

      const updatedProfile = await tx.studentProfile.update({
        where: { userId },
        data: {
          xpPoints: { increment: xpReward },
          learningGems: { increment: gemsReward },
          lastActiveDate: new Date(),
        },
      });

      if (activityType === 'architecture' || activityType === 'practice') {
        await tx.completedLesson.upsert({
          where: {
            userId_lessonId: {
              userId,
              lessonId,
            },
          },
          create: {
            userId,
            lessonId,
            grade: studentProfile.grade,
          },
          update: {},
        });
      }

      return updatedProfile;
    });
  }

  async getBadges(userId: string) {
    const unlockedBadges = await this.prisma.unlockedBadge.findMany({
      where: { userId },
    });
    return unlockedBadges;
  }

  async unlockBadge(userId: string, badgeId: string) {
    const badge = await this.prisma.unlockedBadge.upsert({
      where: {
        userId_badgeId: {
          userId,
          badgeId,
        },
      },
      create: {
        userId,
        badgeId,
      },
      update: {},
    });
    return badge;
  }

  async getMissions(userId: string) {
    return this.prisma.missionProgress.findMany({
      where: { userId },
    });
  }

  async updateMission(userId: string, missionId: string, progress: number) {
    const maxProgressMap: Record<string, number> = {
      m_1: 1,
      m_2: 3,
      m_3: 14,
    };
    const maxProgress = maxProgressMap[missionId] || 1;
    const isCompleted = progress >= maxProgress;

    return this.prisma.missionProgress.upsert({
      where: {
        userId_missionId: {
          userId,
          missionId,
        },
      },
      create: {
        userId,
        missionId,
        progress,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        progress,
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
      },
    });
  }

  async createQuizAttempt(userId: string, dto: CreateQuizAttemptDto) {
    return this.prisma.quizAttempt.create({
      data: {
        userId,
        lessonId: dto.lessonId,
        quizId: dto.quizId,
        scorePercent: dto.scorePercent,
      },
    });
  }

  async getLeaderboard(requesterUserId: string, grade?: string, limit: number = 10) {
    const topProfiles = await this.prisma.studentProfile.findMany({
      where: grade ? { grade } : undefined,
      orderBy: { xpPoints: 'desc' },
      take: Number(limit),
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return topProfiles.map((profile, index) => ({
      rank: index + 1,
      id: profile.userId,
      name: profile.user.name,
      avatar: profile.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      grade: profile.grade,
      xp: profile.xpPoints,
      gems: profile.learningGems,
      isCurrentUser: profile.userId === requesterUserId,
    }));
  }
}
