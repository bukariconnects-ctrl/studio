import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProductsManager } from "./_components/products-manager";

export const metadata: Metadata = {
  title: "إدارة المنتجات",
};

export default async function AdminProductsPage() {
  const supabase = await createClient();

  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:product_categories(*)")
      .order("created_at", { ascending: false }),
    supabase
      .from("product_categories")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <ProductsManager
      products={productsRes.data ?? []}
      categories={categoriesRes.data ?? []}
    />
  );
}
