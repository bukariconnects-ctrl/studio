"use server";

import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validations/profile";
import { revalidatePath } from "next/cache";

export type ProfileResult = {
  error?: string;
  success?: string;
};

export async function updateProfile(formData: FormData): Promise<ProfileResult> {
  const raw = {
    fullName: formData.get("fullName") as string,
    phone: (formData.get("phone") as string) || undefined,
    bio: (formData.get("bio") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "يجب تسجيل الدخول أولاً" };
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: { full_name: parsed.data.fullName },
  });

  if (authError) {
    return { error: "حدث خطأ أثناء تحديث بيانات الحساب" };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone ?? null,
      bio: parsed.data.bio ?? null,
      address: parsed.data.address ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: "حدث خطأ أثناء تحديث الملف الشخصي" };
  }

  revalidatePath("/profile");
  return { success: "تم تحديث الملف الشخصي بنجاح" };
}

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}
