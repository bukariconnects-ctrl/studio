import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  User,
  Shield,
  CalendarDays,
  ShoppingBag,
  Settings,
  Camera,
  UserCog,
  Star,
  Sparkles,
  HeadphonesIcon,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "لوحة التحكم",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير النظام",
  photographer: "مصور",
  client: "عميل",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const role = (user.app_metadata?.user_role as string) ?? "client";

  const [bookingsRes, ordersRes, reviewsRes, notificationsRes] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("id, status, booking_date, services(name)")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("orders")
        .select("id, status, total_amount, created_at")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("client_id", user.id),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false),
    ]);

  const statusLabels: Record<string, string> = {
    pending: "بانتظار",
    confirmed: "مؤكد",
    in_progress: "قيد التنفيذ",
    completed: "مكتمل",
    cancelled: "ملغى",
    processing: "قيد المعالجة",
    delivered: "تم التسليم",
  };

  type BookingRow = {
    id: string;
    status: string;
    booking_date: string;
    services: { name: string } | null;
  };

  type OrderRow = {
    id: string;
    status: string;
    total_amount: number;
    created_at: string;
  };

  const bookings = (bookingsRes.data ?? []) as unknown as BookingRow[];
  const orders = (ordersRes.data ?? []) as unknown as OrderRow[];

  const quickLinks = [
    { href: "/profile", icon: UserCog, label: "الملف الشخصي", show: true },
    { href: "/booking", icon: CalendarDays, label: "حجز جلسة جديدة", show: role === "client" },
    { href: "/products", icon: ShoppingBag, label: "تسوق المنتجات", show: role === "client" },
    { href: "/dashboard/reviews", icon: Star, label: "تقييماتي", show: role === "client" },
    { href: "/dashboard/recommendations", icon: Sparkles, label: "التوصيات الذكية", show: role === "client" },
    { href: "/support", icon: HeadphonesIcon, label: "الدعم الفني", show: role === "client" },
    { href: "/photographer", icon: Camera, label: "لوحة المصور", show: role === "photographer" || role === "admin" },
    { href: "/admin", icon: Settings, label: "لوحة الإدارة", show: role === "admin" },
  ].filter((link) => link.show);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            مرحباً {user.user_metadata?.full_name ?? ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            {ROLE_LABELS[role] ?? role}
            {(notificationsRes.count ?? 0) > 0 && (
              <Badge variant="destructive" className="mr-2">
                {notificationsRes.count} إشعار جديد
              </Badge>
            )}
          </p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm">
            <LogOut className="h-4 w-4" />
            <span>خروج</span>
          </Button>
        </form>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-4 w-4" />
                آخر النشاطات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {b.services?.name ?? "حجز"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {b.booking_date}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {statusLabels[b.status] ?? b.status}
                    </Badge>
                  </div>
                ))}
                {orders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">طلب</p>
                        <p className="text-xs text-muted-foreground">
                          {Number(o.total_amount).toLocaleString()} ر.ي
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {statusLabels[o.status] ?? o.status}
                    </Badge>
                  </div>
                ))}
                {bookings.length === 0 && orders.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    لا يوجد نشاط حتى الآن. ابدأ بحجز جلسة تصوير!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-4 w-4" />
                معلومات الحساب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {user.user_metadata?.full_name ?? "مستخدم"}
                  </p>
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">الدور</p>
                  <p className="text-xs text-muted-foreground">
                    {ROLE_LABELS[role] ?? role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">وصول سريع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3"
                  >
                    <link.icon className="h-4 w-4 text-primary" />
                    <span>{link.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
