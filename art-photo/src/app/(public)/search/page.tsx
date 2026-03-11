import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchForm } from "./_components/search-form";

export const metadata: Metadata = {
  title: "البحث",
};

interface SearchResult {
  id: string;
  type: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  stock?: number;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const type = params.type ?? "all";

  let results: SearchResult[] = [];

  if (query.length > 0) {
    const supabase = await createClient();
    const { data } = await supabase.rpc("search_catalog", {
      p_query: query,
      p_type: type,
    });

    if (data?.results) {
      results = data.results as SearchResult[];
    }
  }

  const TYPE_LABELS: Record<string, string> = {
    service: "خدمة",
    product: "منتج",
    package: "باقة",
  };

  const TYPE_HREF: Record<string, string> = {
    service: "/services",
    product: "/products",
    package: "/services",
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">البحث المتقدم</h1>
        <p className="text-muted-foreground">ابحث في الخدمات والمنتجات والباقات</p>
      </div>

      <SearchForm initialQuery={query} initialType={type} />

      {query.length > 0 && (
        <div className="mt-8">
          <p className="mb-4 text-sm text-muted-foreground">
            {results.length} نتيجة لـ &quot;{query}&quot;
          </p>

          {results.length === 0 ? (
            <div className="flex min-h-[20vh] items-center justify-center text-muted-foreground">
              لم يتم العثور على نتائج
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((item) => (
                <Link key={`${item.type}-${item.id}`} href={TYPE_HREF[item.type] ?? "/"}>
                  <Card className="transition-shadow hover:shadow-md">
                    {item.image && (
                      <div className="aspect-video overflow-hidden rounded-t-lg bg-muted">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="mb-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{TYPE_LABELS[item.type] ?? item.type}</Badge>
                        <h3 className="font-semibold">{item.name}</h3>
                      </div>
                      {item.description && (
                        <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                      )}
                      <span className="font-bold text-primary">{item.price} ر.ي</span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
