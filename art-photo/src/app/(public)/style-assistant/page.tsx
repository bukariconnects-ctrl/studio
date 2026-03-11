import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StyleAssistantForm } from "./_components/style-assistant-form";

export const metadata: Metadata = {
  title: "مساعد المظهر الذكي",
};

export default async function StyleAssistantPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">مساعد المظهر الذكي ✨</h1>
          <p className="text-muted-foreground">
            احصل على نصائح مخصصة للمظهر بناءً على نوع جلسة التصوير باستخدام الذكاء الاصطناعي
          </p>
        </div>
        <StyleAssistantForm />
      </div>
    </div>
  );
}
