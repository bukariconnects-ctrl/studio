import type { Metadata } from "next";
import { SmartAssignForm } from "./_components/smart-assign-form";

export const metadata: Metadata = {
  title: "الجدولة الذكية",
};

export default function SmartAssignPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">الجدولة الذكية (FR-A8)</h1>
      <p className="text-muted-foreground">
        توزيع الحجوزات على المصورين المتاحين تلقائيًا بناءً على عبء العمل والتقييمات والتخصص
      </p>
      <SmartAssignForm />
    </div>
  );
}
