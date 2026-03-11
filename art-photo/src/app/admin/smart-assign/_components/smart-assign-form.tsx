"use client";

import { useState, useTransition } from "react";
import { Loader2, UserCheck, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { smartAssignPhotographer, type SmartAssignResult } from "@/actions/smart-scheduling";
import { toast } from "sonner";

export function SmartAssignForm() {
  const [isPending, startTransition] = useTransition();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [specialty, setSpecialty] = useState("");
  const [result, setResult] = useState<SmartAssignResult | null>(null);

  function handleAssign() {
    if (!date) {
      toast.error("يرجى تحديد التاريخ");
      return;
    }
    startTransition(async () => {
      const res = await smartAssignPhotographer(date, startTime, endTime, specialty || undefined);
      setResult(res);
      if (res.error) toast.error(res.error);
      else if (!res.found) toast.warning(res.message);
      else toast.success(`تم اختيار المصور: ${res.name}`);
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5" />
            بحث عن أفضل مصور متاح
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={isPending} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>التخصص (اختياري)</Label>
              <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="مثال: بورتريه" disabled={isPending} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>وقت البدء</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} disabled={isPending} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>وقت الانتهاء</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={isPending} dir="ltr" />
            </div>
          </div>
          <Button onClick={handleAssign} disabled={isPending || !date} className="w-full">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
            <span>{isPending ? "جارٍ البحث..." : "بحث عن المصور الأنسب"}</span>
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="p-6">
            {result.found ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  <span className="text-lg font-bold text-green-600">تم العثور على مصور مناسب</span>
                </div>
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{result.name}</span>
                    <Badge variant="outline">⭐ {Number(result.rating ?? 0).toFixed(1)}</Badge>
                  </div>
                  {result.specialty && (
                    <p className="text-sm text-muted-foreground">التخصص: {result.specialty}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    الحجوزات الحالية في هذا اليوم: {result.current_bookings ?? 0}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-5 w-5" />
                <span>{result.message ?? "لا يوجد مصور متاح"}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
