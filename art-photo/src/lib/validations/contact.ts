import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب").min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  email: z.string().min(1, "البريد الإلكتروني مطلوب").email("صيغة البريد الإلكتروني غير صحيحة"),
  subject: z.string().min(1, "الموضوع مطلوب").min(5, "الموضوع يجب أن يكون 5 أحرف على الأقل"),
  message: z.string().min(1, "الرسالة مطلوبة").min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل").max(2000, "الرسالة يجب ألا تتجاوز 2000 حرف"),
});

export type ContactFormData = z.infer<typeof contactSchema>;
