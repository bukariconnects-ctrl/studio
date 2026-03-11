"use server";

import { createClient } from "@/lib/supabase/server";
import { generateUserEmbedding } from "@/actions/embeddings";

export async function getAIRecommendations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { recommendations: [], source: "none" };

  await generateUserEmbedding(user.id);

  const { data, error } = await supabase.rpc("get_ai_recommendations", {
    p_user_id: user.id,
    p_limit: 10,
  });

  if (error || !data) {
    return { recommendations: [], source: "error" };
  }

  const result = data as { recommendations: unknown[]; source: string };
  return result;
}
