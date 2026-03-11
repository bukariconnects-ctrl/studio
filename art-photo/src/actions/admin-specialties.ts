"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

export type ActionResult = {
  error?: string;
  success?: string;
};

export async function getSpecialties() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("specialties")
    .select("*")
    .order("name", { ascending: true });
  return data ?? [];
}

export async function createSpecialty(formData: FormData): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.SERVICES_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();

  if (!name) return { error: "اسم التخصص مطلوب" };

  const supabase = await createClient();
  const { error } = await supabase.from("specialties").insert({ name, description: description || null });

  if (error) {
    if (error.code === "23505") return { error: "هذا التخصص موجود مسبقاً" };
    return { error: error.message };
  }

  revalidatePath("/admin/specialties");
  revalidatePath("/admin/users");
  return { success: `تم إضافة التخصص "${name}" بنجاح` };
}

export async function updateSpecialty(id: string, formData: FormData): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.SERVICES_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const isActive = formData.get("is_active") === "true";

  if (!name) return { error: "اسم التخصص مطلوب" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("specialties")
    .update({ name, description: description || null, is_active: isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/specialties");
  return { success: "تم تحديث التخصص بنجاح" };
}

export async function deleteSpecialty(id: string): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.SERVICES_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();
  const { error } = await supabase.from("specialties").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/specialties");
  return { success: "تم حذف التخصص" };
}
