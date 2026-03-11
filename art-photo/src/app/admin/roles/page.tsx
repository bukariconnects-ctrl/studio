import type { Metadata } from "next";
import { getRoles, getPermissions } from "@/actions/admin-roles";
import { RolesManager } from "./_components/roles-manager";

export const metadata: Metadata = {
  title: "إدارة الأدوار والصلاحيات",
};

export default async function AdminRolesPage() {
  const [roles, permissions] = await Promise.all([
    getRoles(),
    getPermissions(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">إدارة الأدوار والصلاحيات</h1>
      <RolesManager initialRoles={roles} permissions={permissions} />
    </div>
  );
}
