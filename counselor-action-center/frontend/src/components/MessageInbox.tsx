import { Message } from "../types";

interface Props {
  messages: Message[];
  unreadCount: number;
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessageInbox({ messages, unreadCount }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-800">Messages</h2>
        {unreadCount > 0 && (
          <span className="text-xs font-bold text-white bg-indigo-600 rounded-full px-2 py-0.5 font-mono">
            {unreadCount} unread
          </span>
        )}
      </div>

      <div className="space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`bg-white rounded-lg border p-4 transition-all duration-200 hover:shadow-sm ${
              !msg.read ? "border-indigo-200 bg-indigo-50/30" : "border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {!msg.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                  )}
                  <p className="text-xs font-semibold text-gray-600 truncate">{msg.from}</p>
                </div>
                <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{msg.subject}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{msg.preview}</p>
              </div>
              <p className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap font-mono">
                {formatTime(msg.receivedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
