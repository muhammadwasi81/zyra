import { TaskStatus } from "../types";

interface Props {
  status: TaskStatus;
}

const CONFIG: Record<TaskStatus, { label: string; classes: string }> = {
  todo: { label: "To Do", classes: "bg-slate-100 text-slate-600" },
  in_progress: { label: "In Progress", classes: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", classes: "bg-green-100 text-green-700" },
};

export function StatusBadge({ status }: Props) {
  const { label, classes } = CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}
