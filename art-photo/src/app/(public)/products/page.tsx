import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Tag, ShoppingBag } from "lucide-react";
import { ProductSearch } from "./_components/product-search";

export const metadata: Metadata = {
  title: "المتجر",
};

export const revalidate = 3600;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("product_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  let query = supabase
    .from("products")
    .select("*, category:product_categories(id, name)")
    .eq("is_active", true);

  if (params.category) {
    query = query.eq("category_id", params.category);
  }

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  }

  if (params.sort === "price_asc") {
    query = query.order("price", { ascending: true });
  } else if (params.sort === "price_desc") {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: products } = await query;

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const p = { ...params, ...overrides };
    const qs = Object.entries(p).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join("&");
    return `/products${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>المتجر</h1>
        <p className="text-muted-foreground">تسوق أفضل معدات وإكسسوارات التصوير</p>
      </div>

      <ProductSearch defaultValue={params.q} />

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

      {(!products || products.length === 0) ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-muted-foreground">
          <ShoppingBag className="h-10 w-10 opacity-30" />
          <p>لا توجد منتجات متاحة حاليًا</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((prod) => (
            <div key={prod.id} className="overflow-hidden rounded-2xl border-2 border-foreground bg-card shadow-pop card-hover">
              {prod.cover_image_url && (
                <div className="aspect-square overflow-hidden border-b-2 border-foreground bg-muted">
                  <img
                    src={prod.cover_image_url}
                    alt={prod.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="mb-1 font-bold">{prod.name}</h3>
                {prod.description && (
                  <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{prod.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">{Number(prod.price).toLocaleString()} ر.ي</span>
                  <div className="flex items-center gap-1">
                    {prod.stock_quantity > 0 ? (
                      <span className="rounded-full border-2 border-foreground bg-quaternary px-2.5 py-0.5 text-xs font-bold text-white">متوفر</span>
                    ) : (
                      <span className="rounded-full border-2 border-foreground bg-destructive px-2.5 py-0.5 text-xs font-bold text-white">نفذ</span>
                    )}
                  </div>
                </div>
                {prod.category && (
                  <div className="mt-2">
                    <Badge variant="outline" className="border-2 border-foreground text-xs">
                      <Tag className="ml-1 h-3 w-3" />
                      {prod.category.name}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
