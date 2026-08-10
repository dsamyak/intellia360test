# Intellia360 API — Phase 1 (Auth)

Backend deliverable for Arnav's Week 1 scope: JWT auth, register/login, hardcoded
role guards, basic API docs. Built with NestJS + TypeORM + PostgreSQL per the
Intellia360 TRD, scoped down using the "easy alternative" column (no refresh
tokens yet, roles hardcoded via an enum, Swagger included instead of a
separate doc).

No frontend exists yet — CORS is left open by default and the API is
versionless/stateless behind a single `/api` prefix, so it can be pointed at
from any frontend later without changes here.

## Requirements

- Node.js 18+
- PostgreSQL (a `docker-compose.yml` is included if you don't have one running)

## Setup

```bash
npm install
cp .env.example .env      # then fill in JWT_SECRET at minimum
docker compose up -d      # starts local Postgres (skip if you have your own)
npm run start:dev
```

The API listens on `http://localhost:3000/api` by default.
Interactive Swagger docs: `http://localhost:3000/api/docs`.

`synchronize: true` is enabled outside production, so tables are created
automatically on first boot — no manual migration step needed for Week 1.

## Endpoints

| Method | Path                | Auth           | Description                              |
|--------|---------------------|----------------|-------------------------------------------|
| GET    | `/api/health`        | none           | Liveness check                            |
| POST   | `/api/auth/register`| none           | Create an account (defaults to `student`) |
| POST   | `/api/auth/login`   | none           | Log in, returns a JWT access token        |
| GET    | `/api/auth/profile` | Bearer token   | Returns the current authenticated user    |
| GET    | `/api/auth/admin-only` | Bearer token, role=`admin` | Example role-guarded route |

### Register

```
POST /api/auth/register
{
  "email": "student@example.com",
  "password": "StrongPass123",
  "fullName": "Aditi Sharma",
  "role": "student"          // optional — admin | student | parent | teacher | school | coach
}
```

### Login

```
POST /api/auth/login
{
  "email": "student@example.com",
  "password": "StrongPass123"
}
```

Both return:

```json
{
  "accessToken": "<jwt>",
  "user": { "id": "...", "email": "...", "role": "student", "fullName": "..." }
}
```

Send the token back as `Authorization: Bearer <jwt>` on protected routes.

## Roles

Hardcoded in `src/common/enums/role.enum.ts` per the TRD's role list:
`admin`, `student`, `parent`, `teacher`, `school`, `coach`. New routes can
restrict access with:

```ts
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.TEACHER)
```

## What's deliberately out of scope this week

- Refresh tokens (single 7-day access token for now — see the note in
  `auth.service.ts` for how to extend this later)
- Password reset flow
- DB-driven permissions (roles are a fixed enum, not a table)

## Project layout

```
src/
  auth/            # register, login, JWT strategy, guards, decorators
  users/           # User entity, UsersService (hashing, lookups)
  common/enums/     # shared Role enum
  app.module.ts     # TypeORM + module wiring
  main.ts           # bootstrap, global validation, CORS, Swagger
```

This mirrors the module layout in the TRD (`auth/`, `users/`, ...) so later
modules (courses, gamification, payments, etc.) can be added as siblings
without restructuring anything here.
