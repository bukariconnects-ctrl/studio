"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateTicketStatus } from "@/actions/admin-tickets";
import { toast } from "sonner";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  user: { full_name: string; email: string } | null;
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "مفتوح", variant: "destructive" },
  in_progress: { label: "قيد المعالجة", variant: "default" },
  resolved: { label: "تم الحل", variant: "secondary" },
  closed: { label: "مغلق", variant: "outline" },
};

const PRIORITY_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  low: { label: "منخفض", variant: "outline" },
  medium: { label: "متوسط", variant: "secondary" },
  high: { label: "عالي", variant: "default" },
  urgent: { label: "عاجل", variant: "destructive" },
};

export function TicketsList({ tickets }: { tickets: Ticket[] }) {
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(ticketId: string, status: string) {
    startTransition(async () => {
      const result = await updateTicketStatus(ticketId, status);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          لا توجد تذاكر دعم
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">التذاكر ({tickets.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const user = ticket.user as { full_name: string; email: string } | null;
            const statusInfo = STATUS_MAP[ticket.status] ?? { label: ticket.status, variant: "outline" as const };
            const priorityInfo = PRIORITY_MAP[ticket.priority] ?? { label: ticket.priority, variant: "outline" as const };

            return (
              <div key={ticket.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <Link href={`/admin/tickets/${ticket.id}`} className="font-medium hover:underline">
                      {ticket.subject}
                    </Link>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      <Badge variant={priorityInfo.variant}>{priorityInfo.label}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user?.full_name ?? "مستخدم"} • {user?.email ?? ""} • {new Date(ticket.created_at).toLocaleDateString("ar-SA")}
                    </div>
                  </div>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                    disabled={isPending}
                    className="flex h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                  >
                    <option value="open">مفتوح</option>
                    <option value="in_progress">قيد المعالجة</option>
                    <option value="resolved">تم الحل</option>
                    <option value="closed">مغلق</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
