import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  LayoutDashboard,
  CalendarDays,
  Upload,
  Clock,
} from "lucide-react";

export const metadata: Metadata = {
  title: {
    default: "لوحة المصور",
    template: "%s | لوحة المصور",
  },
};

const PHOTOGRAPHER_NAV = [
  { href: "/photographer", icon: LayoutDashboard, label: "الرئيسية" },
  { href: "/photographer/sessions", icon: CalendarDays, label: "جلساتي" },
  { href: "/photographer/upload", icon: Upload, label: "رفع الصور" },
  { href: "/photographer/history", icon: Clock, label: "السجل" },
];

export default async function PhotographerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  let role = (user.app_metadata?.user_role as string) ?? "";

  if (!role) {
    const { data: ur } = await supabase
      .from("user_roles")
      .select("role:roles(name)")
      .eq("user_id", user.id)
      .limit(1)
      .single();
    const raw = ur as unknown as { role: { name: string } | null } | null;
    role = raw?.role?.name ?? "client";
  }

  if (role !== "photographer" && role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-wrap gap-2">
        {PHOTOGRAPHER_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
