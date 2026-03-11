# Sprint S2-3 Review — سلة المشتريات (Shopping Cart)

## التاريخ: 2026-03-10

## الهدف
بناء نظام سلة مشتريات متكامل مع Zustand store و localStorage persistence ومزامنة مع قاعدة البيانات وفحص المخزون.

## المُنجزات

### الملفات الجديدة
- `src/stores/cart-store.ts` — Zustand store مع persist middleware
- `src/actions/cart.ts` — syncCartToServer, loadCartFromServer, checkStockAvailability
- `src/app/cart/page.tsx` — صفحة السلة
- `src/app/cart/_components/cart-view.tsx` — واجهة السلة الكاملة
- `src/components/cart/add-to-cart-button.tsx` — زر إضافة للسلة قابل لإعادة الاستخدام

### الميزات
- إضافة/حذف/تعديل الكمية
- حساب المجموع تلقائيًا
- مزامنة تلقائية مع DB للمستخدمين المسجلين
- فحص المخزون قبل الإضافة
- دعم 3 أنواع: منتج، خدمة، باقة

## القرارات التقنية
- Zustand + `persist` للعمل بدون اتصال (localStorage key: `art-photo-cart`)
- مزامنة مؤجلة (2 ثانية debounce) مع جدول `cart_items`
- `maxStock` لمنع تجاوز الكمية المتوفرة
- Hydration check لتجنب mismatch بين الخادم والعميل

## حالة البناء
- TypeScript: 0 أخطاء
- Build: ✅ نجح
