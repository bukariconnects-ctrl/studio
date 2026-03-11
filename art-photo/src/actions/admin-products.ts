"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

export type ActionResult = {
  error?: string;
  success?: string;
};

export async function createProductCategory(formData: FormData): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.PRODUCTS_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name?.trim()) return { error: "اسم التصنيف مطلوب" };

  const { error } = await supabase.from("product_categories").insert({
    name: name.trim(),
    description: description?.trim() || null,
  });

  if (error) return { error: "فشل في إنشاء التصنيف" };

  revalidatePath("/admin/products");
  return { success: "تم إنشاء التصنيف بنجاح" };
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.PRODUCTS_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock_quantity = parseInt(formData.get("stock_quantity") as string);
  const sku = formData.get("sku") as string;
  const category_id = formData.get("category_id") as string;
  const imageFile = formData.get("cover_image") as File | null;

  if (!name?.trim()) return { error: "اسم المنتج مطلوب" };
  if (isNaN(price) || price <= 0) return { error: "السعر غير صالح" };
  if (isNaN(stock_quantity) || stock_quantity < 0) return { error: "الكمية غير صالحة" };

  let cover_image_url: string | null = null;

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop();
    const path = `products/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("catalog")
      .upload(path, imageFile);

    if (uploadError) return { error: "فشل في رفع الصورة" };

    const { data: urlData } = supabase.storage.from("catalog").getPublicUrl(path);
    cover_image_url = urlData.publicUrl;
  }

  const { error } = await supabase.from("products").insert({
    name: name.trim(),
    description: description?.trim() || null,
    price,
    stock_quantity,
    sku: sku?.trim() || null,
    category_id: category_id || null,
    cover_image_url,
  });

  if (error) {
    if (error.code === "23505") return { error: "رمز المنتج (SKU) مستخدم مسبقاً" };
    return { error: "فشل في إنشاء المنتج" };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: "تم إنشاء المنتج بنجاح" };
}

export async function updateProduct(formData: FormData): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.PRODUCTS_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock_quantity = parseInt(formData.get("stock_quantity") as string);
  const sku = formData.get("sku") as string;
  const category_id = formData.get("category_id") as string;
  const is_active = formData.get("is_active") === "true";
  const imageFile = formData.get("cover_image") as File | null;

  if (!id) return { error: "معرف المنتج مطلوب" };
  if (!name?.trim()) return { error: "اسم المنتج مطلوب" };

  const updates: Record<string, unknown> = {
    name: name.trim(),
    description: description?.trim() || null,
    price,
    stock_quantity,
    sku: sku?.trim() || null,
    category_id: category_id || null,
    is_active,
  };

  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop();
    const path = `products/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("catalog")
      .upload(path, imageFile);

    if (uploadError) return { error: "فشل في رفع الصورة" };

    const { data: urlData } = supabase.storage.from("catalog").getPublicUrl(path);
    updates.cover_image_url = urlData.publicUrl;
  }

  const { error } = await supabase.from("products").update(updates).eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "رمز المنتج (SKU) مستخدم مسبقاً" };
    return { error: "فشل في تحديث المنتج" };
  }

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: "تم تحديث المنتج بنجاح" };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.PRODUCTS_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: "فشل في حذف المنتج" };

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { success: "تم حذف المنتج بنجاح" };
}

export async function updateStock(id: string, quantity: number): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.INVENTORY_UPDATE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ stock_quantity: quantity })
    .eq("id", id);

  if (error) return { error: "فشل في تحديث المخزون" };

  revalidatePath("/admin/products");
  revalidatePath("/admin/low-stock");
  revalidatePath("/products");
  return { success: "تم تحديث المخزون بنجاح" };
}
