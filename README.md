# Zyra — Software Engineering Assessment

This repository contains the submission for a two-part software engineering assessment. Both tasks live inside the `counselor-action-center/` directory.

---

## Deployment (Render.com)

This project deploys to [Render.com](https://render.com) via a **Blueprint** (`render.yaml` at the repo root). The Blueprint defines both services — the Node.js API and the React static site — so a single click or `git push` spins up the entire stack.

### How it works

```
render.yaml
├── counselor-action-center-api  (Web Service — Node.js)
│   rootDir: counselor-action-center/backend
│   build:   npm install && npm run build   (tsc → dist/)
│   start:   node dist/index.js
│   env:     NODE_ENV=production
│             FRONTEND_ORIGIN ← auto-filled from counselor-action-center-web URL
│
└── counselor-action-center-web  (Static Site — Vite/React)
    rootDir: counselor-action-center/frontend
    build:   npm install && npm run build   (vite build → dist/)
    publish: ./dist
    env:     VITE_API_URL ← auto-filled from counselor-action-center-api URL
```

`fromService` wires the two services together automatically:
- The backend receives the frontend's URL as `FRONTEND_ORIGIN` for CORS.
- The frontend receives the backend's URL as `VITE_API_URL` (baked into the JS bundle at build time via Vite).

### Deploy steps

1. Fork / push this repo to GitHub (already at https://github.com/muhammadwasi81/zyra).
2. In the [Render Dashboard](https://dashboard.render.com), click **New → Blueprint**.
3. Connect the GitHub repo — Render auto-detects `render.yaml`.
4. Click **Apply**. Both services build and deploy automatically.

No manual environment variable configuration is needed — `fromService` handles cross-service wiring.

> **Free tier note:** Render's free web services spin down after 15 minutes of inactivity. The first request after a cold start takes ~30 seconds. The static site is always-on (CDN-served).

### Local vs Production API routing

| Environment | How frontend reaches backend |
|-------------|------------------------------|
| Dev | `VITE_API_URL` is unset → `BASE_URL = ""` → Vite proxy forwards `/students`, `/tasks` to `localhost:3001` |
| Production | `VITE_API_URL = "https://counselor-action-center-api.onrender.com"` → requests go directly to the deployed API |

No code change is needed between environments.

---

## Repository Structure

```
zyra/
└── counselor-action-center/        ← The full project (Tasks 1 & 2)
    ├── CLAUDE.md                   ← Project-wide agent and architecture notes
    ├── package.json                ← Root workspace (runs both apps via concurrently)
    │
    ├── backend/                    ← Node.js + Express + TypeScript REST API
    │   ├── src/
    │   │   ├── app.ts              ← Express app factory (testable, no listen)
    │   │   ├── index.ts            ← Entry point — calls app.listen()
    │   │   ├── types/index.ts      ← Shared TypeScript interfaces
    │   │   ├── data/
    │   │   │   └── mockData.ts     ← In-memory students, tasks, messages
    │   │   ├── routes/
    │   │   │   ├── students.ts     ← GET /students/:id/action-center
    │   │   │   └── tasks.ts        ← PATCH /tasks/:taskId/status
    │   │   ├── controllers/
    │   │   │   ├── studentController.ts
    │   │   │   └── taskController.ts
    │   │   ├── middleware/
    │   │   │   ├── requestId.ts    ← UUID per request + X-Request-Id header
    │   │   │   ├── logger.ts       ← Morgan HTTP logger with request ID token
    │   │   │   ├── errorHandler.ts ← Centralised 500 handler with requestId
    │   │   │   └── notFound.ts     ← 404 catch-all
    │   │   └── __tests__/
    │   │       └── api.test.ts     ← 17 integration tests (vitest + supertest)
    │   ├── vitest.config.ts
    │   ├── tsconfig.json
    │   └── .env.example
    │
    └── frontend/                   ← React 18 + Vite + TypeScript + TailwindCSS
        ├── index.html
        ├── src/
        │   ├── types/index.ts      ← Mirror of backend types
        │   ├── api/
        │   │   └── client.ts       ← Typed fetch wrapper (all HTTP in one place)
        │   ├── hooks/
        │   │   ├── useActionCenter.ts   ← Data fetching with loading/error/refetch
        │   │   └── useTaskUpdate.ts     ← Per-task mutation with loading state
        │   ├── components/
        │   │   ├── StudentProfile.tsx
        │   │   ├── TaskList.tsx
        │   │   ├── TaskCard.tsx
        │   │   ├── MessageInbox.tsx
        │   │   ├── UrgencyBadge.tsx
        │   │   ├── PriorityBadge.tsx
        │   │   ├── StatusBadge.tsx
        │   │   ├── LoadingSpinner.tsx
        │   │   └── ErrorState.tsx
        │   ├── pages/
        │   │   └── ActionCenter.tsx     ← Main page (student switcher + layout)
        │   └── __tests__/
        │       ├── setup.ts             ← jest-dom import
        │       ├── UrgencyBadge.test.tsx ← 7 component tests
        │       └── TaskCard.test.tsx     ← 12 component tests
        ├── vitest.config.ts
        ├── vite.config.ts
        ├── tailwind.config.js
        └── tsconfig.json
```

---

## Task 1 — Counselor Student Action Center

### What was built

A full-stack mini-feature that lets a school counselor quickly understand a student's priorities, tasks, unread messages, and overall urgency level — all from a single view with a student switcher.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, IBM Plex Sans |
| Backend | Node.js, Express 4, TypeScript |
| Tooling | tsx (dev runner), concurrently, ESLint |

### Quick Start

**Prerequisites:** Node.js ≥ 18, npm ≥ 9

```bash
cd counselor-action-center

# 1. Install all dependencies
npm run install:all

# 2. Start both servers
npm run dev
```

| Server | URL |
|--------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3001 |

Or run each separately:

```bash
# Terminal 1
cd counselor-action-center/backend && npm run dev

# Terminal 2
cd counselor-action-center/frontend && npm run dev
```

### API Contract

#### `GET /students/:id/action-center`

Returns a composed view for a single student.

**Path parameter:** `id` — e.g. `stu_001`

**Response 200:**
```json
{
  "student": {
    "id": "stu_001",
    "name": "Maya Patel",
    "email": "maya.patel@school.edu",
    "grade": 11,
    "gpa": 3.2,
    "counselorId": "csl_001",
    "enrollmentStatus": "at_risk"
  },
  "tasks": [
    {
      "id": "tsk_001",
      "studentId": "stu_001",
      "title": "Submit FAFSA application",
      "description": "Deadline is approaching...",
      "status": "todo",
      "priority": "urgent",
      "dueDate": "2026-06-05",
      "createdAt": "2026-05-13T14:00:00Z",
      "updatedAt": "2026-05-13T14:00:00Z"
    }
  ],
  "messages": [ ... ],
  "summary": {
    "totalTasks": 5,
    "completedTasks": 1,
    "urgentTasks": 2,
    "unreadMessages": 2,
    "urgencyLevel": "critical"
  }
}
```

**Urgency level logic (server-side):**

| Level | Condition |
|-------|-----------|
| `critical` | `enrollmentStatus === "at_risk"` OR any urgent non-completed task |
| `high` | Any high-priority in-progress task |
| `medium` | Any medium-priority todo task |
| `low` | Everything else |

**Response 404:** `{ "error": "Student not found" }`

---

#### `GET /health`

```json
{ "status": "ok", "timestamp": "2026-06-01T09:26:37.937Z" }
```

---

#### `PATCH /tasks/:taskId/status`

Updates a task's status in memory. Mutations persist for the lifetime of the server process.

**Path parameter:** `taskId` — e.g. `tsk_001`

**Request body:**
```json
{ "status": "in_progress" }
```

Valid values: `"todo"` | `"in_progress"` | `"completed"`

**Response 200:** The full updated task object with a refreshed `updatedAt` timestamp.

**Response 400:** `{ "error": "Invalid status value. Must be one of: todo, in_progress, completed" }`

**Response 404:** `{ "error": "Task not found" }`

---

### Test Data

| Student ID | Name | Enrollment | Urgency |
|------------|------|------------|---------|
| `stu_001` | Maya Patel | at_risk | critical |
| `stu_002` | Jordan Lee | active | high |
| `stu_003` | Carlos Rivera | at_risk | critical |

Task IDs: `tsk_001` through `tsk_013`
Message IDs: `msg_001` through `msg_008`

---

### Frontend Architecture

```
ActionCenter (page)
├── StudentProfile      — avatar, name, email, enrollment badge, GPA, urgency badge, stats grid, progress bar
├── TaskList            — active tasks first, completed tasks below with opacity
│   └── TaskCard ×n     — priority/status badges, due-date warnings, Start/Complete CTA
└── MessageInbox        — unread-first sort, unread dot indicator, sender/subject/preview
```

**Data flow:**
1. `useActionCenter(studentId)` fetches `/students/:id/action-center` on mount and on `studentId` change
2. `useTaskUpdate(onSuccess)` issues `PATCH /tasks/:id/status` and calls `refetch()` on success
3. Components are purely presentational — all state lives in hooks

**Key design decisions:**
- Student switcher in the header uses `useState` — no router needed
- Vite proxy (`/students`, `/tasks` → `localhost:3001`) eliminates CORS in dev
- IBM Plex Sans (humanist) + IBM Plex Mono (stats/timestamps) for an institutional dashboard feel
- Urgency-coded accent bar at the top of the student profile card

---

## Task 2 — Production Hardening

Task 2 improves quality, reliability, and observability as if preparing the feature for a real production deployment.

### What was added

#### Backend: Request Logging

Every HTTP request is logged with Morgan in the format:

```
[a1b2c3d4-...] GET /students/stu_001/action-center 200 847b - 3.201 ms
```

The `[uuid]` prefix is the request ID, making every log line individually traceable. Logging is suppressed in `NODE_ENV=test` to keep test output clean.

**File:** `backend/src/middleware/logger.ts`

---

#### Backend: Request ID Middleware

Every request gets a UUID assigned via `crypto.randomUUID()` (built-in Node.js, zero extra dependency). The ID is:

- Stored on `req.id` via Express type augmentation
- Returned in the `X-Request-Id` response header on every response
- Included in `500` error JSON payloads as `requestId`
- Included in server-side error log lines

```
X-Request-Id: a1b2c3d4-e5f6-4789-abcd-ef1234567890
```

This enables log correlation: a support engineer can take the ID from a client error report and find every log line for that exact request.

**File:** `backend/src/middleware/requestId.ts`

---

#### Backend Integration Tests (17 tests)

**File:** `backend/src/__tests__/api.test.ts`
**Runner:** vitest + supertest

The app was refactored to separate `app.ts` (Express setup, no `listen`) from `index.ts` (just calls `listen`). This lets supertest import the app without binding a port.

Tests cover:

| Group | Tests |
|-------|-------|
| `GET /health` | 200 response shape; `X-Request-Id` header present and valid UUID format; unique ID per request |
| `GET /students/:id/action-center` | Full response shape; urgency computation for `at_risk`; exact summary counts; tasks sorted urgent-first; messages sorted unread-first; 404 for unknown ID; all three students load |
| `PATCH /tasks/:taskId/status` | todo → in_progress transition; completed transition; mutation persists across a subsequent GET; 400 on invalid status; 400 on missing body; 404 on unknown task |
| Unknown routes | 404 with error message |

**State isolation:** The `tasks` array is deep-copied before all tests and restored in `beforeEach`, so PATCH tests never bleed into each other.

**TDD note:** The `X-Request-Id` tests were written first and confirmed failing (RED) before the middleware was implemented (GREEN).

```bash
cd counselor-action-center/backend && npm test
```

```
 Tests  17 passed (17)
 Duration  ~266ms
```

---

#### Frontend Component Tests (19 tests)

**Files:** `frontend/src/__tests__/UrgencyBadge.test.tsx`, `TaskCard.test.tsx`
**Runner:** vitest + @testing-library/react + jsdom

**UrgencyBadge (7 tests):**
- Correct label text for all four levels
- Animated pulse dot rendered only for `critical`, absent for all others
- Correct colour class applied per level (`text-red`, `text-orange`, `text-blue`, `text-gray`)

**TaskCard (12 tests):**
- Title and description rendered
- `Start` button shown for `todo` tasks
- `Complete` button shown for `in_progress` tasks
- No button shown for `completed` tasks
- `onStatusChange` called with correct `(taskId, "in_progress")` args on Start click
- Button disabled and shows `...` text while `isUpdating` is true
- Red left border applied for urgent non-completed tasks
- Red left border absent for completed urgent tasks
- Overdue warning rendered for non-completed past-due tasks
- Overdue warning absent for completed past-due tasks

```bash
cd counselor-action-center/frontend && npm test
```

```
 Test Files  2 passed (2)
 Tests       19 passed (19)
 Duration    ~956ms
```

---

### Performance Decisions & Tradeoffs

#### 1. In-memory data store

**Decision:** All data lives in a module-level mutable array — no database.

**Tradeoff:** O(n) scan per request. Acceptable at tens of students per counselor. At scale, replace with PostgreSQL with indexed `(studentId, status, priority)` columns. The data layer is fully isolated in `src/data/mockData.ts`, so the swap touches only that file and the controllers.

---

#### 2. Server-side sorting and urgency computation

**Decision:** Tasks are sorted and urgency is computed in the controller on every request.

**Tradeoff:** Recomputed per request. Acceptable because it is two cheap array passes on a tiny dataset. At scale, precompute urgency as a stored/indexed DB column and use `ORDER BY priority_rank, due_date`. Benefit: React components stay purely presentational with no sorting logic.

---

#### 3. `refetch()` after task mutation

**Decision:** After a successful PATCH, the client calls `refetch()` which re-fetches the full action center.

**Tradeoff:** One extra round-trip per update. At < 2 KB payload this is imperceptible. The benefit is guaranteed consistency: summary stats (`urgentTasks`, `urgencyLevel`) recompute on the server — the client never holds stale totals. Manual optimistic patching would duplicate urgency logic in the client and risk divergence.

---

#### 4. Per-task loading state (`Record<string, boolean>`)

**Decision:** Each task button tracks its own `isUpdating` flag independently.

**Tradeoff:** Slightly more complex state than a single boolean. Benefit: a counselor can queue multiple task updates without freezing the whole list. Cost is O(1) per update.

---

#### 5. Vite proxy in development

**Decision:** Vite forwards `/students` and `/tasks` to `localhost:3001`.

**Tradeoff:** No CORS configuration needed in dev. Same-origin requests in dev match production topology (nginx/reverse proxy in front of both apps). The alternative requires maintaining CORS origin lists separately per environment.

---

#### 6. Request IDs (`crypto.randomUUID()`)

**Decision:** UUID on every request, in response header and error payloads.

**Tradeoff:** ~0.01 ms per request (native instruction). High production value: correlate client error reports with server log lines across distributed infrastructure. No external dependency — `crypto.randomUUID()` is built into Node.js 14.17+.

---

#### 7. Morgan logger with custom format

**Decision:** Logs `[requestId] METHOD /path STATUS bytes - ms` per response. Suppressed in `NODE_ENV=test`.

**Tradeoff:** ~1 ms overhead per request (negligible). In production, stream morgan output to a log aggregator (Datadog, Loki, CloudWatch) for searchable, correlated traces.

---

## Running All Tests

```bash
# Backend (17 integration tests)
cd counselor-action-center/backend && npm test

# Frontend (19 component tests)
cd counselor-action-center/frontend && npm test
```

**Total: 36 tests, 0 failures**

---

## Environment Variables

Copy `counselor-action-center/backend/.env.example` to `counselor-action-center/backend/.env` before starting the backend.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend listen port |
| `NODE_ENV` | `development` | Suppresses Morgan logging when `test` |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | CORS allowed origin |

---

## Design Notes

- **No database** — intentional; in-memory data is scoped to this assessment feature
- **No authentication** — out of scope; single-counselor demo
- **No React Router** — single page; student is selected via a dropdown in the header
- **TypeScript strict mode** on both sides — no `any` types anywhere in source

---

## GitHub Repository

**https://github.com/muhammadwasi81/zyra**
