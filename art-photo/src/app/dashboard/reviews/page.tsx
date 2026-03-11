import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBookingsToReview } from "@/actions/reviews";
import { ReviewForm } from "@/components/reviews/review-form";

export const metadata: Metadata = {
  title: "التقييمات",
};

export default async function ReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const bookings = await getBookingsToReview();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">تقييم الجلسات</h1>
        <p className="text-muted-foreground">قيّم تجربتك مع المصورين لمساعدة الآخرين في اختيار الأفضل</p>
        <ReviewForm bookings={bookings} />
      </div>
    </div>
  );
}
