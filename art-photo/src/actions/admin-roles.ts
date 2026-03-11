"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

export type ActionResult = {
  error?: string;
  success?: string;
};

export async function getRoles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roles")
    .select("*, role_permissions(permission_id)")
    .order("created_at");

  if (error) return [];
  return data;
}

export async function getPermissions() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .order("name");

  if (error) return [];
  return data;
}

export async function getRolePermissions(roleId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", roleId);

  if (error) return [];
  return data.map((rp) => rp.permission_id);
}

export async function createRole(formData: FormData): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.ROLES_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name?.trim()) return { error: "اسم الدور مطلوب" };

  const supabase = await createClient();
  const { error } = await supabase.from("roles").insert({
    name: name.trim().toLowerCase(),
    description: description?.trim() || null,
  });

  if (error) {
    if (error.code === "23505") return { error: "هذا الدور موجود مسبقاً" };
    return { error: "فشل في إنشاء الدور" };
  }

  revalidatePath("/admin/roles");
  return { success: "تم إنشاء الدور بنجاح" };
}

export async function updateRolePermissions(
  roleId: string,
  permissionIds: string[]
): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.ROLES_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const { error: deleteError } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId);

  if (deleteError) return { error: "فشل في تحديث الصلاحيات" };

  if (permissionIds.length > 0) {
    const rows = permissionIds.map((permissionId) => ({
      role_id: roleId,
      permission_id: permissionId,
    }));

    const { error: insertError } = await supabase
      .from("role_permissions")
      .insert(rows);

    if (insertError) return { error: "فشل في إضافة الصلاحيات" };
  }

  revalidatePath("/admin/roles");
  return { success: "تم تحديث صلاحيات الدور بنجاح" };
}

export async function deleteRole(roleId: string): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.ROLES_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const { data: role } = await supabase
    .from("roles")
    .select("name")
    .eq("id", roleId)
    .single();

  const protectedRoles = ["admin", "client", "photographer", "visitor"];
  if (role && protectedRoles.includes(role.name)) {
    return { error: "لا يمكن حذف الأدوار الأساسية" };
  }

  const { error } = await supabase.from("roles").delete().eq("id", roleId);

  if (error) return { error: "فشل في حذف الدور" };

  revalidatePath("/admin/roles");
  return { success: "تم حذف الدور بنجاح" };
}
