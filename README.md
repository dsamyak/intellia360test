# Intellia360

AI-powered adaptive learning platform for primary school students.

**Stack:** Next.js 16 · Prisma 6 · MongoDB · TypeScript · Zod · Resend

---

## Prerequisites

- Node.js 18+
- A MongoDB connection string (MongoDB Atlas free tier, or local via Docker — see below)

---

## Local setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in the required values (see Environment variables below)

# 3. Generate Prisma client and push schema to MongoDB
npx prisma generate
npx prisma db push

# 4. (Optional) Seed the database
npm run seed

# 5. Start the development server
npm run dev
```

App runs at **http://localhost:3000**.

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | MongoDB connection string |
| `AUTH_JWT_SECRET` | ✅ | Secret used to sign session JWTs (min 32 chars) |
| `AUTH_JWT_EXPIRES_IN` | — | JWT expiry (default: `7d`) |
| `RESEND_API_KEY` | ✅ | API key for transactional email via Resend |
| `NEXT_PUBLIC_APP_URL` | — | Full URL of the app (used in reset-password emails) |

---

## Local MongoDB with Docker

A `docker-compose.yml` is included. Start a local MongoDB 7 container with:

```bash
docker compose up -d
```

Then set:

```
DATABASE_URL="mongodb://root:example@localhost:27017/intellia360?authSource=admin"
```

---

## npm scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run seed` | Seed the database via `prisma/seed.ts` |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run prisma:push` | Push schema changes to MongoDB (dev) |
| `npm run prisma:migrate` | Run Prisma migrations |

---

## Project structure

```
src/
  app/
    (auth)/          # Login, register, forgot/reset password pages
    api/auth/        # Next.js Route Handlers — auth API (login, register, reset, etc.)
    student/         # Student-facing pages (dashboard, courses, leaderboard, …)
    teacher/         # Teacher-facing pages (dashboard, classes, analytics, …)
  components/        # Shared React components
  context/           # React context providers (StudentContext)
  data/              # Static curriculum JSON per grade
  lib/
    auth/            # JWT helpers, bcrypt hashing, email, Zod validation schemas
    db.ts            # Prisma client singleton
  types/             # Shared TypeScript types
  proxy.ts           # Next.js middleware — auth guards & role-based redirects

prisma/
  schema.prisma      # MongoDB data models (User, StudentProfile, progress, etc.)
  seed.ts            # Database seed script
```

---

## Roles

Defined in `prisma/schema.prisma` as the `Role` enum:

| Role | Access |
|---|---|
| `STUDENT` | Student dashboard and learning pages |
| `PARENT` | Student dashboard (read-only view for parents) |
| `TEACHER` | Teacher dashboard, classes, analytics, assignments |
| `SCHOOL` | Same as TEACHER |
| `ADMIN` | All routes |

---

## Authentication

- Passwords hashed with **bcryptjs** (cost factor 12)
- Session cookies: `httpOnly`, `sameSite=lax`, `secure` in production
- JWT signed with `AUTH_JWT_SECRET`; verified in middleware via `jose`
- Password-reset tokens are single-use, expire in 1 hour, and are invalidated when a new one is requested
- Anti-enumeration: all auth responses that could reveal account existence return identical messages
