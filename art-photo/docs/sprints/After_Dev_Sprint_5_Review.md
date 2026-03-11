# Sprint 5 Review: Playful Geometric Design System + Layout Architecture

## التاريخ: 2026-03-11
## الإصدار: 0.7.0

---

## نظرة عامة

تم تطبيق نظام التصميم "Playful Geometric" بالكامل على مشروع Art Photo Studio، مع إعادة هيكلة معمارية Layout لفصل الصفحات العامة عن لوحات التحكم. كما تم إصلاح مشكلة بناء حرجة تتعلق بتصدير القيم من ملفات "use server" في Next.js 16.

---

## ما تم إنجازه

### 1. Design Tokens (Phase 1)

| العنصر | القديم | الجديد |
|--------|--------|--------|
| خط العناوين | Geist Sans | Outfit (Bold 700) |
| خط النصوص | Geist Sans | Plus Jakarta Sans (Medium 500) |
| الخلفية | oklch(1 0 0) أبيض | #FFFDF5 Warm Cream |
| اللون الأساسي | oklch(0.205 0 0) رمادي | #8B5CF6 Vivid Violet |
| اللون الثانوي | oklch(0.97 0 0) رمادي | #F472B6 Hot Pink |
| الحدود | oklch(0.922 0 0) رمادي خفيف | #1E293B Chunky 2px |
| الظلال | blur shadows | Hard Pop (4px 4px 0px 0px) |
| الزوايا | 0.625rem | 1rem (مع تنوع: full/2xl/xl) |

### 2. Layout Architecture (Phase 2)

**المشكلة**: جميع الصفحات كانت تعرض Navbar + Footer بما فيها لوحات التحكم.

**الحل**: Route Groups في Next.js App Router

```
src/app/
├── (public)/          ← Navbar + Footer
│   ├── layout.tsx     ← Public Shell
│   ├── page.tsx       ← الصفحة الرئيسية
│   ├── services/
│   ├── products/
│   ├── about/
│   ├── contact/
│   └── ... (15 مسار)
├── admin/             ← AdminSidebar + Breadcrumbs (بدون Navbar/Footer)
├── dashboard/         ← Client Dashboard (بدون Navbar/Footer)
├── photographer/      ← Photographer Panel (بدون Navbar/Footer)
├── auth/              ← Auth Pages (بدون Navbar/Footer)
└── layout.tsx         ← Root (fonts + AuthProvider فقط)
```

### 3. Core Components Restyled (Phase 3)

**Navbar**:
- شعار مع صندوق ملون + shadow-pop
- أزرار تنقل pill-shaped مع tertiary active state
- زر CTA "حساب جديد" candy button مع bounce hover
- Avatar بخلفية quaternary مع حدود chunky
- قائمة dropdown مع rounded-xl و shadow-pop-lg

**Footer**:
- خلفية foreground (داكنة) مع نص فاتح
- 3 أشكال هندسية مزخرفة (دائرة، مربع مائل، حلقة متقطعة)
- ألوان tertiary للروابط عند التمرير

**Home Page**:
- Hero غير متماثل (left-aligned في RTL = right-aligned بصرياً)
- 4 أشكال عائمة مزخرفة (دائرة amber، مربع مائل pink، حلقة متقطعة، مربع صغير violet)
- Badge "استوديو تصوير احترافي" مع tertiary bg + shadow-pop
- بطاقات Sticker (border-2 + shadow-pop-lg + card-hover rotation)
- أيقونات ملونة حسب الفئة (primary, secondary, tertiary, quaternary)
- CTA section بخلفية primary مع أشكال مزخرفة

### 4. Dashboard Shell (Phase 4)

**AdminSidebar**:
- حدود 2px chunky
- tertiary active state مع shadow-pop
- rounded-xl nav items
- خط Outfit للعنوان

**Auth Layout**:
- 4 أشكال هندسية مزخرفة
- شعار branded مع shadow-pop
- hover-pop على الشعار

### 5. Build Fix (Phase 5)

**مشكلة حرجة**: Next.js 16 يرفض تصدير `PERMISSIONS` (const object) من ملفات `"use server"`.

**الحل**:
1. إنشاء `src/lib/permissions.ts` لتصدير `PERMISSIONS` و `Permission` type
2. تحديث `src/lib/rbac.ts` لإزالة re-export
3. تحديث 10 ملفات action لتقسيم الاستيرادات

---

## الملفات المتأثرة

### ملفات جديدة (2):
- `src/app/(public)/layout.tsx`
- `src/lib/permissions.ts`

### ملفات معدّلة (13):
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/components/layout/navbar.tsx`
- `src/components/layout/footer.tsx`
- `src/components/layout/admin-sidebar.tsx`
- `src/app/(public)/page.tsx`
- `src/app/auth/layout.tsx`
- `src/lib/rbac.ts`
- `src/actions/admin-services.ts`
- `src/actions/admin-products.ts`
- `src/actions/admin-packages.ts`
- `src/actions/admin-users.ts`
- `src/actions/admin-reports.ts`
- `src/actions/admin-settings.ts`
- `src/actions/admin-tickets.ts`
- `src/actions/admin-roles.ts`
- `src/actions/embeddings.ts`
- `src/actions/smart-scheduling.ts`

### ملفات منقولة (15 مسار):
- `src/app/about` → `src/app/(public)/about`
- `src/app/booking` → `src/app/(public)/booking`
- `src/app/cart` → `src/app/(public)/cart`
- `src/app/checkout` → `src/app/(public)/checkout`
- `src/app/contact` → `src/app/(public)/contact`
- `src/app/photographers` → `src/app/(public)/photographers`
- `src/app/privacy` → `src/app/(public)/privacy`
- `src/app/products` → `src/app/(public)/products`
- `src/app/profile` → `src/app/(public)/profile`
- `src/app/search` → `src/app/(public)/search`
- `src/app/services` → `src/app/(public)/services`
- `src/app/style-assistant` → `src/app/(public)/style-assistant`
- `src/app/support` → `src/app/(public)/support`
- `src/app/terms` → `src/app/(public)/terms`
- `src/app/page.tsx` → `src/app/(public)/page.tsx`

---

## نتائج البناء

```
✓ Compiled successfully in 29.8s
✓ TypeScript: No errors
✓ Static pages: 43/43 generated
✓ All routes working correctly
```

---

## Design System Tokens Reference

### Colors (Light)
| Token | Value | Usage |
|-------|-------|-------|
| background | #FFFDF5 | Warm cream paper feel |
| primary | #8B5CF6 | Vivid Violet (Brand) |
| secondary | #F472B6 | Hot Pink (Accents) |
| tertiary | #FBBF24 | Amber (Active states) |
| quaternary | #34D399 | Emerald (Success/Avatar) |
| border | #1E293B | Dark chunky borders |

### Utility Classes
| Class | Effect |
|-------|--------|
| `shadow-pop` | `4px 4px 0px 0px #1E293B` |
| `shadow-pop-lg` | `8px 8px 0px 0px #E2E8F0` |
| `shadow-pop-accent` | `4px 4px 0px 0px #8B5CF6` |
| `hover-pop` | Bounce translate + enlarged shadow on hover |
| `card-hover` | Rotate -1deg + scale 1.02 on hover |
| `border-chunky` | 2px border with dark color |

---

## ملاحظات للمطورين

1. **لا تستورد PERMISSIONS من `@/lib/rbac`** — استخدم `@/lib/permissions` بدلاً من ذلك
2. **لا تستورد checkPermission من `@/lib/permissions`** — استخدم `@/lib/rbac` بدلاً من ذلك
3. الصفحات العامة يجب أن تكون في `src/app/(public)/`
4. لوحات التحكم يجب أن تكون في المستوى الأعلى (`admin/`, `dashboard/`, `photographer/`)
5. استخدم `style={{ fontFamily: "var(--font-heading)" }}` للعناوين في Client Components
6. CSS lint warnings عن `@theme`, `@custom-variant`, `@apply` هي طبيعية — Tailwind v4 directives
