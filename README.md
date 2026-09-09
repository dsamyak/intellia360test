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

This is a **single Next.js application**. There is no separate front-end project,
no second `package.json`, and no second dev server — every role’s UI is a route
group inside `src/app`.

```
src/
  app/
    (auth)/          # Login, register, forgot/reset password pages
    api/auth/        # Next.js Route Handlers — auth API (login, register, reset, etc.)
    api/teacher/     # Teacher API (GET /api/teacher/me)
    student/         # Student-facing pages (dashboard, courses, leaderboard, …)
    teacher/         # Teacher Console — see below
  components/
    teacher/         # Teacher Console shell, UI kit and modals
  context/
    AuthContext.tsx         # Session shared by the whole app
    StudentContext.tsx
    TeacherDataContext.jsx  # Teacher Console data layer
  data/
    teacher/         # Teacher Console seed data
    grades/          # Static curriculum JSON per grade
  lib/
    auth/            # JWT helpers, bcrypt hashing, email, Zod validation schemas
    teacher/         # Teacher Console helpers (SSR-safe useLocalStorage)
    db.ts            # Prisma client singleton
  styles/
    globals.css      # Tailwind entry — imports variables.css and teacher.css
    teacher.css      # Teacher Console design tokens (@theme) + component classes
  types/             # Shared TypeScript types
  proxy.ts           # Next.js middleware — auth guards & role-based redirects

prisma/
  schema.prisma      # MongoDB data models (User, StudentProfile, progress, etc.)
  seed.ts            # Database seed script
```

---

## Teacher Console

Reached at **`/teacher`** (which redirects to `/teacher/dashboard`). Signing in
as a `TEACHER` or `SCHOOL` account lands there automatically — `dashboardFor()`
in `src/lib/auth/roles.ts` decides, and `src/proxy.ts` guards the routes.

| Route | Page |
|---|---|
| `/teacher/dashboard` | Command centre — class snapshot, engagement chart, AI quick actions, top performers |
| `/teacher/classes` | Roster cards with live average progress |
| `/teacher/classes/[id]` | One class — full roster, assignments, quick actions |
| `/teacher/students` | Searchable directory with a student profile drawer |
| `/teacher/lessons` | Curriculum browser by grade/chapter, with lesson creation |
| `/teacher/assignments` | Kanban board (Not Started → In Progress → Completed / Overdue) |
| `/teacher/reports` | Completion/engagement trends, per-class comparison, at-risk list |
| `/teacher/attendance` | Mark present/late/absent per class per day |
| `/teacher/rewards` | Badge catalog, XP/coin rules, class leaderboard |
| `/teacher/messages` | Threaded inbox with reply |
| `/teacher/ai-assistant` | Chat grounded in the live class data |
| `/teacher/resources` | Shared teaching materials |
| `/teacher/settings` | Profile, notification preferences, account |

`/teacher/analytics`, `/teacher/ai-planner` and `/teacher/profile` are kept as
redirects to `/teacher/reports`, `/teacher/ai-assistant` and `/teacher/settings`
so older links keep working.

**Data.** Identity comes from `AuthContext` (the real session) and roster
figures from `GET /api/teacher/me` when the signed-in teacher has classes in the
database. Everything else — lessons, assignments, attendance, messages — is
served by `TeacherDataContext` from `src/data/teacher/mockData.js` and persisted
to `localStorage`, so the console is fully interactive before those endpoints
exist. To move a section onto the API, replace the matching state in
`TeacherDataContext.jsx` with fetches; the context shape is what the pages use.

**Design.** Fraunces (display) + Inter (UI) + JetBrains Mono (data), loaded via
`next/font` in `src/app/teacher/layout.tsx`. Colours and the ledger-rule motif
live in `src/styles/teacher.css` as Tailwind v4 `@theme` tokens.

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
