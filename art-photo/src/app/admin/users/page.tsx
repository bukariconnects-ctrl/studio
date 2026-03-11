import type { Metadata } from "next";
import { getUsers } from "@/actions/admin-users";
import { getSpecialties } from "@/actions/admin-specialties";
import { UsersList } from "./_components/users-list";
import { CreatePhotographerForm } from "./_components/create-photographer-form";

export const metadata: Metadata = {
  title: "إدارة المستخدمين",
};

export default async function AdminUsersPage() {
  const [users, specialties] = await Promise.all([getUsers(), getSpecialties()]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>إدارة المستخدمين والصلاحيات</h1>
      <CreatePhotographerForm specialties={specialties} />
      <UsersList users={users} />
    </div>
  );
}
