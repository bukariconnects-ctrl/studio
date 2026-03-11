import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItemLocal {
  id: string;
  type: "product" | "service" | "package";
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  maxStock?: number;
}

interface CartState {
  items: CartItemLocal[];
  addItem: (item: Omit<CartItemLocal, "quantity">, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.id === item.id && i.type === item.type);

        if (existing) {
          const newQty = existing.quantity + quantity;
          if (item.maxStock !== undefined && newQty > item.maxStock) return;
          set({
            items: items.map((i) =>
              i.id === item.id && i.type === item.type
                ? { ...i, quantity: newQty }
                : i
            ),
          });
        } else {
          if (item.maxStock !== undefined && quantity > item.maxStock) return;
          set({ items: [...items, { ...item, quantity }] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) => {
            if (i.id !== id) return i;
            if (i.maxStock !== undefined && quantity > i.maxStock) return i;
            return { ...i, quantity };
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "art-photo-cart",
    }
  )
);
