"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createProduct, type ActionResult } from "@/actions/admin-products";
import type { ProductCategory } from "@/types/database";

const initialState: ActionResult = {};

export function CreateProductForm({ categories }: { categories: ProductCategory[] }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => createProduct(formData),
    initialState
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">منتج جديد</CardTitle>
      </CardHeader>
      <CardContent>
        {state.error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{state.error}</div>
        )}
        {state.success && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">{state.success}</div>
        )}
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="prod-name">اسم المنتج</Label>
              <Input id="prod-name" name="name" required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-cat">التصنيف</Label>
              <select
                id="prod-cat"
                name="category_id"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
                disabled={isPending}
              >
                <option value="">بدون تصنيف</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="prod-price">السعر (ر.ي)</Label>
              <Input id="prod-price" name="price" type="number" step="0.01" min="0" required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-stock">الكمية</Label>
              <Input id="prod-stock" name="stock_quantity" type="number" min="0" required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prod-sku">رمز المنتج (SKU)</Label>
              <Input id="prod-sku" name="sku" dir="ltr" disabled={isPending} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="prod-desc">الوصف</Label>
            <Textarea id="prod-desc" name="description" disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prod-img">صورة الغلاف</Label>
            <Input id="prod-img" name="cover_image" type="file" accept="image/*" disabled={isPending} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>إضافة منتج</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
