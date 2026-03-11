import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Brain, Database, Key, Sparkles } from "lucide-react";
import { EmbeddingsManager } from "./_components/embeddings-manager";

export const metadata: Metadata = {
  title: "إدارة الذكاء الاصطناعي",
};

export default async function EmbeddingsPage() {
  const supabase = await createClient();

  const [itemEmbRes, userEmbRes, servicesRes, productsRes, packagesRes] = await Promise.all([
    supabase.from("item_embeddings").select("id", { count: "exact", head: true }),
    supabase.from("user_embeddings").select("id", { count: "exact", head: true }),
    supabase.from("services").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("packages").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const totalItems = (servicesRes.count ?? 0) + (productsRes.count ?? 0) + (packagesRes.count ?? 0);
  const embeddedItems = itemEmbRes.count ?? 0;
  const hasApiKey = !!process.env.GEMINI_API_KEY;

  const stats = [
    { label: "متجهات العناصر", value: embeddedItems, total: totalItems, icon: Database, color: "bg-primary" },
    { label: "متجهات المستخدمين", value: userEmbRes.count ?? 0, icon: Brain, color: "bg-secondary" },
    { label: "Gemini API", value: hasApiKey ? "مفعّل" : "غير مفعّل", icon: Key, color: hasApiKey ? "bg-quaternary" : "bg-destructive" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>إدارة الذكاء الاصطناعي</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border-2 border-foreground bg-card p-4 shadow-pop card-hover">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 border-foreground ${stat.color} shadow-pop`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold leading-tight">
                  {stat.value}
                  {"total" in stat && <span className="text-xs font-normal text-muted-foreground"> / {stat.total}</span>}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border-2 border-foreground bg-card p-5 shadow-pop-lg">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-foreground bg-primary shadow-pop">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-heading)" }}>توليد المتجهات</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          يتم توليد متجهات لجميع الخدمات والمنتجات والباقات النشطة باستخدام Gemini text-embedding-004
          وتخزينها في جدول item_embeddings لتشغيل محرك التوصيات الذكية.
        </p>
        <EmbeddingsManager hasApiKey={hasApiKey} />
      </div>
    </div>
  );
}
