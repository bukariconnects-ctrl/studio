"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

export type ActionResult = {
  error?: string;
  success?: string;
};

export async function getTickets() {
  const allowed = await checkPermission(PERMISSIONS.TICKETS_MANAGE);
  if (!allowed) return [];

  const supabase = await createClient();

  const { data } = await supabase
    .from("tickets")
    .select("*, user:profiles!tickets_user_id_fkey(full_name, email)")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getTicketWithReplies(ticketId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: ticket } = await supabase
    .from("tickets")
    .select("*, user:profiles!tickets_user_id_fkey(full_name, email)")
    .eq("id", ticketId)
    .single();

  if (!ticket) return null;

  const { data: replies } = await supabase
    .from("ticket_replies")
    .select("*, user:profiles!ticket_replies_user_id_fkey(full_name)")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });

  return { ticket, replies: replies ?? [] };
}

export async function replyToTicket(ticketId: string, message: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "غير مصرح" };

  if (!message?.trim()) return { error: "الرسالة مطلوبة" };

  const { error } = await supabase.from("ticket_replies").insert({
    ticket_id: ticketId,
    user_id: user.id,
    message: message.trim(),
  });

  if (error) return { error: "فشل في إرسال الرد" };

  revalidatePath(`/admin/tickets/${ticketId}`);
  revalidatePath(`/support/${ticketId}`);
  return { success: "تم إرسال الرد" };
}

export async function updateTicketStatus(ticketId: string, status: string): Promise<ActionResult> {
  const allowed = await checkPermission(PERMISSIONS.TICKETS_MANAGE);
  if (!allowed) return { error: "غير مصرح" };

  const supabase = await createClient();

  const { error } = await supabase
    .from("tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (error) return { error: "فشل في تحديث الحالة" };

  revalidatePath("/admin/tickets");
  revalidatePath(`/admin/tickets/${ticketId}`);
  return { success: "تم تحديث الحالة" };
}

export async function getClientTickets() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("tickets")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}
