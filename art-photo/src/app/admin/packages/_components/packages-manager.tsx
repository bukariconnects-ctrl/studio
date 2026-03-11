"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
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
  createPackage,
  updatePackage,
  deletePackage,
} from "@/actions/admin-packages";
import { toast } from "sonner";

interface PackageItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_percentage: number;
  is_active: boolean;
  cover_image_url?: string | null;
  package_services?: { service: { id: string; name: string } | null }[];
}

interface SimpleService {
  id: string;
  name: string;
}

interface Props {
  packages: PackageItem[];
  services: SimpleService[];
}

export function PackagesManager({ packages, services }: Props) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<PackageItem | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return packages;
    const q = search.toLowerCase();
    return packages.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
    );
  }, [packages, search]);

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      const res = await createPackage(formData);
      if (res.error) toast.error(res.error);
      else {
        toast.success(res.success);
        setCreateOpen(false);
      }
    });
  }

  function handleUpdate(formData: FormData) {
    startTransition(async () => {
      const res = await updatePackage(formData);
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
      const res = await deletePackage(id);
      if (res.error) toast.error(res.error);
      else toast.success(res.success);
    });
  }

  function renderServiceCheckboxes(selectedIds: string[]) {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {services.map((svc) => (
          <label key={svc.id} className="flex items-center gap-2 rounded-lg border-2 border-foreground/20 p-2.5 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input
              type="checkbox"
              name="service_ids"
              value={svc.id}
              defaultChecked={selectedIds.includes(svc.id)}
              disabled={isPending}
              className="accent-primary"
            />
            <span>{svc.name}</span>
          </label>
        ))}
        {services.length === 0 && (
          <p className="col-span-2 text-sm text-muted-foreground">لا توجد خدمات. أنشئ خدمات أولاً.</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
          إدارة الباقات
        </h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger render={<button className="inline-flex items-center gap-2 rounded-full border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-pop hover-pop" />}>
            <Plus className="h-4 w-4" />
            <span>باقة جديدة</span>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl border-2 border-foreground shadow-pop-lg sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>إضافة باقة جديدة</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>اسم الباقة</Label>
                  <Input name="name" required disabled={isPending} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>السعر (ر.ي)</Label>
                    <Input name="price" type="number" step="0.01" min="0" required disabled={isPending} />
                  </div>
                  <div className="space-y-2">
                    <Label>الخصم %</Label>
                    <Input name="discount_percentage" type="number" step="0.01" min="0" max="100" defaultValue="0" disabled={isPending} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea name="description" disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label>الخدمات المضمنة</Label>
                {renderServiceCheckboxes([])}
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

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="بحث في الباقات..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-full border-2 border-foreground pr-10 shadow-pop"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border-2 border-foreground bg-card shadow-pop">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-foreground bg-muted/50">
              <th className="px-4 py-3 text-right font-bold">الباقة</th>
              <th className="px-4 py-3 text-right font-bold">السعر</th>
              <th className="px-4 py-3 text-right font-bold">الخصم</th>
              <th className="px-4 py-3 text-right font-bold">الخدمات</th>
              <th className="px-4 py-3 text-right font-bold">الحالة</th>
              <th className="px-4 py-3 text-center font-bold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  {search ? "لا توجد نتائج للبحث" : "لا توجد باقات. أضف باقة جديدة."}
                </td>
              </tr>
            ) : (
              filtered.map((pkg) => (
                <tr key={pkg.id} className="border-b border-foreground/10 transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="font-bold">{pkg.name}</div>
                    {pkg.description && (
                      <div className="line-clamp-1 max-w-[200px] text-xs text-muted-foreground">{pkg.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold">{Number(pkg.price).toLocaleString()} ر.ي</td>
                  <td className="px-4 py-3">
                    {pkg.discount_percentage > 0 ? (
                      <Badge className="border-2 border-foreground bg-primary text-primary-foreground">{pkg.discount_percentage}%</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(pkg.package_services ?? []).map((ps, idx) => (
                        <Badge key={idx} variant="outline" className="border-2 border-foreground/20 text-xs">
                          {ps.service?.name ?? "محذوفة"}
                        </Badge>
                      ))}
                      {(!pkg.package_services || pkg.package_services.length === 0) && (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {pkg.is_active ? (
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
                        onClick={() => setEditItem(pkg)}
                        disabled={isPending}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border-2 border-destructive text-destructive shadow-pop hover-pop"
                        onClick={() => handleDelete(pkg.id, pkg.name)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        إجمالي: {filtered.length} باقة {search && `(من ${packages.length})`}
      </p>

      <Dialog open={!!editItem} onOpenChange={(open) => !open && setEditItem(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-2xl border-2 border-foreground shadow-pop-lg sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>تعديل الباقة</DialogTitle>
          </DialogHeader>
          {editItem && (
            <form action={handleUpdate} className="space-y-4">
              <input type="hidden" name="id" value={editItem.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>اسم الباقة</Label>
                  <Input name="name" defaultValue={editItem.name} required disabled={isPending} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>السعر (ر.ي)</Label>
                    <Input name="price" type="number" step="0.01" defaultValue={editItem.price} disabled={isPending} />
                  </div>
                  <div className="space-y-2">
                    <Label>الخصم %</Label>
                    <Input name="discount_percentage" type="number" step="0.01" defaultValue={editItem.discount_percentage} disabled={isPending} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <select name="is_active" defaultValue={String(editItem.is_active)} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm" disabled={isPending}>
                  <option value="true">مفعّل</option>
                  <option value="false">معطّل</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea name="description" defaultValue={editItem.description ?? ""} disabled={isPending} />
              </div>
              <div className="space-y-2">
                <Label>الخدمات المضمنة</Label>
                {renderServiceCheckboxes(
                  (editItem.package_services ?? [])
                    .map((ps) => ps.service?.id)
                    .filter(Boolean) as string[]
                )}
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
