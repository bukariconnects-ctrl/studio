"use client";

import { useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { replyToTicket } from "@/actions/admin-tickets";
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

interface Reply {
  id: string;
  message: string;
  created_at: string;
  user: { full_name: string } | null;
}

export function TicketDetail({ ticket, replies }: { ticket: Ticket; replies: Reply[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const user = ticket.user as { full_name: string; email: string } | null;

  function handleReply() {
    if (!message.trim()) return;
    startTransition(async () => {
      const result = await replyToTicket(ticket.id, message);
      if (result.error) toast.error(result.error);
      else {
        toast.success(result.success);
        setMessage("");
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle>{ticket.subject}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{ticket.status}</Badge>
              <Badge variant="secondary">{ticket.priority}</Badge>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {user?.full_name ?? "مستخدم"} ({user?.email ?? ""}) • {new Date(ticket.created_at).toLocaleDateString("ar-SA")}
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">{ticket.message}</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {replies.map((reply) => {
          const replyUser = reply.user as { full_name: string } | null;
          return (
            <Card key={reply.id}>
              <CardContent className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{replyUser?.full_name ?? "مستخدم"}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(reply.created_at).toLocaleDateString("ar-SA")}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-sm">{reply.message}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="اكتب ردك هنا..."
              disabled={isPending}
            />
            <Button onClick={handleReply} disabled={isPending || !message.trim()}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>إرسال الرد</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
