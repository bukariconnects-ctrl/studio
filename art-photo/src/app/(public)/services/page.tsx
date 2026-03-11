import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Clock, Tag, Camera } from "lucide-react";
import { ServiceSearch } from "./_components/service-search";

export const metadata: Metadata = {
  title: "الخدمات",
};

export const revalidate = 3600;

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("service_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  let query = supabase
    .from("services")
    .select("*, category:service_categories(id, name)")
    .eq("is_active", true);

  if (params.category) {
    query = query.eq("category_id", params.category);
  }

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  }

  if (params.sort === "price_asc") {
    query = query.order("base_price", { ascending: true });
  } else if (params.sort === "price_desc") {
    query = query.order("base_price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: services } = await query;

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p = { ...params, ...overrides };
    const qs = Object.entries(p).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join("&");
    return `/services${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>خدماتنا</h1>
        <p className="text-muted-foreground">اكتشف مجموعة واسعة من خدمات التصوير الاحترافي</p>
      </div>

      <ServiceSearch defaultValue={params.q} />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link
          href={buildUrl({ category: undefined })}
          className={`rounded-full border-2 border-foreground px-4 py-1.5 text-sm font-semibold shadow-pop transition-colors ${!params.category ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
        >
          الكل
        </Link>
        {(categories ?? []).map((cat) => (
          <Link
            key={cat.id}
            href={buildUrl({ category: cat.id })}
            className={`rounded-full border-2 border-foreground px-4 py-1.5 text-sm font-semibold shadow-pop transition-colors ${params.category === cat.id ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"}`}
          >
            {cat.name}
          </Link>
        ))}
        <div className="mr-auto flex gap-2">
          <Link
            href={buildUrl({ sort: "price_asc" })}
            className={`rounded-full border-2 border-foreground px-3 py-1.5 text-xs font-bold shadow-pop transition-colors ${params.sort === "price_asc" ? "bg-secondary text-white" : "bg-card hover:bg-muted"}`}
          >
            السعر ↑
          </Link>
          <Link
            href={buildUrl({ sort: "price_desc" })}
            className={`rounded-full border-2 border-foreground px-3 py-1.5 text-xs font-bold shadow-pop transition-colors ${params.sort === "price_desc" ? "bg-secondary text-white" : "bg-card hover:bg-muted"}`}
          >
            السعر ↓
          </Link>
        </div>
      </div>

      {(!services || services.length === 0) ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-muted-foreground">
          <Camera className="h-10 w-10 opacity-30" />
          <p>لا توجد خدمات متاحة حاليًا</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <div key={svc.id} className="overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-pop card-hover">
              {svc.cover_image_url && (
                <div className="aspect-video overflow-hidden border-b-2 border-foreground bg-muted">
                  <img
                    src={svc.cover_image_url}
                    alt={svc.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="text-lg font-bold">{svc.name}</h3>
                  <span className="rounded-full border-2 border-foreground bg-tertiary px-3 py-0.5 text-sm font-bold shadow-pop">
                    {Number(svc.base_price).toLocaleString()} ر.ي
                  </span>
                </div>
                {svc.description && (
                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">{svc.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 rounded-full border-2 border-foreground/30 px-2 py-0.5 font-semibold">
                    <Clock className="h-3 w-3" />
                    {svc.duration_minutes} دقيقة
                  </span>
                  {svc.category && (
                    <Badge variant="outline" className="border-2 border-foreground/30 text-xs">
                      <Tag className="ml-1 h-3 w-3" />
                      {svc.category.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
