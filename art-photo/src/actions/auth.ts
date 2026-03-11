"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth";
import { sendEmail } from "@/lib/email";
import { verificationEmailTemplate } from "@/lib/email-templates";

export type AuthResult = {
  error?: string;
  success?: string;
};

export async function signIn(formData: FormData): Promise<AuthResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const raw = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    agreeToTerms: formData.get("agreeToTerms") === "on" ? true as const : false as const,
  };

  const gdprConsent = formData.get("gdprConsent") === "on";
  if (!gdprConsent) {
    return { error: "يجب الموافقة على سياسة الخصوصية وحماية البيانات" };
  }

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const adminClient = createAdminClient();

  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: "signup",
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (linkError) {
    console.error("[signUp] generateLink error:", linkError.message, linkError.status);
    if (linkError.message.includes("already been registered") || linkError.message.includes("already registered")) {
      return { error: "هذا البريد الإلكتروني مسجل مسبقاً" };
    }
    return { error: "حدث خطأ أثناء إنشاء الحساب، حاول مرة أخرى" };
  }

  if (linkData.user) {
    await adminClient
      .from("profiles")
      .update({
        gdpr_consent: true,
        gdpr_consent_at: new Date().toISOString(),
      })
      .eq("id", linkData.user.id);
  }

  const confirmUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?token_hash=${linkData.properties.hashed_token}&type=email`;

  try {
    await sendEmail(
      parsed.data.email,
      "تأكيد البريد الإلكتروني - Art Photo Studio",
      verificationEmailTemplate(parsed.data.fullName, confirmUrl)
    );
  } catch (emailError) {
    console.error("[signUp] Email send error:", emailError);
  }

  return { success: "تم إنشاء الحساب بنجاح! تحقق من بريدك الإلكتروني لتأكيد الحساب." };
}

export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { error: "حدث خطأ أثناء الاتصال بـ Google" };
  }

  redirect(data.url);
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const raw = {
    email: formData.get("email") as string,
  };

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  });

  if (error) {
    return { error: "حدث خطأ أثناء إرسال رابط إعادة التعيين" };
  }

  return { success: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني" };
}

export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const raw = {
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: "حدث خطأ أثناء تحديث كلمة المرور" };
  }

  redirect("/auth/login?message=تم تحديث كلمة المرور بنجاح");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
