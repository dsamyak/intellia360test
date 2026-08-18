# Intellia360 — Teacher Dashboard

A fully interactive Teacher Dashboard for Intellia360's gamified, AI-powered Math LMS, built from the product's PRD/TRD (Product Structure, Teacher persona requirements, Gamification engine, and AI module) and the site's Next.js/NestJS architecture.

This is a **frontend-only** build (React 18 + Vite) with realistic mock data and full interactivity, so it can be reviewed and demoed standalone before it's wired to the live `intellia360-api` backend.

## What's inside

Every module maps to a section of the PRD's Teacher Dashboard requirements (FR‑TCH‑*, FR‑GAM‑*, FR‑AI‑*, FR‑REP‑*):

- **Dashboard** — command-center overview: class snapshot, activity engagement, AI assistant quick actions, top performers, recent activity, reminders.
- **My Classes** — roster cards with live average progress; click into a class for its full roster, assignments, and quick actions.
- **Students** — searchable/filterable directory with a full profile drawer (XP, coins, streak, badges, at-risk flag, "give XP boost", "message parent").
- **Lessons** — curriculum browser by grade/chapter with a lesson creation flow (draft/published).
- **Assignments** — kanban-style board (Not Started → In Progress → Completed / Overdue) with a create-assignment flow.
- **Quizzes** — quiz library plus an **AI quiz generator** (pick grade + topic, watch it draft questions, save as a draft).
- **Reports & Analytics** — completion/engagement trend chart, per-class comparison, activity distribution, at-risk student list.
- **Attendance** — mark present/late/absent per class per day, with daily roll-up counts.
- **Rewards** — badge catalog, XP/coin rules table, and a full class leaderboard.
- **Messages** — inbox + threaded conversation view with parents, students, and school admin, with reply.
- **AI Teaching Assistant** — a chat interface whose replies are generated from your *live* mock data (weakest topic, lowest-performing class, streak counts, etc.), not static copy.
- **Resources** — a shared teaching-materials library.
- **Settings** — profile, notification preferences, account actions.

All actions (adding a student, creating an assignment, marking attendance, generating a quiz, replying to a message) update real React state and persist to `localStorage`, so the app behaves like a working product across page reloads.

## Design

- **Type:** Fraunces (display) + Inter (UI) + JetBrains Mono (stats/data) — a warm editorial display face paired with a dense, data-friendly UI face, since a teacher's tool needs to read like a gradebook, not a toy.
- **Color:** Signal Violet (`#5B3DF5`) primary, Amber for XP/gamification, Jade for progress/success, Coral for at-risk/overdue, Sky for coins/secondary data.
- **Signature motif:** thin "ledger rule" lines (`.ledger-lines`) echoing a teacher's gradebook paper, used behind the hero and dark panels.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

### Build for production

```bash
npm run build
npm run preview   # serve the production build locally
```

The `dist/` folder is a static site (relative asset paths) — deploy it to any static host, or open it via `npm run preview` / any local static server. It uses hash-based routing (`/#/students`, etc.) so it works from any subpath without extra server config.

## Connecting to the real backend

This build uses `src/data/mockData.js` and `src/context/DataContext.jsx` as its data layer. To wire it to the `intellia360-api` NestJS backend from the TRD:

1. Replace the local state in `DataContext.jsx` with API calls to the endpoints in the TRD (`GET /courses`, `GET /leaderboard`, `POST /ai/chat`, etc.), keeping the same context shape so pages don't need to change.
2. Swap the `useLocalStorage` persistence for real mutations (`POST`/`PATCH`) against the backend.
3. Point `AiAssistant.jsx`'s `buildReply` at `POST /ai/chat` instead of the local heuristic.

## Tech stack

React 18 · Vite · React Router · Tailwind CSS v4 · Recharts · Lucide icons
