import { UrgencyLevel } from "../types";

interface Props {
  level: UrgencyLevel;
}

const CONFIG: Record<UrgencyLevel, { label: string; classes: string; dot?: string }> = {
  critical: {
    label: "Critical",
    classes: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
  },
  high: {
    label: "High",
    classes: "bg-orange-100 text-orange-700 border-orange-200",
  },
  medium: {
    label: "Medium",
    classes: "bg-blue-100 text-blue-700 border-blue-200",
  },
  low: {
    label: "Low",
    classes: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

export function UrgencyBadge({ level }: Props) {
  const { label, classes, dot } = CONFIG[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${classes}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse flex-shrink-0`} />
      )}
      {label}
    </span>
  );
}
