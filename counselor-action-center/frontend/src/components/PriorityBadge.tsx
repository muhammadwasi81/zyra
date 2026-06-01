import { TaskPriority } from "../types";

interface Props {
  priority: TaskPriority;
}

const CONFIG: Record<TaskPriority, { label: string; classes: string }> = {
  urgent: { label: "Urgent", classes: "bg-red-50 text-red-600 border-red-200" },
  high: { label: "High", classes: "bg-orange-50 text-orange-600 border-orange-200" },
  medium: { label: "Medium", classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  low: { label: "Low", classes: "bg-gray-50 text-gray-500 border-gray-200" },
};

export function PriorityBadge({ priority }: Props) {
  const { label, classes } = CONFIG[priority];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${classes}`}>
      {label}
    </span>
  );
}
