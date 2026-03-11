import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTicketWithReplies } from "@/actions/admin-tickets";
import { ClientTicketView } from "./_components/client-ticket-view";

export const metadata: Metadata = {
  title: "تفاصيل التذكرة",
};

export default async function ClientTicketPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { id } = await params;
  const data = await getTicketWithReplies(id);

  if (!data) notFound();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-2xl font-bold">تفاصيل التذكرة</h1>
        <ClientTicketView ticket={data.ticket} replies={data.replies} />
      </div>
    </div>
  );
}
