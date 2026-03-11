"use client";

import { useActionState } from "react";
import { Lock, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updatePassword, type AuthResult } from "@/actions/auth";

const initialState: AuthResult = {};

export function ResetPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: AuthResult, formData: FormData) => updatePassword(formData),
    initialState
  );

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">تعيين كلمة مرور جديدة</CardTitle>
        <CardDescription>أدخل كلمة المرور الجديدة لحسابك</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {state.error}
          </div>
        )}
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور الجديدة</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="pr-10"
                dir="ltr"
                required
                disabled={isPending}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              8 أحرف على الأقل، حرف كبير ورقم واحد
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="pr-10"
                dir="ltr"
                required
                disabled={isPending}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4" />
            )}
            <span>تحديث كلمة المرور</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
