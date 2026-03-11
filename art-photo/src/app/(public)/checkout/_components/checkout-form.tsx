"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CreditCard, ShoppingCart, CheckCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCartStore } from "@/stores/cart-store";
import { completeCheckout } from "@/actions/checkout";
import { toast } from "sonner";

export function CheckoutForm() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCartStore();
  const [isPending, startTransition] = useTransition();
  const [hydrated, setHydrated] = useState(false);
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [orderComplete, setOrderComplete] = useState<{
    orderId: string;
    invoiceNumber: string;
    total: number;
  } | null>(null);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center text-muted-foreground">
        جارٍ التحميل...
      </div>
    );
  }

  const productItems = items.filter((i) => i.type === "product");

  if (orderComplete) {
    return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h2 className="text-2xl font-bold">تم إتمام الطلب بنجاح!</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>رقم الطلب: <strong dir="ltr">{orderComplete.orderId.slice(0, 8)}</strong></p>
              <p>رقم الفاتورة: <strong dir="ltr">{orderComplete.invoiceNumber}</strong></p>
              <p>المبلغ الإجمالي: <strong>{orderComplete.total.toFixed(2)} ر.ي</strong></p>
            </div>
            <div className="flex gap-2 pt-4">
              <Link href="/dashboard">
                <Button>لوحة التحكم</Button>
              </Link>
              <Link href="/products">
                <Button variant="outline">
                  <ShoppingCart className="h-4 w-4" />
                  متابعة التسوق
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (productItems.length === 0) {
    return (
      <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4">
        <ShoppingCart className="h-16 w-16 text-muted-foreground/40" />
        <p className="text-lg text-muted-foreground">لا توجد منتجات في السلة للشراء</p>
        <Link href="/products">
          <Button variant="outline">تصفح المنتجات</Button>
        </Link>
      </div>
    );
  }

  function handleCheckout() {
    if (!shippingAddress.trim()) {
      toast.error("يرجى إدخال عنوان الشحن");
      return;
    }

    const checkoutItems = productItems.map((i) => ({
      product_id: i.id,
      quantity: i.quantity,
    }));

    const stubPaymentIntentId = `pi_stub_${Date.now()}`;

    startTransition(async () => {
      const result = await completeCheckout(
        checkoutItems,
        shippingAddress,
        paymentMethod,
        stubPaymentIntentId
      );

      if (result.error) {
        toast.error(result.error);
      } else {
        clearCart();
        setOrderComplete({
          orderId: result.orderId!,
          invoiceNumber: result.invoiceNumber!,
          total: result.total!,
        });
      }
    });
  }

  const subtotal = productItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const taxRate = 0.15;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">عنوان الشحن</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>العنوان الكامل</Label>
              <Input
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="المدينة، الحي، الشارع، رقم المبنى"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">طريقة الدفع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex items-center gap-3 rounded-lg border p-4 transition-colors ${paymentMethod === "card" ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
              >
                <CreditCard className="h-5 w-5" />
                <div className="text-right">
                  <div className="font-medium">بطاقة ائتمان</div>
                  <div className="text-xs text-muted-foreground">Visa / Mastercard</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`flex items-center gap-3 rounded-lg border p-4 transition-colors ${paymentMethod === "cash" ? "border-primary bg-primary/5" : "hover:bg-accent"}`}
              >
                <FileText className="h-5 w-5" />
                <div className="text-right">
                  <div className="font-medium">الدفع عند الاستلام</div>
                  <div className="text-xs text-muted-foreground">نقدًا أو عبر مدى</div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="text-lg">ملخص الطلب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {productItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span>{(item.price * item.quantity).toFixed(2)} ر.ي</span>
              </div>
            ))}
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>المجموع الفرعي</span>
                <span>{subtotal.toFixed(2)} ر.ي</span>
              </div>
              <div className="flex justify-between">
                <span>ضريبة القيمة المضافة (15%)</span>
                <span>{tax.toFixed(2)} ر.ي</span>
              </div>
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>الإجمالي</span>
                <span>{total.toFixed(2)} ر.ي</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCheckout}
              className="w-full"
              size="lg"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CreditCard className="h-5 w-5" />
              )}
              <span>إتمام الدفع ({total.toFixed(2)} ر.ي)</span>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
