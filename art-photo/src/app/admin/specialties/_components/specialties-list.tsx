"use client";

import { useState, useTransition } from "react";
import { createSpecialty, updateSpecialty, deleteSpecialty } from "@/actions/admin-specialties";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Camera } from "lucide-react";

type Specialty = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
};

export function SpecialtiesList({ specialties }: { specialties: Specialty[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Specialty | null>(null);
  const [deleting, setDeleting] = useState<Specialty | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = (formData: FormData) => {
    startTransition(async () => {
      const result = await createSpecialty(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success(result.success);
        setShowCreate(false);
      }
    });
  };

  const handleUpdate = (formData: FormData) => {
    if (!editing) return;
    startTransition(async () => {
      const result = await updateSpecialty(editing.id, formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success(result.success);
        setEditing(null);
      }
    });
  };

  const handleDelete = () => {
    if (!deleting) return;
    startTransition(async () => {
      const result = await deleteSpecialty(deleting.id);
      if (result.error) toast.error(result.error);
      else {
        toast.success(result.success);
        setDeleting(null);
      }
    });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{specialties.length} تخصص</p>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-full border-2 border-foreground bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-pop hover-pop"
        >
          <Plus className="h-4 w-4" />
          إضافة تخصص
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {specialties.map((s) => (
          <div
            key={s.id}
            className={`rounded-2xl border-2 border-foreground bg-card p-4 shadow-pop card-hover ${!s.is_active ? "opacity-50" : ""}`}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-foreground bg-secondary">
                  <Camera className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-bold">{s.name}</h3>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditing(s)}
                  className="rounded-lg border-2 border-foreground bg-card p-1.5 shadow-pop hover-pop"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeleting(s)}
                  className="rounded-lg border-2 border-destructive bg-card p-1.5 text-destructive shadow-pop hover-pop"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {s.description && (
              <p className="text-xs text-muted-foreground">{s.description}</p>
            )}
            {!s.is_active && (
              <span className="mt-2 inline-block rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                غير نشط
              </span>
            )}
          </div>
        ))}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="border-2 border-foreground shadow-pop-lg sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>إضافة تخصص جديد</DialogTitle>
          </DialogHeader>
          <form action={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم التخصص</Label>
              <Input name="name" id="name" required className="border-2 border-foreground shadow-pop" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">الوصف (اختياري)</Label>
              <Textarea name="description" id="description" className="border-2 border-foreground shadow-pop" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="border-2 border-foreground">
                إلغاء
              </Button>
              <Button type="submit" disabled={isPending} className="border-2 border-foreground shadow-pop">
                {isPending ? "جاري الحفظ..." : "حفظ"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="border-2 border-foreground shadow-pop-lg sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>تعديل التخصص</DialogTitle>
          </DialogHeader>
          {editing && (
            <form action={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">اسم التخصص</Label>
                <Input name="name" id="edit-name" defaultValue={editing.name} required className="border-2 border-foreground shadow-pop" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-desc">الوصف</Label>
                <Textarea name="description" id="edit-desc" defaultValue={editing.description ?? ""} className="border-2 border-foreground shadow-pop" />
              </div>
              <div className="flex items-center gap-2">
                <input type="hidden" name="is_active" value={editing.is_active ? "true" : "false"} />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    defaultChecked={editing.is_active}
                    onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                    className="h-4 w-4"
                  />
                  نشط
                </label>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)} className="border-2 border-foreground">
                  إلغاء
                </Button>
                <Button type="submit" disabled={isPending} className="border-2 border-foreground shadow-pop">
                  {isPending ? "جاري التحديث..." : "تحديث"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <DialogContent className="border-2 border-foreground shadow-pop-lg sm:max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>حذف التخصص</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            هل أنت متأكد من حذف التخصص <strong>{deleting?.name}</strong>؟
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleting(null)} className="border-2 border-foreground">
              إلغاء
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending} className="border-2 border-foreground shadow-pop">
              {isPending ? "جاري الحذف..." : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
