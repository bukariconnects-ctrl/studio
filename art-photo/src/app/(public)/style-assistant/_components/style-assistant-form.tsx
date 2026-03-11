"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStyleAdvice } from "@/actions/ai-style-assistant";
import { toast } from "sonner";

const SESSION_TYPES = [
  "تصوير بورتريه",
  "تصوير زفاف",
  "تصوير عائلي",
  "تصوير أعمال (بروفايل)",
  "تصوير أطفال",
  "تصوير منتجات",
  "تصوير تخرج",
  "تصوير مواليد",
  "تصوير أزياء",
];

const OCCASIONS = ["زفاف", "تخرج", "عيد ميلاد", "ذكرى سنوية", "عمل رسمي", "كاجوال", "أخرى"];
const SEASONS = ["صيف", "شتاء", "ربيع", "خريف"];

export function StyleAssistantForm() {
  const [isPending, startTransition] = useTransition();
  const [sessionType, setSessionType] = useState("");
  const [occasion, setOccasion] = useState("");
  const [gender, setGender] = useState("");
  const [season, setSeason] = useState("");
  const [advice, setAdvice] = useState("");

  function handleSubmit() {
    if (!sessionType) {
      toast.error("يرجى اختيار نوع الجلسة");
      return;
    }
    startTransition(async () => {
      const result = await getStyleAdvice(sessionType, occasion, gender, season);
      if (result.error) {
        toast.error(result.error);
      } else {
        setAdvice(result.advice);
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wand2 className="h-5 w-5" />
            اختر تفاصيل الجلسة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>نوع جلسة التصوير *</Label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              disabled={isPending}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
            >
              <option value="">اختر نوع الجلسة...</option>
              {SESSION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>المناسبة</Label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                disabled={isPending}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">اختياري</option>
                {OCCASIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>الجنس</Label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={isPending}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">اختياري</option>
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>الموسم</Label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                disabled={isPending}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
              >
                <option value="">اختياري</option>
                {SEASONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={isPending || !sessionType} className="w-full">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{isPending ? "جارٍ التحليل..." : "احصل على نصائح المظهر"}</span>
          </Button>
        </CardContent>
      </Card>

      {advice && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" />
              نصائح المظهر
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
              {advice}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
