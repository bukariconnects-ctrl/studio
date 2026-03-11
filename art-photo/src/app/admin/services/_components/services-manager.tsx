"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Tags,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  createService,
  updateService,
  deleteService,
  createServiceCategory,
} from "@/actions/admin-services";
import { toast } from "sonner";
import type { Service, ServiceCategory } from "@/types/database";

interface Props {
  services: Service[];
  categories: ServiceCategory[];
}

export function ServicesManager({ services, categories }: Props) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<Service | null>(null);
  const [catOpen, setCatOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return services;
    const q = search.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description ?? "").toLowerCase().includes(q) ||
        (s.category as { name: string } | null)?.name?.toLowerCase().includes(q)
    );
  }, [services, search]);

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const res = await createService(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success);
        setCreateOpen(false);
      }
    });
  }

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      const res = await updateService(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success);
        setEditItem(null);
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    startTransition(async () => {
      const res = await deleteService(id);
      if (res.error) toast.error(res.error);
      else toast.success(res.success);
    });
  }

  function handleCreateCategory(formData: FormData) {
    startTransition(async () => {
      const res = await createServiceCategory(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success);
        setCatOpen(false);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          إدارة الخدمات
        </h1>
        <div className="flex gap-2">
          <Dialog open={catOpen} onOpenChange={setCatOpen}>
            <DialogTrigger render={<button className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-card px-4 py-2 text-sm font-bold shadow-pop hover-pop" />}>
              <Tags className="h-4 w-4" />
              <span>تصنيف جديد</span>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-2 border-foreground shadow-pop-lg sm:max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة تصنيف جديد</DialogTitle>
              </DialogHeader>
              <form action={handleCreateCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label>اسم التصنيف</Label>
                  <Input name="name" required disabled={isPending} />
                </div>
                <div className="space-y-2">
                  <Label>الوصف</Label>
                  <Input name="description" disabled={isPending} />
                </div>
                <DialogFooter>
                  <DialogClose render={<button className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium" />}>
                    إلغاء
                  </DialogClose>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    إضافة
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger render={<button className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-pop hover-pop" />}>
              <Plus className="h-4 w-4" />
              <span>خدمة جديدة</span>
            </DialogTrigger>
            <DialogContent className="rounded-2xl border-2 border-foreground shadow-pop-lg sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>إضافة خدمة جديدة</DialogTitle>
              </DialogHeader>
              <form action={handleCreate} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>اسم الخدمة</Label>
                    <Input name="name" required disabled={isPending} />
                  </div>
                  <div className="space-y-2">
                    <Label>التصنيف</Label>
                    <select name="category_id" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" disabled={isPending}>
                      <option value="">بدون تصنيف</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>السعر (ر.ي)</Label>
                    <Input name="base_price" type="number" step="0.01" min="0" required disabled={isPending} />
                  </div>
                  <div className="space-y-2">
                    <Label>المدة (دقيقة)</Label>
                    <Input name="duration_minutes" type="number" min="1" required disabled={isPending} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>الوصف</Label>
                  <Textarea name="description" disabled={isPending} />
                </div>
                <div className="space-y-2">
                  <Label>صورة الغلاف</Label>
                  <Input name="cover_image" type="file" accept="image/*" disabled={isPending} />
                </div>
                <DialogFooter>
                  <DialogClose render={<button className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium" />}>
                    إلغاء
                  </DialogClose>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    إضافة
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="بحث في الخدمات..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-full border-2 border-foreground pr-10 shadow-pop"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border-2 border-foreground bg-card shadow-pop">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-foreground bg-muted/50">
              <th className="px-4 py-3 text-right font-bold">الخدمة</th>
              <th className="px-4 py-3 text-right font-bold">التصنيف</th>
              <th className="px-4 py-3 text-right font-bold">السعر</th>
              <th className="px-4 py-3 text-right font-bold">المدة</th>
              <th className="px-4 py-3 text-right font-bold">الحالة</th>
              <th className="px-4 py-3 text-center font-bold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  {search ? "لا توجد نتائج للبحث" : "لا توجد خدمات. أضف خدمة جديدة."}
                </td>
              </tr>
            ) : (
              filtered.map((svc) => {
                const cat = svc.category as { name: string } | null;
                return (
                  <tr key={svc.id} className="border-b border-foreground/10 transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {svc.cover_image_url && (
                          <img src={svc.cover_image_url} alt="" className="h-10 w-10 rounded-lg border-2 border-foreground object-cover" />
                        )}
                        <div>
                          <div className="font-bold">{svc.name}</div>
                          {svc.description && (
                            <div className="line-clamp-1 max-w-[200px] text-xs text-muted-foreground">{svc.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {cat ? (
                        <Badge variant="outline" className="border-2 border-foreground/30">{cat.name}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold">{Number(svc.base_price).toLocaleString()} ر.ي</td>
                    <td className="px-4 py-3">{svc.duration_minutes} دقيقة</td>
                    <td className="px-4 py-3">
                      {svc.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-full border-2 border-green-600/30 bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                          <Eye className="h-3 w-3" /> مفعّل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border-2 border-red-600/30 bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                          <EyeOff className="h-3 w-3" /> معطّل
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-2 border-foreground shadow-pop hover-pop"
                          onClick={() => setEditItem(svc)}
                          disabled={isPending}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-2 border-destructive text-destructive shadow-pop hover-pop"
                          onClick={() => handleDelete(svc.id, svc.name)}
                          disabled={isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        إجمالي: {filtered.length} خدمة {search && `(من ${services.length})`}
      </p>

      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="rounded-2xl border-2 border-foreground shadow-pop-lg sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل الخدمة</DialogTitle>
          </DialogHeader>
          {editItem && (
            <form action={handleUpdate} className="space-y-4">
              <input type="hidden" name="id" value={editItem.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>اسم الخدمة</Label>
                  <Input name="name" defaultValue={editItem.name} required disabled={isPending} />
                </div>
                <div className="space-y-2">
                  <Label>التصنيف</Label>
                  <select name="category_id" defaultValue={editItem.category_id ?? ""} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" disabled={isPending}>
                    <option value="">بدون تصنيف</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>السعر (ر.ي)</Label>
                  <Input name="base_price" type="number" step="0.01" defaultValue={editItem.base_price} disabled={isPending} />
                </div>
                <div className="space-y-2">
                  <Label>المدة (دقيقة)</Label>
                  <Input name="duration_minutes" type="number" defaultValue={editItem.duration_minutes} disabled={isPending} />
                </div>
                <div className="space-y-2">
                  <Label>الحالة</Label>
                  <select name="is_active" defaultValue={String(editItem.is_active)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" disabled={isPending}>
                    <option value="true">مفعّل</option>
                    <option value="false">معطّل</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea name="description" defaultValue={editItem.description ?? ""} disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label>صورة الغلاف</Label>
                <Input name="cover_image" type="file" accept="image/*" disabled={isPending} />
              </div>
              <DialogFooter>
                <DialogClose render={<button className="inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium" />}>
                  إلغاء
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  حفظ التعديلات
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
