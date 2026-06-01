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

## Test Student IDs

| ID | Name | Status |
|----|------|--------|
| stu_001 | Maya Patel | at_risk → critical urgency |
| stu_002 | Jordan Lee | active → high urgency |
| stu_003 | Carlos Rivera | at_risk → critical urgency |
