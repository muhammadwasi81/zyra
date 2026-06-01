import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../app";
import { tasks } from "../data/mockData";

// Snapshot the original task data so we can restore it between tests
const ORIGINAL_TASKS = tasks.map((t) => ({ ...t }));

beforeEach(() => {
  // Reset mutable in-memory state to prevent test bleed
  tasks.length = 0;
  tasks.push(...ORIGINAL_TASKS.map((t) => ({ ...t })));
});

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(typeof res.body.timestamp).toBe("string");
  });

  it("attaches an X-Request-Id UUID header to every response", async () => {
    const res = await request(app).get("/health");

    expect(res.headers["x-request-id"]).toBeDefined();
    expect(res.headers["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it("generates a unique request ID per request", async () => {
    const [a, b] = await Promise.all([
      request(app).get("/health"),
      request(app).get("/health"),
    ]);
    expect(a.headers["x-request-id"]).not.toBe(b.headers["x-request-id"]);
  });
});

// ---------------------------------------------------------------------------
// GET /students/:id/action-center
// ---------------------------------------------------------------------------

describe("GET /students/:id/action-center", () => {
  it("returns 200 with the full composed action-center shape for stu_001", async () => {
    const res = await request(app).get("/students/stu_001/action-center");

    expect(res.status).toBe(200);

    // Student shape
    expect(res.body.student.id).toBe("stu_001");
    expect(res.body.student.name).toBe("Maya Patel");
    expect(res.body.student.enrollmentStatus).toBe("at_risk");

    // Arrays present
    expect(Array.isArray(res.body.tasks)).toBe(true);
    expect(Array.isArray(res.body.messages)).toBe(true);
    expect(res.body.tasks.length).toBeGreaterThan(0);
    expect(res.body.messages.length).toBeGreaterThan(0);

    // Summary shape and types
    const { summary } = res.body;
    expect(typeof summary.totalTasks).toBe("number");
    expect(typeof summary.completedTasks).toBe("number");
    expect(typeof summary.urgentTasks).toBe("number");
    expect(typeof summary.unreadMessages).toBe("number");
    expect(["critical", "high", "medium", "low"]).toContain(summary.urgencyLevel);
  });

  it("computes critical urgency for an at_risk student (stu_001)", async () => {
    const res = await request(app).get("/students/stu_001/action-center");

    expect(res.status).toBe(200);
    expect(res.body.summary.urgencyLevel).toBe("critical");
  });

  it("computes correct summary counts for stu_001", async () => {
    const res = await request(app).get("/students/stu_001/action-center");
    const { summary } = res.body;

    expect(summary.totalTasks).toBe(5);
    expect(summary.completedTasks).toBe(1);
    expect(summary.urgentTasks).toBe(2);
    expect(summary.unreadMessages).toBe(2);
  });

  it("returns tasks sorted urgent-first then by dueDate", async () => {
    const res = await request(app).get("/students/stu_001/action-center");
    const { tasks: returnedTasks } = res.body;
    const priorities = returnedTasks.map((t: { priority: string }) => t.priority);
    const urgentIdx = priorities.lastIndexOf("urgent");
    const highIdx = priorities.indexOf("high");
    expect(urgentIdx).toBeLessThan(highIdx);
  });

  it("returns messages with unread first", async () => {
    const res = await request(app).get("/students/stu_001/action-center");
    const msgs: Array<{ read: boolean }> = res.body.messages;
    const firstReadIdx = msgs.findIndex((m) => m.read);
    const lastUnreadIdx = msgs.map((m) => !m.read).lastIndexOf(true);
    if (firstReadIdx !== -1 && lastUnreadIdx !== -1) {
      expect(lastUnreadIdx).toBeLessThan(firstReadIdx);
    }
  });

  it("returns 404 for an unknown student ID", async () => {
    const res = await request(app).get("/students/stu_999/action-center");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Student not found");
  });

  it("returns all three students' action centers without error", async () => {
    for (const id of ["stu_001", "stu_002", "stu_003"]) {
      const res = await request(app).get(`/students/${id}/action-center`);
      expect(res.status).toBe(200);
      expect(res.body.student.id).toBe(id);
    }
  });
});

// ---------------------------------------------------------------------------
// PATCH /tasks/:taskId/status
// ---------------------------------------------------------------------------

describe("PATCH /tasks/:taskId/status", () => {
  it("transitions a task from todo to in_progress and returns the updated task", async () => {
    const res = await request(app)
      .patch("/tasks/tsk_001/status")
      .send({ status: "in_progress" });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe("tsk_001");
    expect(res.body.status).toBe("in_progress");
    expect(typeof res.body.updatedAt).toBe("string");
    // updatedAt should be a recent ISO timestamp
    const age = Date.now() - new Date(res.body.updatedAt).getTime();
    expect(age).toBeLessThan(5000);
  });

  it("transitions a task to completed", async () => {
    const res = await request(app)
      .patch("/tasks/tsk_002/status")
      .send({ status: "completed" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("completed");
  });

  it("persists the mutation — a subsequent GET reflects the new status", async () => {
    await request(app)
      .patch("/tasks/tsk_001/status")
      .send({ status: "in_progress" });

    // The action-center re-fetch should reflect the change
    const res = await request(app).get("/students/stu_001/action-center");
    const task = res.body.tasks.find((t: { id: string }) => t.id === "tsk_001");
    expect(task.status).toBe("in_progress");
  });

  it("returns 400 for an invalid status value", async () => {
    const res = await request(app)
      .patch("/tasks/tsk_001/status")
      .send({ status: "invalid" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid status value/);
  });

  it("returns 400 when status field is missing from body", async () => {
    const res = await request(app)
      .patch("/tasks/tsk_001/status")
      .send({});

    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown task ID", async () => {
    const res = await request(app)
      .patch("/tasks/tsk_999/status")
      .send({ status: "completed" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Task not found");
  });
});

// ---------------------------------------------------------------------------
// 404 catch-all
// ---------------------------------------------------------------------------

describe("Unknown routes", () => {
  it("returns 404 with error message for unrecognised routes", async () => {
    const res = await request(app).get("/not-a-real-route");

    expect(res.status).toBe(404);
    expect(typeof res.body.error).toBe("string");
  });
});
