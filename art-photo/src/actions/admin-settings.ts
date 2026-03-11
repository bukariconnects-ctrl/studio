"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

export type ActionResult = {
  error?: string;
  success?: string;
};

export async function getSystemSettings() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("system_settings")
    .select("*")
    .order("key");

  return data ?? [];
}

export async function updateSetting(key: string, value: string): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.SETTINGS_CMS);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("system_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);

  if (error) return { error: "فشل في تحديث الإعداد" };

  revalidatePath("/admin/settings");
  revalidatePath("/about");
  revalidatePath("/privacy");
  revalidatePath("/terms");
  return { success: `تم تحديث "${key}"` };
}

export async function createSetting(formData: FormData): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.SETTINGS_CMS);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const key = formData.get("key") as string;
  const value = formData.get("value") as string;
  const description = formData.get("description") as string;

  if (!key?.trim()) return { error: "المفتاح مطلوب" };

  const { error } = await supabase.from("system_settings").insert({
    key: key.trim(),
    value: value?.trim() || "",
    description: description?.trim() || null,
  });

  if (error) {
    if (error.code === "23505") return { error: "المفتاح موجود مسبقاً" };
    return { error: "فشل في إنشاء الإعداد" };
  }

  revalidatePath("/admin/settings");
  return { success: "تم إنشاء الإعداد" };
}
