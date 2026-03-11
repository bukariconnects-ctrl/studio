"use client";

import { useState, useTransition } from "react";
import { Trash2, Edit, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteService, updateService } from "@/actions/admin-services";
import type { Service, ServiceCategory } from "@/types/database";

interface Props {
  services: Service[];
  categories: ServiceCategory[];
}

export function ServicesList({ services, categories }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;
    startTransition(() => {
      deleteService(id);
    });
  }

  function handleEdit(id: string) {
    setEditingId(editingId === id ? null : id);
  }

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      await updateService(formData);
      setEditingId(null);
    });
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          لا توجد خدمات حتى الآن. أضف خدمة جديدة من النموذج أعلاه.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">الخدمات ({services.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((svc) => (
            <div key={svc.id} className="rounded-lg border p-4">
              {editingId === svc.id ? (
                <form action={handleUpdate} className="space-y-3">
                  <input type="hidden" name="id" value={svc.id} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input name="name" defaultValue={svc.name} required />
                    <select
                      name="category_id"
                      defaultValue={svc.category_id ?? ""}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    >
                      <option value="">بدون تصنيف</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input name="base_price" type="number" step="0.01" defaultValue={svc.base_price} />
                    <Input name="duration_minutes" type="number" defaultValue={svc.duration_minutes} />
                    <select
                      name="is_active"
                      defaultValue={String(svc.is_active)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                    >
                      <option value="true">مفعّل</option>
                      <option value="false">معطّل</option>
                    </select>
                  </div>
                  <Input name="description" defaultValue={svc.description ?? ""} />
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
                      <span className="font-medium">{svc.name}</span>
                      {!svc.is_active && <Badge variant="secondary">معطّل</Badge>}
                      {svc.category && <Badge variant="outline">{svc.category.name}</Badge>}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{svc.base_price} ر.ي</span>
                      <span>{svc.duration_minutes} دقيقة</span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(svc.id)} disabled={isPending}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(svc.id)} disabled={isPending}>
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
