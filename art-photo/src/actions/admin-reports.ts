"use server";

import { createClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/rbac";
import { PERMISSIONS } from "@/lib/permissions";

export async function getDailyRevenue() {
  const allowed = await checkPermission(PERMISSIONS.ANALYTICS_VIEW);
  if (!allowed) return [];

  const supabase = await createClient();

  const { data } = await supabase
    .from("v_daily_revenue")
    .select("*")
    .limit(30);

  return data ?? [];
}

export async function getPhotographerPerformance() {
  const allowed = await checkPermission(PERMISSIONS.ANALYTICS_VIEW);
  if (!allowed) return [];

  const supabase = await createClient();

  const { data } = await supabase
    .from("v_photographer_performance")
    .select("*");

  return data ?? [];
}

export async function getDashboardStats() {
  const allowed = await checkPermission(PERMISSIONS.ANALYTICS_VIEW);
  if (!allowed) return null;

  const supabase = await createClient();

  const { data } = await supabase.rpc("get_admin_dashboard_stats");
  return data;
}

export async function getRevenueData() {
  const allowed = await checkPermission(PERMISSIONS.ANALYTICS_VIEW);
  if (!allowed) return { bookings: [], orders: [], invoices: [] };

  const supabase = await createClient();

  const [bookingsRes, ordersRes, invoicesRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("id, booking_date, total_price, status")
      .order("booking_date", { ascending: false })
      .limit(100),
    supabase
      .from("orders")
      .select("id, total_amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("invoices")
      .select("id, invoice_number, amount, tax_amount, total_amount, payment_method, payment_date, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  return {
    bookings: bookingsRes.data ?? [],
    orders: ordersRes.data ?? [],
    invoices: invoicesRes.data ?? [],
  };
}
