import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPhotographers, getServicesAndPackages } from "@/actions/booking";
import { BookingForm } from "./_components/booking-form";

export const metadata: Metadata = {
  title: "حجز موعد",
};

export default async function BookingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [photographers, catalog] = await Promise.all([
    getPhotographers(),
    getServicesAndPackages(),
  ]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">حجز موعد تصوير</h1>
        <p className="text-muted-foreground">اختر المصور والخدمة وحدد الموعد المناسب</p>
      </div>
      <BookingForm
        photographers={photographers}
        services={catalog.services}
        packages={catalog.packages}
      />
    </div>
  );
}
