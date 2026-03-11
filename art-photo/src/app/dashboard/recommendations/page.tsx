import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAIRecommendations } from "@/actions/ai-recommendations";
import { RecommendationsList } from "./_components/recommendations-list";

export const metadata: Metadata = {
  title: "توصيات ذكية",
};

export default async function RecommendationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { recommendations, source } = await getAIRecommendations();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">منتجات مقترحة لك ✨</h1>
          <p className="text-muted-foreground">
            {source === "ai_similarity"
              ? "توصيات مخصصة بناءً على تفضيلاتك وسجل نشاطك"
              : "أحدث المنتجات والخدمات المتاحة"}
          </p>
        </div>
        <RecommendationsList recommendations={recommendations} source={source} />
      </div>
    </div>
  );
}
