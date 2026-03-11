"use server";

import { createClient } from "@/lib/supabase/server";
import { contactSchema } from "@/lib/validations/contact";
import { sendEmail } from "@/lib/email";

export type ContactResult = {
  error?: string;
  success?: string;
};

export async function submitContact(formData: FormData): Promise<ContactResult> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    subject: formData.get("subject") as string,
    message: formData.get("message") as string,
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  try {
    const supabase = await createClient();

    const { error: dbError } = await supabase.from("tickets").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
      status: "open",
    });

    if (dbError) {
      return { error: "حدث خطأ أثناء إرسال الرسالة، حاول مرة أخرى" };
    }

    try {
      await sendEmail(
        process.env.GOOGLE_EMAIL!,
        `رسالة جديدة من ${parsed.data.name}: ${parsed.data.subject}`,
        `<div dir="rtl" style="font-family:Arial,sans-serif;">
          <h2>رسالة جديدة من نموذج التواصل</h2>
          <p><strong>الاسم:</strong> ${parsed.data.name}</p>
          <p><strong>البريد:</strong> ${parsed.data.email}</p>
          <p><strong>الموضوع:</strong> ${parsed.data.subject}</p>
          <p><strong>الرسالة:</strong></p>
          <p>${parsed.data.message}</p>
        </div>`
      );
    } catch {
      // no-op
    }

    return { success: "تم إرسال رسالتك بنجاح! سنتواصل معك في أقرب وقت." };
  } catch {
    return { error: "حدث خطأ أثناء إرسال الرسالة، حاول مرة أخرى" };
  }
}
