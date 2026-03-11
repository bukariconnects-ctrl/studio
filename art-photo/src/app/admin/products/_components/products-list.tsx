"use client";

import { useState, useTransition } from "react";
import { Trash2, Edit, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteProduct, updateProduct } from "@/actions/admin-products";
import type { Product, ProductCategory } from "@/types/database";

interface Props {
  products: Product[];
  categories: ProductCategory[];
}

export function ProductsList({ products, categories }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    startTransition(() => {
      deleteProduct(id);
    });
  }

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      await updateProduct(formData);
      setEditingId(null);
    });
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          لا توجد منتجات حتى الآن. أضف منتجًا جديدًا من النموذج أعلاه.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">المنتجات ({products.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((prod) => (
            <div key={prod.id} className="rounded-lg border p-4">
              {editingId === prod.id ? (
                <form action={handleUpdate} className="space-y-3">
                  <input type="hidden" name="id" value={prod.id} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input name="name" defaultValue={prod.name} required />
                    <select
                      name="category_id"
                      defaultValue={prod.category_id ?? ""}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    >
                      <option value="">بدون تصنيف</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-4">
                    <Input name="price" type="number" step="0.01" defaultValue={prod.price} />
                    <Input name="stock_quantity" type="number" defaultValue={prod.stock_quantity} />
                    <Input name="sku" defaultValue={prod.sku ?? ""} dir="ltr" />
                    <select
                      name="is_active"
                      defaultValue={String(prod.is_active)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    >
                      <option value="true">مفعّل</option>
                      <option value="false">معطّل</option>
                    </select>
                  </div>
                  <Input name="description" defaultValue={prod.description ?? ""} />
                  <Input name="cover_image" type="file" accept="image/*" />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" disabled={isPending}>
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      <span>حفظ</span>
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4" />
                      <span>إلغاء</span>
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{prod.name}</span>
                      {!prod.is_active && <Badge variant="secondary">معطّل</Badge>}
                      {prod.category && <Badge variant="outline">{prod.category.name}</Badge>}
                      {prod.stock_quantity < 5 && (
                        <Badge variant="destructive">مخزون منخفض</Badge>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{prod.price} ر.ي</span>
                      <span>المخزون: {prod.stock_quantity}</span>
                      {prod.sku && <span dir="ltr">SKU: {prod.sku}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setEditingId(editingId === prod.id ? null : prod.id)} disabled={isPending}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(prod.id)} disabled={isPending}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
