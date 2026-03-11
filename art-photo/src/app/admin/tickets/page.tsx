import type { Metadata } from "next";
import { getTickets } from "@/actions/admin-tickets";
import { TicketsList } from "./_components/tickets-list";

export const metadata: Metadata = {
  title: "إدارة التذاكر",
};

export default async function AdminTicketsPage() {
  const tickets = await getTickets();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة تذاكر الدعم</h1>
      <TicketsList tickets={tickets} />
    </div>
  );
}
