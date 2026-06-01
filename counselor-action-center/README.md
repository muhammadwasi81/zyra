# Counselor Student Action Center

A full-stack mini-feature that helps school counselors quickly understand a student's priorities, tasks, unread messages, and urgency level.

## Tech Stack
- **Frontend:** React 18, TypeScript, Vite, TailwindCSS, IBM Plex Sans
- **Backend:** Node.js, Express, TypeScript (in-memory data, no DB)

## Quick Start

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
# Install all dependencies
npm run install:all

# Run both frontend + backend concurrently
npm run dev
```

Or separately:
```bash
# Terminal 1 — Backend (port 3001)
cd backend && npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Open http://localhost:5173 in your browser.

## API Contract

### GET /students/:id/action-center
Returns the composed action center for a student.

| Param | Type | Example |
|-------|------|---------|
| id | string (path) | `stu_001` |

**Response 200:**
```json
{
  "student": { "id": "stu_001", "name": "Maya Patel", ... },
  "tasks": [...],
  "messages": [...],
  "summary": {
    "totalTasks": 5,
    "completedTasks": 1,
    "urgentTasks": 2,
    "unreadMessages": 2,
    "urgencyLevel": "critical"
  }
}
```

**Response 404:** `{ "error": "Student not found" }`

---

### PATCH /tasks/:taskId/status
Updates a task's status in-memory.

| Param | Type | Example |
|-------|------|---------|
| taskId | string (path) | `tsk_001` |

**Body:**
```json
{ "status": "in_progress" }
```
Valid values: `"todo"` | `"in_progress"` | `"completed"`

**Response 200:** Updated task object.
**Response 400:** `{ "error": "Invalid status value. Must be one of: todo, in_progress, completed" }`
**Response 404:** `{ "error": "Task not found" }`

---

## Architecture

```
counselor-action-center/
├── backend/   Express + TypeScript REST API with in-memory mock data
└── frontend/  React + Vite SPA with typed API client and custom hooks
```

**Backend:**
- Layered: `routes → controllers → data`. Each concern is isolated.
- Mock data is a mutable in-memory array — PATCH mutations persist within a process session.
- Urgency level computed server-side at request time.
- Centralized error middleware ensures consistent error shapes.

**Frontend:**
- `api/client.ts` — typed fetch wrapper; all HTTP calls in one place.
- `hooks/useActionCenter.ts` — data fetching with loading/error/refetch states.
- `hooks/useTaskUpdate.ts` — mutation handler with per-task loading state tracking.
- `pages/ActionCenter.tsx` — single-page composition of all feature components.
- Vite proxy forwards `/students` and `/tasks` to backend — no CORS config needed in dev.

## Testing

### Run all tests

```bash
# Backend integration tests (17 tests)
cd backend && npm test

# Frontend component tests (19 tests)
cd frontend && npm test
```

### Backend integration tests (`backend/src/__tests__/api.test.ts`)

Cover the full HTTP contract including:
- `/health` — response shape and `X-Request-Id` header presence and UUID format
- `GET /students/:id/action-center` — 200 response shape, urgency computation, sort order, all three students
- `PATCH /tasks/:taskId/status` — valid transitions, mutation persistence, 400 on bad status, 404 on missing task
- 404 catch-all for unknown routes

State isolation: `tasks` is reset to the original in-memory snapshot via `beforeEach` to prevent test bleed from mutation tests.

### Frontend component tests (`frontend/src/__tests__/`)

- **UrgencyBadge** — correct label per level, animated dot only on `critical`, correct colour class per level
- **TaskCard** — renders title/description, shows correct CTA button per status (`Start`/`Complete`/none), calls `onStatusChange` with correct args on click, disables button while updating, applies urgency border only for non-completed urgent tasks, shows overdue warning only for non-completed past-due tasks

---

## Performance Decisions & Tradeoffs

### 1. In-memory data store

**Decision:** All data lives in a module-level mutable array — no database.

**Tradeoff:** Every GET request scans O(n) across all tasks/messages. Acceptable at tens-of-students per counselor. At scale (thousands of students, multi-counselor), replace with a PostgreSQL table with indexed `(studentId, status, priority)` columns and push sorting to the DB via `ORDER BY`. The data layer is fully isolated in `src/data/mockData.ts`, so the swap is contained to that file and the controllers.

---

### 2. Server-side sorting and urgency computation

**Decision:** Tasks are sorted urgency-first then by `dueDate`, and the urgency level is computed, in the controller on every request.

**Tradeoff:** Work is repeated per-request. Acceptable because the computation is cheap (two array passes) and the sort is stable. At scale, precompute urgency level as a stored column that is updated on task mutation, and push `ORDER BY priority_rank, due_date` to the DB. Benefit of server-side sorting: React components are purely presentational with no ordering logic — easier to test and maintain.

---

### 3. `refetch()` after task mutation instead of optimistic state patching

**Decision:** After a successful PATCH, the client calls `refetch()` which re-fetches the full action center response.

**Tradeoff:** One extra network round-trip per task update. At current payload size (< 2 KB response), this is imperceptible. The benefit is correctness: the summary stats (`urgentTasks`, `urgencyLevel`) recompute on the server and the client always shows consistent state. The alternative — manually patching the task in local state and re-deriving summary counts in the client — doubles the business logic surface and risks stale summaries. The current payload is small enough that simplicity wins.

---

### 4. Per-task loading state (`Record<string, boolean>`)

**Decision:** Each task tracks its own in-flight state independently in `useTaskUpdate`.

**Tradeoff:** Slightly more complex state shape than a single global boolean. The benefit is that a counselor can click multiple task buttons without the entire list freezing. The cost is negligible — the object is keyed by task ID and updates are O(1).

---

### 5. Vite proxy in development

**Decision:** Vite forwards `/students` and `/tasks` requests to the backend at `localhost:3001`.

**Tradeoff:** Zero CORS configuration needed in dev, and same-origin requests in dev mirror production topology (where you'd sit both apps behind an nginx/Vercel reverse proxy). The alternative — CORS headers on individual routes — would require production-specific CORS configuration to be maintained separately, increasing config surface.

---

### 6. Request IDs (`crypto.randomUUID()`)

**Decision:** Every inbound request gets a `randomUUID()` attached to `req.id`, echoed in the `X-Request-Id` response header and in error payloads.

**Tradeoff:** ~0.01 ms overhead per request (UUID generation is a native CPU instruction). The benefit in production is high: a request ID lets you correlate every log line from a single failed request across load balancer logs, application logs, and client-side error reports. `crypto.randomUUID()` is built into Node.js 14.17+ — no dependency required.

---

### 7. Morgan request logger with custom format

**Decision:** Morgan logs `[requestId] METHOD /path STATUS bytes - ms` on every response. Suppressed in `NODE_ENV=test` to keep test output clean.

**Tradeoff:** ~1 ms synchronous overhead per request (negligible). In production, pipe the morgan stream to a structured log aggregator (e.g., Datadog, Loki) for searchable request traces. The `requestId` token in the log format is the linchpin — it lets you search all log lines for a specific failing request.

---

## Test Student IDs

| ID | Name | Status |
|----|------|--------|
| stu_001 | Maya Patel | at_risk → critical urgency |
| stu_002 | Jordan Lee | active → high urgency |
| stu_003 | Carlos Rivera | at_risk → critical urgency |
