# Change Log - Art Photo Studio

---

## [0.1.0] - 2026-03-09

### Initialization

- Created Next.js 15 project with TypeScript, Tailwind CSS v4, App Router, `src/` directory structure
- Configured shadcn/ui (base-nova style, CSS variables, lucide icons)
- Set HTML to `lang="ar" dir="rtl"` for Arabic RTL support

### Dependencies

- **Supabase**: `@supabase/supabase-js`, `@supabase/ssr`, `supabase` (CLI dev)
- **Email**: `nodemailer`, `@types/nodemailer`, `googleapis`
- **State**: `zustand`
- **Forms**: `react-hook-form`, `zod`
- **UI**: `lucide-react`, `shadcn/ui` (button component pre-installed)

### Project Structure

```
src/
├── actions/auth.ts          → Server Actions (signOut)
├── app/
│   ├── globals.css          → Tailwind + shadcn theme
│   ├── layout.tsx           → Root layout (RTL, metadata)
│   └── page.tsx             → Landing placeholder
├── components/ui/           → shadcn/ui components
├── lib/
│   ├── utils.ts             → shadcn utility (cn)
│   ├── email.ts             → Gmail OAuth2 transporter
│   └── supabase/
│       ├── client.ts        → Browser client
│       ├── server.ts        → Server client (cookies)
│       ├── middleware.ts     → Session refresh logic
│       └── admin.ts         → Service role client
├── stores/auth-store.ts     → Zustand auth state
├── types/database.ts        → TypeScript DB types
└── middleware.ts             → Next.js middleware (auth session)
```

### Supabase Migration

- Initialized `supabase/` directory via `supabase init`
- Created `supabase/migrations/20260309000000_initial_schema.sql` from reviewed schema
- Schema includes: RBAC, profiles, services, packages, products, bookings, orders, invoices, reviews, tickets, notifications, RLS with JWT Claims optimization

### Environment

- Created `.env.local` with all required keys (Supabase, Google OAuth2, Site URL)

---

## [0.1.1] - 2026-03-10

### Migration Fixes & Remote DB Push

- **Replaced** `uuid_generate_v4()` → `gen_random_uuid()` (native PostgreSQL 13+, no extension needed)
- **Removed** `uuid-ossp` extension dependency
- **Split migrations** into 3 files for Supabase compatibility:
  - `20260309000000_initial_schema.sql` — Core schema (RBAC, tables, functions, triggers, RLS, seed data, Realtime)
  - `20260309000002_pgvector_ai_features.sql` — AI/vector tables, indexes, RLS, `get_ai_recommendations()` function
  - `20260309000003_pg_cron_scheduled_jobs.sql` — Scheduled cleanup and reminder jobs
- **Schema-qualified** `vector` type as `extensions.vector` for Supabase hosted compatibility
- **All 3 migrations pushed successfully** to remote Supabase DB ✅

### Next.js 16 Convention

- Renamed `middleware.ts` → `proxy.ts` with `proxy()` function (Next.js 16 deprecation fix)

---

## [0.2.0] - 2026-03-10 — Sprint 1: Core Connection & Auth

### Auth Server Actions (`src/actions/auth.ts`)

- `signIn` — Email/password login with Zod validation
- `signUp` — Registration with email verification, GDPR consent, password strength rules
- `signInWithGoogle` — Google OAuth 2.0 flow
- `resetPassword` — Send password reset email via Supabase
- `updatePassword` — Set new password after reset link
- `signOut` — Sign out and redirect

### Auth Pages

- `/auth/login` — Login form with email/password + Google OAuth
- `/auth/register` — Registration form with full validation (name, email, password, terms)
- `/auth/forgot-password` — Password recovery email request
- `/auth/reset-password` — New password form (after email link)
- `/auth/callback` — OAuth/email code exchange (Route Handler)
- `/auth/confirm` — Email verification + recovery OTP handler (Route Handler)
- `/dashboard` — Protected dashboard placeholder (Server Component, shows user info + role)

### Validation Schemas (`src/lib/validations/auth.ts`)

- `loginSchema`, `registerSchema`, `forgotPasswordSchema`, `resetPasswordSchema`
- Zod v4 compatible (`.issues` API, `z.literal` with `message` param)

### Route Protection (`src/lib/supabase/middleware.ts`)

- Auth routes redirect logged-in users to `/dashboard`
- Protected routes redirect guests to `/auth/login`
- Admin routes (`/admin/*`) restricted to `admin` role via JWT Claims
- Photographer routes (`/photographer/*`) restricted to `photographer` or `admin`

### UI Components Added

- shadcn/ui: `input`, `label`, `card`, `separator`, `sonner`
- `GoogleButton` shared component with Google SVG icon

### Technical Issues & Fixes

- **Zod v4**: `errorMap` removed from `z.literal()` → used `message` param
- **Zod v4**: `.errors` renamed to `.issues` on `ZodError`
- **Next.js 16**: Forms use `useActionState` (native) instead of external form libraries

### Build Status

- TypeScript: ✅ 0 errors
- Next.js Build: ✅ 9 routes (4 static, 3 dynamic, 2 route handlers)

---

## [0.3.0] - 2026-03-10 — Sprint 2: UI Layout, Profile & Auth Sync

### Responsive Navbar + Footer

- **Navbar**: Sticky header with logo, nav links, user dropdown (desktop) + Sheet hamburger menu (mobile)
- **Footer**: 3-column grid with brand info, quick links, legal links
- Uses `@base-ui/react` `render` prop pattern (base-nova shadcn/ui variant)
- Role-based menu items (admin link only for `admin` role)

### Auth Provider (`src/components/providers/auth-provider.tsx`)

- Syncs Supabase session with Zustand `auth-store` on mount + `onAuthStateChange`
- Extracts `user_role` from `app_metadata` for RBAC in client components

### Profile Management (`/profile`) (FR-C2)

- Server Actions: `updateProfile`, `getProfile`
- Updates both `auth.users.user_metadata` and `profiles` table
- Zod validation: fullName, phone, bio, address
- `revalidatePath` after update

### Root Layout Updated

- Wrapped with `AuthProvider`, `Navbar`, `Footer`, `Toaster` (Sonner)
- Metadata template: `%s | Art Photo Studio`

### UI Components Added (shadcn/ui)

- `avatar`, `dropdown-menu`, `sheet`, `textarea`, `badge`

---

## [0.4.0] - 2026-03-10 — Sprint 3: Static Pages & Error Handling

### Static Pages (FR-V6)

- `/terms` — شروط الخدمة (6 sections)
- `/privacy` — سياسة الخصوصية (7 sections, GDPR compliant)
- `/about` — من نحن (stats cards, رؤية, رسالة, فريق العمل)

### Error Handling (NFR-ET1)

- `error.tsx` — Global error boundary with Arabic messaging + retry button
- `not-found.tsx` — 404 page with home link
- `loading.tsx` — Global loading spinner (Loader2)

---

## [0.5.0] - 2026-03-10 — Sprint 4: Email Templates & Contact System

### Email Templates (`src/lib/email-templates.ts`)

- `verificationEmailTemplate` — تأكيد البريد الإلكتروني
- `passwordResetEmailTemplate` — إعادة تعيين كلمة المرور
- `bookingConfirmationTemplate` — تأكيد الحجز (service, date, time, photographer)
- `contactReplyTemplate` — الرد على رسالة العميل
- RTL-aware HTML templates with brand header/footer, inline CSS

### Contact Form (`/contact`)

- Zod validated: name, email, subject, message
- Server Action inserts into `tickets` table
- Sends admin notification email via Gmail API (nodemailer + googleapis)

---

## [0.6.0] - 2026-03-10 — Sprint 5: Landing Page, Dashboard & Final Integration

### Landing Page (`/`)

- Hero section with gradient, headline, 2 CTA buttons
- Features grid (6 cards: جلسات، معرض، متجر، حجز، فريق، تقييمات)
- Bottom CTA section with registration link

### Enhanced Dashboard (`/dashboard`)

- Role-based quick links (client/photographer/admin)
- Arabic role labels mapping
- Account info + sign out

### Placeholder Pages (Unit 2 stubs)

- `/services`, `/products`, `/photographers` — Ready for Unit 2 (Catalog Module)

### ✅ Unit 1 Complete — وحدة الأساس والهوية

- **5 Sprints completed** covering FR-V5, FR-V6, FR-C1, FR-C2, FR-C10, FR-P1, FR-A1
- **NFR coverage**: SEC1, SEC2, SEC3, US1, ET1
- **17 routes** (12 static, 3 dynamic, 2 route handlers)
- **TypeScript**: 0 errors | **Build**: Compiled successfully

---

## القسم الثاني: العمليات التشغيلية والمالية (Section 2)

### Sprint 1 — إدارة الكتالوج (Admin CRUD)
**التاريخ**: 2026-03-10

#### الملفات المُنشأة:
- `src/types/database.ts` — Extended with 14 entity types (ServiceCategory, Package, Product, etc.)
- `src/app/admin/layout.tsx` — Admin layout with navigation (Services, Packages, Products, Low Stock)
- `src/actions/admin-services.ts` — CRUD server actions for service categories and services
- `src/actions/admin-products.ts` — CRUD server actions for product categories and products + stock update
- `src/actions/admin-packages.ts` — CRUD server actions for packages with service linking
- `src/app/admin/page.tsx` — Admin dashboard with stats cards
- `src/app/admin/services/` — Full CRUD UI (create form, category form, services list with inline edit)
- `src/app/admin/products/` — Full CRUD UI (create form, category form, products list with inline edit)
- `src/app/admin/packages/` — Full CRUD UI (create form with service checkboxes, packages list)
- `src/app/admin/low-stock/` — Low stock products display with inline quantity update

#### القرارات التقنية:
- Supabase Storage bucket `catalog` for image uploads (services/products/packages)
- `useActionState` (React 19) for form state management
- `revalidatePath` for ISR cache invalidation after mutations
- Admin role check via `user.app_metadata.user_role` in every server action
- SKU uniqueness enforced with `23505` error code handling

---

### Sprint 2 — عرض الكتالوج العام (Public Catalog)
**التاريخ**: 2026-03-10

#### الملفات المُعدّلة/المُنشأة:
- `src/app/services/page.tsx` — Full catalog with category filters, price sorting, service cards
- `src/app/products/page.tsx` — Full catalog with category filters, price sorting, stock badges
- `src/app/photographers/page.tsx` — Photographer profiles with ratings, specialties, experience
- `src/app/search/page.tsx` — Advanced search page using `search_catalog` RPC
- `src/app/search/_components/search-form.tsx` — Client search form with type filter

#### القرارات التقنية:
- `searchParams` as Promise (Next.js 16 async API)
- `revalidate = 3600` for ISR on catalog pages
- Category filter pills with active state via URL params
- Price sort via URL query params (ascending/descending)
- `search_catalog` RPC integration for full-text search

---

### Sprint 3 — سلة المشتريات (Shopping Cart)
**التاريخ**: 2026-03-10

#### الملفات المُنشأة:
- `src/stores/cart-store.ts` — Zustand store with `persist` middleware (localStorage)
- `src/actions/cart.ts` — Server actions: syncCartToServer, loadCartFromServer, checkStockAvailability
- `src/app/cart/page.tsx` — Cart page
- `src/app/cart/_components/cart-view.tsx` — Full cart UI with quantity controls, order summary
- `src/components/cart/add-to-cart-button.tsx` — Reusable add-to-cart button with stock check

#### القرارات التقنية:
- Zustand + `persist` for offline-first cart (localStorage key: `art-photo-cart`)
- Debounced sync to `cart_items` table (2s delay) for logged-in users
- Stock availability check before adding products
- Support for 3 item types: product, service, package
- `maxStock` enforcement on quantity updates

---

### Sprint 4 — محرك الحجوزات (Booking Engine)
**التاريخ**: 2026-03-10

#### الملفات المُنشأة:
- `src/actions/booking.ts` — Server actions: checkAvailability, createBooking, getPhotographers, getServicesAndPackages
- `src/app/booking/page.tsx` — Booking page (auth-gated)
- `src/app/booking/_components/booking-form.tsx` — Multi-step booking form

#### القرارات التقنية:
- `check_photographer_availability` RPC for real-time availability
- `create_booking` RPC for atomic booking creation
- Auto end-time calculation based on service duration
- Photographer selection with avatar, rating, specialty display
- Service/Package toggle with visual selection cards
- Time slots from 09:00–20:30 in 30-min intervals
- Availability check required before booking confirmation

---

### Sprint 5 — الدفع والفوترة (Checkout & Payments)
**التاريخ**: 2026-03-10

#### الملفات المُنشأة:
- `src/actions/checkout.ts` — Server actions: completeCheckout, generateInvoicePdfUrl
- `src/app/checkout/page.tsx` — Checkout page (auth-gated)
- `src/app/checkout/_components/checkout-form.tsx` — Checkout form with address, payment, order summary
- `src/app/api/invoice/[id]/route.ts` — Invoice HTML generation API route

#### القرارات التقنية:
- `complete_order` RPC for atomic order + invoice creation + stock deduction
- 15% VAT calculation on checkout
- Stripe stub payment intent ID (`pi_stub_*`) for future Stripe integration
- Two payment methods: card (Stripe) / cash on delivery
- Invoice HTML route with print-friendly CSS
- Order success page with order/invoice numbers
- Cart auto-clear on successful checkout

---

### ✅ Unit 2 Complete — العمليات التشغيلية والمالية

- **5 Sprints completed** covering:
  - **FR-CAT**: Full catalog CRUD (services, packages, products)
  - **FR-CART**: Shopping cart with localStorage + DB sync
  - **FR-BOOK**: Booking engine with availability checks
  - **FR-PAY**: Checkout flow with order completion + invoicing
  - **FR-SEARCH**: Full-text catalog search
- **28 routes** (11 static, 15 dynamic, 2 API routes)
- **TypeScript**: 0 errors | **Build**: Compiled successfully

---

## القسم الثالث: التنفيذ والتحكم الشامل (Section 3)

### Sprint 1 — لوحة تحكم المصور (Photographer Dashboard)
**التاريخ**: 2026-03-10

#### الملفات المُنشأة:
- `src/app/photographer/layout.tsx` — تخطيط المصور مع التنقل (الرئيسية، جلساتي، رفع الصور، السجل)
- `src/actions/photographer.ts` — getPhotographerRecord, getUpcomingSessions, getPastSessions, getSessionDetails, completeSession, confirmSession
- `src/app/photographer/page.tsx` — لوحة إحصائيات (جلسات قادمة، مكتملة، تقييم، خبرة)
- `src/app/photographer/_components/upcoming-sessions-list.tsx` — عرض الجلسات مع أزرار تأكيد/إتمام
- `src/app/photographer/sessions/page.tsx` — صفحة الجلسات القادمة
- `src/app/photographer/history/page.tsx` — سجل الجلسات السابقة

#### القرارات التقنية:
- فحص دور المصور عبر `user.app_metadata.user_role` في Layout
- RLS يضمن أن المصور يرى فقط حجوزاته (`photographer_id`)
- تحديث حالة الجلسة عبر Server Actions مع `actual_end_time`
- جلب بيانات العميل (الاسم، الهاتف، الموقع، الملاحظات) للتحضير

---

### Sprint 2 — رفع الصور وإدارة الألبومات (Storage & Delivery)
**التاريخ**: 2026-03-10

#### الملفات المُنشأة:
- `src/actions/albums.ts` — createAlbum, uploadPhotos, getPhotographerAlbums, getCompletedBookingsWithoutAlbum
- `src/app/photographer/upload/page.tsx` — صفحة إدارة الألبومات ورفع الصور
- `src/app/photographer/upload/_components/album-manager.tsx` — واجهة إنشاء ألبومات + رفع صور متعددة + معرض الألبومات

#### القرارات التقنية:
- Supabase Storage bucket `catalog` مسار `albums/{albumId}/`
- رفع متعدد الصور مع `formData.getAll("photos")`
- ربط الصور بجدول `album_photos` مع حفظ اسم الملف وحجمه
- استبعاد الجلسات التي لديها ألبوم مسبقاً من قائمة الإنشاء
- تحقق من ملكية المصور للألبوم والحجز قبل أي عملية

---

### Sprint 3 — إدارة المستخدمين والصلاحيات (User/RBAC Management)
**التاريخ**: 2026-03-10

#### الملفات المُنشأة:
- `src/actions/admin-users.ts` — getUsers, updateUserRole, softDeleteUser, createPhotographerAccount
- `src/app/admin/users/page.tsx` — صفحة إدارة المستخدمين
- `src/app/admin/users/_components/create-photographer-form.tsx` — إنشاء حساب مصور جديد
- `src/app/admin/users/_components/users-list.tsx` — قائمة المستخدمين مع تغيير الأدوار والحذف الآمن

#### القرارات التقنية:
- Supabase Auth Admin API (`createAdminClient`) لإنشاء حسابات المصورين
- `soft_delete_user` RPC للحذف الآمن (تعطيل الحساب + إخفاء البيانات الشخصية)
- تحديث `app_metadata.user_role` + جدول `user_roles` معًا لضمان التزامن
- إنشاء سجل `photographers` تلقائيًا عند ترقية مستخدم لدور مصور
- حظر المستخدم عبر `ban_duration` بعد الحذف الآمن

---

### Sprint 4 — التقارير والإحصائيات المالية (Financial Analytics)
**التاريخ**: 2026-03-10

#### الملفات المُنشأة:
- `src/actions/admin-reports.ts` — getDailyRevenue, getPhotographerPerformance, getDashboardStats, getRevenueData
- `src/app/admin/reports/page.tsx` — صفحة التقارير
- `src/app/admin/reports/_components/reports-view.tsx` — رسوم بيانية + KPIs + تصدير

#### المكتبات المُضافة:
- `recharts` — رسوم بيانية تفاعلية (LineChart, BarChart)
- `jspdf` — تصدير PDF
- `xlsx` — تصدير Excel

#### القرارات التقنية:
- `v_daily_revenue` View لعرض إيرادات الحجوزات والطلبات يوميًا (آخر 30 يوم)
- `v_photographer_performance` View لأداء المصورين (حجوزات، تقييمات، إيرادات)
- `get_admin_dashboard_stats` RPC لـ KPIs الرئيسية
- Recharts: LineChart للإيرادات اليومية + BarChart لأداء المصورين
- تصدير PDF عبر jsPDF + تصدير Excel عبر xlsx (معالجة في المتصفح)

---

### Sprint 5 — الدعم الفني وإدارة المحتوى (Support & CMS)
**التاريخ**: 2026-03-10

#### الملفات المُنشأة:
- `src/actions/admin-tickets.ts` — getTickets, getTicketWithReplies, replyToTicket, updateTicketStatus, getClientTickets
- `src/actions/admin-settings.ts` — getSystemSettings, updateSetting, createSetting
- `src/app/admin/tickets/page.tsx` — قائمة التذاكر
- `src/app/admin/tickets/_components/tickets-list.tsx` — عرض التذاكر مع تغيير الحالة
- `src/app/admin/tickets/[id]/page.tsx` — تفاصيل التذكرة
- `src/app/admin/tickets/[id]/_components/ticket-detail.tsx` — عرض تفاصيل + ردود + نموذج رد
- `src/app/admin/settings/page.tsx` — صفحة CMS
- `src/app/admin/settings/_components/settings-manager.tsx` — إدارة إعدادات النظام
- `src/app/support/page.tsx` — صفحة تذاكر العميل
- `src/app/support/[id]/page.tsx` — تفاصيل تذكرة العميل
- `src/app/support/[id]/_components/client-ticket-view.tsx` — عرض التذكرة + الرد

#### القرارات التقنية:
- نظام تذاكر كامل: فتح/قيد المعالجة/تم الحل/مغلق
- أولويات التذاكر: منخفض/متوسط/عالي/عاجل
- الردود ثنائية الاتجاه (المدير والعميل)
- CMS عبر جدول `system_settings` (key-value pairs)
- إنشاء/تعديل الإعدادات مع revalidation للصفحات المتأثرة
- تحديث تخطيط لوحة الإدارة مع إضافة روابط (المستخدمون، التقارير، الدعم، الإعدادات)

---

### ✅ Unit 3 Complete — التنفيذ والتحكم الشامل

- **5 Sprints completed** covering:
  - **FR-P2/P3/P4**: لوحة المصور وإدارة الجلسات
  - **FR-P5**: رفع الصور وإدارة الألبومات
  - **FR-A5/A11**: إدارة المستخدمين والصلاحيات (RBAC)
  - **FR-A6/A10**: التقارير المالية وتصدير البيانات
  - **FR-A7/A9**: الدعم الفني وإدارة المحتوى (CMS)
- **38 routes** (11 static, 25 dynamic, 2 API routes)
- **TypeScript**: 0 errors | **Build**: Compiled successfully

---

## القسم الرابع: التحسينات الذكية (Section 4)

### Sprint 1 — البنية التحتية للتفاعل اللحظي (Realtime Infrastructure)
**التاريخ**: 2026-03-10

#### الملفات المُنشأة:
- `src/lib/gemini.ts` — إعداد عميل Gemini API (gemini-2.0-flash + text-embedding-004)
- `src/actions/notifications.ts` — getUnreadNotifications, getAllNotifications, markNotificationRead, markAllNotificationsRead, createNotification
- `src/hooks/use-realtime-notifications.ts` — Supabase Realtime hook لإشعارات postgres_changes على جدول notifications
- `src/hooks/use-realtime-bookings.ts` — Supabase Realtime hook لتحديثات حالة الحجوزات لحظيًا
- `src/components/notifications/notification-bell.tsx` — جرس الإشعارات مع عداد + قائمة منسدلة + قراءة فردية/جماعية
- `src/components/notifications/realtime-provider.tsx` — مزود Realtime يربط hooks الإشعارات والحجوزات
- `src/components/ui/popover.tsx` — مكون Popover من shadcn/ui (Base UI)

#### التكامل:
- تحديث `src/components/layout/navbar.tsx` — إضافة NotificationBell و RealtimeProvider للمستخدم المُسجل

#### المكتبات المُثبتة:
- `@google/generative-ai` — Gemini SDK

#### القرارات التقنية:
- Supabase Realtime Channels: قناة لكل مستخدم `notifications:{userId}` تستمع لـ INSERT
- قناة حجوزات `bookings:{userId}` تستمع لـ UPDATE وتعرض Toast عند تغيير الحالة
- Sonner Toast لعرض الإشعارات اللحظية مع أيقونات حسب النوع (حجز، طلب، تقييم، تذكرة)
- تحديث تلقائي للصفحة عبر `router.refresh()` عند تغيير حالة حجز
- Base UI Popover (render prop) بدلاً من Radix asChild

---

### Sprint 2 — نظام التقييم التفاعلي والأتمتة (Feedback Automation)
**التاريخ**: 2026-03-10

#### الملفات المُنشأة:
- `src/actions/reviews.ts` — submitReview, getBookingsToReview, getPhotographerReviews
- `src/components/reviews/star-rating.tsx` — مكون تقييم النجوم التفاعلي (1-5) مع hover effect
- `src/components/reviews/review-form.tsx` — نموذج تقييم الجلسات المكتملة مع نجوم + تعليق نصي
- `src/app/dashboard/reviews/page.tsx` — صفحة تقييمات العميل

#### القرارات التقنية:
- Database Trigger `update_photographer_rating` (موجود في المخطط) يحدّث `photographers.average_rating` و `total_reviews` تلقائيًا
- UNIQUE constraint `(client_id, booking_id)` يمنع التقييم المزدوج
- Optimistic UI في السلة: Zustand يُحدّث الحالة فورًا ثم يزامن مع السيرفر بعد 2 ثانية debounce
- AddToCartButton يعرض حالة "تمت الإضافة" فوريًا قبل فحص المخزون

---

### Sprint 3 — محرك المتجهات باستخدام Gemini Embeddings
**التاريخ**: 2026-03-10

#### الملفات المُنشأة:
- `src/actions/embeddings.ts` — generateEmbedding (text-embedding-004 API), generateItemEmbeddings, generateUserEmbedding, searchSimilarItems
- `src/app/admin/embeddings/page.tsx` — صفحة إدارة المتجهات
- `src/app/admin/embeddings/_components/embeddings-manager.tsx` — زر توليد متجهات العناصر

#### القرارات التقنية:
- Google text-embedding-004 API مع outputDimensionality: 1536 للتوافق مع pgvector
- توليد متجهات لـ: الخدمات (name + description + price) + المنتجات (name + description + category + price) + الباقات
- Upsert في `item_embeddings` مع onConflict: `entity_type,entity_id`
- توليد متجه المستخدم من: التقييمات + الحجوزات + المشتريات (user_embeddings)
- `get_ai_recommendations` RPC (موجود في المخطط) يستخدم cosine similarity للتوصيات
- Fallback: إذا لم يكن للمستخدم embedding، يُعرض أحدث المنتجات

---

### Sprint 4 — التوصيات الذكية ومساعد المظهر بـ Gemini
**التاريخ**: 2026-03-10

#### الملفات المُنشأة:
- `src/actions/ai-recommendations.ts` — getAIRecommendations (يولّد user embedding ثم يستدعي get_ai_recommendations RPC)
- `src/actions/ai-style-assistant.ts` — getStyleAdvice (Gemini gemini-2.0-flash لنصائح المظهر)
- `src/app/dashboard/recommendations/page.tsx` — صفحة التوصيات الذكية
- `src/app/dashboard/recommendations/_components/recommendations-list.tsx` — عرض التوصيات مع نسبة التطابق
- `src/app/style-assistant/page.tsx` — صفحة مساعد المظهر الذكي
- `src/app/style-assistant/_components/style-assistant-form.tsx` — نموذج تفاعلي: نوع الجلسة + المناسبة + الجنس + الموسم

#### القرارات التقنية:
- Gemini gemini-2.0-flash لتوليد نصائح المظهر بالعربية
- Prompt engineering: مصمم لإرجاع نصائح عن الملابس والإكسسوارات والمكياج
- التوصيات تعتمد على pgvector cosine similarity عبر get_ai_recommendations RPC
- عرض مصدر التوصية: "ai_similarity" (مخصصة) أو "popular" (عامة)

---

### Sprint 5 — الجدولة الذكية واللمسات النهائية
**التاريخ**: 2026-03-10

#### الملفات المُنشأة:
- `src/actions/smart-scheduling.ts` — smartAssignPhotographer (يستدعي smart_assign_photographer RPC)
- `src/app/admin/smart-assign/page.tsx` — صفحة الجدولة الذكية
- `src/app/admin/smart-assign/_components/smart-assign-form.tsx` — نموذج البحث عن أفضل مصور متاح

#### الملفات المُحدَّثة:
- `src/app/auth/register/_components/register-form.tsx` — إضافة خانة موافقة GDPR
- `src/actions/auth.ts` — تخزين gdpr_consent + gdpr_consent_at في profiles عند التسجيل
- `src/app/admin/layout.tsx` — إضافة روابط: الذكاء الاصطناعي، الجدولة الذكية
- `.env.local` — إضافة GEMINI_API_KEY و GEMINI_MODEL

#### القرارات التقنية:
- `smart_assign_photographer` RPC (موجود في المخطط): يبحث عن المصور الأقل حجوزات + الأعلى تقييمًا + متاح + لا يوجد تعارض
- NFR-SEC3 (GDPR): خانة موافقة إلزامية مع طابع زمني `gdpr_consent_at` في `profiles`
- فحص المصور بناءً على: عبء العمل (load balancing) + التقييم + التخصص + التوفر + عدم التعارض الزمني

---

### ✅ Unit 4 Complete — التحسينات الذكية

- **5 Sprints completed** covering:
  - **FR-P6/SR7**: الإشعارات اللحظية عبر Supabase Realtime + Toast
  - **FR-C9**: نظام التقييم التفاعلي + Database Triggers
  - **NFR-PE1**: Optimistic UI في السلة والتقييمات
  - **SR4/FR-C7**: Gemini Embeddings + pgvector + محرك التوصيات الذكية
  - **FR-C7**: مساعد المظهر الذكي بـ Gemini gemini-2.0-flash
  - **FR-A8**: الجدولة الذكية (smart_assign_photographer)
  - **NFR-SEC3**: طوابع الخصوصية GDPR في التسجيل
- **42 routes** (11 static, 29 dynamic, 2 API routes)
- **TypeScript**: 0 errors | **Build**: Compiled successfully

---

## [0.5.1] - 2026-03-10 — Hotfix: Auth Registration & User Deletion

### إصلاح التسجيل (signUp)

- **السبب الجذري**: `supabase_auth_admin` role يملك `search_path=auth` فقط، مما يمنع `handle_new_user` و `custom_access_token_hook` من الوصول لجداول `public` schema
- **الإصلاح**: إضافة `SET search_path = public, auth, extensions` لجميع الدوال:
  - `handle_new_user()`
  - `custom_access_token_hook(event JSONB)`
  - `auth_has_role(p_role_name TEXT)`
  - `sync_user_role_to_metadata()`
- إزالة `UPDATE auth.users` الزائد من `handle_new_user` (الـ Hook يتولى حقن الدور في JWT)
- إضافة grants شاملة لـ `supabase_auth_admin` على `public.roles`, `public.user_roles`, `public.profiles`

### إصلاح إرسال إيميل التحقق عبر Gmail API

- تعديل `src/actions/auth.ts` لاستخدام `admin.generateLink({ type: "signup" })` بدل `auth.signUp` المباشر
- إرسال إيميل التحقق عبر `sendEmail()` (Gmail OAuth2 API) بدلاً من خوادم Supabase الافتراضية
- استخدام `verificationEmailTemplate` مع رابط `token_hash` الذي يوجه إلى `/auth/confirm`

### إصلاح حذف المستخدمين

- **السبب الجذري 1**: FK constraints بدون `ON DELETE` action (يستخدم `NO ACTION` افتراضياً):
  - `user_roles.assigned_by` → تم إضافة `ON DELETE SET NULL`
  - `system_settings.updated_by` → تم إضافة `ON DELETE SET NULL`
- **السبب الجذري 2**: `sync_user_role_to_metadata` trigger يحاول `UPDATE auth.users` لمستخدم قيد الحذف
  - إضافة guard check: `IF NOT EXISTS(SELECT 1 FROM auth.users WHERE id = v_user_id)` → skip
- حذف جميع مستخدمي الاختبار وتنظيف البيئة بالكامل

### الملفات المُعدّلة:
- `src/actions/auth.ts` — signUp flow: admin.generateLink + Gmail API
- `supabase/migrations/20260309000000_initial_schema.sql` — SET search_path، FK fixes، trigger guard
- `docs/debug_signup_error.md` — توثيق كامل لجميع خطوات التشخيص

---

## [0.6.0] - 2026-03-10 — After-Development Plan (4 Sprints)

### Sprint 1: Advanced RBAC System (نظام صلاحيات ذري)

- إنشاء `src/lib/rbac.ts` مع `checkPermission()`, `requirePermission()`, `requireAuth()`, `requireRole()`
- تعريف 13 صلاحية ذرية: `bookings.view_all`, `bookings.manage`, `products.manage`, `inventory.update`, `users.manage`, `roles.manage`, `analytics.view`, `settings.cms`, `services.manage`, `packages.manage`, `tickets.manage`, `albums.manage`, `ai.manage`
- تحديث `custom_access_token_hook` لحقن `permissions[]` في JWT `app_metadata` إلى جانب `user_role`
- إنشاء `src/actions/admin-roles.ts` — CRUD للأدوار وربط الصلاحيات
- إنشاء صفحة `/admin/roles` مع واجهة Checkboxes لتحديد صلاحيات كل دور
- Seed: 13 صلاحية + ربطها بالأدوار (admin: الكل، photographer: bookings.view_all + albums.manage)
- إضافة GRANTs لـ `supabase_auth_admin` على `permissions` و `role_permissions`

### Sprint 2: UI/UX Dashboard Revolution (مركز القيادة)

- إنشاء `AdminSidebar` — شريط جانبي قابل للطي مع دعم Responsive (Drawer في الجوال)
- إنشاء `Breadcrumbs` — تنقل هرمي يعمل تلقائياً حسب المسار
- إعادة تصميم `/admin` layout: Sidebar + Main content area
- إعادة تصميم لوحة الإدارة `/admin/page.tsx`:
  - 4 بطاقات إحصائية: إجمالي الإيرادات، الحجوزات النشطة، مخزون منخفض، متوسط التقييم
  - قسم "النشاط الأخير": آخر 5 حجوزات + آخر 5 طلبات مع حالاتها
  - قسم "إجراءات سريعة": أزرار مباشرة للإجراءات المتكررة
- إعادة تصميم `/dashboard/page.tsx` (العميل):
  - ترحيب شخصي + عدد الإشعارات غير المقروءة
  - آخر النشاطات (حجوزات + طلبات)
  - وصول سريع مُحسّن مع روابط ذكية حسب الدور

### Sprint 3: Taiz-Yemen Seed Data (بيانات تعز الواقعية)

- إنشاء `supabase/seed.sql` ببيانات واقعية لمدينة تعز
- **المستخدمون** (7): أديب الحكيمي (admin)، عصام التعزي + أروى الصبري + مازن المخلافي (photographers)، فاطمة السعيدي + محمد الشرعبي + نور الحمادي (clients)
- **التصنيفات**: 5 تصنيفات خدمات + 4 تصنيفات منتجات
- **الخدمات** (7): تغطية زفاف قلعة القاهرة، جلسة جبل صبر، باقة تخرج جامعة تعز، بورتريه استوديو، تصوير منتجات، تصوير خطوبة، جلسة باب موسى
- **الباقات** (3): عروس تعز الذهبية، فخر التخرج، ذكريات تعز العائلية
- **المنتجات** (10): كاميرات Sony/Canon، ألبومات خشبية/جلدية، براويز إسلامية، إكسسوارات
- **الحجوزات** (3): مكتمل (5 نجوم)، ملغى، بانتظار الموافقة في قاعة السعيد
- **الطلبات**: طلب مكتمل مع فاتورة مدفوعة
- **النشاط**: 50 سجل نشاط + 10 سجلات نظام + تذكرة دعم مفتوحة
- **الإعدادات**: 11 إعداد نظام (اسم، هاتف، عنوان، ساعات عمل، عملة، إلخ)

### Sprint 4: Global Security & Code Audit (المراجعة الأمنية)

- استبدال **جميع** فحوصات `user.app_metadata?.user_role !== "admin"` بـ `checkPermission(PERMISSIONS.X)` في:
  - `admin-services.ts` (4 functions) → `SERVICES_MANAGE`
  - `admin-products.ts` (5 functions) → `PRODUCTS_MANAGE` + `INVENTORY_UPDATE`
  - `admin-packages.ts` (3 functions) → `PACKAGES_MANAGE`
  - `admin-users.ts` (4 functions) → `USERS_MANAGE`
  - `admin-reports.ts` (4 functions) → `ANALYTICS_VIEW`
  - `admin-settings.ts` (2 functions) → `SETTINGS_CMS`
  - `admin-tickets.ts` (2 functions) → `TICKETS_MANAGE`
  - `embeddings.ts` (1 function) → `AI_MANAGE`
  - `smart-scheduling.ts` (1 function) → `BOOKINGS_MANAGE`
- إنشاء `PermissionGuard` React component لإخفاء العناصر حسب الصلاحية
- RLS policies تستخدم `auth_has_role()` المبني على JWT (O(1) بدون استعلام DB)
- **0 instances** من فحص الدور المباشر في Server Actions بعد التحديث

### الملفات الجديدة:
- `src/lib/rbac.ts` — RBAC utilities (checkPermission, requirePermission, PERMISSIONS)
- `src/actions/admin-roles.ts` — Server actions لإدارة الأدوار والصلاحيات
- `src/app/admin/roles/page.tsx` — صفحة إدارة الأدوار
- `src/app/admin/roles/_components/roles-manager.tsx` — مكون إدارة الأدوار (Client)
- `src/components/layout/admin-sidebar.tsx` — الشريط الجانبي للإدارة
- `src/components/layout/breadcrumbs.tsx` — مكون التنقل الهرمي
- `src/components/auth/permission-guard.tsx` — مكون حماية الصلاحيات
- `supabase/seed.sql` — بيانات تجريبية لمدينة تعز

### الملفات المُعدّلة:
- `src/app/admin/layout.tsx` — Sidebar layout بدل nav links
- `src/app/admin/page.tsx` — مركز القيادة (stats, activity, quick actions)
- `src/app/dashboard/page.tsx` — لوحة تحكم مُحسّنة للعميل
- `supabase/migrations/20260309000000_initial_schema.sql` — custom_access_token_hook + permissions injection + grants
- جميع ملفات `src/actions/admin-*.ts` — checkPermission بدل raw role checks

---

## [0.6.1] - 2026-03-11 — System Testing & Password Reset

### المشكلة
- محاولة تسجيل الدخول بحسابات Seed Data فشلت مع "البريد الإلكتروني أو كلمة المرور غير صحيحة"
- السبب: المستخدمون تم إنشاؤهم عبر Admin API لكن كلمات المرور لم تُحفظ بشكل صحيح

### الحل
- إنشاء `scripts/reset-passwords.mjs` — إعادة تعيين كلمات المرور لجميع المستخدمين (7 مستخدمين)
- إنشاء `scripts/refresh-permissions.mjs` — تحديث صلاحيات JWT لجميع المستخدمين
- إنشاء `scripts/test-system.mjs` — سكريبت اختبار شامل للنظام

### نتائج الاختبار الشامل

**المرحلة 1: التحقق من المستخدمين**
- ✅ 7 مستخدمين موجودين في قاعدة البيانات

**المرحلة 2: اختبار تسجيل الدخول**
- ✅ Admin (admin@artphoto.ye): 37 صلاحية
- ✅ Photographer 1 (essam@artphoto.ye): 7 صلاحيات
- ✅ Photographer 2 (arwa@artphoto.ye): 7 صلاحيات
- ✅ Photographer 3 (mazen@artphoto.ye): 7 صلاحيات
- ✅ Client 1 (fatima@client.ye): 10 صلاحيات
- ✅ Client 2 (mohammed@client.ye): 10 صلاحيات
- ✅ Client 3 (noor@client.ye): 10 صلاحيات
- **معدل النجاح: 100%**

**المرحلة 3: اختبار العمليات**

**Admin Operations:**
- ✅ جلب الخدمات: 3 خدمات
- ✅ جلب المنتجات: 3 منتجات
- ✅ جلب الحجوزات: 3 حجوزات
- ✅ جلب المستخدمين: 5 مستخدمين
- ✅ جلب الأدوار: 4 أدوار
- ✅ جلب الصلاحيات: 37 صلاحية

**Photographer Operations:**
- ✅ جلب حجوزاتي: 1 حجز
- ✅ جلب كل الحجوزات: 1 حجز (RLS يسمح برؤية الكل)
- ✅ صلاحيات: bookings.view_all + albums.manage

**Client Operations:**
- ✅ جلب حجوزاتي: 1 حجز
- ✅ جلب طلباتي: 0 طلب
- ✅ تصفح الخدمات: 5 خدمات
- ✅ تصفح المنتجات: 5 منتجات

### التوثيق
- إنشاء `docs/SEED_DATA_CREDENTIALS.md` — توثيق شامل لجميع بيانات الاعتماد والتفاصيل:
  - 7 مستخدمين مع كلمات المرور
  - 7 خدمات (تعز)
  - 3 باقات
  - 10 منتجات
  - 3 حجوزات (مكتمل، ملغى، بانتظار الموافقة)
  - طلب + فاتورة مدفوعة
  - تذكرة دعم مفتوحة
  - 11 إعداد نظام

### الملفات الجديدة:
- `scripts/test-system.mjs` — اختبار شامل للنظام (تسجيل دخول + عمليات + صلاحيات)
- `scripts/reset-passwords.mjs` — إعادة تعيين كلمات المرور
- `scripts/refresh-permissions.mjs` — تحديث صلاحيات JWT
- `docs/SEED_DATA_CREDENTIALS.md` — توثيق بيانات الاعتماد

### الخلاصة
✅ النظام يعمل بشكل مثالي - جميع المستخدمين يمكنهم تسجيل الدخول والقيام بعملياتهم حسب أدوارهم وصلاحياتهم

---

## [0.7.0] - 2026-03-11 — Playful Geometric Design System + Layout Architecture

### نظرة عامة
تطبيق نظام التصميم "Playful Geometric" الكامل على المشروع مع إعادة هيكلة معمارية Layout لفصل الصفحات العامة عن لوحات التحكم.

### Phase 1: Design Tokens
- استبدال خطوط Geist بـ **Outfit** (عناوين) + **Plus Jakarta Sans** (نصوص)
- إعادة كتابة `globals.css` بالكامل مع نظام ألوان جديد:
  - Background: `#FFFDF5` (Warm Cream)
  - Primary: `#8B5CF6` (Vivid Violet)
  - Secondary: `#F472B6` (Hot Pink)
  - Tertiary: `#FBBF24` (Amber)
  - Quaternary: `#34D399` (Emerald)
  - Border: `#1E293B` (Dark Chunky 2px)
- إضافة utility classes: `shadow-pop`, `shadow-pop-lg`, `shadow-pop-accent`, `hover-pop`, `card-hover`, `border-chunky`
- دعم `prefers-reduced-motion` للرسوم المتحركة
- دعم كامل لـ Dark Mode

### Phase 2: Layout Architecture Refactoring
- إنشاء route group `(public)` لعزل الصفحات العامة
- نقل 15 مسار عام إلى `src/app/(public)/`:
  - about, booking, cart, checkout, contact, photographers, privacy, products, profile, search, services, style-assistant, support, terms, page.tsx
- إنشاء `(public)/layout.tsx` مع Navbar + Footer
- إزالة Navbar/Footer من root layout → لوحات التحكم (admin/dashboard/photographer) لم تعد تعرض Header/Footer العام

### Phase 3: Core Components Restyled
- **Navbar**: حدود 2px chunky، شعار مع shadow-pop، أزرار pill-shaped مع tertiary active state، candy CTA button مع bounce hover
- **Footer**: خلفية داكنة مع أشكال هندسية مزخرفة (دوائر، مربعات مائلة، حلقات متقطعة)، ألوان tertiary للروابط
- **Home Page**: Hero غير متماثل (left-aligned مع أشكال عائمة)، بطاقات sticker مع card-hover rotation، أيقونات ملونة حسب الفئة، CTA section بخلفية primary

### Phase 4: Dashboard Shell Restyled
- **AdminSidebar**: حدود 2px، tertiary active مع shadow-pop، rounded-xl nav items، خط Outfit للعناوين
- **Auth Layout**: خلفية مع أشكال هندسية مزخرفة، شعار branded مع shadow-pop

### Phase 5: Build Fix (PERMISSIONS Export)
- **مشكلة**: Next.js 16 يمنع تصدير قيم غير async من ملفات "use server"
- **الحل**: نقل `PERMISSIONS` const و `Permission` type إلى `src/lib/permissions.ts` (ملف عادي)
- تحديث 10 ملفات action لاستيراد `PERMISSIONS` من `@/lib/permissions` و `checkPermission` من `@/lib/rbac`
- ✅ البناء نجح: 43 مسار بدون أخطاء

### Visual Design Signatures
- **Hard Pop Shadows**: `4px 4px 0px 0px` بدون blur (ملمس sticker)
- **Bounce Easing**: `cubic-bezier(0.34, 1.56, 0.64, 1)` للتفاعلات
- **Card Hover**: `rotate(-1deg) scale(1.02)` للبطاقات
- **Decorative Shapes**: دوائر، مربعات مائلة، حلقات متقطعة كعناصر خلفية
- **Mixed Radii**: `rounded-full` للأزرار، `rounded-2xl` للبطاقات، `rounded-xl` للأيقونات

### الملفات الجديدة:
- `src/app/(public)/layout.tsx` — Public layout مع Navbar + Footer
- `src/lib/permissions.ts` — PERMISSIONS const و Permission type (منفصل عن use server)

### الملفات المُعدّلة:
- `src/app/layout.tsx` — خطوط Outfit + Plus Jakarta Sans، إزالة Navbar/Footer
- `src/app/globals.css` — نظام ألوان Playful Geometric كامل + utilities
- `src/components/layout/navbar.tsx` — تصميم chunky مع shadow-pop
- `src/components/layout/footer.tsx` — خلفية داكنة مع أشكال مزخرفة
- `src/components/layout/admin-sidebar.tsx` — تصميم متناسق مع Design System
- `src/app/(public)/page.tsx` — Hero غير متماثل مع sticker cards
- `src/app/auth/layout.tsx` — أشكال مزخرفة وشعار branded
- `src/lib/rbac.ts` — إزالة تصدير PERMISSIONS const
- 10 ملفات `src/actions/*.ts` — تقسيم imports (rbac + permissions)

### الملفات المنقولة (15 مسار عام → route group):
- `src/app/{route}` → `src/app/(public)/{route}` لجميع الصفحات العامة

---

## [0.3.0] - 2026-03-11

### Sprint 1: Admin Layout & Dashboard Overhaul

#### Admin Sidebar (`src/components/layout/admin-sidebar.tsx`)
- إعادة هيكلة الشريط الجانبي مع تجميع الروابط في أقسام (عام، الكتالوج، المستخدمون، النظام)
- إضافة عناوين أقسام بتنسيق uppercase مع tracking-widest
- إضافة رابط "الحجوزات" (`/admin/bookings`) و "التخصصات" (`/admin/specialties`)
- إضافة شعار مع أيقونة كاميرا في الرأس
- إضافة زر "العودة للموقع" في الأسفل مع أيقونة Globe
- توسيع العرض إلى `w-64` (من `w-60`)

#### Admin Dashboard (`src/app/admin/page.tsx`)
- 6 بطاقات إحصائية (إيرادات، حجوزات نشطة، مخزون منخفض، تقييم، مستخدمون، تذاكر)
- مخطط إيرادات Recharts (آخر 14 يوم) من `v_daily_revenue` view
- تصميم Playful Geometric: border-2, shadow-pop, rounded-2xl
- عرض التاريخ بالعربية اليمنية
- إجراءات سريعة مع أيقونات ملونة

#### Admin Revenue Chart (`src/app/admin/_components/admin-revenue-chart.tsx`)
- مكون Recharts BarChart مع حجوزات + طلبات
- تصميم Tooltip مع shadow-pop وحدود
- تنسيق العملة ر.ي

### Sprint 1: Admin Bookings Page

#### New Files:
- `src/actions/admin-bookings.ts` — getBookings + updateBookingStatus server actions
- `src/app/admin/bookings/page.tsx` — صفحة إدارة الحجوزات
- `src/app/admin/bookings/_components/bookings-list.tsx` — جدول مع بحث، فلترة حسب الحالة، dialog لتحديث الحالة

### Sprint 2: Database & Specialties

#### Migration (`supabase/migrations/20260311000000_specialties_and_invitations.sql`)
- جدول `specialties` (id, name, description, is_active) مع 10 تخصصات أولية
- إضافة عمود `specialty_id` FK إلى جدول `photographers`
- جدول `photographer_invitations` (email, full_name, token, status, expires_at)
- سياسات RLS: قراءة عامة للتخصصات، كتابة للمدير فقط

#### Bug Fix: `src/actions/admin-users.ts`
- إصلاح استخدام `user_id` → `id` في جدول photographers (PK هو id وليس user_id)
- تأثر: updateUserRole + createPhotographerAccount

#### New Files:
- `src/actions/admin-specialties.ts` — CRUD actions للتخصصات
- `src/app/admin/specialties/page.tsx` + `_components/specialties-list.tsx` — واجهة إدارة التخصصات مع Create/Edit/Delete dialogs

#### Modified: `src/app/admin/users/page.tsx`
- تمرير specialties إلى CreatePhotographerForm

#### Modified: `src/app/admin/users/_components/create-photographer-form.tsx`
- تحويل النماذج إلى Dialog modals بدلاً من inline forms
- إضافة dropdown للتخصصات من قاعدة البيانات
- إضافة زر "إرسال دعوة بريدية" مع dialog منفصل

### Sprint 3: Photographer Onboarding

#### New Files:
- `src/actions/admin-invitations.ts` — sendPhotographerInvitation, validateInvitationToken, markInvitationAccepted, getInvitations
- قالب بريد إلكتروني HTML للدعوة مع رابط تسجيل مخصص
- رابط دعوة بتوكن عشوائي (32 bytes hex) صالح 7 أيام

### Sprint 4: AI & Bug Fixes

#### Embeddings Fix (`src/actions/embeddings.ts`)
- إصلاح: products query كان يستخدم `category` (غير موجود) → تم تغييره إلى join مع `product_categories(name)`
- إصلاح: orders query كان يستخدم `.eq("user_id")` → تم تغييره إلى `.eq("client_id")`
- إصلاح: order_items parsing لاستخدام `product_categories` بدلاً من `category`
- تحديث نصوص الـ embeddings لاستخدام "ريال يمني"

#### AI Management Page (`src/app/admin/embeddings/page.tsx`)
- 3 بطاقات إحصائية: متجهات العناصر (مع total)، متجهات المستخدمين، حالة Gemini API
- تحذير مرئي إذا GEMINI_API_KEY غير مُعرّف
- تصميم Playful Geometric

#### Logout Refresh Fix (`src/components/providers/auth-provider.tsx`)
- إضافة `reset()` لمسح Zustand state فوراً عند عدم وجود session
- إضافة `router.refresh()` عند حدث `SIGNED_OUT` لإجبار إعادة تحميل Server Components

### Sprint 5: Public Store & Currency Fix

#### Search Feature:
- `src/app/(public)/products/page.tsx` — إضافة بحث نصي عبر `q` search param مع `ilike`
- `src/app/(public)/services/page.tsx` — نفس البحث النصي
- `src/app/(public)/products/_components/product-search.tsx` — مكون بحث client
- `src/app/(public)/services/_components/service-search.tsx` — مكون بحث client

#### Playful Geometric Restyling (Public Pages):
- بطاقات المنتجات: rounded-2xl, border-2, shadow-pop, card-hover
- فلاتر الفئات: rounded-full, border-2, shadow-pop
- أسعار الخدمات: pill badge مع bg-tertiary

#### Currency Fix (ر.س → ر.ي):
- تم تحديث 29 موضع عبر 15 ملف
- الملفات المتأثرة: checkout-form, invoice route, cart-view, booking-form, reports-view, photographers, search, low-stock-list, packages (create+list), products (create+list), services (create+list), recommendations-list

### Breadcrumbs Update (`src/components/layout/breadcrumbs.tsx`)
- إضافة labels: bookings → "الحجوزات"، specialties → "التخصصات"

### Build Verification
- ✅ `npx next build` ناجح — 45 route بدون أخطاء
- ✅ Migration pushed to Supabase (rpfliekiobxoibkatqah)
