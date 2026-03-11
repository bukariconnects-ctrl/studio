import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { LowStockList } from "./_components/low-stock-list";

export const metadata: Metadata = {
  title: "مخزون منخفض",
};

export default async function LowStockPage() {
  const supabase = await createClient();

  const { data: rawData } = await supabase
    .from("products")
    .select("id, name, sku, stock_quantity, price, category_id, product_categories(name)")
    .eq("is_active", true)
    .lt("stock_quantity", 5)
    .order("stock_quantity", { ascending: true });

  const products = (rawData ?? []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    name: p.name as string,
    sku: p.sku as string | null,
    stock_quantity: p.stock_quantity as number,
    price: p.price as number,
    category: p.product_categories as { name: string } | null,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">المنتجات منخفضة المخزون</h1>
      <LowStockList products={products} />
    </div>
  );
}
