import { Request, Response } from "express";
import { students, tasks, messages } from "../data/mockData";
import { ActionCenterResponse, ActionCenterSummary, Task, UrgencyLevel } from "../types";

function computeUrgencyLevel(enrollmentStatus: string, studentTasks: Task[]): UrgencyLevel {
  const hasUrgentTodo = studentTasks.some(
    (t) => t.priority === "urgent" && t.status !== "completed"
  );
  const hasHighInProgress = studentTasks.some(
    (t) => t.priority === "high" && t.status === "in_progress"
  );
  const hasMediumTodo = studentTasks.some(
    (t) => t.priority === "medium" && t.status === "todo"
  );

  if (enrollmentStatus === "at_risk" || hasUrgentTodo) return "critical";
  if (hasHighInProgress) return "high";
  if (hasMediumTodo) return "medium";
  return "low";
}

export function getActionCenter(req: Request, res: Response): void {
  const { id } = req.params;

  const student = students.find((s) => s.id === id);
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }

  const studentTasks = tasks.filter((t) => t.studentId === id);
  const studentMessages = messages.filter((m) => m.studentId === id);

  const urgentTasks = studentTasks.filter(
    (t) => t.priority === "urgent" && t.status !== "completed"
  ).length;

  const summary: ActionCenterSummary = {
    totalTasks: studentTasks.length,
    completedTasks: studentTasks.filter((t) => t.status === "completed").length,
    urgentTasks,
    unreadMessages: studentMessages.filter((m) => !m.read).length,
    urgencyLevel: computeUrgencyLevel(student.enrollmentStatus, studentTasks),
  };

  // Sort: urgent first, then by dueDate ascending
  const sortedTasks = [...studentTasks].sort((a, b) => {
    const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  // Sort messages: unread first, then by receivedAt descending
  const sortedMessages = [...studentMessages].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
  });

  const response: ActionCenterResponse = {
    student,
    tasks: sortedTasks,
    messages: sortedMessages,
    summary,
  };

  res.status(200).json(response);
}
