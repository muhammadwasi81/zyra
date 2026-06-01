import { ActionCenterData, Task, TaskStatus } from "../types";

// In dev: VITE_API_URL is unset → raw = "" → Vite proxy handles /students and /tasks.
// In production: Render sets VITE_API_URL to the bare hostname via fromService.host
// (e.g. "counselor-action-center-api.onrender.com"). Prepend https:// if no scheme.
const raw = import.meta.env.VITE_API_URL ?? "";
const BASE_URL = raw && !raw.startsWith("http") ? `https://${raw}` : raw;

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
