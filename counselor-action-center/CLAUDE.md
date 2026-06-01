# CLAUDE.md — Counselor Student Action Center

## Project Purpose
A full-stack mini-feature for school counselors to view a composed action center for individual students. All IDs follow a predictable structure (stu_001, tsk_001, msg_001, etc.)
- Backend state is in-memory only — mutations reset on server restart (by design)
- No authentication layer — this is a scoped assessment feature
- CORS is permissive for local dev only

## API Contract

### GET /students/:id/action-center
Returns a composed action center object for a single student.

**Response shape:**
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
  "tasks": [ ...Task[] ],
  "messages": [ ...Message[] ],
  "summary": {
    "totalTasks": 5,
    "completedTasks": 1,
    "urgentTasks": 2,
    "unreadMessages": 2,
    "urgencyLevel": "critical"
  }
}
```

**Urgency level logic:**
- `critical`  → enrollmentStatus is "at_risk" OR has urgent+todo tasks
- `high`      → has high priority tasks in_progress
- `medium`    → has medium priority tasks todo
- `low`       → all tasks low priority

**Error:** 404 `{ "error": "Student not found" }` if ID doesn't exist.

---

### PATCH /tasks/:taskId/status
Updates a single task's status field in-memory.

**Request body:**
```json
{ "status": "in_progress" }
```

**Valid statuses:** `"todo"` | `"in_progress"` | `"completed"`

**Response:** Updated task object `{ ...Task, updatedAt: "<ISO string>" }`

**Errors:**
- 404 `{ "error": "Task not found" }`
- 400 `{ "error": "Invalid status value" }`

---

## Dev Commands
- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm run dev`
- Both together from root: `npm run dev` (uses concurrently)

## Code Style
- TypeScript strict mode enabled on both sides
- No `any` types — use proper interfaces
- Async/await over raw promises
- Named exports preferred over default where multiple exports exist
- React components: functional only, hooks for all state/effects

## Naming Conventions
- Files: camelCase for utilities/hooks, PascalCase for React components
- Types/Interfaces: PascalCase, prefix interfaces with no `I` prefix
- Constants: SCREAMING_SNAKE_CASE only for true app-wide constants

## Git
- Commit messages: conventional commits format (`feat:`, `fix:`, `chore:`)
- `.env` and `CLAUDE.local.md` are gitignored
