"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deletePackage } from "@/actions/admin-packages";

interface PackageItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount_percentage: number;
  is_active: boolean;
  package_services?: { service: { id: string; name: string } | null }[];
}

interface SimpleService {
  id: string;
  name: string;
}

interface Props {
  packages: PackageItem[];
  services: SimpleService[];
}

export function PackagesList({ packages }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذه الباقة؟")) return;
    startTransition(() => {
      deletePackage(id);
    });
  }

  if (packages.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          لا توجد باقات حتى الآن. أضف باقة جديدة من النموذج أعلاه.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">الباقات ({packages.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {packages.map((pkg) => (
            <div key={pkg.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{pkg.name}</span>
                    {!pkg.is_active && <Badge variant="secondary">معطّل</Badge>}
                    {pkg.discount_percentage > 0 && (
                      <Badge variant="default">خصم {pkg.discount_percentage}%</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{pkg.price} ر.ي</div>
                  {pkg.package_services && pkg.package_services.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {pkg.package_services.map((ps, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {ps.service?.name ?? "خدمة محذوفة"}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(pkg.id)} disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
