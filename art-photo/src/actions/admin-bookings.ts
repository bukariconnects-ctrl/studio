"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

export type ActionResult = {
  error?: string;
  success?: string;
};

export async function getBookings() {
  const allowed = await checkPermission(PERMISSIONS.BOOKINGS_VIEW_ALL);
  if (!allowed) return [];

  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select("*, profiles!bookings_client_id_fkey(full_name, phone), services(name), packages(name), photographer:photographers!bookings_photographer_id_fkey(id, profiles!photographers_id_fkey(full_name))")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function updateBookingStatus(bookingId: string, status: string): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.BOOKINGS_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const validStatuses = ["pending", "confirmed", "in_progress", "completed", "cancelled", "rejected"];
  if (!validStatuses.includes(status)) return { error: "حالة غير صالحة" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);

  if (error) return { error: error.message };

  revalidatePath("/admin/bookings");
  return { success: `تم تحديث حالة الحجز إلى ${status}` };
}
