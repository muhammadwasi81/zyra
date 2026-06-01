import { ActionCenterData, Task, TaskStatus } from "../types";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error: string }).error || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const api = {
  getActionCenter: (studentId: string) =>
    fetchJSON<ActionCenterData>(`/students/${studentId}/action-center`),

  updateTaskStatus: (taskId: string, status: TaskStatus) =>
    fetchJSON<Task>(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
