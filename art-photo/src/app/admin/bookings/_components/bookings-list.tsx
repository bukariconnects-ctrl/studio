"use client";

import { useState, useTransition } from "react";
import { updateBookingStatus } from "@/actions/admin-bookings";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Search, Filter } from "lucide-react";

type Booking = {
  id: string;
  status: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  total_price: number;
  client_notes: string | null;
  created_at: string;
  profiles: { full_name: string; phone: string | null } | null;
  services: { name: string } | null;
  packages: { name: string } | null;
  photographer: { id: string; profiles: { full_name: string } | null } | null;
};

const STATUS_OPTIONS = [
  { value: "pending", label: "بانتظار", color: "bg-tertiary" },
  { value: "confirmed", label: "مؤكد", color: "bg-primary" },
  { value: "in_progress", label: "قيد التنفيذ", color: "bg-secondary" },
  { value: "completed", label: "مكتمل", color: "bg-quaternary" },
  { value: "cancelled", label: "ملغى", color: "bg-destructive" },
  { value: "rejected", label: "مرفوض", color: "bg-destructive" },
];

const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.label])
);

const STATUS_COLORS: Record<string, string> = Object.fromEntries(
  STATUS_OPTIONS.map((s) => [s.value, s.color])
);

export function BookingsList({ bookings }: { bookings: Booking[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      !search ||
      b.profiles?.full_name?.includes(search) ||
      b.services?.name?.includes(search) ||
      b.packages?.name?.includes(search) ||
      b.id.includes(search);
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (bookingId: string, newStatus: string) => {
    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, newStatus);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        setSelected(null);
      }
    });
  };

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الخدمة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-2 border-foreground pr-10 shadow-pop focus:shadow-pop-accent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border-2 border-foreground bg-card px-3 py-2 text-sm font-semibold shadow-pop"
          >
            <option value="all">الكل</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-foreground bg-card shadow-pop-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-foreground/20 text-right">
                <th className="px-4 py-3 font-bold">العميل</th>
                <th className="px-4 py-3 font-bold">الخدمة</th>
                <th className="px-4 py-3 font-bold">التاريخ</th>
                <th className="px-4 py-3 font-bold">الوقت</th>
                <th className="px-4 py-3 font-bold">المصور</th>
                <th className="px-4 py-3 font-bold">المبلغ</th>
                <th className="px-4 py-3 font-bold">الحالة</th>
                <th className="px-4 py-3 font-bold">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-foreground/10 transition-colors hover:bg-muted/50">
                  <td className="px-4 py-3 font-semibold">{b.profiles?.full_name ?? "—"}</td>
                  <td className="px-4 py-3">{b.services?.name ?? b.packages?.name ?? "—"}</td>
                  <td className="px-4 py-3">{b.booking_date}</td>
                  <td className="px-4 py-3 text-xs" dir="ltr">{b.start_time?.slice(0, 5)} - {b.end_time?.slice(0, 5)}</td>
                  <td className="px-4 py-3">{(b.photographer as Booking["photographer"])?.profiles?.full_name ?? "غير محدد"}</td>
                  <td className="px-4 py-3 font-bold">{Number(b.total_price).toLocaleString()} ر.ي</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full border-2 border-foreground px-2.5 py-0.5 text-xs font-bold text-white ${STATUS_COLORS[b.status] ?? "bg-muted"}`}>
                      {STATUS_LABELS[b.status] ?? b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(b)}
                      className="rounded-lg border-2 border-foreground bg-card px-3 py-1 text-xs font-bold shadow-pop hover-pop"
                    >
                      تعديل
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <CalendarDays className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    لا توجد حجوزات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="border-2 border-foreground shadow-pop-lg sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-heading)" }}>تحديث حالة الحجز</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="rounded-xl border-2 border-foreground/20 bg-muted/50 p-3 text-sm">
                <p><strong>العميل:</strong> {selected.profiles?.full_name ?? "—"}</p>
                <p><strong>الخدمة:</strong> {selected.services?.name ?? selected.packages?.name ?? "—"}</p>
                <p><strong>التاريخ:</strong> {selected.booking_date}</p>
                <p><strong>المبلغ:</strong> {Number(selected.total_price).toLocaleString()} ر.ي</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <Button
                    key={s.value}
                    variant={selected.status === s.value ? "default" : "outline"}
                    size="sm"
                    disabled={isPending || selected.status === s.value}
                    onClick={() => handleStatusUpdate(selected.id, s.value)}
                    className="border-2 border-foreground text-xs font-bold shadow-pop"
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)} className="border-2 border-foreground">
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
