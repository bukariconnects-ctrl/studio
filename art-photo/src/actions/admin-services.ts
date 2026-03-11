"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

export type ActionResult = {
  error?: string;
  success?: string;
};

export async function createServiceCategory(formData: FormData): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.SERVICES_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name?.trim()) return { error: "اسم التصنيف مطلوب" };

  const { error } = await supabase.from("service_categories").insert({
    name: name.trim(),
    description: description?.trim() || null,
  });

  if (error) return { error: "فشل في إنشاء التصنيف" };

  revalidatePath("/admin/services");
  return { success: "تم إنشاء التصنيف بنجاح" };
}

export async function createService(formData: FormData): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.SERVICES_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const base_price = parseFloat(formData.get("base_price") as string);
  const duration_minutes = parseInt(formData.get("duration_minutes") as string);
  const category_id = formData.get("category_id") as string;
  const imageFile = formData.get("cover_image") as File | null;

  if (!name?.trim()) return { error: "اسم الخدمة مطلوب" };
  if (isNaN(base_price) || base_price <= 0) return { error: "السعر غير صالح" };
  if (isNaN(duration_minutes) || duration_minutes <= 0) return { error: "المدة غير صالحة" };

  let cover_image_url: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop();
    const path = `services/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("catalog")
      .upload(path, imageFile);

    if (uploadError) return { error: "فشل في رفع الصورة" };

    const { data: urlData } = supabase.storage.from("catalog").getPublicUrl(path);
    cover_image_url = urlData.publicUrl;
  }

  const { error } = await supabase.from("services").insert({
    name: name.trim(),
    description: description?.trim() || null,
    base_price,
    duration_minutes,
    category_id: category_id || null,
    cover_image_url,
  });

  if (error) return { error: "فشل في إنشاء الخدمة" };

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: "تم إنشاء الخدمة بنجاح" };
}

export async function updateService(formData: FormData): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.SERVICES_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const base_price = parseFloat(formData.get("base_price") as string);
  const duration_minutes = parseInt(formData.get("duration_minutes") as string);
  const category_id = formData.get("category_id") as string;
  const is_active = formData.get("is_active") === "true";
  const imageFile = formData.get("cover_image") as File | null;

  if (!id) return { error: "معرف الخدمة مطلوب" };
  if (!name?.trim()) return { error: "اسم الخدمة مطلوب" };

  const updates: Record<string, unknown> = {
    name: name.trim(),
    description: description?.trim() || null,
    base_price,
    duration_minutes,
    category_id: category_id || null,
    is_active,
  };

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop();
    const path = `services/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("catalog")
      .upload(path, imageFile);

    if (uploadError) return { error: "فشل في رفع الصورة" };

    const { data: urlData } = supabase.storage.from("catalog").getPublicUrl(path);
    updates.cover_image_url = urlData.publicUrl;
  }

  const { error } = await supabase.from("services").update(updates).eq("id", id);

  if (error) return { error: "فشل في تحديث الخدمة" };

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: "تم تحديث الخدمة بنجاح" };
}

export async function deleteService(id: string): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.SERVICES_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) return { error: "فشل في حذف الخدمة" };

  revalidatePath("/admin/services");
  revalidatePath("/services");
  return { success: "تم حذف الخدمة بنجاح" };
}
