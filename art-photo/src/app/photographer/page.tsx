import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, CheckCircle, Star } from "lucide-react";
import { getPhotographerRecord, getUpcomingSessions, getPastSessions } from "@/actions/photographer";
import { UpcomingSessionsList } from "./_components/upcoming-sessions-list";

export const metadata: Metadata = {
  title: "لوحة المصور",
};

export default async function PhotographerDashboard() {
  const photographer = await getPhotographerRecord();

  if (!photographer) {
    redirect("/dashboard");
  }

  const [upcoming, past] = await Promise.all([
    getUpcomingSessions(photographer.id),
    getPastSessions(photographer.id),
  ]);

  const completedCount = past.filter((s: { status: string }) => s.status === "completed").length;

  const stats = [
    { label: "جلسات قادمة", value: upcoming.length, icon: CalendarDays },
    { label: "جلسات مكتملة", value: completedCount, icon: CheckCircle },
    { label: "التقييم", value: Number(photographer.average_rating).toFixed(1), icon: Star },
    { label: "سنوات الخبرة", value: photographer.experience_years, icon: Clock },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">مرحبًا بك في لوحة المصور</h1>
        <p className="text-muted-foreground">
          {photographer.specialty && <Badge variant="outline" className="mr-2">{photographer.specialty}</Badge>}
          إدارة جلساتك ومهامك
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold">الجلسات القادمة</h2>
        <UpcomingSessionsList sessions={upcoming} />
      </div>
    </div>
  );
}
