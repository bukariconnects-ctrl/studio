import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  DollarSign,
  CalendarDays,
  AlertTriangle,
  Star,
  Users,
  ShoppingBag,
  Camera,
  BarChart3,
  MessageSquare,
  Clock,
  TrendingUp,
} from "lucide-react";
import { AdminRevenueChart } from "./_components/admin-revenue-chart";

export const metadata: Metadata = {
  title: "لوحة الإدارة",
};

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    bookingsActiveRes,
    lowStockRes,
    revenueRes,
    reviewsRes,
    recentBookingsRes,
    recentOrdersRes,
    ticketsOpenRes,
    usersCountRes,
    revenueChartRes,
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "confirmed", "in_progress"]),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .lt("stock_quantity", 5)
      .eq("is_active", true),
    supabase
      .from("invoices")
      .select("total_amount")
      .eq("status", "paid"),
    supabase
      .from("reviews")
      .select("rating"),
    supabase
      .from("bookings")
      .select("id, status, booking_date, created_at, profiles!bookings_client_id_fkey(full_name), services(name)")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("orders")
      .select("id, status, total_amount, created_at, profiles!orders_client_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("tickets")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "in_progress"]),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("v_daily_revenue")
      .select("*")
      .order("date", { ascending: true })
      .limit(14),
  ]);

  const totalRevenue = (revenueRes.data ?? []).reduce(
    (sum: number, inv: { total_amount: number }) => sum + Number(inv.total_amount),
    0
  );

  const avgRating =
    (reviewsRes.data ?? []).length > 0
      ? (
          (reviewsRes.data ?? []).reduce(
            (sum: number, r: { rating: number }) => sum + r.rating,
            0
          ) / (reviewsRes.data ?? []).length
        ).toFixed(1)
      : "0";

  const statusLabels: Record<string, string> = {
    pending: "بانتظار",
    confirmed: "مؤكد",
    in_progress: "قيد التنفيذ",
    completed: "مكتمل",
    cancelled: "ملغى",
    processing: "قيد المعالجة",
    shipped: "تم الشحن",
    delivered: "تم التسليم",
  };

  const statusBorderColors: Record<string, string> = {
    pending: "border-tertiary",
    confirmed: "border-primary",
    in_progress: "border-secondary",
    completed: "border-quaternary",
    cancelled: "border-destructive",
    processing: "border-primary",
    shipped: "border-primary",
    delivered: "border-quaternary",
  };

  const stats = [
    {
      label: "إجمالي الإيرادات",
      value: `${totalRevenue.toLocaleString()} ر.ي`,
      icon: DollarSign,
      color: "bg-quaternary",
    },
    {
      label: "الحجوزات النشطة",
      value: bookingsActiveRes.count ?? 0,
      icon: CalendarDays,
      color: "bg-primary",
    },
    {
      label: "مخزون منخفض",
      value: lowStockRes.count ?? 0,
      icon: AlertTriangle,
      color: "bg-tertiary",
    },
    {
      label: "متوسط التقييم",
      value: `${avgRating} / 5`,
      icon: Star,
      color: "bg-secondary",
    },
    {
      label: "المستخدمون",
      value: usersCountRes.count ?? 0,
      icon: Users,
      color: "bg-primary",
    },
    {
      label: "تذاكر مفتوحة",
      value: ticketsOpenRes.count ?? 0,
      icon: MessageSquare,
      color: "bg-tertiary",
    },
  ];

  const quickActions = [
    { href: "/admin/bookings", icon: CalendarDays, label: "إدارة الحجوزات", accent: "bg-primary" },
    { href: "/admin/services", icon: Camera, label: "إضافة خدمة", accent: "bg-secondary" },
    { href: "/admin/products", icon: ShoppingBag, label: "إضافة منتج", accent: "bg-tertiary" },
    { href: "/admin/users", icon: Users, label: "المستخدمون", accent: "bg-quaternary" },
    { href: "/admin/reports", icon: BarChart3, label: "التقارير", accent: "bg-primary" },
    { href: "/admin/tickets", icon: MessageSquare, label: `الدعم (${ticketsOpenRes.count ?? 0})`, accent: "bg-secondary" },
  ];

  type BookingRow = {
    id: string;
    status: string;
    booking_date: string;
    created_at: string;
    profiles: { full_name: string } | null;
    services: { name: string } | null;
  };

  type OrderRow = {
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
    profiles: { full_name: string } | null;
  };

  const recentBookings = (recentBookingsRes.data ?? []) as unknown as BookingRow[];
  const recentOrders = (recentOrdersRes.data ?? []) as unknown as OrderRow[];
  const chartData = (revenueChartRes.data ?? []) as { date: string; booking_revenue: number; order_revenue: number; total_revenue: number }[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>مركز القيادة</h1>
        <span className="rounded-full border-2 border-foreground bg-tertiary px-4 py-1.5 text-xs font-bold shadow-pop">
          {new Date().toLocaleDateString("ar-YE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border-2 border-foreground bg-card p-4 shadow-pop card-hover">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-foreground ${stat.color} shadow-pop`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-lg font-bold leading-tight">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border-2 border-foreground bg-card p-5 shadow-pop-lg">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-foreground bg-primary shadow-pop">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-heading)" }}>الإيرادات (آخر 14 يوم)</h2>
            </div>
            <AdminRevenueChart data={chartData} />
          </div>

          <div className="rounded-2xl border-2 border-foreground bg-card p-5 shadow-pop-lg">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-foreground bg-secondary shadow-pop">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-base font-bold" style={{ fontFamily: "var(--font-heading)" }}>النشاط الأخير</h2>
            </div>
            <div className="space-y-2">
              {recentBookings.map((b) => (
                <div
                  key={`b-${b.id}`}
                  className={`flex items-center justify-between rounded-xl border-2 border-r-4 p-3 ${statusBorderColors[b.status] ?? "border-muted"}`}
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold">
                        {b.profiles?.full_name ?? "عميل"} — {b.services?.name ?? "خدمة"}
                      </p>
                      <p className="text-xs text-muted-foreground">{b.booking_date}</p>
                    </div>
                  </div>
                  <span className="rounded-full border-2 border-foreground bg-muted px-2.5 py-0.5 text-xs font-bold">
                    {statusLabels[b.status] ?? b.status}
                  </span>
                </div>
              ))}
              {recentOrders.map((o) => (
                <div
                  key={`o-${o.id}`}
                  className={`flex items-center justify-between rounded-xl border-2 border-r-4 p-3 ${statusBorderColors[o.status] ?? "border-muted"}`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold">
                        {o.profiles?.full_name ?? "عميل"} — طلب
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Number(o.total_amount).toLocaleString()} ر.ي
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border-2 border-foreground bg-muted px-2.5 py-0.5 text-xs font-bold">
                    {statusLabels[o.status] ?? o.status}
                  </span>
                </div>
              ))}
              {recentBookings.length === 0 && recentOrders.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  لا يوجد نشاط حتى الآن
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border-2 border-foreground bg-card p-5 shadow-pop-lg">
          <h2 className="mb-4 text-base font-bold" style={{ fontFamily: "var(--font-heading)" }}>إجراءات سريعة</h2>
          <div className="grid gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-xl border-2 border-foreground bg-card p-3 text-sm font-semibold shadow-pop hover-pop"
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${action.accent}`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
