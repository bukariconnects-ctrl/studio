import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PackagesManager } from "./_components/packages-manager";

export const metadata: Metadata = {
  title: "إدارة الباقات",
};

export default async function AdminPackagesPage() {
  const supabase = await createClient();

  const [packagesRes, servicesRes] = await Promise.all([
    supabase
      .from("packages")
      .select("*, package_services(*, service:services(id, name))")
      .order("created_at", { ascending: false }),
    supabase
      .from("services")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
  ]);

  return (
    <PackagesManager
      packages={packagesRes.data ?? []}
      services={servicesRes.data ?? []}
    />
  );
}
