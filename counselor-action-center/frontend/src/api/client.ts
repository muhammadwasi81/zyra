import { ActionCenterData, Task, TaskStatus } from "../types";

// In dev, BASE_URL is "" and the Vite proxy forwards /students and /tasks to localhost:3001.
// In production (Render), VITE_API_URL is the backend's full URL, e.g. https://counselor-action-center-api.onrender.com
const BASE_URL = import.meta.env.VITE_API_URL ?? "";

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
    fetchJSON<ActionCenterData>(`${BASE_URL}/students/${studentId}/action-center`),

  updateTaskStatus: (taskId: string, status: TaskStatus) =>
    fetchJSON<Task>(`${BASE_URL}/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
