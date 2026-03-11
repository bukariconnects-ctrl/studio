"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const STATUS_LABELS: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "تم التأكيد",
  completed: "مكتمل",
  cancelled: "ملغى",
  rejected: "مرفوض",
};

export function useRealtimeBookings(userId: string | null) {
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`bookings:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
        },
        (payload) => {
          const newStatus = payload.new.status as string;
          const oldStatus = payload.old.status as string;

          if (newStatus !== oldStatus) {
            const label = STATUS_LABELS[newStatus] ?? newStatus;
            toast(`📅 تحديث حالة الحجز`, {
              description: `تم تحديث حالة الحجز إلى: ${label}`,
              duration: 5000,
            });
            router.refresh();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);
}
