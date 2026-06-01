import { Request, Response } from "express";
import { tasks } from "../data/mockData";
import { TaskStatus } from "../types";

const VALID_STATUSES: TaskStatus[] = ["todo", "in_progress", "completed"];

export function updateTaskStatus(req: Request, res: Response): void {
  const { taskId } = req.params;
  const { status } = req.body as { status: unknown };

  if (!status || !VALID_STATUSES.includes(status as TaskStatus)) {
    res.status(400).json({
      error: `Invalid status value. Must be one of: ${VALID_STATUSES.join(", ")}`,
    });
    return;
  }

  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    status: status as TaskStatus,
    updatedAt: new Date().toISOString(),
  };

  res.status(200).json(tasks[taskIndex]);
}
