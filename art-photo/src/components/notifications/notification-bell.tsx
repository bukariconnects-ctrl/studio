"use client";

import { useState, useEffect, useTransition } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import {
  getUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/actions/notifications";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getUnreadNotifications().then((data) => setNotifications(data));
  }, []);

  useRealtimeNotifications(userId, (newNotif) => {
    setNotifications((prev) => [newNotif, ...prev].slice(0, 20));
  });

  function handleMarkRead(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    startTransition(() => markNotificationRead(id));
  }

  function handleMarkAll() {
    setNotifications([]);
    startTransition(() => markAllNotificationsRead());
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        }
      />
      <PopoverContent align="end" className="w-80">
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-sm font-semibold">الإشعارات</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAll}
              disabled={isPending}
              className="h-auto py-1 text-xs"
            >
              <CheckCheck className="h-3 w-3" />
              <span>قراءة الكل</span>
            </Button>
          )}
        </div>
        <div className="max-h-72 space-y-1 overflow-y-auto pt-2">
          {notifications.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              لا توجد إشعارات جديدة
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-2 rounded-md p-2 hover:bg-accent"
              >
                <div className="flex-1 space-y-0.5">
                  <p className="text-sm font-medium leading-tight">{n.title}</p>
                  {n.body && (
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleString("ar-SA")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => handleMarkRead(n.id)}
                  disabled={isPending}
                >
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
