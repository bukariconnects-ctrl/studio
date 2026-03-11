"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

export type EmbeddingResult = {
  error?: string;
  success?: string;
  count?: number;
};

async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text }] },
          outputDimensionality: 1536,
        }),
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data?.embedding?.values ?? null;
  } catch {
    return null;
  }
}

export async function generateItemEmbeddings(): Promise<EmbeddingResult> {
  const allowed = await checkPermission(PERMISSIONS.AI_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const adminClient = createAdminClient();
  let count = 0;

  const { data: services } = await adminClient
    .from("services")
    .select("id, name, description, base_price")
    .eq("is_active", true);

  for (const svc of services ?? []) {
    const text = `${svc.name}. ${svc.description ?? ""}. السعر: ${svc.base_price} ريال يمني`;
    const embedding = await generateEmbedding(text);
    if (!embedding) continue;

    await adminClient.from("item_embeddings").upsert(
      {
        entity_type: "service",
        entity_id: svc.id,
        embedding: JSON.stringify(embedding),
        metadata: { name: svc.name, price: svc.base_price },
      },
      { onConflict: "entity_type,entity_id" }
    );
    count++;
  }

  const { data: products } = await adminClient
    .from("products")
    .select("id, name, description, price, product_categories(name)")
    .eq("is_active", true);

  for (const prod of products ?? []) {
    const raw = prod as Record<string, unknown>;
    const catName = ((raw.product_categories as { name: string } | null))?.name ?? "";
    const text = `${prod.name}. ${prod.description ?? ""}. الفئة: ${catName}. السعر: ${prod.price} ريال يمني`;
    const embedding = await generateEmbedding(text);
    if (!embedding) continue;

    await adminClient.from("item_embeddings").upsert(
      {
        entity_type: "product",
        entity_id: prod.id,
        embedding: JSON.stringify(embedding),
        metadata: { name: prod.name, price: prod.price, category: catName },
      },
      { onConflict: "entity_type,entity_id" }
    );
    count++;
  }

  const { data: packages } = await adminClient
    .from("packages")
    .select("id, name, description, price")
    .eq("is_active", true);

  for (const pkg of packages ?? []) {
    const text = `${pkg.name}. ${pkg.description ?? ""}. السعر: ${pkg.price} ريال يمني`;
    const embedding = await generateEmbedding(text);
    if (!embedding) continue;

    await adminClient.from("item_embeddings").upsert(
      {
        entity_type: "package",
        entity_id: pkg.id,
        embedding: JSON.stringify(embedding),
        metadata: { name: pkg.name, price: pkg.price },
      },
      { onConflict: "entity_type,entity_id" }
    );
    count++;
  }

  return { success: `تم توليد متجهات لـ ${count} عنصر`, count };
}

export async function generateUserEmbedding(userId: string): Promise<EmbeddingResult> {
  const adminClient = createAdminClient();

  const { data: reviews } = await adminClient
    .from("reviews")
    .select("rating, comment, services(name), photographers(specialty)")
    .eq("client_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: bookings } = await adminClient
    .from("bookings")
    .select("services(name), packages(name)")
    .eq("client_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data: orders } = await adminClient
    .from("orders")
    .select("order_items(products(name, product_categories(name)))")
    .eq("client_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const parts: string[] = [];

  for (const r of reviews ?? []) {
    const raw = r as Record<string, unknown>;
    const svc = ((raw.services as { name: string }[] | null) ?? [])[0]?.name ?? "";
    const spec = ((raw.photographers as { specialty: string }[] | null) ?? [])[0]?.specialty ?? "";
    parts.push(`تقييم ${r.rating}/5 لـ ${svc} ${spec}: ${r.comment ?? ""}`);
  }

  for (const b of bookings ?? []) {
    const raw = b as Record<string, unknown>;
    const svc = ((raw.services as { name: string }[] | null) ?? [])[0]?.name ?? "";
    const pkg = ((raw.packages as { name: string }[] | null) ?? [])[0]?.name ?? "";
    parts.push(`حجز: ${svc} ${pkg}`);
  }

  for (const o of orders ?? []) {
    const raw = o as Record<string, unknown>;
    const items = (raw.order_items as { products: { name: string; product_categories: { name: string } | null } | null }[] | null) ?? [];
    for (const item of items) {
      if (item.products) {
        const catName = item.products.product_categories?.name ?? "";
        parts.push(`شراء: ${item.products.name} (${catName})`);
      }
    }
  }

  if (parts.length === 0) return { success: "لا توجد بيانات كافية لتوليد متجه المستخدم" };

  const text = parts.join(". ");
  const embedding = await generateEmbedding(text);
  if (!embedding) return { error: "فشل في توليد المتجه" };

  await adminClient.from("user_embeddings").upsert(
    {
      user_id: userId,
      embedding: JSON.stringify(embedding),
      metadata: { parts_count: parts.length },
    },
    { onConflict: "user_id" }
  );

  return { success: "تم تحديث متجه تفضيلات المستخدم" };
}

export async function searchSimilarItems(query: string) {
  const embedding = await generateEmbedding(query);
  if (!embedding) return [];

  const adminClient = createAdminClient();

  const { data } = await adminClient.rpc("match_items_by_embedding", {
    query_embedding: JSON.stringify(embedding),
    match_threshold: 0.3,
    match_count: 10,
  });

  return data ?? [];
}
