# CLAUDE.md — SkillForge AI

Context for Claude (or any engineer) picking up this repository fresh, on a different
machine than the one it was built on.

## What this is

SkillForge AI is a complete, working full-stack web app: a personal skill-gap analyzer and
career roadmap platform. React (Vite) frontend, Express REST API backend, MySQL database.
Built end-to-end in one session — not a scaffold or partial prototype.

**Status: feature-complete and tested.** 70/70 backend tests pass (Jest + Supertest, including
live-MySQL integration tests). The full user workflow — register, select a career role, add
skills, run skill-gap analysis, generate a roadmap, complete prerequisite-gated milestones,
view project recommendations, see dashboard metrics update — was manually verified end-to-end
via the real API on the original machine. **No live browser UI click-through was ever
performed** (no browser automation tool was available in that session) — if something looks
visually off, that's the first place to check; the logic underneath has been verified.

## Read first

- `README.md` — full setup, architecture, API reference, and the exact formulas used for
  skill-gap scoring, roadmap ordering, and project recommendations. Read this before changing
  any scoring/ordering logic — it's documented precisely and tests assert the documented
  behavior.
- `SETUP_ON_NEW_MACHINE.md` (present in the Downloads-folder transfer, not in this git repo) —
  machine-portability notes.

## What is deliberately NOT in this repository

Nothing is broken or forgotten here — these are intentional exclusions, not bugs:

| Missing | Why | Fix |
|---|---|---|
| `node_modules/` (both `client/` and `server/`) | Standard practice; regenerated per machine | `npm install` in each |
| `server/.env` | Holds a local MySQL password + JWT secret — machine-specific, and secrets don't belong in a public repo | Copy `.env.example` → `server/.env`, fill in real values |
| A live MySQL `skillforge` database | Databases aren't files you commit | Run the schema/seed import — see README §6 |
| Any user/account data (skills, roadmaps, activity logs) | Only `database/seed.sql`'s role/project *catalog* is seeded; no demo account exists until one is registered through the running app | Register through `/register`, or import a data dump if one was provided alongside this clone |

Until the `.env` + database steps are done, `server/server.js` will print a connection error
and **exit on purpose** (see `server/server.js` — it refuses to silently run against a fake/
missing database, per this project's explicit requirement that API failures are never faked).

## Architecture at a glance

```
client/   React (Vite) — pages/ (one file per screen), components/, services/api.js
                           (single fetch wrapper, JWT in localStorage)
server/   Express — controllers/ (HTTP), services/ (multi-query business logic),
                     utils/ (pure, unit-tested algorithms: skillGap.js, roadmapPlanner.js,
                     projectMatcher.js, validators.js — read these before touching scoring logic)
database/ schema.sql (DDL) + seed.sql (6 roles, 51 role-skills, 10 projects, 38 project-skills)
```

No AI/LLM integration exists anywhere in this app — skill-gap scoring, roadmap ordering, and
project recommendations are all deterministic, documented algorithms in `server/utils/`. If a
future task asks to "make the roadmap smarter" or similar, that's a deliberate, scoped addition
on top of this deterministic baseline — not a bug fix.

## Before changing code

- Run `npm test` in `server/` first (requires the DB to be set up) — 70 tests cover the
  algorithms and the live API. A change that breaks these is almost certainly wrong, not the
  tests.
- `npm run build` in `client/` should complete with zero errors before considering frontend
  work done.
- Constraints from the original spec, still in force: no TypeScript, no Tailwind, no MongoDB/
  Firebase, no paid/external AI APIs required for the core workflow, parameterized SQL only,
  never fake a successful API response when the backend/DB is unavailable.
