# 🚀 Intellia360

> AI-Powered Gamified Learning Management System

## 📌 Project Overview

Intellia360 is a modern AI-powered Learning Management System (LMS) designed for K-10 students. The platform combines interactive learning, gamification, AI tutoring, and teacher management into a single scalable application.

---

# 🎯 Current Development Phase

### Phase 1 – Frontend Development

Current Scope:

- Student Dashboard
- Teacher Dashboard

Authentication, Backend APIs, Database, and AI integrations will be implemented in later phases.

---

# 📂 Project Documents

```
PRD/
    Intellia360_PRD.docx

TRD/
    Intellia360_TRD.docx

Reference/
    student-dashboard.png
```

These documents are the single source of truth.

All development must strictly follow:

- Product Requirements Document (PRD)
- Technical Requirements Document (TRD)
- Reference Dashboard Design

---

# 🎨 UI Goal

The Student Dashboard must match the provided reference design as closely as possible.

Requirements:

- Pixel-perfect UI
- Same spacing
- Same typography
- Same border radius
- Same shadows
- Same colors
- Same responsive behaviour
- Production-quality code

No redesigns unless explicitly approved.

---

# 🛠 Tech Stack

Frontend

- Next.js 15
- React
- TypeScript
- Plain CSS

Backend (Later)

- NestJS
- PostgreSQL
- Prisma
- Redis

---

# 📁 Frontend Structure

```
src/

app/

components/

styles/

assets/

data/
```

---

# 🎯 Development Rules

- Build frontend first
- Use mock JSON data
- No authentication
- No backend integration
- No API calls
- No database
- No hardcoded inline styles
- Use reusable React components
- Use page-based CSS

---

# 🎨 CSS Rules

Each major page has its own CSS file.

Example:

```
student-dashboard.css
teacher-dashboard.css
header.css
sidebar.css
hero.css
cards.css
chatbot.css
responsive.css
```

---

# 📦 Assets

```
assets/

images/

icons/

avatars/

illustrations/

backgrounds/
```

---

# 📋 Development Order

1. Project Architecture
2. Folder Structure
3. Student Dashboard
4. Responsive Design
5. Teacher Dashboard
6. Authentication
7. Backend Integration
8. Database
9. AI Integration
10. Production Deployment

---

# 🚫 Out of Scope (Current Phase)

- Authentication
- Login
- Signup
- Database
- API Integration
- AI Backend
- Payments
- Notifications

---

# 📌 Git Workflow

Create feature branches.

Example:

```
feature/student-dashboard
feature/teacher-dashboard
feature/authentication
```

Commit frequently with meaningful commit messages.

Example:

```
feat: create student dashboard layout

style: add dashboard responsive css

refactor: optimize sidebar component
```

---

# ✅ Definition of Done

A task is complete only when:

- UI matches the reference image
- Responsive on Desktop, Tablet, Mobile
- Clean reusable components
- Organized CSS
- No console errors
- No TypeScript errors
- Production-ready structure

---

© Intellia360