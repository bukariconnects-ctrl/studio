"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createService, type ActionResult } from "@/actions/admin-services";
import type { ServiceCategory } from "@/types/database";

const initialState: ActionResult = {};

export function CreateServiceForm({ categories }: { categories: ServiceCategory[] }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => createService(formData),
    initialState
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">خدمة جديدة</CardTitle>
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
              <Label htmlFor="svc-name">اسم الخدمة</Label>
              <Input id="svc-name" name="name" required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-cat">التصنيف</Label>
              <select
                id="svc-cat"
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="svc-price">السعر (ر.ي)</Label>
              <Input id="svc-price" name="base_price" type="number" step="0.01" min="0" required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="svc-dur">المدة (دقيقة)</Label>
              <Input id="svc-dur" name="duration_minutes" type="number" min="1" required disabled={isPending} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-desc">الوصف</Label>
            <Textarea id="svc-desc" name="description" disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="svc-img">صورة الغلاف</Label>
            <Input id="svc-img" name="cover_image" type="file" accept="image/*" disabled={isPending} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>إضافة خدمة</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
