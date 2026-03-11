import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ServicesManager } from "./_components/services-manager";

export const metadata: Metadata = {
  title: "إدارة الخدمات",
};

export default async function AdminServicesPage() {
  const supabase = await createClient();

  const [servicesRes, categoriesRes] = await Promise.all([
    supabase
      .from("services")
      .select("*, category:service_categories(*)")
      .order("created_at", { ascending: false }),
    supabase
      .from("service_categories")
      .select("*")
      .order("sort_order", { ascending: true }),
  ]);

  return (
    <ServicesManager
      services={servicesRes.data ?? []}
      categories={categoriesRes.data ?? []}
    />
  );
}
