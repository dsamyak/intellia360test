import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';

@Injectable()
export class TeacherService {
  constructor(private readonly prisma: PrismaService) {}

  private async getTeacherProfileByUserId(userId: string) {
    let profile = await this.prisma.teacherProfile.findUnique({
      where: { userId },
      include: {
        classes: {
          select: { id: true },
        },
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!profile) {
      profile = await this.prisma.teacherProfile.create({
        data: {
          userId,
          schoolName: 'Default School',
        },
        include: {
          classes: {
            select: { id: true },
          },
          user: {
            select: { id: true, email: true, name: true },
          },
        },
      });
    }

    return profile;
  }

  async getProfile(userId: string) {
    const profile = await this.getTeacherProfileByUserId(userId);
    return {
      id: profile.id,
      name: profile.user.name,
      email: profile.user.email,
      avatar: profile.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=150',
      schoolName: profile.schoolName || 'Oakridge Elementary School',
      assignedClasses: profile.classes.map((c) => c.id),
    };
  }

  async getClasses(userId: string) {
    const teacherProfile = await this.getTeacherProfileByUserId(userId);

    const classes = await this.prisma.classGroup.findMany({
      where: { teacherId: teacherProfile.id },
      include: {
        students: {
          include: {
            user: {
              select: {
                id: true,
                completedLessons: true,
                quizAttempts: true,
              },
            },
          },
        },
      },
    });

    return classes.map((classGroup) => {
      const studentCount = classGroup.students.length;

      let totalScoreSum = 0;
      let totalScoreCount = 0;
      let totalCompletionSum = 0;
      let atRiskCount = 0;

      const totalLessonsPerGrade = 10; // Nominal standard count per grade

      for (const student of classGroup.students) {
        const attempts = student.user.quizAttempts || [];
        const studentAvgScore = attempts.length > 0
          ? Math.round(attempts.reduce((sum, a) => sum + a.scorePercent, 0) / attempts.length)
          : 0;

        if (attempts.length > 0) {
          totalScoreSum += studentAvgScore;
          totalScoreCount++;
        }

        const completedCount = (student.user.completedLessons || []).length;
        const studentCompletionPercentage = Math.min(
          100,
          Math.round((completedCount / totalLessonsPerGrade) * 100),
        );
        totalCompletionSum += studentCompletionPercentage;

        if (studentAvgScore < 60 || studentCompletionPercentage < 40) {
          atRiskCount++;
        }
      }

      const averageScore = totalScoreCount > 0 ? Math.round(totalScoreSum / totalScoreCount) : 0;
      const completionRate = studentCount > 0 ? Math.round(totalCompletionSum / studentCount) : 0;

      return {
        id: classGroup.id,
        className: classGroup.className,
        grade: classGroup.grade,
        studentCount,
        averageScore,
        completionRate,
        atRiskCount,
      };
    });
  }

  async createClass(userId: string, dto: CreateClassDto) {
    const teacherProfile = await this.getTeacherProfileByUserId(userId);
    return this.prisma.classGroup.create({
      data: {
        className: dto.className,
        grade: dto.grade,
        teacherId: teacherProfile.id,
      },
    });
  }

  async getRoster(userId: string, classId: string) {
    const teacherProfile = await this.getTeacherProfileByUserId(userId);

    const classGroup = await this.prisma.classGroup.findUnique({
      where: { id: classId },
      include: {
        students: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                completedLessons: true,
                quizAttempts: true,
              },
            },
          },
        },
      },
    });

    if (!classGroup) {
      throw new NotFoundException('Class not found');
    }

    if (classGroup.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Access denied to this class roster');
    }

    const totalLessonsPerGrade = 10;

    return classGroup.students.map((student) => {
      const attempts = student.user.quizAttempts || [];
      const averageQuizScore = attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.scorePercent, 0) / attempts.length)
        : 0;

      const completedCount = (student.user.completedLessons || []).length;
      const completionPercentage = Math.min(
        100,
        Math.round((completedCount / totalLessonsPerGrade) * 100),
      );

      let status: 'on-track' | 'excelling' | 'at-risk' = 'on-track';
      if (averageQuizScore < 60 || completionPercentage < 40) {
        status = 'at-risk';
      } else if (averageQuizScore >= 90 && completionPercentage >= 70) {
        status = 'excelling';
      }

      const lastActive = student.lastActiveDate
        ? student.lastActiveDate.toISOString().split('T')[0]
        : '2026-08-01';

      return {
        id: student.userId,
        name: student.user.name,
        avatar: student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        grade: student.grade,
        completionPercentage,
        averageQuizScore,
        lastActive,
        status,
      };
    });
  }

  async getTopicAnalytics(userId: string, classId: string) {
    const teacherProfile = await this.getTeacherProfileByUserId(userId);

    const classGroup = await this.prisma.classGroup.findUnique({
      where: { id: classId },
      include: {
        students: {
          select: { userId: true },
        },
      },
    });

    if (!classGroup) {
      throw new NotFoundException('Class not found');
    }

    if (classGroup.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Access denied to this class analytics');
    }

    const studentUserIds = classGroup.students.map((s) => s.userId);

    if (studentUserIds.length === 0) {
      return [];
    }

    const quizAttempts = await this.prisma.quizAttempt.findMany({
      where: {
        userId: { in: studentUserIds },
      },
    });

    const topicMap = new Map<string, { scores: number[]; strugglingUsers: Set<string> }>();

    for (const qa of quizAttempts) {
      if (!topicMap.has(qa.lessonId)) {
        topicMap.set(qa.lessonId, { scores: [], strugglingUsers: new Set() });
      }
      const entry = topicMap.get(qa.lessonId)!;
      entry.scores.push(qa.scorePercent);
      if (qa.scorePercent < 60) {
        entry.strugglingUsers.add(qa.userId);
      }
    }

    const lessonTitles: Record<string, string> = {
      'counting-up-to-100': 'Counting & Place Value Basics',
      'reading-writing-numbers': 'Reading and Writing Numbers',
      'place-value-tens-and-ones': 'Place Value: Tens & Ones',
      'comparing-and-ordering-numbers': 'Comparing & Ordering Numbers',
      'number-patterns': 'Number Patterns & Skip Counting',
      'ordinal-numbers': 'Ordinal Numbers',
      'numbers-and-counting-test-series': 'Numbers Assessment Series',
    };

    const analytics = Array.from(topicMap.entries()).map(([lessonId, data]) => {
      const masteryPercentage = data.scores.length > 0
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : 0;

      return {
        topicId: lessonId,
        topicTitle: lessonTitles[lessonId] || lessonId,
        masteryPercentage,
        strugglingStudentsCount: data.strugglingUsers.size,
      };
    });

    if (analytics.length === 0) {
      return [
        {
          topicId: 'counting-up-to-100',
          topicTitle: 'Counting & Place Value Basics',
          masteryPercentage: 85,
          strugglingStudentsCount: 0,
        },
        {
          topicId: 'place-value-tens-and-ones',
          topicTitle: 'Place Value: Tens & Ones',
          masteryPercentage: 72,
          strugglingStudentsCount: 1,
        },
      ];
    }

    return analytics;
  }

  async getAssignments(userId: string, classId?: string) {
    const teacherProfile = await this.getTeacherProfileByUserId(userId);

    const assignments = await this.prisma.assignment.findMany({
      where: {
        class: {
          teacherId: teacherProfile.id,
          ...(classId ? { id: classId } : {}),
        },
      },
      include: {
        class: {
          include: {
            students: {
              select: { id: true },
            },
          },
        },
        submissions: true,
      },
      orderBy: { assignedDate: 'desc' },
    });

    return assignments.map((a) => ({
      id: a.id,
      title: a.title,
      targetClass: a.class.className,
      assignedDate: a.assignedDate.toISOString().split('T')[0],
      dueDate: a.dueDate.toISOString().split('T')[0],
      submissionsCount: a.submissions.length,
      totalStudents: a.class.students.length,
      status: a.status.toLowerCase(),
    }));
  }

  async createAssignment(userId: string, dto: CreateAssignmentDto) {
    const teacherProfile = await this.getTeacherProfileByUserId(userId);

    const classGroup = await this.prisma.classGroup.findUnique({
      where: { id: dto.classId },
    });

    if (!classGroup || classGroup.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Invalid classId for this teacher');
    }

    return this.prisma.assignment.create({
      data: {
        title: dto.title,
        classId: dto.classId,
        lessonId: dto.lessonId || null,
        dueDate: new Date(dto.dueDate),
      },
    });
  }

  async updateAssignment(userId: string, assignmentId: string, dto: UpdateAssignmentDto) {
    const teacherProfile = await this.getTeacherProfileByUserId(userId);

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { class: true },
    });

    if (!assignment || assignment.class.teacherId !== teacherProfile.id) {
      throw new ForbiddenException('Access denied to update this assignment');
    }

    return this.prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.dueDate ? { dueDate: new Date(dto.dueDate) } : {}),
        ...(dto.status ? { status: dto.status } : {}),
      },
    });
  }

  async submitAssignment(studentUserId: string, assignmentId: string, dto: SubmitAssignmentDto) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return this.prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: studentUserId,
        },
      },
      create: {
        assignmentId,
        studentId: studentUserId,
        submittedAt: new Date(),
        scorePercent: dto.scorePercent ?? 100,
      },
      update: {
        submittedAt: new Date(),
        scorePercent: dto.scorePercent ?? 100,
      },
    });
  }
}
