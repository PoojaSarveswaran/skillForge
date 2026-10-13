# SkillForge AI — Personal Skill Gap Analyzer & Career Roadmap Platform

A full-stack web application that helps students and aspiring developers identify missing
skills for a target career role, understand their current proficiency, and follow a
structured, prioritized learning roadmap.

> **No external AI model is integrated in this version.** All "intelligence" — skill gap
> scoring, roadmap ordering, project recommendations — comes from transparent, deterministic
> algorithms described below. The architecture is AI-integration-ready for a future version,
> but the entire core workflow works without any paid API or API key.

---

## 1. Problem Statement

Students and early-career developers often don't know exactly what skills a target job
requires, how far they are from meeting those requirements, or what to learn next. SkillForge
AI turns a vague goal ("become an AI/ML Engineer") into a concrete, ordered learning plan
based on the user's own self-assessed skills.

## 2. Objectives

- Let users record their current skills and proficiency.
- Compare those skills against transparent, editable role requirements.
- Surface skill gaps with a clear severity classification.
- Generate a dependency-aware, prioritized learning roadmap.
- Track real progress against persisted data — no fake/mocked metrics.
- Recommend practice projects that target the user's actual gaps.

## 3. Features

- Landing page, demo-grade email/password auth (bcrypt + JWT).
- Analytics dashboard: readiness score, skill/gap counts, roadmap progress, weekly activity,
  upcoming milestones, recommended next action, recent activity feed.
- Career Explorer with search/filter and a full role-details page.
- Skill Assessment: add / edit / delete / search / filter skills, 0–4 proficiency scale.
- Skill Gap Analysis: per-skill comparison table, readiness score with documented formula,
  critical/needs-improvement/meets/exceeds buckets.
- Learning Roadmap: auto-generated milestones ordered by prerequisite dependencies and
  priority; mark in-progress/complete, add personal tasks, reorder (blocked if it would
  violate a prerequisite), prerequisite-gated completion with an explicit override.
- Project Lab: transparent skill-overlap-based recommendations plus a full searchable catalog.
- Profile & Settings: edit profile, target role, availability, goals; destructive "reset my
  data" action behind a confirmation dialog.
- About & Methodology page documenting every formula and its limitations.

## 4. Technology Stack

- **Frontend:** React (JSX, Vite), React Router, Chart.js / react-chartjs-2, plain CSS3.
- **Backend:** Node.js, Express, REST APIs.
- **Database:** MySQL 8, `mysql2` (parameterized queries only).
- **Auth:** bcryptjs password hashing + JWT session tokens (demo-grade, not production-hardened).
- **Testing:** Jest + Supertest (70 tests: pure algorithm unit tests + live-API/DB integration tests).

No TypeScript, Tailwind, MongoDB, or Firebase is used, per project constraints.

## 5. Architecture

```
skillforge-ai/
  client/                React app (Vite)
    src/
      components/        Reusable UI (cards, modals, charts, badges…)
      pages/              One file per screen (Landing, Dashboard, Roadmap, …)
      layouts/            AppLayout (sidebar + topbar shell)
      hooks/              useAuth (JWT session context)
      services/           api.js — single fetch wrapper for the whole REST API
      utils/              constants, chart setup
      styles/             theme.css (design tokens) + global.css
  server/                 Express API
    config/db.js          mysql2 connection pool
    controllers/          HTTP handlers (one file per resource)
    routes/                Route wiring, mounted under /api
    middleware/            JWT auth guard, centralized error handler
    services/               Multi-query business logic (roadmap generation, activity log)
    utils/                 Pure, unit-tested algorithms: skillGap.js, roadmapPlanner.js,
                            projectMatcher.js, validators.js, constants.js
    tests/                  Jest unit + integration tests
  database/
    schema.sql              Full MySQL DDL
    seed.sql                Career roles, role_skills, projects, project_skills
  .env.example
```

Frontend and backend are fully decoupled — the client talks to the API only over
`fetch('/api/...')` (proxied to `localhost:4000` in dev by Vite).

## 6. Database Setup

Prerequisite: a running local MySQL server and a user with privileges to create a database.

```bash
# 1. Create the database and a dedicated app user (adjust password as you like)
mysql -u root -p <<'SQL'
CREATE DATABASE IF NOT EXISTS skillforge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'sf_app'@'localhost' IDENTIFIED BY 'SfApp_2026!';
GRANT ALL PRIVILEGES ON skillforge.* TO 'sf_app'@'localhost';
FLUSH PRIVILEGES;
SQL

# 2. Load schema and seed data
mysql -u sf_app -p skillforge < database/schema.sql
mysql -u sf_app -p skillforge < database/seed.sql
```

This seeds 6 career roles, 51 role-skill requirements, 10 projects, and 38 project-skill
mappings. No user data is seeded via SQL — create a demo account through the real
`/api/auth/register` endpoint (see Demonstration Sequence below) so password hashing and
business logic are exercised exactly as they are for a real user.

## 7. Environment Variables

Copy `.env.example` to `server/.env` and fill in your local values:

```
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=skillforge
DB_USER=sf_app
DB_PASSWORD=SfApp_2026!
JWT_SECRET=<generate a long random string>
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
```

Never commit a real `.env` file — it's listed in `.gitignore`.

## 8. Installation & Running

```bash
# Backend
cd server
npm install
npm run dev        # nodemon, http://localhost:4000
# or: npm start

# Frontend (separate terminal)
cd client
npm install
npm run dev         # Vite, http://localhost:5173
```

Open the printed Vite URL in a browser. The client proxies all `/api/*` requests to the
Express server, so both must be running.

## 9. Testing

```bash
cd server
npm test            # Jest + Supertest — 70 tests
```

Coverage includes:

- Proficiency validation (`validators.test.js`)
- Skill gap classification + weighted readiness score (`skillGap.test.js`)
- Roadmap prerequisite topological ordering + completion gating (`roadmapPlanner.test.js`)
- Project recommendation overlap scoring (`projectMatcher.test.js`)
- Live API integration against the real MySQL database: registration/login, duplicate-email
  409, wrong-password 401, missing-token 401, unknown-route 404, unknown-role 404, full skills
  CRUD, and analysis against live seed data (`api.test.js`)

All 70 tests were run against this project's actual local MySQL instance and passed. The
React build was verified with `npm run build` (Vite) with zero errors. **Live in-browser UI
testing was not performed in this session** — no connected browser automation tool was
available — so visual rendering/interaction has been verified by code review and a complete
curl-driven walkthrough of every API endpoint (registration → skill entry → role selection →
gap analysis → roadmap generation → prerequisite-gated completion → project recommendations →
dashboard aggregation), not by clicking through the UI itself. Run the demonstration sequence
below in a browser to confirm the UI before presenting it.

## 10. Skill Gap & Roadmap Algorithms

### Proficiency scale
`0` Not learned · `1` Beginner · `2` Intermediate · `3` Advanced · `4` Proficient

### Gap classification (`server/utils/skillGap.js`)
```
gap = target_proficiency - current_proficiency
exceeds_requirement   gap < 0
meets_requirement     gap == 0
critical               gap > 0 AND importance in {high, critical} AND gap >= 2
needs_improvement      any other gap > 0
```

### Readiness score
```
importance_weight = { low: 1, medium: 2, high: 3, critical: 4 }
score = Σ( min(current, target) / max(target, 1) × weight ) / Σ(weight) × 100
```
Weighted so falling short on a critical-importance skill hurts the score more than falling
short on a low-importance one. **Limitation:** purely based on self-reported proficiency; a
0→1 gain counts the same as a 3→4 gain even though the latter is usually harder. This is a
planning aid, not a certification or employability guarantee.

### Roadmap ordering (`server/utils/roadmapPlanner.js`)
Only skills with `gap > 0` are planned. They're ordered with **Kahn's topological sort** over
each skill's `prerequisite_skill_name` (when that prerequisite is itself part of the plan), so
foundational skills are always scheduled before the skills that depend on them. Among
unblocked skills, ties are broken by `importance_weight × 10 + gap` (bigger, more important
gaps first). `estimated_hours = gap × 12` (a flat, documented assumption).

### Prerequisite-gated completion
A roadmap item can only move to `completed` if its `prerequisite_item_id` item is already
`completed`, **unless** the request explicitly sets `override_prerequisite: true` (the UI
surfaces this as "Complete Anyway" after a blocked attempt) — which also clears the
dependency so it won't block again.

### Project recommendation (`server/utils/projectMatcher.js`)
```
match_score = (project's practiced skills that are also a current gap) / (total practiced skills) × 100
```
Ranked by how many of those overlapping skills are `critical` gaps, then by `match_score`.
Purely rule-based — no AI model is involved, and the app never claims otherwise.

## 11. API Reference

All routes except `/api/auth/register` and `/api/auth/login` require
`Authorization: Bearer <token>`.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account, returns `{ token, user }` |
| POST | `/api/auth/login` | Authenticate, returns `{ token, user }` |
| GET | `/api/auth/me` | Current user |
| GET | `/api/profile` | Get profile |
| PUT | `/api/profile` | Update profile / target role |
| POST | `/api/profile/reset` | Destructive: wipe this user's skills/roadmap/activity |
| GET | `/api/dashboard` | Aggregated dashboard metrics |
| GET | `/api/roles` | List roles (`?category=&search=`) |
| GET | `/api/roles/categories` | Distinct role categories |
| GET | `/api/roles/:id` | Role detail + required skills + example projects |
| GET | `/api/skills` | List current user's skills (`?category=&search=`) |
| POST | `/api/skills` | Add a skill |
| PUT | `/api/skills/:id` | Update a skill |
| DELETE | `/api/skills/:id` | Remove a skill |
| GET | `/api/analysis/:roleId` | Skill gap analysis + readiness score for a role |
| GET | `/api/roadmaps` | List this user's roadmaps |
| POST | `/api/roadmaps` | Generate a roadmap for a role (`{ role_id, regenerate? }`) |
| PUT | `/api/roadmaps/:id` | Rename/archive a roadmap |
| GET | `/api/roadmaps/:id/items` | List items + progress summary |
| POST | `/api/roadmaps/:id/items` | Add a personal task |
| PUT | `/api/roadmaps/:id/reorder` | Reorder items (`{ order: [id, …] }`), rejects prerequisite violations |
| PUT | `/api/roadmap-items/:itemId` | Update status/priority/hours; gated completion |
| DELETE | `/api/roadmap-items/:itemId` | Remove a personal task (not auto-generated milestones) |
| GET | `/api/projects` | List projects (`?difficulty=&search=`) |
| GET | `/api/projects/recommended/:roleId` | Skill-overlap-ranked recommendations |

## 12. Demonstration Sequence

1. Open the landing page, click **Get Started Free**, register an account.
2. Go to **Career Explorer**, open a role's details, click **Select This Role**.
3. Go to **My Skills**, add 4–6 skills relevant to that role at varying proficiency levels.
4. Go to **Skill Gap Analysis** — observe the readiness score and bucketed skill table.
5. Click **Generate Learning Roadmap**.
6. On **Learning Roadmap**, expand a foundational item and mark it complete; try completing a
   dependent item first to see the prerequisite-gating error, then complete the prerequisite
   and retry.
7. Return to **Overview** — readiness, roadmap progress, and recent activity all update from
   real persisted data.
8. Visit **Project Lab → Recommended for You** to see projects matched to the remaining gaps.

## 13. Limitations & Future Improvements

- Authentication is demo-grade: no email verification, password reset, or rate limiting.
- Proficiency is entirely self-assessed and unverified.
- Readiness scoring and estimated hours use flat, documented assumptions, not personalized
  learning-speed data.
- No live browser UI test was run in this build session (see Testing section) — verify
  visually before presenting.
- Future version: optional AI-assisted explanations or resource suggestions, swappable in
  without changing the core deterministic scoring/roadmap engine.

## 14. Likely Viva Questions

**1. Why REST over GraphQL here?**
The data shape per screen is simple and mostly 1:1 with a table/join; REST keeps the surface
small and easy to reason about for a project this size, with no need for GraphQL's query
flexibility.

**2. How does the frontend manage auth state?**
A JWT is stored in `localStorage` and attached as a `Bearer` header by a single `services/api.js`
wrapper. `hooks/useAuth.jsx` exposes a React context (`user`, `login`, `register`, `logout`,
`refreshUser`) consumed by `ProtectedRoute` to gate the `/app/*` routes.

**3. Why MySQL over a NoSQL store?**
The domain is inherently relational — users, roles, role-skills, roadmaps, and roadmap items
all have clear foreign-key relationships and need referential integrity (e.g., a roadmap item's
prerequisite must point to a real row in the same roadmap).

**4. How is SQL injection prevented?**
Every query goes through `mysql2`'s parameterized `?` placeholders — no string concatenation
of user input into SQL anywhere in the codebase.

**5. Walk through the skill-gap scoring formula.**
See section 10 above — importance-weighted ratio of achieved vs. target proficiency, summed
and normalized to 0–100.

**6. How are roadmap prerequisites enforced?**
Two layers: (a) roadmap generation uses Kahn's topological sort so prerequisites are always
ordered before dependents; (b) at completion time, the server checks the prerequisite item's
status and returns 409 unless the client explicitly overrides it.

**7. What happens if two roadmap items have no dependency relationship?**
They're ordered by a priority score (`importance_weight × 10 + gap`), highest first, among
whichever items are currently unblocked.

**8. How does centralized error handling work?**
All async controllers are wrapped in `asyncHandler`, which forwards rejected promises to
Express's `next()`. `middleware/errorHandler.js` maps `ValidationError` → 400,
`NotFoundError` → 404, `ConflictError` → 409, known MySQL error codes → 409/500, and anything
else → a generic 500 that never leaks a stack trace or SQL text to the client.

**9. How is state kept in sync between the dashboard and the roadmap page?**
Each page fetches fresh data from the API on mount (no global client-side cache) — the
source of truth is always MySQL, so switching pages or reloading never shows stale, drifted
numbers.

**10. Why Chart.js instead of a custom SVG charting solution?**
Chart.js is a mature, accessible, well-documented library that covers every chart type this
project needs (radar, doughnut, bar) with minimal code, via the official React wrapper
`react-chartjs-2`.
