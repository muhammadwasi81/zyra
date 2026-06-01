import { useState, useCallback } from "react";
import { api } from "../api/client";
import { Task, TaskStatus } from "../types";

interface UseTaskUpdateReturn {
  updateTask: (taskId: string, status: TaskStatus) => Promise<Task | null>;
  updating: Record<string, boolean>;
  updateError: string | null;
}

export function useTaskUpdate(onSuccess: (updatedTask: Task) => void): UseTaskUpdateReturn {
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const [updateError, setUpdateError] = useState<string | null>(null);

  const updateTask = useCallback(
    async (taskId: string, status: TaskStatus): Promise<Task | null> => {
      setUpdating((prev) => ({ ...prev, [taskId]: true }));
      setUpdateError(null);
      try {
        const updated = await api.updateTaskStatus(taskId, status);
        onSuccess(updated);
        return updated;
      } catch (err) {
        setUpdateError(err instanceof Error ? err.message : "Failed to update task");
        return null;
      } finally {
        setUpdating((prev) => ({ ...prev, [taskId]: false }));
      }
    },
    [onSuccess]
  );

  return { updateTask, updating, updateError };
}
