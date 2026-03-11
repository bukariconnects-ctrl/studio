import type { Metadata } from "next";
import { CartView } from "./_components/cart-view";

export const metadata: Metadata = {
  title: "سلة المشتريات",
};

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-center text-3xl font-bold">سلة المشتريات</h1>
      <CartView />
    </div>
  );
}
