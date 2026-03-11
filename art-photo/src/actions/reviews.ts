"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = {
  error?: string;
  success?: string;
};

export async function submitReview(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "يجب تسجيل الدخول" };

  const bookingId = formData.get("booking_id") as string;
  const photographerId = formData.get("photographer_id") as string;
  const serviceId = formData.get("service_id") as string;
  const rating = parseInt(formData.get("rating") as string);
  const comment = (formData.get("comment") as string)?.trim() || null;

  if (!bookingId || !rating || rating < 1 || rating > 5) {
    return { error: "بيانات التقييم غير صالحة" };
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, status")
    .eq("id", bookingId)
    .eq("client_id", user.id)
    .eq("status", "completed")
    .single();

  if (!booking) return { error: "لا يمكن تقييم هذا الحجز" };

  const { error } = await supabase.from("reviews").insert({
    client_id: user.id,
    photographer_id: photographerId || null,
    service_id: serviceId || null,
    booking_id: bookingId,
    rating,
    comment,
  });

  if (error) {
    if (error.code === "23505") return { error: "لقد قيّمت هذا الحجز مسبقاً" };
    return { error: "فشل في إرسال التقييم" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/photographers");
  return { success: "تم إرسال التقييم بنجاح" };
}

export async function getBookingsToReview() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: reviewedBookings } = await supabase
    .from("reviews")
    .select("booking_id")
    .eq("client_id", user.id);

  const reviewedIds = (reviewedBookings ?? []).map((r: { booking_id: string }) => r.booking_id);

  let query = supabase
    .from("bookings")
    .select("id, booking_date, photographer_id, service_id, photographer:photographers(id, profiles!inner(full_name)), service:services(id, name)")
    .eq("client_id", user.id)
    .eq("status", "completed")
    .order("booking_date", { ascending: false })
    .limit(10);

  if (reviewedIds.length > 0) {
    query = query.not("id", "in", `(${reviewedIds.join(",")})`);
  }

  const { data } = await query;

  return (data ?? []).map((b: Record<string, unknown>) => ({
    id: b.id as string,
    booking_date: b.booking_date as string,
    photographer_id: b.photographer_id as string,
    service_id: b.service_id as string | null,
    photographer_name: ((b.photographer as Record<string, unknown>)?.profiles as { full_name: string } | null)?.full_name ?? "مصور",
    service_name: (b.service as { name: string } | null)?.name ?? null,
  }));
}

export async function getPhotographerReviews(photographerId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("reviews")
    .select("*, client:profiles!reviews_client_id_fkey(full_name, avatar_url)")
    .eq("photographer_id", photographerId)
    .eq("is_visible", true)
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}
