"use client";

import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationToast() {
  const clientId = "frontend-A"; // can make dynamic later
  const { notifications, markAsRead } = useNotifications(clientId);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 space-y-3 z-50">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="bg-white border border-gray-300 shadow-xl rounded-lg p-4 w-80 animate-fadeIn"
        >
          <div className="font-semibold text-gray-800">
            📰 New article on {n.person}
          </div>
          <p className="text-sm text-gray-600 mt-1">{n.message}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(n.timestamp + "Z").toLocaleString("en-SG", {
              timeZone: "Asia/Singapore",
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <button
            onClick={() => markAsRead([n.id])}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
