import path from 'node:path';
import { config } from 'dotenv';
import { PrismaClient, Role, AssignmentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// ── Environment ──────────────────────────────────────────────────────────────
// `npm run seed` shells out to ts-node, which loads no env file of its own.
// The only reason this used to work at all was that Prisma Client quietly reads
// `.env` when it is constructed — and `.env` is gitignored, so a fresh clone
// has only `.env.example`. Developers put their real credentials in `.env.local`
// (the file Next.js reads), that file was never loaded here, DATABASE_URL came
// back undefined and the seed died before its first query.
//
// Load both explicitly, in Next.js' own precedence: `.env` first, then
// `.env.local` overriding it. Both `npm run seed` and `prisma db seed` run from
// the project root, so the files are resolved against process.cwd(); if that
// ever is not the case the guard below names the exact paths it tried.
// (`__dirname` is deliberately not used — ts-node parses this file as an ES
// module, where it is not defined.)
const projectRoot = process.cwd();
const envPath = path.join(projectRoot, '.env');
const envLocalPath = path.join(projectRoot, '.env.local');

config({ path: envPath });
config({ path: envLocalPath, override: true });

if (!process.env.DATABASE_URL) {
  console.error(
    '❌ DATABASE_URL is not set.\n' +
      `   Looked in ${envPath} and ${envLocalPath}.\n` +
      '   Copy .env.example to .env.local, fill in DATABASE_URL, then re-run `npm run seed`\n' +
      '   from the project root.'
  );
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.missionProgress.deleteMany();
  await prisma.unlockedBadge.deleteMany();
  await prisma.completedActivity.deleteMany();
  await prisma.completedLesson.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.classGroup.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 12);

  // ── 0. Create the platform super-admin ────────────────────────────────────
  // This is the ONLY user seeded with role=ADMIN.
  // All other roles must be assigned by this admin via the admin panel.
  const admin = await prisma.user.create({
    data: {
      email:         'admin@intellia.dev',
      name:          'Platform Admin',
      password:      passwordHash,          // Password123! — same as all demo accounts
      role:          Role.ADMIN,
      emailVerified: true,
      // requestedRole intentionally omitted — admin is not a "requested" role
    },
  });
  console.log('  ✓ Admin:   admin@intellia.dev  / Password123!');

  // 1. Create Demo Teacher
  const teacherUser = await prisma.user.create({
    data: {
      email:         'teacher@intellia.dev',
      name:          'Sarah Jenkins',
      password:      passwordHash,
      role:          Role.TEACHER,
      requestedRole: Role.TEACHER,
      emailVerified: true,
      teacherProfile: {
        create: {
          avatar: '/avatars/teacher1.png',
          schoolName: 'Oakridge Elementary School',
        },
      },
    },
    include: {
      teacherProfile: true,
    },
  });

  const teacherProfileId = teacherUser.teacherProfile!.id;

  // Create 1 ClassGroup for Teacher
  const classGroup = await prisma.classGroup.create({
    data: {
      className: 'Grade 1 - Section Alpha',
      grade: 'grade1',
      teacherId: teacherProfileId,
    },
  });

  // 2. Create 4 Demo Students enrolled in that class
  const studentDataList = [
    {
      name: 'Alex Rivera',
      email: 'alex@intellia.dev',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      grade: 'grade1',
      xpPoints: 1250,
      learningGems: 45,
      streakDays: 5,
    },
    {
      name: 'Maya Lin',
      email: 'maya@intellia.dev',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      grade: 'grade1',
      xpPoints: 980,
      learningGems: 30,
      streakDays: 3,
    },
    {
      name: 'Ethan Hunt',
      email: 'ethan@intellia.dev',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
      grade: 'grade1',
      xpPoints: 450,
      learningGems: 15,
      streakDays: 1,
    },
    {
      name: 'Sophia Chen',
      email: 'sophia@intellia.dev',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150',
      grade: 'grade1',
      xpPoints: 1600,
      learningGems: 60,
      streakDays: 7,
    },
  ];

  type SeedStudent = Awaited<ReturnType<typeof prisma.user.create>>;
  const createdStudents: SeedStudent[] = [];

  for (const sData of studentDataList) {
    const studentUser = await prisma.user.create({
      data: {
        email:         sData.email,
        name:          sData.name,
        password:      passwordHash,
        role:          Role.STUDENT,
        requestedRole: Role.STUDENT,
        emailVerified: true,
        studentProfile: {
          create: {
            avatar: sData.avatar,
            grade: sData.grade,
            xpPoints: sData.xpPoints,
            learningGems: sData.learningGems,
            streakDays: sData.streakDays,
            lastActiveDate: new Date(),
            classId: classGroup.id,
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });
    createdStudents.push(studentUser);
  }

  // 3. Add Completed Lessons & Activities for students
  const student1 = createdStudents[0]; // Alex
  const student2 = createdStudents[1]; // Maya
  const student4 = createdStudents[3]; // Sophia

  // Completed Lessons
  await prisma.completedLesson.createMany({
    data: [
      { userId: student1.id, lessonId: 'counting-up-to-100', grade: 'grade1' },
      { userId: student1.id, lessonId: 'reading-writing-numbers', grade: 'grade1' },
      { userId: student2.id, lessonId: 'counting-up-to-100', grade: 'grade1' },
      { userId: student4.id, lessonId: 'counting-up-to-100', grade: 'grade1' },
      { userId: student4.id, lessonId: 'reading-writing-numbers', grade: 'grade1' },
      { userId: student4.id, lessonId: 'place-value-tens-and-ones', grade: 'grade1' },
    ],
  });

  // Completed Activities
  await prisma.completedActivity.createMany({
    data: [
      { userId: student1.id, lessonId: 'counting-up-to-100', activityType: 'eduNotes', xpAwarded: 50, gemsAwarded: 5 },
      { userId: student1.id, lessonId: 'counting-up-to-100', activityType: 'practice', xpAwarded: 100, gemsAwarded: 10 },
      { userId: student2.id, lessonId: 'counting-up-to-100', activityType: 'practice', xpAwarded: 100, gemsAwarded: 10 },
      { userId: student4.id, lessonId: 'counting-up-to-100', activityType: 'practice', xpAwarded: 100, gemsAwarded: 10 },
      { userId: student4.id, lessonId: 'reading-writing-numbers', activityType: 'practice', xpAwarded: 100, gemsAwarded: 10 },
    ],
  });

  // Quiz Attempts
  await prisma.quizAttempt.createMany({
    data: [
      { userId: student1.id, lessonId: 'counting-up-to-100', quizId: 'quiz_1_1', scorePercent: 90 },
      { userId: student1.id, lessonId: 'reading-writing-numbers', quizId: 'quiz_1_2', scorePercent: 85 },
      { userId: student2.id, lessonId: 'counting-up-to-100', quizId: 'quiz_1_1', scorePercent: 75 },
      { userId: student4.id, lessonId: 'counting-up-to-100', quizId: 'quiz_1_1', scorePercent: 100 },
      { userId: student4.id, lessonId: 'reading-writing-numbers', quizId: 'quiz_1_2', scorePercent: 95 },
    ],
  });

  // Unlocked Badges & Mission Progress
  await prisma.unlockedBadge.createMany({
    data: [
      { userId: student1.id, badgeId: 'badge_first_step' },
      { userId: student4.id, badgeId: 'badge_first_step' },
      { userId: student4.id, badgeId: 'badge_math_whiz' },
    ],
  });

  await prisma.missionProgress.createMany({
    data: [
      { userId: student1.id, missionId: 'mission_1', progress: 3, isCompleted: true, completedAt: new Date() },
      { userId: student2.id, missionId: 'mission_1', progress: 1, isCompleted: false },
    ],
  });

  // 4. Create Assignments & Submissions
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Counting 1-100 Practice Worksheet',
      classId: classGroup.id,
      lessonId: 'counting-up-to-100',
      dueDate,
      status: AssignmentStatus.ACTIVE,
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'Place Value Hundreds Quiz',
      classId: classGroup.id,
      lessonId: 'place-value-tens-and-ones',
      dueDate,
      status: AssignmentStatus.ACTIVE,
    },
  });

  // Submissions (1 completed submission by Alex)
  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: student1.id,
      submittedAt: new Date(),
      scorePercent: 92,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('  ✓ Admin:   admin@intellia.dev    / Password123!');
  console.log('  ✓ Teacher: teacher@intellia.dev  / Password123!');
  console.log('  ✓ Students: alex, maya, ethan, sophia @intellia.dev / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
