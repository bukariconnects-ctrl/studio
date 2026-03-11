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
  created_at: string;
}

interface Reply {
  id: string;
  message: string;
  created_at: string;
  user: { full_name: string } | null;
}

export function ClientTicketView({ ticket, replies }: { ticket: Ticket; replies: Reply[] }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

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

  const isClosed = ticket.status === "closed" || ticket.status === "resolved";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{ticket.subject}</CardTitle>
            <Badge variant="outline">{ticket.status}</Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(ticket.created_at).toLocaleDateString("ar-SA")}
          </span>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm">{ticket.message}</p>
        </CardContent>
      </Card>

      {replies.map((reply) => {
        const replyUser = reply.user as { full_name: string } | null;
        return (
          <Card key={reply.id}>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{replyUser?.full_name ?? "الدعم"}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(reply.created_at).toLocaleDateString("ar-SA")}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{reply.message}</p>
            </CardContent>
          </Card>
        );
      })}

      {!isClosed && (
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
                <span>إرسال</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
