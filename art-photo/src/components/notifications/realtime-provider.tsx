"use client";

import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { useRealtimeBookings } from "@/hooks/use-realtime-bookings";

export function RealtimeProvider({ userId }: { userId: string | null }) {
  useRealtimeNotifications(userId);
  useRealtimeBookings(userId);
  return null;
}
