"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";

const LABELS: Record<string, string> = {
  admin: "لوحة الإدارة",
  dashboard: "لوحة التحكم",
  services: "الخدمات",
  packages: "الباقات",
  products: "المنتجات",
  "low-stock": "مخزون منخفض",
  users: "المستخدمون",
  roles: "الأدوار والصلاحيات",
  reports: "التقارير",
  tickets: "الدعم الفني",
  settings: "الإعدادات",
  embeddings: "الذكاء الاصطناعي",
  "smart-assign": "الجدولة الذكية",
  bookings: "الحجوزات",
  specialties: "التخصصات",
  photographer: "لوحة المصور",
  sessions: "الجلسات",
  history: "السجل",
  upload: "رفع الصور",
  profile: "الملف الشخصي",
  booking: "الحجز",
  cart: "السلة",
  checkout: "الدفع",
  reviews: "التقييمات",
  recommendations: "التوصيات",
  support: "الدعم",
  contact: "اتصل بنا",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = segments.map((segment, idx) => {
    const href = "/" + segments.slice(0, idx + 1).join("/");
    const label = LABELS[segment] ?? segment;
    const isLast = idx === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronLeft className="h-3 w-3" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-foreground">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
