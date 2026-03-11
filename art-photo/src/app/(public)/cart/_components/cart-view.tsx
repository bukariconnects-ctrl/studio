"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { useAuthStore } from "@/stores/auth-store";
import { syncCartToServer } from "@/actions/cart";

export function CartView() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } = useCartStore();
  const { user } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!user || items.length === 0) return;
    const timeout = setTimeout(() => {
      syncCartToServer(
        items.map((i) => ({ id: i.id, type: i.type, quantity: i.quantity }))
      );
    }, 2000);
    return () => clearTimeout(timeout);
  }, [items, user]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center text-muted-foreground">
        جارٍ التحميل...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/40" />
        <p className="text-lg text-muted-foreground">سلة المشتريات فارغة</p>
        <div className="flex gap-2">
          <Link href="/products">
            <Button variant="outline">تصفح المنتجات</Button>
          </Link>
          <Link href="/services">
            <Button variant="outline">تصفح الخدمات</Button>
          </Link>
        </div>
      </div>
    );
  }

  const TYPE_LABELS: Record<string, string> = {
    product: "منتج",
    service: "خدمة",
    package: "باقة",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      {items.map((item) => (
        <Card key={`${item.type}-${item.id}`}>
          <CardContent className="flex items-center gap-4 p-4">
            {item.image && (
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </div>
            )}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.name}</span>
                <Badge variant="outline" className="text-xs">{TYPE_LABELS[item.type]}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">{item.price} ر.ي</div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                disabled={item.maxStock !== undefined && item.quantity >= item.maxStock}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <div className="w-24 text-left font-bold">{(item.price * item.quantity).toFixed(2)} ر.ي</div>
            <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ملخص الطلب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>المجموع الفرعي</span>
            <span>{totalPrice().toFixed(2)} ر.ي</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>الإجمالي</span>
            <span>{totalPrice().toFixed(2)} ر.ي</span>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Link href="/checkout" className="flex-1">
            <Button className="w-full">إتمام الشراء</Button>
          </Link>
          <Button variant="outline" onClick={clearCart}>مسح السلة</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
