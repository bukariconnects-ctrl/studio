"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CheckoutResult = {
  error?: string;
  success?: string;
  orderId?: string;
  invoiceNumber?: string;
  total?: number;
};

export async function completeCheckout(
  items: { product_id: string; quantity: number }[],
  shippingAddress: string,
  paymentMethod: string,
  stripePaymentIntentId: string
): Promise<CheckoutResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "يجب تسجيل الدخول" };
  if (items.length === 0) return { error: "السلة فارغة" };

  const { data, error } = await supabase.rpc("complete_order", {
    p_client_id: user.id,
    p_items: items,
    p_shipping_address: shippingAddress || null,
    p_payment_method: paymentMethod,
    p_stripe_payment_intent_id: stripePaymentIntentId || null,
  });

  if (error) return { error: error.message };

  if (!data?.success) return { error: data?.message ?? "فشل في إتمام الطلب" };

  revalidatePath("/dashboard");
  revalidatePath("/products");

  return {
    success: data.message,
    orderId: data.order_id,
    invoiceNumber: data.invoice_number,
    total: data.total,
  };
}

export async function generateInvoicePdfUrl(invoiceNumber: string): Promise<{ url: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { url: null };

  const { data } = await supabase
    .from("invoices")
    .select("id, invoice_number, amount, tax_amount, total_amount, payment_method, payment_date, created_at")
    .eq("invoice_number", invoiceNumber)
    .eq("client_id", user.id)
    .single();

  if (!data) return { url: null };

  return { url: `/api/invoice/${data.invoice_number}` };
}
