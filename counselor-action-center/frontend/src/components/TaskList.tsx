import { Task, TaskStatus } from "../types";
import { TaskCard } from "./TaskCard";

interface Props {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  updatingIds: Record<string, boolean>;
}

export function TaskList({ tasks, onStatusChange, updatingIds }: Props) {
  const active = tasks.filter((t) => t.status !== "completed");
  const completed = tasks.filter((t) => t.status === "completed");

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-800">Tasks</h2>
        <span className="text-xs text-gray-400 font-mono">
          {completed.length}/{tasks.length} completed
        </span>
      </div>

      <div className="space-y-2">
        {active.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={onStatusChange}
            isUpdating={!!updatingIds[task.id]}
          />
        ))}

        {completed.length > 0 && (
          <>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider pt-2 pb-1">
              Completed
            </p>
            {completed.map((task) => (
              <div key={task.id} className="opacity-60">
                <TaskCard
                  task={task}
                  onStatusChange={onStatusChange}
                  isUpdating={!!updatingIds[task.id]}
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
