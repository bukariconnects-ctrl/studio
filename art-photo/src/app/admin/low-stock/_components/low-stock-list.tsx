"use client";

import { useState, useTransition } from "react";
import { Loader2, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateStock } from "@/actions/admin-products";

interface LowStockProduct {
  id: string;
  name: string;
  sku: string | null;
  stock_quantity: number;
  price: number;
  category: { name: string } | null;
}

export function LowStockList({ products }: { products: LowStockProduct[] }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isPending, startTransition] = useTransition();

  function handleSave(id: string) {
    const qty = quantities[id];
    if (qty === undefined || qty < 0) return;
    startTransition(async () => {
      await updateStock(id, qty);
    });
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 p-8 text-center text-muted-foreground">
          <AlertTriangle className="h-8 w-8" />
          <p>لا توجد منتجات منخفضة المخزون حاليًا.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          منتجات تحتاج تعبئة ({products.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  {p.category && <Badge variant="outline">{p.category.name}</Badge>}
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>المخزون الحالي: <strong className="text-destructive">{p.stock_quantity}</strong></span>
                  <span>{p.price} ر.ي</span>
                  {p.sku && <span dir="ltr">SKU: {p.sku}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  className="w-24"
                  placeholder="الكمية"
                  defaultValue={p.stock_quantity}
                  onChange={(e) => setQuantities((prev) => ({ ...prev, [p.id]: parseInt(e.target.value) || 0 }))}
                  disabled={isPending}
                />
                <Button size="sm" onClick={() => handleSave(p.id)} disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
