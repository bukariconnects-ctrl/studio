"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = {
  error?: string;
  success?: string;
};

export async function createAlbum(bookingId: string, title: string): Promise<ActionResult & { albumId?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const { data: photographer } = await supabase
    .from("photographers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!photographer) return { error: "غير مصرح" };

  const { data: booking } = await supabase
    .from("bookings")
    .select("id")
    .eq("id", bookingId)
    .eq("photographer_id", photographer.id)
    .single();

  if (!booking) return { error: "الحجز غير موجود أو غير مصرح" };

  const { data: album, error } = await supabase
    .from("albums")
    .insert({
      booking_id: bookingId,
      photographer_id: photographer.id,
      title: title.trim() || "ألبوم الجلسة",
    })
    .select("id")
    .single();

  if (error) return { error: "فشل في إنشاء الألبوم" };

  revalidatePath("/photographer/upload");
  return { success: "تم إنشاء الألبوم", albumId: album.id };
}

export async function uploadPhotos(albumId: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  const { data: photographer } = await supabase
    .from("photographers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!photographer) return { error: "غير مصرح" };

  const { data: album } = await supabase
    .from("albums")
    .select("id")
    .eq("id", albumId)
    .eq("photographer_id", photographer.id)
    .single();

  if (!album) return { error: "الألبوم غير موجود أو غير مصرح" };

  const files = formData.getAll("photos") as File[];
  if (files.length === 0) return { error: "لم يتم اختيار صور" };

  const uploadResults = [];

  for (const file of files) {
    if (!file.size) continue;
    const ext = file.name.split(".").pop();
    const path = `albums/${albumId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("catalog")
      .upload(path, file);

    if (uploadError) continue;

    const { data: urlData } = supabase.storage.from("catalog").getPublicUrl(path);

    uploadResults.push({
      album_id: albumId,
      photo_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
    });
  }

  if (uploadResults.length === 0) return { error: "فشل في رفع الصور" };

  const { error } = await supabase.from("album_photos").insert(uploadResults);
  if (error) return { error: "فشل في حفظ بيانات الصور" };

  await supabase
    .from("albums")
    .update({ photo_count: uploadResults.length })
    .eq("id", albumId);

  revalidatePath("/photographer/upload");
  return { success: `تم رفع ${uploadResults.length} صورة بنجاح` };
}

export async function getPhotographerAlbums() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: photographer } = await supabase
    .from("photographers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!photographer) return [];

  const { data } = await supabase
    .from("albums")
    .select("*, booking:bookings(booking_date, client_id, client:profiles!bookings_client_id_fkey(full_name)), photos:album_photos(id, photo_url, file_name)")
    .eq("photographer_id", photographer.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getCompletedBookingsWithoutAlbum() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: photographer } = await supabase
    .from("photographers")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!photographer) return [];

  const { data: existingAlbumBookings } = await supabase
    .from("albums")
    .select("booking_id")
    .eq("photographer_id", photographer.id);

  const excludeIds = (existingAlbumBookings ?? []).map((a: { booking_id: string }) => a.booking_id);

  let query = supabase
    .from("bookings")
    .select("id, booking_date, profiles!bookings_client_id_fkey(full_name), services(name), packages(name)")
    .eq("photographer_id", photographer.id)
    .eq("status", "completed")
    .order("booking_date", { ascending: false });

  if (excludeIds.length > 0) {
    query = query.not("id", "in", `(${excludeIds.join(",")})`);
  }

  const { data } = await query;
  return (data ?? []).map((b: Record<string, unknown>) => ({
    id: b.id as string,
    booking_date: b.booking_date as string,
    client: (b.profiles as { full_name: string }[] | null)?.[0] ?? null,
    service: (b.services as { name: string }[] | null)?.[0] ?? null,
    package: (b.packages as { name: string }[] | null)?.[0] ?? null,
  }));
}
