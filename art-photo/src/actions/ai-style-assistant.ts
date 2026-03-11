"use server";

import { getGeminiModel } from "@/lib/gemini";

export type StyleAdvice = {
  advice: string;
  error?: string;
};

export async function getStyleAdvice(
  sessionType: string,
  occasion?: string,
  gender?: string,
  season?: string,
): Promise<StyleAdvice> {
  try {
    const model = getGeminiModel();

    const prompt = `أنت مساعد مظهر محترف في استوديو Art Photo Studio.
المستخدم يحتاج نصائح للمظهر لجلسة تصوير.

نوع الجلسة: ${sessionType}
${occasion ? `المناسبة: ${occasion}` : ""}
${gender ? `الجنس: ${gender}` : ""}
${season ? `الموسم: ${season}` : ""}

قدم نصائح مختصرة ومفيدة حول:
1. الملابس المناسبة (الألوان والأنماط)
2. الإكسسوارات المقترحة
3. تسريحة الشعر والمكياج
4. نصائح عامة لأفضل صورة

أجب باللغة العربية بشكل منظم ومختصر.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return { advice: text };
  } catch {
    return {
      advice: "",
      error: "فشل في الحصول على نصائح المظهر. يرجى المحاولة لاحقاً.",
    };
  }
}
