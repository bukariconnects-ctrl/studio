"use server";

import { createClient } from "@/lib/supabase/server";
import { type Permission } from "@/lib/permissions";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserRole(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) return "visitor";
  return (user.app_metadata?.user_role as string) ?? "client";
}

export async function getUserPermissions(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return (user.app_metadata?.permissions as string[]) ?? [];
}

export async function checkPermission(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const role = (user.app_metadata?.user_role as string) ?? "client";
  if (role === "admin") return true;

  const permissions = (user.app_metadata?.permissions as string[]) ?? [];
  return permissions.includes(permission);
}

export async function requirePermission(permission: Permission): Promise<void> {
  const allowed = await checkPermission(permission);
  if (!allowed) {
    throw new Error("غير مصرح: ليس لديك الصلاحية المطلوبة");
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("يجب تسجيل الدخول");
  }
  return user;
}

export async function requireRole(role: string) {
  const user = await requireAuth();
  const userRole = (user.app_metadata?.user_role as string) ?? "client";
  if (userRole !== role && userRole !== "admin") {
    throw new Error("غير مصرح");
  }
  return user;
}
