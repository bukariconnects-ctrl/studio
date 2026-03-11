"use client";

import { useState, useActionState, useTransition } from "react";
import { Loader2, UserPlus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createPhotographerAccount, type ActionResult } from "@/actions/admin-users";
import { sendPhotographerInvitation } from "@/actions/admin-invitations";
import { toast } from "sonner";

type Specialty = { id: string; name: string };

const initialState: ActionResult = {};

export function CreatePhotographerForm({ specialties }: { specialties: Specialty[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [invitePending, startInvite] = useTransition();

  const [state, formAction, isPending] = useActionState(
    async (_prev: ActionResult, formData: FormData) => {
      const result = await createPhotographerAccount(formData);
      if (result.success) {
        toast.success(result.success);
        setShowCreate(false);
      }
      return result;
    },
    initialState
  );

  const handleInvite = (formData: FormData) => {
    startInvite(async () => {
      const result = await sendPhotographerInvitation(formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success(result.success);
        setShowInvite(false);
      }
    });
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-full border-2 border-foreground bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-pop hover-pop"
        >
          <UserPlus className="h-4 w-4" />
          إنشاء حساب مصور
        </button>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 rounded-full border-2 border-foreground bg-secondary px-5 py-2.5 text-sm font-bold text-white shadow-pop hover-pop"
        >
          <Mail className="h-4 w-4" />
          إرسال دعوة بريدية
        </button>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="border-2 border-foreground shadow-pop-lg sm:max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>إنشاء حساب مصور جديد</DialogTitle>
          </DialogHeader>
          {state.error && (
            <div className="rounded-xl border-2 border-destructive bg-destructive/10 p-3 text-sm font-semibold text-destructive">{state.error}</div>
          )}
          <form action={formAction} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>الاسم الكامل</Label>
                <Input name="full_name" required disabled={isPending} className="border-2 border-foreground shadow-pop" />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input name="email" type="email" dir="ltr" required disabled={isPending} className="border-2 border-foreground shadow-pop" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>كلمة المرور</Label>
                <Input name="password" type="password" dir="ltr" required disabled={isPending} className="border-2 border-foreground shadow-pop" />
              </div>
              <div className="space-y-2">
                <Label>التخصص</Label>
                <select name="specialty" disabled={isPending} className="flex h-9 w-full rounded-xl border-2 border-foreground bg-card px-3 text-sm shadow-pop">
                  <option value="">تصوير عام</option>
                  {specialties.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>سنوات الخبرة</Label>
                <Input name="experience_years" type="number" min="0" defaultValue="0" disabled={isPending} className="border-2 border-foreground shadow-pop" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)} className="border-2 border-foreground">إلغاء</Button>
              <Button type="submit" disabled={isPending} className="border-2 border-foreground shadow-pop">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                <span>إنشاء</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="border-2 border-foreground shadow-pop-lg sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>دعوة مصور بالبريد الإلكتروني</DialogTitle>
          </DialogHeader>
          <form action={handleInvite} className="space-y-4">
            <div className="space-y-2">
              <Label>اسم المصور</Label>
              <Input name="full_name" required disabled={invitePending} className="border-2 border-foreground shadow-pop" />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <Input name="email" type="email" dir="ltr" required disabled={invitePending} className="border-2 border-foreground shadow-pop" />
            </div>
            <div className="space-y-2">
              <Label>التخصص (اختياري)</Label>
              <select name="specialty_id" disabled={invitePending} className="flex h-9 w-full rounded-xl border-2 border-foreground bg-card px-3 text-sm shadow-pop">
                <option value="">اختر تخصص...</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowInvite(false)} className="border-2 border-foreground">إلغاء</Button>
              <Button type="submit" disabled={invitePending} className="border-2 border-foreground bg-secondary shadow-pop hover:bg-secondary/90">
                {invitePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                <span>إرسال الدعوة</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
