"use client";

import { useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "@/components/reviews/star-rating";
import { submitReview } from "@/actions/reviews";
import { toast } from "sonner";

interface BookingToReview {
  id: string;
  booking_date: string;
  photographer_id: string;
  service_id: string | null;
  photographer_name: string;
  service_name: string | null;
}

export function ReviewForm({ bookings }: { bookings: BookingToReview[] }) {
  const [isPending, startTransition] = useTransition();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  function handleSubmit(booking: BookingToReview) {
    const rating = ratings[booking.id];
    if (!rating) {
      toast.error("يرجى اختيار تقييم");
      return;
    }

    const formData = new FormData();
    formData.set("booking_id", booking.id);
    formData.set("photographer_id", booking.photographer_id);
    formData.set("service_id", booking.service_id ?? "");
    formData.set("rating", String(rating));
    formData.set("comment", comments[booking.id] ?? "");

    startTransition(async () => {
      const result = await submitReview(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        setSubmitted((prev) => new Set(prev).add(booking.id));
      }
    });
  }

  const pending = bookings.filter((b) => !submitted.has(b.id));

  if (pending.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          لا توجد حجوزات بحاجة لتقييم حاليًا
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pending.map((booking) => (
        <Card key={booking.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              تقييم جلسة {booking.booking_date}
            </CardTitle>
            <div className="flex gap-3 text-sm text-muted-foreground">
              <span>المصور: {booking.photographer_name}</span>
              {booking.service_name && <span>الخدمة: {booking.service_name}</span>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">التقييم</span>
              <StarRating
                value={ratings[booking.id] ?? 0}
                onChange={(v) => setRatings((prev) => ({ ...prev, [booking.id]: v }))}
                size="lg"
              />
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">تعليقك (اختياري)</span>
              <Textarea
                value={comments[booking.id] ?? ""}
                onChange={(e) => setComments((prev) => ({ ...prev, [booking.id]: e.target.value }))}
                placeholder="شاركنا رأيك عن الجلسة..."
                disabled={isPending}
              />
            </div>
            <Button
              onClick={() => handleSubmit(booking)}
              disabled={isPending || !ratings[booking.id]}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span>إرسال التقييم</span>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
