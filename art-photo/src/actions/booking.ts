"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type BookingActionResult = {
  error?: string;
  success?: string;
  bookingId?: string;
};

export async function checkAvailability(
  photographerId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<{ available: boolean; message: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("check_photographer_availability", {
    p_photographer_id: photographerId,
    p_date: date,
    p_start_time: startTime,
    p_end_time: endTime,
  });

  if (error) return { available: false, message: "حدث خطأ أثناء التحقق" };

  return {
    available: data?.available ?? false,
    message: data?.message ?? "حدث خطأ",
  };
}

export async function createBooking(formData: FormData): Promise<BookingActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "يجب تسجيل الدخول لإنشاء حجز" };

  const photographerId = formData.get("photographer_id") as string;
  const serviceId = formData.get("service_id") as string;
  const packageId = formData.get("package_id") as string;
  const bookingDate = formData.get("booking_date") as string;
  const startTime = formData.get("start_time") as string;
  const endTime = formData.get("end_time") as string;
  const location = formData.get("location") as string;
  const clientNotes = formData.get("client_notes") as string;

  if (!photographerId) return { error: "يجب اختيار مصور" };
  if (!bookingDate) return { error: "يجب تحديد التاريخ" };
  if (!startTime || !endTime) return { error: "يجب تحديد الوقت" };
  if (!serviceId && !packageId) return { error: "يجب اختيار خدمة أو باقة" };

  const { data, error } = await supabase.rpc("create_booking", {
    p_client_id: user.id,
    p_photographer_id: photographerId,
    p_service_id: serviceId || null,
    p_package_id: packageId || null,
    p_booking_date: bookingDate,
    p_start_time: startTime,
    p_end_time: endTime,
    p_location: location || null,
    p_client_notes: clientNotes || null,
  });

  if (error) return { error: error.message };

  if (!data?.success) return { error: data?.error ?? "فشل في إنشاء الحجز" };

  revalidatePath("/dashboard");
  revalidatePath("/bookings");
  return {
    success: data.message,
    bookingId: data.booking_id,
  };
}

export async function getPhotographers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("photographers")
    .select("id, specialty, experience_years, average_rating, hourly_rate, profiles(full_name, avatar_url)")
    .eq("is_available", true)
    .order("average_rating", { ascending: false });

  return (data ?? []).map((ph: Record<string, unknown>) => ({
    id: ph.id as string,
    specialty: ph.specialty as string | null,
    experience_years: ph.experience_years as number,
    average_rating: ph.average_rating as number,
    hourly_rate: ph.hourly_rate as number | null,
    profile: (ph.profiles as { full_name: string; avatar_url: string | null }[] | null)?.[0] ?? null,
  }));
}

export async function getServicesAndPackages() {
  const supabase = await createClient();

  const [servicesRes, packagesRes] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, base_price, duration_minutes")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("packages")
      .select("id, name, price, discount_percentage")
      .eq("is_active", true)
      .order("name"),
  ]);

  return {
    services: servicesRes.data ?? [],
    packages: packagesRes.data ?? [],
  };
}
