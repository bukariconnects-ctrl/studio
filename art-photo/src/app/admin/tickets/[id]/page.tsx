import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTicketWithReplies } from "@/actions/admin-tickets";
import { TicketDetail } from "./_components/ticket-detail";

export const metadata: Metadata = {
  title: "تفاصيل التذكرة",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getTicketWithReplies(id);

  if (!data) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">تفاصيل التذكرة</h1>
      <TicketDetail ticket={data.ticket} replies={data.replies} />
    </div>
  );
}
