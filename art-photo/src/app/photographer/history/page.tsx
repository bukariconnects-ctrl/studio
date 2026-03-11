import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPhotographerRecord, getPastSessions } from "@/actions/photographer";

export const metadata: Metadata = {
  title: "سجل الجلسات",
};

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  completed: { label: "مكتمل", variant: "default" },
  cancelled: { label: "ملغى", variant: "destructive" },
};

export default async function HistoryPage() {
  const photographer = await getPhotographerRecord();
  if (!photographer) redirect("/dashboard");

  const sessions = await getPastSessions(photographer.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">سجل الجلسات السابقة</h1>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            لا توجد جلسات سابقة
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session: Record<string, unknown>) => {
            const client = session.client as { full_name: string } | null;
            const service = session.service as { name: string } | null;
            const pkg = session.package as { name: string } | null;
            const statusInfo = STATUS_MAP[session.status as string] ?? { label: session.status as string, variant: "outline" as const };

            return (
              <Card key={session.id as string}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold" dir="ltr">{session.booking_date as string}</span>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                    <div className="flex gap-3 text-sm text-muted-foreground">
                      {client && <span>{client.full_name}</span>}
                      {service && <span>{service.name}</span>}
                      {pkg && <span>{pkg.name}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
