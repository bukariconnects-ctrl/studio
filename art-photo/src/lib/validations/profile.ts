import { z } from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, "الاسم الكامل مطلوب")
    .min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[\d+\-\s()]{7,15}$/.test(val), {
      message: "رقم الهاتف غير صالح",
    }),
  bio: z.string().max(500, "النبذة يجب ألا تتجاوز 500 حرف").optional(),
  address: z.string().max(200, "العنوان يجب ألا يتجاوز 200 حرف").optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
