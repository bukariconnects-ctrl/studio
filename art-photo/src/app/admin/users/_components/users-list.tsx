"use client";

import { useTransition } from "react";
import { Loader2, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateUserRole, softDeleteUser } from "@/actions/admin-users";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  user_roles: { role: { name: string } | null }[];
}

const ROLES = ["client", "photographer", "admin"];

const ROLE_LABELS: Record<string, string> = {
  client: "عميل",
  photographer: "مصور",
  admin: "مدير",
};

export function UsersList({ users }: { users: UserProfile[] }) {
  const [isPending, startTransition] = useTransition();

  function handleRoleChange(userId: string, role: string) {
    startTransition(async () => {
      const result = await updateUserRole(userId, role);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  }

  function handleDelete(userId: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟ سيتم تعطيل الحساب وإخفاء البيانات الشخصية.")) return;
    startTransition(async () => {
      const result = await softDeleteUser(userId);
      if (result.error) toast.error(result.error);
      else toast.success(result.success);
    });
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          لا يوجد مستخدمون
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">المستخدمون ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((u) => {
            const currentRole = u.user_roles?.[0]?.role?.name ?? "client";
            const name = u.full_name ?? "بدون اسم";

            return (
              <div key={u.id} className="flex items-center gap-4 rounded-lg border p-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={u.avatar_url ?? undefined} />
                  <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{name}</span>
                    <Badge variant={u.is_active ? "outline" : "destructive"}>
                      {u.is_active ? ROLE_LABELS[currentRole] ?? currentRole : "معطّل"}
                    </Badge>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {u.email && <span dir="ltr">{u.email}</span>}
                    {u.phone && <span dir="ltr">{u.phone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={currentRole}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    disabled={isPending}
                    className="flex h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(u.id)} disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
