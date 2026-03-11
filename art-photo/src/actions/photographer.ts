"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = {
  error?: string;
  success?: string;
};

export async function getPhotographerRecord() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("photographers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data;
}

export async function getUpcomingSessions(photographerId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("bookings")
    .select("*, client:profiles!bookings_client_id_fkey(full_name, phone, avatar_url), service:services(name, duration_minutes), package:packages(name)")
    .eq("photographer_id", photographerId)
    .in("status", ["pending", "confirmed"])
    .gte("booking_date", today)
    .order("booking_date", { ascending: true })
    .order("start_time", { ascending: true });

  return data ?? [];
}

export async function getPastSessions(photographerId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select("*, client:profiles!bookings_client_id_fkey(full_name, phone, avatar_url), service:services(name), package:packages(name)")
    .eq("photographer_id", photographerId)
    .in("status", ["completed", "cancelled"])
    .order("booking_date", { ascending: false })
    .limit(20);

  return data ?? [];
}

export async function getSessionDetails(bookingId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("bookings")
    .select("*, client:profiles!bookings_client_id_fkey(full_name, phone, email, avatar_url, bio, address), service:services(name, base_price, duration_minutes, description), package:packages(name, price, description)")
    .eq("id", bookingId)
    .single();

  return data;
}

export async function completeSession(bookingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const { data: photographer } = await supabase
    .from("photographers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!photographer) return { error: "غير مصرح" };

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "completed",
      actual_end_time: new Date().toTimeString().slice(0, 8),
    })
    .eq("id", bookingId)
    .eq("photographer_id", photographer.id);

  if (error) return { error: "فشل في تحديث حالة الجلسة" };

  revalidatePath("/photographer");
  revalidatePath("/photographer/sessions");
  revalidatePath("/photographer/history");
  return { success: "تم إتمام الجلسة بنجاح" };
}

export async function confirmSession(bookingId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const { data: photographer } = await supabase
    .from("photographers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!photographer) return { error: "غير مصرح" };

  const { error } = await supabase
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingId)
    .eq("photographer_id", photographer.id)
    .eq("status", "pending");

  if (error) return { error: "فشل في تأكيد الجلسة" };

  revalidatePath("/photographer");
  revalidatePath("/photographer/sessions");
  return { success: "تم تأكيد الجلسة" };
}
