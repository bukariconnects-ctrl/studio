"use client";

import { useState } from "react";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, type CartItemLocal } from "@/stores/cart-store";
import { checkStockAvailability } from "@/actions/cart";
import { toast } from "sonner";

interface Props {
  item: Omit<CartItemLocal, "quantity">;
  className?: string;
}

export function AddToCartButton({ item, className }: Props) {
  const { addItem, items } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const existingQty = items.find((i) => i.id === item.id && i.type === item.type)?.quantity ?? 0;

  async function handleAdd() {
    setLoading(true);
    try {
      if (item.type === "product") {
        const { available, stock } = await checkStockAvailability(item.id, existingQty + 1);
        if (!available) {
          toast.error(`الكمية المطلوبة غير متوفرة. المتوفر: ${stock}`);
          setLoading(false);
          return;
        }
      }

      addItem(item);
      setAdded(true);
      toast.success("تمت الإضافة إلى السلة");
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handleAdd}
      disabled={loading || (item.maxStock !== undefined && item.maxStock <= 0)}
      className={className}
      size="sm"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : added ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      <span>{added ? "تمت الإضافة" : "أضف للسلة"}</span>
    </Button>
  );
}
