"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

export type ActionResult = {
  error?: string;
  success?: string;
};

export async function createPackage(formData: FormData): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.PACKAGES_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const discount_percentage = parseFloat(formData.get("discount_percentage") as string) || 0;
  const serviceIds = formData.getAll("service_ids") as string[];
  const imageFile = formData.get("cover_image") as File | null;

  if (!name?.trim()) return { error: "اسم الباقة مطلوب" };
  if (isNaN(price) || price <= 0) return { error: "السعر غير صالح" };

  let cover_image_url: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop();
    const path = `packages/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("catalog")
      .upload(path, imageFile);

    if (uploadError) return { error: "فشل في رفع الصورة" };

    const { data: urlData } = supabase.storage.from("catalog").getPublicUrl(path);
    cover_image_url = urlData.publicUrl;
  }

  const { data: pkg, error } = await supabase
    .from("packages")
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      price,
      discount_percentage,
      cover_image_url,
    })
    .select("id")
    .single();

  if (error || !pkg) return { error: "فشل في إنشاء الباقة" };

  if (serviceIds.length > 0) {
    const links = serviceIds.map((sid) => ({
      package_id: pkg.id,
      service_id: sid,
    }));
    await supabase.from("package_services").insert(links);
  }

  revalidatePath("/admin/packages");
  return { success: "تم إنشاء الباقة بنجاح" };
}

export async function updatePackage(formData: FormData): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.PACKAGES_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const discount_percentage = parseFloat(formData.get("discount_percentage") as string) || 0;
  const is_active = formData.get("is_active") === "true";
  const serviceIds = formData.getAll("service_ids") as string[];
  const imageFile = formData.get("cover_image") as File | null;

  if (!id) return { error: "معرف الباقة مطلوب" };
  if (!name?.trim()) return { error: "اسم الباقة مطلوب" };

  const updates: Record<string, unknown> = {
    name: name.trim(),
    description: description?.trim() || null,
    price,
    discount_percentage,
    is_active,
  };

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop();
    const path = `packages/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("catalog")
      .upload(path, imageFile);

    if (uploadError) return { error: "فشل في رفع الصورة" };

    const { data: urlData } = supabase.storage.from("catalog").getPublicUrl(path);
    updates.cover_image_url = urlData.publicUrl;
  }

  const { error } = await supabase.from("packages").update(updates).eq("id", id);
  if (error) return { error: "فشل في تحديث الباقة" };

  await supabase.from("package_services").delete().eq("package_id", id);
  if (serviceIds.length > 0) {
    const links = serviceIds.map((sid) => ({
      package_id: id,
      service_id: sid,
    }));
    await supabase.from("package_services").insert(links);
  }

  revalidatePath("/admin/packages");
  return { success: "تم تحديث الباقة بنجاح" };
}

export async function deletePackage(id: string): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.PACKAGES_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const { error } = await supabase.from("packages").delete().eq("id", id);
  if (error) return { error: "فشل في حذف الباقة" };

  revalidatePath("/admin/packages");
  return { success: "تم حذف الباقة بنجاح" };
}
