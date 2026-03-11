"use client";

import { useTransition } from "react";
import { Loader2, CheckCircle, ThumbsUp, MapPin, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { confirmSession, completeSession } from "@/actions/photographer";
import { toast } from "sonner";

interface Session {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  location: string | null;
  client_notes: string | null;
  client: { full_name: string; phone: string | null; avatar_url: string | null } | null;
  service: { name: string; duration_minutes: number } | null;
  package: { name: string } | null;
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  pending: { label: "قيد الانتظار", variant: "secondary" },
  confirmed: { label: "مؤكد", variant: "default" },
};

export function UpcomingSessionsList({ sessions }: { sessions: Session[] }) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm(id: string) {
    startTransition(async () => {
      const result = await confirmSession(id);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  }

  function handleComplete(id: string) {
    if (!confirm("هل أنت متأكد من إتمام هذه الجلسة؟")) return;
    startTransition(async () => {
      const result = await completeSession(id);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          لا توجد جلسات قادمة حاليًا
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => {
        const client = session.client as { full_name: string; phone: string | null } | null;
        const statusInfo = STATUS_MAP[session.status] ?? { label: session.status, variant: "outline" as const };

        return (
          <Card key={session.id}>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold" dir="ltr">{session.booking_date}</span>
                    <span className="text-sm text-muted-foreground" dir="ltr">
                      {session.start_time?.slice(0, 5)} — {session.end_time?.slice(0, 5)}
                    </span>
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {client && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {client.full_name}
                      </span>
                    )}
                    {client?.phone && (
                      <span className="flex items-center gap-1" dir="ltr">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </span>
                    )}
                    {session.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {session.service && <Badge variant="outline">{session.service.name}</Badge>}
                    {session.package && <Badge variant="outline">{session.package.name}</Badge>}
                  </div>

                  {session.client_notes && (
                    <p className="text-xs text-muted-foreground">ملاحظات: {session.client_notes}</p>
                  )}
                </div>

                <div className="flex shrink-0 gap-2">
                  {session.status === "pending" && (
                    <Button size="sm" onClick={() => handleConfirm(session.id)} disabled={isPending}>
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                      <span>تأكيد</span>
                    </Button>
                  )}
                  {session.status === "confirmed" && (
                    <Button size="sm" variant="default" onClick={() => handleComplete(session.id)} disabled={isPending}>
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      <span>إتمام الجلسة</span>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
