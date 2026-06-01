import { useCallback } from "react";
import { useActionCenter } from "../hooks/useActionCenter";
import { useTaskUpdate } from "../hooks/useTaskUpdate";
import { StudentProfile } from "../components/StudentProfile";
import { TaskList } from "../components/TaskList";
import { MessageInbox } from "../components/MessageInbox";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorState } from "../components/ErrorState";
import { useState } from "react";

const STUDENT_IDS = [
  { id: "stu_001", name: "Maya Patel" },
  { id: "stu_002", name: "Jordan Lee" },
  { id: "stu_003", name: "Carlos Rivera" },
];

export function ActionCenter() {
  const [selectedId, setSelectedId] = useState("stu_001");
  const { data, loading, error, refetch } = useActionCenter(selectedId);

  const handleTaskSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  const { updateTask, updating } = useTaskUpdate(handleTaskSuccess);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold font-mono">AC</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-tight">Action Center</p>
              <p className="text-xs text-gray-400 leading-tight">Counselor Dashboard</p>
            </div>
          </div>

          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow"
          >
            {STUDENT_IDS.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {loading && <LoadingSpinner />}
        {error && <ErrorState message={error} onRetry={refetch} />}
        {data && !loading && (
          <div className="space-y-5">
            <StudentProfile student={data.student} summary={data.summary} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <TaskList
                tasks={data.tasks}
                onStatusChange={updateTask}
                updatingIds={updating}
              />
              <MessageInbox
                messages={data.messages}
                unreadCount={data.summary.unreadMessages}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
