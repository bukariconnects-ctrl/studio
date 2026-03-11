"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPassword, type AuthResult } from "@/actions/auth";

const initialState: AuthResult = {};

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: AuthResult, formData: FormData) => resetPassword(formData),
    initialState
  );

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">استعادة كلمة المرور</CardTitle>
        <CardDescription>
          أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
            {state.success}
          </div>
        )}
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
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
              <ArrowRight className="h-4 w-4" />
            )}
            <span>إرسال رابط الاستعادة</span>
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          href="/auth/login"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          العودة لتسجيل الدخول
        </Link>
      </CardFooter>
    </Card>
  );
}
