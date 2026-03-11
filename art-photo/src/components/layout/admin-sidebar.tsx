"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Camera,
  Package,
  ShoppingBag,
  AlertTriangle,
  Users,
  BarChart3,
  MessageSquare,
  Settings,
  Sparkles,
  Brain,
  ShieldCheck,
  Menu,
  X,
  ChevronLeft,
  CalendarDays,
  Globe,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    title: "عام",
    items: [
      { href: "/admin", icon: LayoutDashboard, label: "الرئيسية" },
      { href: "/admin/bookings", icon: CalendarDays, label: "الحجوزات" },
      { href: "/admin/reports", icon: BarChart3, label: "التقارير" },
    ],
  },
  {
    title: "الكتالوج",
    items: [
      { href: "/admin/services", icon: Camera, label: "الخدمات" },
      { href: "/admin/packages", icon: Package, label: "الباقات" },
      { href: "/admin/products", icon: ShoppingBag, label: "المنتجات" },
      { href: "/admin/low-stock", icon: AlertTriangle, label: "مخزون منخفض" },
    ],
  },
  {
    title: "المستخدمون",
    items: [
      { href: "/admin/users", icon: Users, label: "المستخدمون" },
      { href: "/admin/roles", icon: ShieldCheck, label: "الأدوار" },
      { href: "/admin/specialties", icon: Camera, label: "التخصصات" },
    ],
  },
  {
    title: "النظام",
    items: [
      { href: "/admin/tickets", icon: MessageSquare, label: "الدعم" },
      { href: "/admin/settings", icon: Settings, label: "الإعدادات" },
      { href: "/admin/embeddings", icon: Sparkles, label: "AI" },
      { href: "/admin/smart-assign", icon: Brain, label: "الجدولة" },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <nav className="flex flex-col gap-4 p-3">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          {!collapsed && (
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {section.title}
            </p>
          )}
          <div className="flex flex-col gap-1">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  isActive(item.href)
                    ? "border-2 border-foreground bg-tertiary text-foreground shadow-pop"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <button
        className="fixed top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-xl border-2 border-foreground bg-card shadow-pop hover-pop lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 right-0 z-40 flex h-screen flex-col border-l-2 border-foreground bg-card transition-all lg:sticky lg:top-0 ${
          mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        } ${collapsed ? "w-[68px]" : "w-64"}`}
      >
        <div className={`flex items-center border-b-2 border-foreground/20 p-4 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-foreground bg-primary shadow-pop">
                <Camera className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-bold" style={{ fontFamily: "var(--font-heading)" }}>لوحة الإدارة</span>
            </Link>
          )}
          <button
            className="hidden h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted lg:flex"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">{sidebarContent}</div>

        <div className="border-t-2 border-foreground/20 p-3">
          <Link
            href="/"
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${collapsed ? "justify-center" : ""}`}
          >
            <Globe className="h-4 w-4 shrink-0" />
            {!collapsed && <span>العودة للموقع</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
