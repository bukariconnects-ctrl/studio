"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CalendarDays, Clock, MapPin, User, Camera, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createBooking, checkAvailability } from "@/actions/booking";
import { toast } from "sonner";

interface PhotographerItem {
  id: string;
  specialty: string | null;
  experience_years: number;
  average_rating: number;
  hourly_rate: number | null;
  profile: { full_name: string; avatar_url: string | null } | null;
}

interface ServiceItem {
  id: string;
  name: string;
  base_price: number;
  duration_minutes: number;
}

interface PackageItem {
  id: string;
  name: string;
  price: number;
  discount_percentage: number;
}

interface Props {
  photographers: PhotographerItem[];
  services: ServiceItem[];
  packages: PackageItem[];
}

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
];

export function BookingForm({ photographers, services, packages }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedPhotographer, setSelectedPhotographer] = useState("");
  const [bookingType, setBookingType] = useState<"service" | "package">("service");
  const [selectedService, setSelectedService] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const [availabilityStatus, setAvailabilityStatus] = useState<{ checked: boolean; available: boolean; message: string }>({
    checked: false,
    available: false,
    message: "",
  });

  const selectedSvc = services.find((s) => s.id === selectedService);

  function autoSetEndTime(start: string) {
    setStartTime(start);
    if (selectedSvc) {
      const [h, m] = start.split(":").map(Number);
      const totalMinutes = h * 60 + m + selectedSvc.duration_minutes;
      const endH = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
      const endM = (totalMinutes % 60).toString().padStart(2, "0");
      setEndTime(`${endH}:${endM}`);
    }
  }

  async function handleCheckAvailability() {
    if (!selectedPhotographer || !bookingDate || !startTime || !endTime) {
      toast.error("اختر المصور والتاريخ والوقت أولاً");
      return;
    }

    const result = await checkAvailability(selectedPhotographer, bookingDate, startTime, endTime);
    setAvailabilityStatus({ checked: true, ...result });

    if (result.available) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }

  function handleSubmit() {
    if (!availabilityStatus.checked || !availabilityStatus.available) {
      toast.error("تحقق من التوفر أولاً");
      return;
    }

    const formData = new FormData();
    formData.set("photographer_id", selectedPhotographer);
    formData.set("booking_date", bookingDate);
    formData.set("start_time", startTime);
    formData.set("end_time", endTime);
    formData.set("location", location);
    formData.set("client_notes", notes);

    if (bookingType === "service") {
      formData.set("service_id", selectedService);
      formData.set("package_id", "");
    } else {
      formData.set("service_id", "");
      formData.set("package_id", selectedPackage);
    }

    startTransition(async () => {
      const result = await createBooking(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success ?? "تم إنشاء الحجز بنجاح");
        router.push("/dashboard");
      }
    });
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            اختيار المصور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {photographers.map((ph) => {
              const profile = ph.profile as { full_name: string; avatar_url: string | null } | null;
              const name = profile?.full_name ?? "مصور";
              const isSelected = selectedPhotographer === ph.id;

              return (
                <button
                  key={ph.id}
                  type="button"
                  onClick={() => {
                    setSelectedPhotographer(ph.id);
                    setAvailabilityStatus({ checked: false, available: false, message: "" });
                  }}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-right transition-colors ${isSelected ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url ?? undefined} />
                    <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{name}</div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      {ph.specialty && <span>{ph.specialty}</span>}
                      <span>⭐ {Number(ph.average_rating).toFixed(1)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {photographers.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">لا يوجد مصورون متاحون حاليًا</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5" />
            اختيار الخدمة أو الباقة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={bookingType === "service" ? "default" : "outline"}
              onClick={() => setBookingType("service")}
              size="sm"
            >
              <Camera className="h-4 w-4" />
              خدمة
            </Button>
            <Button
              type="button"
              variant={bookingType === "package" ? "default" : "outline"}
              onClick={() => setBookingType("package")}
              size="sm"
            >
              <Package className="h-4 w-4" />
              باقة
            </Button>
          </div>

          {bookingType === "service" ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {services.map((svc) => (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => setSelectedService(svc.id)}
                  className={`rounded-lg border p-3 text-right transition-colors ${selectedService === svc.id ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
                >
                  <div className="font-medium">{svc.name}</div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{svc.base_price} ر.ي</span>
                    <span>{svc.duration_minutes} دقيقة</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`rounded-lg border p-3 text-right transition-colors ${selectedPackage === pkg.id ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{pkg.name}</span>
                    {pkg.discount_percentage > 0 && (
                      <Badge variant="default" className="text-xs">خصم {pkg.discount_percentage}%</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{pkg.price} ر.ي</div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5" />
            تحديد الموعد
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>التاريخ</Label>
              <Input
                type="date"
                min={today}
                value={bookingDate}
                onChange={(e) => {
                  setBookingDate(e.target.value);
                  setAvailabilityStatus({ checked: false, available: false, message: "" });
                }}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>وقت البداية</Label>
              <select
                value={startTime}
                onChange={(e) => {
                  autoSetEndTime(e.target.value);
                  setAvailabilityStatus({ checked: false, available: false, message: "" });
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                dir="ltr"
              >
                <option value="">اختر الوقت</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>وقت النهاية</Label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setAvailabilityStatus({ checked: false, available: false, message: "" });
                }}
                dir="ltr"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleCheckAvailability}
            disabled={!selectedPhotographer || !bookingDate || !startTime || !endTime}
          >
            <Clock className="h-4 w-4" />
            تحقق من التوفر
          </Button>

          {availabilityStatus.checked && (
            <div className={`rounded-md p-3 text-sm ${availabilityStatus.available ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : "bg-destructive/10 text-destructive"}`}>
              {availabilityStatus.message}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5" />
            تفاصيل إضافية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>الموقع</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="عنوان موقع التصوير"
            />
          </div>
          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات أو طلبات خاصة..."
            />
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSubmit}
        className="w-full"
        size="lg"
        disabled={isPending || !availabilityStatus.available}
      >
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <CalendarDays className="h-5 w-5" />}
        <span>تأكيد الحجز</span>
      </Button>
    </div>
  );
}
