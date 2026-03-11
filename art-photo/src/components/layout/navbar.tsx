"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Menu, LogIn, UserPlus, LayoutDashboard, User, LogOut, Settings } from "lucide-react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { RealtimeProvider } from "@/components/notifications/realtime-provider";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth-store";
import { signOut } from "@/actions/auth";

const NAV_LINKS = [
  { href: "/", label: "الرئيسية" },
  { href: "/services", label: "الخدمات" },
  { href: "/products", label: "المتجر" },
  { href: "/photographers", label: "المصورون" },
  { href: "/about", label: "من نحن" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, role, isLoading } = useAuthStore();
  const [open, setOpen] = useState(false);

  const initials = user?.user_metadata?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-foreground bg-background">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 hover-pop">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-foreground bg-primary shadow-pop">
            <Camera className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            Art Photo Studio
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  pathname === link.href
                    ? "border-2 border-foreground bg-tertiary text-foreground shadow-pop"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-full border-2 border-muted bg-muted" />
          ) : user ? (
            <>
            <RealtimeProvider userId={user.id} />
            <NotificationBell userId={user.id} />
            <DropdownMenu>
              <DropdownMenuTrigger render={<button className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-foreground bg-quaternary outline-none shadow-pop hover-pop" />}>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-transparent text-xs font-bold text-foreground">{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-52 rounded-xl border-2 border-foreground bg-card shadow-pop-lg">
                <div className="px-3 py-2">
                  <p className="text-sm font-bold">{user.user_metadata?.full_name ?? "مستخدم"}</p>
                  <p className="text-xs text-muted-foreground" dir="ltr">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/dashboard" />}>
                  <LayoutDashboard className="ml-2 h-4 w-4" />لوحة التحكم
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link href="/profile" />}>
                  <User className="ml-2 h-4 w-4" />الملف الشخصي
                </DropdownMenuItem>
                {role === "admin" && (
                  <DropdownMenuItem render={<Link href="/admin" />}>
                    <Settings className="ml-2 h-4 w-4" />الإدارة
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { const form = document.createElement("form"); form.action = "/"; form.method = "post"; document.body.appendChild(form); }}>
                  <form action={signOut} className="flex w-full items-center">
                    <button type="submit" className="flex w-full items-center">
                      <LogOut className="ml-2 h-4 w-4" />تسجيل الخروج
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
                <LogIn className="h-4 w-4" />دخول
              </Link>
              <Link href="/auth/register" className="inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-foreground bg-primary px-4 text-sm font-bold text-primary-foreground shadow-pop hover-pop">
                <UserPlus className="h-4 w-4" />حساب جديد
              </Link>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-foreground shadow-pop hover-pop md:hidden" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-r-2 border-foreground bg-background">
            <SheetTitle className="sr-only">القائمة</SheetTitle>
            <div className="mt-6 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    pathname === link.href
                      ? "border-2 border-foreground bg-tertiary shadow-pop"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-3 border-t-2 border-foreground/20" />
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted">
                    لوحة التحكم
                  </Link>
                  <Link href="/profile" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted">
                    الملف الشخصي
                  </Link>
                  <form action={signOut}>
                    <button type="submit" className="w-full rounded-xl px-4 py-3 text-start text-sm font-semibold text-destructive hover:bg-destructive/10">
                      تسجيل الخروج
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-muted">
                    تسجيل الدخول
                  </Link>
                  <Link href="/auth/register" onClick={() => setOpen(false)} className="rounded-xl border-2 border-foreground bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground shadow-pop">
                    إنشاء حساب
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
