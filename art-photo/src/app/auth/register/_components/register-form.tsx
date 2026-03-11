"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { UserPlus, Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signUp, type AuthResult } from "@/actions/auth";
import { GoogleButton } from "../../_components/google-button";

const initialState: AuthResult = {};

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (_prev: AuthResult, formData: FormData) => signUp(formData),
    initialState
  );

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
        <CardDescription>أنشئ حسابك للبدء في استخدام خدماتنا</CardDescription>
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
            <Label htmlFor="fullName">الاسم الكامل</Label>
            <div className="relative">
              <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="أحمد محمد"
                className="pr-10"
                required
                disabled={isPending}
              />
            </div>
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pr-10 pl-10"
                dir="ltr"
                required
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-muted-foreground hover:text-foreground"
                disabled={isPending}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
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
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pr-10 pl-10"
                dir="ltr"
                required
                disabled={isPending}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-3 text-muted-foreground hover:text-foreground"
                disabled={isPending}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              className="mt-1 h-4 w-4 rounded border-input"
              required
              disabled={isPending}
            />
            <Label htmlFor="agreeToTerms" className="text-sm font-normal leading-relaxed">
              أوافق على{" "}
              <Link href="/terms" className="text-primary hover:underline">
                شروط الخدمة
              </Link>{" "}
              و{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                سياسة الخصوصية
              </Link>
            </Label>
          </div>
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="gdprConsent"
              name="gdprConsent"
              className="mt-1 h-4 w-4 rounded border-input"
              required
              disabled={isPending}
            />
            <Label htmlFor="gdprConsent" className="text-sm font-normal leading-relaxed">
              أوافق على معالجة بياناتي الشخصية وفقاً لـ{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                سياسة الخصوصية وحماية البيانات (GDPR)
              </Link>
            </Label>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            <span>إنشاء الحساب</span>
          </Button>
        </form>
        <div className="relative flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">أو</span>
          <Separator className="flex-1" />
        </div>
        <GoogleButton />
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            تسجيل الدخول
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
