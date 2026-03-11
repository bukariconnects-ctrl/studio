"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CartActionResult = {
  error?: string;
  success?: string;
};

export async function syncCartToServer(
  items: { id: string; type: "product" | "service" | "package"; quantity: number }[]
): Promise<CartActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "غير مسجل" };

  await supabase.from("cart_items").delete().eq("user_id", user.id);

  if (items.length === 0) return { success: "تم مسح السلة" };

  const rows = items.map((item) => ({
    user_id: user.id,
    product_id: item.type === "product" ? item.id : null,
    service_id: item.type === "service" ? item.id : null,
    package_id: item.type === "package" ? item.id : null,
    quantity: item.quantity,
  }));

  const { error } = await supabase.from("cart_items").insert(rows);
  if (error) return { error: "فشل في مزامنة السلة" };

  return { success: "تم مزامنة السلة" };
}

export async function loadCartFromServer(): Promise<{
  items: { id: string; type: "product" | "service" | "package"; quantity: number; name: string; price: number; image: string | null; maxStock?: number }[];
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { items: [] };

  const { data } = await supabase
    .from("cart_items")
    .select("*, product:products(id, name, price, cover_image_url, stock_quantity), service:services(id, name, base_price, cover_image_url), package:packages(id, name, price, cover_image_url)")
    .eq("user_id", user.id);

  if (!data) return { items: [] };

  const items = data.map((row: Record<string, unknown>) => {
    const product = row.product as { id: string; name: string; price: number; cover_image_url: string | null; stock_quantity: number } | null;
    const service = row.service as { id: string; name: string; base_price: number; cover_image_url: string | null } | null;
    const pkg = row.package as { id: string; name: string; price: number; cover_image_url: string | null } | null;

    if (product) {
      return {
        id: product.id,
        type: "product" as const,
        quantity: row.quantity as number,
        name: product.name,
        price: product.price,
        image: product.cover_image_url,
        maxStock: product.stock_quantity,
      };
    }
    if (service) {
      return {
        id: service.id,
        type: "service" as const,
        quantity: row.quantity as number,
        name: service.name,
        price: service.base_price,
        image: service.cover_image_url,
      };
    }
    if (pkg) {
      return {
        id: pkg.id,
        type: "package" as const,
        quantity: row.quantity as number,
        name: pkg.name,
        price: pkg.price,
        image: pkg.cover_image_url,
      };
    }
    return null;
  }).filter(Boolean) as { id: string; type: "product" | "service" | "package"; quantity: number; name: string; price: number; image: string | null; maxStock?: number }[];

  return { items };
}

export async function checkStockAvailability(productId: string, requestedQty: number): Promise<{ available: boolean; stock: number }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("stock_quantity")
    .eq("id", productId)
    .eq("is_active", true)
    .single();

  if (!data) return { available: false, stock: 0 };
  return {
    available: data.stock_quantity >= requestedQty,
    stock: data.stock_quantity,
  };
}
