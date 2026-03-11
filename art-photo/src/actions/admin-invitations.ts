"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export type ActionResult = {
  error?: string;
  success?: string;
};

export async function getInvitations() {
  const allowed = await checkPermission(PERMISSIONS.USERS_MANAGE);
  if (!allowed) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("photographer_invitations")
    .select("*, specialties(name)")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function sendPhotographerInvitation(formData: FormData): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.USERS_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const email = (formData.get("email") as string)?.trim();
  const fullName = (formData.get("full_name") as string)?.trim();
  const specialtyId = (formData.get("specialty_id") as string)?.trim() || null;

  if (!email || !fullName) return { error: "البريد الإلكتروني والاسم مطلوبان" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const token = crypto.randomBytes(32).toString("hex");

  const { error } = await supabase.from("photographer_invitations").insert({
    email,
    full_name: fullName,
    specialty_id: specialtyId,
    token,
    invited_by: user?.id ?? null,
  });

  if (error) return { error: error.message };

  const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/register?invite=${token}`;

  try {
    await sendEmail(
      email,
      "دعوة للانضمام كمصور - Art Photo Studio",
      `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #8B5CF6;">مرحباً ${fullName} 👋</h2>
        <p>تمت دعوتك للانضمام إلى فريق المصورين في <strong>Art Photo Studio</strong>.</p>
        <p>اضغط على الزر أدناه لإكمال تسجيلك:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${inviteUrl}" style="background: #8B5CF6; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; border: 2px solid #1E293B;">
            إكمال التسجيل
          </a>
        </div>
        <p style="color: #64748B; font-size: 14px;">هذا الرابط صالح لمدة 7 أيام.</p>
        <hr style="border: 1px solid #E2E8F0; margin: 20px 0;" />
        <p style="color: #94A3B8; font-size: 12px;">Art Photo Studio - استوديو تصوير احترافي</p>
      </div>
      `
    );
  } catch (emailError) {
    console.error("[sendPhotographerInvitation] Email error:", emailError);
  }

  revalidatePath("/admin/users");
  return { success: `تم إرسال الدعوة إلى ${email} بنجاح` };
}

export async function validateInvitationToken(token: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("photographer_invitations")
    .select("*, specialties(name)")
    .eq("token", token)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .single();

  return data;
}

export async function markInvitationAccepted(token: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("photographer_invitations")
    .update({ status: "accepted" })
    .eq("token", token);

  if (error) return { error: error.message };
  return { success: "تم قبول الدعوة" };
}
