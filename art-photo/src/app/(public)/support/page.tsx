import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getClientTickets } from "@/actions/admin-tickets";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "تذاكر الدعم",
};

const STATUS_MAP: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "مفتوح", variant: "destructive" },
  in_progress: { label: "قيد المعالجة", variant: "default" },
  resolved: { label: "تم الحل", variant: "secondary" },
  closed: { label: "مغلق", variant: "outline" },
};

export default async function SupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const tickets = await getClientTickets();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">تذاكر الدعم الخاصة بي</h1>
          <Link href="/contact">
            <Badge variant="default" className="cursor-pointer px-4 py-2">تذكرة جديدة</Badge>
          </Link>
        </div>

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12" />
              <p>لا توجد تذاكر دعم. يمكنك إنشاء تذكرة من صفحة التواصل.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket: Record<string, unknown>) => {
              const statusInfo = STATUS_MAP[ticket.status as string] ?? { label: ticket.status as string, variant: "outline" as const };
              return (
                <Link key={ticket.id as string} href={`/support/${ticket.id}`}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="font-medium">{ticket.subject as string}</span>
                          <div className="text-xs text-muted-foreground">
                            {new Date(ticket.created_at as string).toLocaleDateString("ar-SA")}
                          </div>
                        </div>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
