import type { Metadata } from "next";
import { getBookings } from "@/actions/admin-bookings";
import { BookingsList } from "./_components/bookings-list";

export const metadata: Metadata = {
  title: "إدارة الحجوزات",
};

export default async function AdminBookingsPage() {
  const bookings = await getBookings();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>إدارة الحجوزات</h1>
      <BookingsList bookings={bookings} />
    </div>
  );
}
