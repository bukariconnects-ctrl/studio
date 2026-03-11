import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CheckoutForm } from "./_components/checkout-form";

export const metadata: Metadata = {
  title: "إتمام الشراء",
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">إتمام الشراء</h1>
        <p className="text-muted-foreground">راجع طلبك وأكمل عملية الدفع</p>
      </div>
      <CheckoutForm />
    </div>
  );
}
