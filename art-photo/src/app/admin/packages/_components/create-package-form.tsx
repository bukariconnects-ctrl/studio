"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPackage, type ActionResult } from "@/actions/admin-packages";

const initialState: ActionResult = {};

interface SimpleService {
  id: string;
  name: string;
}

export function CreatePackageForm({ services }: { services: SimpleService[] }) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => createPackage(formData),
    initialState
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">باقة جديدة</CardTitle>
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
              <Label htmlFor="pkg-name">اسم الباقة</Label>
              <Input id="pkg-name" name="name" required disabled={isPending} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="pkg-price">السعر (ر.ي)</Label>
                <Input id="pkg-price" name="price" type="number" step="0.01" min="0" required disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pkg-disc">الخصم %</Label>
                <Input id="pkg-disc" name="discount_percentage" type="number" step="0.01" min="0" max="100" defaultValue="0" disabled={isPending} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pkg-desc">الوصف</Label>
            <Textarea id="pkg-desc" name="description" disabled={isPending} />
          </div>
          <div className="space-y-2">
            <Label>الخدمات المضمنة</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {services.map((svc) => (
                <label key={svc.id} className="flex items-center gap-2 rounded border p-2 text-sm">
                  <input type="checkbox" name="service_ids" value={svc.id} disabled={isPending} />
                  <span>{svc.name}</span>
                </label>
              ))}
            </div>
            {services.length === 0 && (
              <p className="text-sm text-muted-foreground">لا توجد خدمات. أنشئ خدمات أولاً.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pkg-img">صورة الغلاف</Label>
            <Input id="pkg-img" name="cover_image" type="file" accept="image/*" disabled={isPending} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>إضافة باقة</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
