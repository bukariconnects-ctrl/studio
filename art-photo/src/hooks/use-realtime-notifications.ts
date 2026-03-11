"use client";

import { useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  type: string;
  reference_id: string | null;
  reference_type: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  booking: "📅",
  order: "🛒",
  review: "⭐",
  ticket: "🎫",
  assignment: "📋",
  system: "🔔",
  general: "💬",
};

export function useRealtimeNotifications(userId: string | null, onNew?: (n: Notification) => void) {
  const showToast = useCallback(
    (notification: Notification) => {
      const icon = TYPE_ICONS[notification.type] ?? "🔔";
      toast(`${icon} ${notification.title}`, {
        description: notification.body ?? undefined,
        duration: 6000,
      });
      onNew?.(notification);
    },
    [onNew],
  );

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          showToast(payload.new as Notification);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, showToast]);
}
