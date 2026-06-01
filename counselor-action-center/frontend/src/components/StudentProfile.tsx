import { Student, ActionCenterSummary } from "../types";
import { UrgencyBadge } from "./UrgencyBadge";

interface Props {
  student: Student;
  summary: ActionCenterSummary;
}

export function StudentProfile({ student, summary }: Props) {
  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const enrollmentLabel =
    student.enrollmentStatus === "at_risk"
      ? "At Risk"
      : student.enrollmentStatus === "active"
      ? "Active"
      : "Inactive";

  const completionPct =
    summary.totalTasks > 0
      ? Math.round((summary.completedTasks / summary.totalTasks) * 100)
      : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Accent bar — color-coded by urgency */}
      <div
        className={`h-1 w-full ${
          summary.urgencyLevel === "critical"
            ? "bg-red-500"
            : summary.urgencyLevel === "high"
            ? "bg-orange-400"
            : summary.urgencyLevel === "medium"
            ? "bg-blue-400"
            : "bg-gray-300"
        }`}
      />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-sm">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">{student.name}</h1>
              <p className="text-sm text-gray-500 font-mono text-xs mt-0.5">{student.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    student.enrollmentStatus === "at_risk"
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {enrollmentLabel}
                </span>
                <span className="text-xs text-gray-400">Grade {student.grade}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-xs text-gray-400 font-mono">GPA {student.gpa.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wider">Urgency</p>
            <UrgencyBadge level={summary.urgencyLevel} />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100">
          {[
            { label: "Total Tasks", value: summary.totalTasks, color: "text-gray-900" },
            { label: "Completed", value: summary.completedTasks, color: "text-green-600" },
            { label: "Urgent", value: summary.urgentTasks, color: "text-red-600" },
            { label: "Unread Msgs", value: summary.unreadMessages, color: "text-indigo-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Task completion</span>
            <span className="text-xs font-semibold font-mono text-gray-700">{completionPct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
