"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Save, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  createRole,
  updateRolePermissions,
  deleteRole,
  getRolePermissions,
} from "@/actions/admin-roles";

type Role = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  role_permissions: { permission_id: string }[];
};

type Permission = {
  id: string;
  name: string;
  description: string | null;
};

const PERMISSION_GROUPS: Record<string, string> = {
  bookings: "الحجوزات",
  products: "المنتجات",
  inventory: "المخزون",
  users: "المستخدمون",
  roles: "الأدوار",
  analytics: "التقارير",
  settings: "الإعدادات",
  services: "الخدمات",
  packages: "الباقات",
  tickets: "الدعم الفني",
  albums: "الألبومات",
  ai: "الذكاء الاصطناعي",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "مدير النظام",
  photographer: "مصور",
  client: "عميل",
  visitor: "زائر",
};

function groupPermissions(permissions: Permission[]) {
  const groups: Record<string, Permission[]> = {};
  for (const perm of permissions) {
    const group = perm.name.split(".")[0];
    if (!groups[group]) groups[group] = [];
    groups[group].push(perm);
  }
  return groups;
}

export function RolesManager({
  initialRoles,
  permissions,
}: {
  initialRoles: Role[];
  permissions: Permission[];
}) {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set()
  );
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const grouped = groupPermissions(permissions);
  const protectedRoles = ["admin", "client", "photographer", "visitor"];

  async function handleSelectRole(roleId: string) {
    setIsLoading(true);
    setSelectedRoleId(roleId);
    const permIds = await getRolePermissions(roleId);
    setSelectedPermissions(new Set(permIds));
    setIsLoading(false);
  }

  function togglePermission(permId: string) {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  }

  function handleSavePermissions() {
    if (!selectedRoleId) return;
    startTransition(async () => {
      const result = await updateRolePermissions(
        selectedRoleId,
        Array.from(selectedPermissions)
      );
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
      }
    });
  }

  function handleCreateRole(formData: FormData) {
    startTransition(async () => {
      const result = await createRole(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
      }
    });
  }

  function handleDeleteRole(roleId: string) {
    startTransition(async () => {
      const result = await deleteRole(roleId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.success);
        if (selectedRoleId === roleId) {
          setSelectedRoleId(null);
          setSelectedPermissions(new Set());
        }
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">الأدوار</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {initialRoles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role.id)}
                className={`flex w-full items-center justify-between rounded-lg border p-3 text-right transition-colors hover:bg-accent ${
                  selectedRoleId === role.id
                    ? "border-primary bg-accent"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      {ROLE_LABELS[role.name] ?? role.name}
                    </p>
                    {role.description && (
                      <p className="text-xs text-muted-foreground">
                        {role.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {role.role_permissions.length}
                  </Badge>
                  {!protectedRoles.includes(role.name) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role.id);
                      }}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">إنشاء دور جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleCreateRole} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="roleName">اسم الدور</Label>
                <Input
                  id="roleName"
                  name="name"
                  placeholder="مثال: editor"
                  dir="ltr"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="roleDesc">الوصف</Label>
                <Input
                  id="roleDesc"
                  name="description"
                  placeholder="وصف الدور..."
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>إنشاء</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">
              {selectedRoleId
                ? `صلاحيات: ${
                    ROLE_LABELS[
                      initialRoles.find((r) => r.id === selectedRoleId)
                        ?.name ?? ""
                    ] ??
                    initialRoles.find((r) => r.id === selectedRoleId)?.name
                  }`
                : "اختر دوراً لتعديل صلاحياته"}
            </CardTitle>
            {selectedRoleId && (
              <Button
                onClick={handleSavePermissions}
                disabled={isPending}
                size="sm"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>حفظ</span>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : selectedRoleId ? (
              <div className="space-y-6">
                {Object.entries(grouped).map(([group, perms]) => (
                  <div key={group}>
                    <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                      {PERMISSION_GROUPS[group] ?? group}
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {perms.map((perm) => (
                        <label
                          key={perm.id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPermissions.has(perm.id)}
                            onChange={() => togglePermission(perm.id)}
                            className="h-4 w-4 rounded border-input"
                          />
                          <div>
                            <p className="text-sm font-medium" dir="ltr">
                              {perm.name}
                            </p>
                            {perm.description && (
                              <p className="text-xs text-muted-foreground">
                                {perm.description}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <Shield className="mx-auto mb-3 h-12 w-12 opacity-20" />
                <p>اختر دوراً من القائمة لعرض وتعديل صلاحياته</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
