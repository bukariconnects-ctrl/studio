import type { Metadata } from "next";
import { getSpecialties } from "@/actions/admin-specialties";
import { SpecialtiesList } from "./_components/specialties-list";

export const metadata: Metadata = {
  title: "إدارة التخصصات",
};

export default async function AdminSpecialtiesPage() {
  const specialties = await getSpecialties();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>إدارة التخصصات</h1>
      <SpecialtiesList specialties={specialties} />
    </div>
  );
}
