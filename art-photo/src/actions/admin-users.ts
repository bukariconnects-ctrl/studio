"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

export type ActionResult = {
  error?: string;
  success?: string;
};

export async function getUsers() {
  const allowed = await checkPermission(PERMISSIONS.USERS_MANAGE);
  if (!allowed) return [];

  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("*, user_roles(role:roles(name))")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function updateUserRole(userId: string, roleName: string): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.USERS_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const adminClient = createAdminClient();

  const { error: metaError } = await adminClient.auth.admin.updateUserById(userId, {
    app_metadata: { user_role: roleName },
  });

  if (metaError) return { error: "فشل في تحديث الدور" };

  const { data: role } = await supabase
    .from("roles")
    .select("id")
    .eq("name", roleName)
    .single();

  if (role) {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, role_id: role.id });
  }

  if (roleName === "photographer") {
    const { data: existing } = await supabase
      .from("photographers")
      .select("id")
      .eq("id", userId)
      .single();

    if (!existing) {
      await supabase.from("photographers").insert({
        id: userId,
        specialty: "تصوير عام",
        experience_years: 0,
      });
    }
  }

  revalidatePath("/admin/users");
  return { success: `تم تحديث الدور إلى ${roleName}` };
}

export async function softDeleteUser(userId: string): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.USERS_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user && userId === user.id) return { error: "لا يمكنك حذف حسابك" };

  const { data, error } = await supabase.rpc("soft_delete_user", {
    p_user_id: userId,
  });

  if (error) return { error: error.message };
  if (!data?.success) return { error: data?.message ?? "فشل في حذف المستخدم" };

  const adminClient = createAdminClient();
  await adminClient.auth.admin.updateUserById(userId, {
    ban_duration: "876000h",
  });

  revalidatePath("/admin/users");
  return { success: "تم حذف المستخدم بشكل آمن" };
}

export async function createPhotographerAccount(formData: FormData): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.USERS_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("full_name") as string;
  const specialty = formData.get("specialty") as string;
  const experienceYears = parseInt(formData.get("experience_years") as string) || 0;

  if (!email?.trim() || !password?.trim() || !fullName?.trim()) {
    return { error: "جميع الحقول مطلوبة" };
  }

  const adminClient = createAdminClient();

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email: email.trim(),
    password: password.trim(),
    email_confirm: true,
    app_metadata: { user_role: "photographer" },
    user_metadata: { full_name: fullName.trim() },
  });

  if (createError) return { error: createError.message };
  if (!newUser.user) return { error: "فشل في إنشاء الحساب" };

  const { data: role } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "photographer")
    .single();

  if (role) {
    await supabase.from("user_roles").insert({
      user_id: newUser.user.id,
      role_id: role.id,
    });
  }

  await supabase.from("photographers").insert({
    id: newUser.user.id,
    specialty: specialty?.trim() || "تصوير عام",
    experience_years: experienceYears,
  });

  revalidatePath("/admin/users");
  return { success: `تم إنشاء حساب المصور ${fullName} بنجاح` };
}
