"use client";

import { useActionState } from "react";
import { User as UserIcon, Phone, MapPin, FileText, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateProfile, type ProfileResult } from "@/actions/profile";
import type { User } from "@supabase/supabase-js";

const initialState: ProfileResult = {};

interface ProfileFormProps {
  user: User;
  profile: {
    full_name: string;
    phone: string | null;
    bio: string | null;
    address: string | null;
  } | null;
}

export function ProfileForm({ user, profile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: ProfileResult, formData: FormData) => updateProfile(formData),
    initialState
  );

  const role = (user.app_metadata?.user_role as string) ?? "client";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>معلومات الحساب</CardTitle>
            <Badge variant="secondary">{role}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">البريد:</span>
            <span dir="ltr">{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">تاريخ الإنشاء:</span>
            <span>{new Date(user.created_at).toLocaleDateString("ar-SA")}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تعديل الملف الشخصي</CardTitle>
        </CardHeader>
        <CardContent>
          {state.error && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
              {state.success}
            </div>
          )}
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">الاسم الكامل</Label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={profile?.full_name ?? user.user_metadata?.full_name ?? ""}
                  className="pr-10"
                  required
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={profile?.phone ?? ""}
                  placeholder="+966 5XX XXX XXXX"
                  className="pr-10"
                  dir="ltr"
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">العنوان</Label>
              <div className="relative">
                <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  name="address"
                  defaultValue={profile?.address ?? ""}
                  placeholder="المدينة، الحي"
                  className="pr-10"
                  disabled={isPending}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">نبذة شخصية</Label>
              <div className="relative">
                <FileText className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="bio"
                  name="bio"
                  defaultValue={profile?.bio ?? ""}
                  placeholder="اكتب نبذة مختصرة عنك..."
                  className="min-h-[100px] pr-10"
                  disabled={isPending}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>حفظ التغييرات</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
