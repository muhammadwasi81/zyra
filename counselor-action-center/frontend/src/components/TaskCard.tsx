import { Task, TaskStatus } from "../types";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

interface Props {
  task: Task;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  isUpdating: boolean;
}

const NEXT_STATUS: Record<TaskStatus, { label: string; value: TaskStatus } | null> = {
  todo: { label: "Start", value: "in_progress" },
  in_progress: { label: "Complete", value: "completed" },
  completed: null,
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isDueSoon(dueDate: string): boolean {
  const due = new Date(dueDate);
  const now = new Date();
  const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= 7 && diff >= 0;
}

function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date();
}

export function TaskCard({ task, onStatusChange, isUpdating }: Props) {
  const nextAction = NEXT_STATUS[task.status];
  const overdue = task.status !== "completed" && isOverdue(task.dueDate);
  const dueSoon = !overdue && isDueSoon(task.dueDate);

  return (
    <div
      className={`bg-white rounded-lg border p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
        task.priority === "urgent" && task.status !== "completed"
          ? "border-l-4 border-l-red-400 border-gray-200"
          : task.priority === "high" && task.status !== "completed"
          ? "border-l-4 border-l-orange-400 border-gray-200"
          : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{task.title}</h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
          <div className="flex items-center gap-1 mt-2">
            <span
              className={`text-xs font-medium font-mono ${
                overdue ? "text-red-600" : dueSoon ? "text-orange-500" : "text-gray-400"
              }`}
            >
              {overdue ? "⚠ Overdue: " : dueSoon ? "⏰ Due soon: " : "Due: "}
              {formatDate(task.dueDate)}
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center">
          {nextAction && (
            <button
              onClick={() => onStatusChange(task.id, nextAction.value)}
              disabled={isUpdating}
              className="btn-ghost"
            >
              {isUpdating ? "..." : nextAction.label}
            </button>
          )}
          {task.status === "completed" && (
            <span className="text-green-500 text-lg" aria-label="Completed">
              ✓
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
