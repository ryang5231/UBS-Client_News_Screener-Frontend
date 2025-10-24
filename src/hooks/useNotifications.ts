"use client";

import { useEffect, useState } from "react";

export interface NotificationItem {
  id: string;
  person: string;
  message: string;
  timestamp: string;
}

export function useNotifications(clientId: string) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications?client_id=${clientId}`,
        );
        const data = await res.json();
        if (data.count > 0) {
          setNotifications(data.notifications);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    // first fetch + poll every 15s
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [clientId]);

  const markAsRead = async (ids: string[]) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/mark-read`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ client_id: clientId, ids }),
        },
      );
      setNotifications((prev) => prev.filter((n) => !ids.includes(n.id)));
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  };

  return { notifications, markAsRead };
}
