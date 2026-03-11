"use client";

import { useAuthStore } from "@/stores/auth-store";

type PermissionGuardProps = {
  permission?: string;
  role?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function PermissionGuard({
  permission,
  role,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const user = useAuthStore((s) => s.user);
  const userRole = useAuthStore((s) => s.role);

  if (!user) return <>{fallback}</>;

  if (userRole === "admin") return <>{children}</>;

  if (role && userRole !== role) return <>{fallback}</>;

  if (permission) {
    const permissions =
      (user.app_metadata?.permissions as string[]) ?? [];
    if (!permissions.includes(permission)) return <>{fallback}</>;
  }

  return <>{children}</>;
}
