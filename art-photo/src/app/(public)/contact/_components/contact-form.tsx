"use client";

import { useActionState } from "react";
import { User, Mail, MessageSquare, FileText, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { submitContact, type ContactResult } from "@/actions/contact";

const initialState: ContactResult = {};

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: ContactResult, formData: FormData) => submitContact(formData),
    initialState
  );

  return (
    <Card>
      <CardContent className="p-6">
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="name" name="name" placeholder="اسمك الكامل" className="pr-10" required disabled={isPending} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input id="email" name="email" type="email" placeholder="example@email.com" className="pr-10" dir="ltr" required disabled={isPending} />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">الموضوع</Label>
            <div className="relative">
              <FileText className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="subject" name="subject" placeholder="موضوع الرسالة" className="pr-10" required disabled={isPending} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">الرسالة</Label>
            <div className="relative">
              <MessageSquare className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea id="message" name="message" placeholder="اكتب رسالتك هنا..." className="min-h-[140px] pr-10" required disabled={isPending} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>إرسال الرسالة</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
