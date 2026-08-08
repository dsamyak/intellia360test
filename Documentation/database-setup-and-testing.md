# Intellia360 — Database Setup & Testing Guide

This document covers everything needed to get the PostgreSQL database running,
apply the Prisma schema, and verify the full authentication flow works end-to-end.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Option A — Local PostgreSQL](#2-option-a--local-postgresql)
3. [Option B — Neon (Free Hosted Postgres)](#3-option-b--neon-free-hosted-postgres)
4. [Environment Configuration](#4-environment-configuration)
5. [Running Migrations](#5-running-migrations)
6. [Verifying the Schema](#6-verifying-the-schema)
7. [Manual API Testing](#7-manual-api-testing)
8. [End-to-End Browser Testing](#8-end-to-end-browser-testing)
9. [Common Errors & Fixes](#9-common-errors--fixes)

---

## 1. Prerequisites

- Node.js 18+ installed
- Project dependencies installed (`npm install`)
- `.env.local` file present at the project root (copy from `.env.example` if missing)

---

## 2. Option A — Local PostgreSQL

**Recommended for: offline development, no account sign-ups required.**

### Install PostgreSQL on Windows

1. Download the installer from https://www.postgresql.org/download/windows/
2. Run the installer. During setup:
   - Set a password for the `postgres` superuser — remember this
   - Keep the default port: `5432`
   - Keep the default locale
3. After install, open **pgAdmin 4** (installed alongside PostgreSQL) or the
   **SQL Shell (psql)** from the Start menu.

### Create the database

In pgAdmin, right-click **Databases → Create → Database**, name it `intellia360`.

Or in psql:

```sql
CREATE DATABASE intellia360;
```

### Connection string format

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/intellia360
```

Replace `YOUR_PASSWORD` with the password you set during install.

---

## 3. Option B — Neon (Free Hosted Postgres)

**Recommended for: quickest setup, no local install needed.**

1. Go to https://neon.tech and sign up (free tier, no credit card required)
2. Click **New Project**, give it a name (e.g. `intellia360`)
3. Neon auto-creates a database and shows a **Connection Details** panel
4. Select **Connection string** and copy the value. It looks like:

```
postgresql://alex:AbCdEfGh@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

5. Paste this as `DATABASE_URL` in your `.env.local`

> **Note:** The `?sslmode=require` at the end is required for Neon connections.
> Do not remove it.

---

## 4. Environment Configuration

Open `.env.local` and fill in the required values:

```env
# ─── Database ────────────────────────────────────────────────────────────────
# Paste your connection string here (local or Neon)
DATABASE_URL=postgresql://user:password@host:5432/intellia360

# ─── Authentication ──────────────────────────────────────────────────────────
# Generate a strong secret — run this in your terminal:
#   node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
AUTH_JWT_SECRET=replace-with-a-64-char-random-string
AUTH_JWT_EXPIRES_IN=7d

# ─── Application ─────────────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ─── Email (Password Reset) ───────────────────────────────────────────────────
# For local testing you can leave these blank — forgot-password will still
# create the token in the DB, but the email will not be sent.
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@intellia360.com
```

### Generating a secure JWT secret

Run this once in your terminal and paste the output as `AUTH_JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
```

---

## 5. Running Migrations

Once `DATABASE_URL` is set, run:

```bash
npx prisma migrate dev --name init
```

This will:
- Connect to your database
- Create the `User` and `PasswordResetToken` tables
- Generate an initial migration file at `prisma/migrations/`
- Regenerate the Prisma client

**Expected output:**

```
Prisma schema loaded from prisma\schema.prisma.
Datasource "db": PostgreSQL database "intellia360" at "localhost:5432"

Applying migration `20260808_init`

The following migration(s) have been applied:

migrations/
  └─ 20260808_init/
     └─ migration.sql

✔ Generated Prisma Client to .\src\generated\prisma
```

### Future schema changes

Whenever you modify `prisma/schema.prisma`, run:

```bash
npx prisma migrate dev --name describe-your-change
```

---

## 6. Verifying the Schema

After migrating, confirm the tables exist:

### Using pgAdmin

Open pgAdmin → your database → Schemas → public → Tables.
You should see: `User`, `PasswordResetToken`.

### Using psql

```bash
psql -U postgres -d intellia360 -c "\dt"
```

Expected output:

```
              List of relations
 Schema |        Name         | Type  |  Owner
--------+---------------------+-------+----------
 public | PasswordResetToken  | table | postgres
 public | User                | table | postgres
```

### Using Prisma Studio (visual browser)

```bash
npx prisma studio
```

Opens a browser UI at http://localhost:5555 where you can browse and edit records directly.

---

## 7. Manual API Testing

Use these `curl` commands (or import into Postman/Insomnia) to test each endpoint.
Start the dev server first: **run `npm run dev` in your terminal.**

### 7.1 Register a new user

```bash
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "username": "testuser",
    "password": "Password1!",
    "confirmPassword": "Password1!",
    "role": "STUDENT",
    "agreeToTerms": true
  }'
```

**Expected response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "STUDENT",
    "isVerified": false,
    "isActive": true
  }
}
```

The `-c cookies.txt` flag saves the session cookie for subsequent requests.

---

### 7.2 Try registering with the same email (should fail)

```bash
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "username": "differentusername",
    "password": "Password1!",
    "confirmPassword": "Password1!",
    "role": "STUDENT",
    "agreeToTerms": true
  }'
```

**Expected response (409):**
```json
{
  "success": false,
  "message": "An account with this email already exists"
}
```

---

### 7.3 Login with correct credentials

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "Password1!",
    "rememberMe": false
  }'
```

**Expected response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": { "id": "...", "email": "test@example.com", "role": "STUDENT" }
}
```

---

### 7.4 Login with wrong password (should fail)

```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "WrongPassword1!"
  }'
```

**Expected response (401):**
```json
{
  "success": false,
  "message": "Invalid email/username or password"
}
```

---

### 7.5 Get current user session

```bash
curl -s http://localhost:3000/api/auth/me \
  -b cookies.txt
```

**Expected response (200):**
```json
{
  "success": true,
  "message": "OK",
  "data": { "id": "...", "email": "test@example.com", "role": "STUDENT" }
}
```

---

### 7.6 Change password

```bash
curl -s -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "currentPassword": "Password1!",
    "newPassword": "NewPassword2@",
    "confirmPassword": "NewPassword2@"
  }'
```

**Expected response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 7.7 Forgot password (creates reset token in DB)

```bash
curl -s -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{ "email": "test@example.com" }'
```

**Expected response (200) — always, regardless of whether email exists:**
```json
{
  "success": true,
  "message": "If an account with that email exists, you will receive a password reset link shortly."
}
```

To get the generated token for testing (since email sending requires SMTP config),
query the database directly:

```bash
# psql
SELECT token, "expiresAt", used FROM "PasswordResetToken" ORDER BY "createdAt" DESC LIMIT 1;

# or Prisma Studio: http://localhost:5555 → PasswordResetToken table
```

---

### 7.8 Reset password using the token

```bash
curl -s -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "PASTE_TOKEN_FROM_DB_HERE",
    "password": "ResetPassword3#",
    "confirmPassword": "ResetPassword3#"
  }'
```

**Expected response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now log in."
}
```

---

### 7.9 Logout

```bash
curl -s -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

**Expected response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 7.10 Confirm session is cleared after logout

```bash
curl -s http://localhost:3000/api/auth/me \
  -b cookies.txt
```

**Expected response (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## 8. End-to-End Browser Testing

Start the dev server (`npm run dev`) and test the full UI flow manually.

### Registration flow

1. Go to http://localhost:3000 — should redirect to `/login`
2. Click **Sign up** or go to http://localhost:3000/register
3. Fill in all fields, check the terms box, click **Create Account**
4. Should redirect to `/student/dashboard` (for STUDENT role)
5. Open DevTools → Application → Cookies → confirm `intellia_session` cookie is set (HttpOnly, not readable by JS — it will appear in the list but its value is protected)

### Login flow

1. Logout, then go to http://localhost:3000/login
2. Enter the credentials you registered with
3. Should redirect to the correct dashboard based on role

### Route protection

| What to test | Expected result |
|---|---|
| Visit `/student/dashboard` while logged out | Redirected to `/login` |
| Visit `/login` while logged in as STUDENT | Redirected to `/student/dashboard` |
| Visit `/teacher/dashboard` while logged in as STUDENT | Redirected to `/login` |
| Visit `/admin` while logged in as STUDENT | Redirected to `/login` |

### Forgot password flow

1. Go to `/forgot-password`, enter your registered email, submit
2. Look up the token in Prisma Studio or psql (see section 7.7)
3. Go to `http://localhost:3000/reset-password?token=YOUR_TOKEN`
4. Enter a new password, submit
5. Login with the new password to confirm it worked

---

## 9. Common Errors & Fixes

### `P1001: Can't reach database server at localhost:5432`

PostgreSQL is not running. Either:
- Start the PostgreSQL service: open **Services** in Windows, find `postgresql-x64-XX`, click **Start**
- Or check that your Neon connection string in `.env.local` is correct

### `P1003: Database does not exist`

The database `intellia360` hasn't been created yet. Run:
```sql
CREATE DATABASE intellia360;
```
or create it in pgAdmin.

### `Invalid prisma.X invocation` / column does not exist

The migration hasn't been applied. Run:
```bash
npx prisma migrate dev --name init
```

### `Error: AUTH_JWT_SECRET is not set` (production build)

`AUTH_JWT_SECRET` is missing from your environment. Set it in `.env.local` (development) or in your hosting platform's environment variables (production).

### Session cookie not being sent with requests

The `intellia_session` cookie is `HttpOnly` and `SameSite=lax`. It is sent automatically by the browser on same-origin requests. If testing with curl, always pass `-b cookies.txt` to include the saved cookie.

### `Invalid or expired reset link`

The password reset token is either:
- Already used (tokens are one-time use)
- Expired (tokens expire after 1 hour)
- Incorrect (check for copy-paste errors)

Request a new one via `/forgot-password`.

---

*Last updated: August 2026*
