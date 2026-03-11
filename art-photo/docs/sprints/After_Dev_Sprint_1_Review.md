# Sprint 1 Review: Advanced RBAC System

## الهدف
بناء نظام صلاحيات ذري (Granular Permissions) يعتمد على الصلاحيات بدلاً من الأدوار فقط، مع واجهة إدارية للتحكم.

## ما تم تنفيذه

### 1. RBAC Utility (`src/lib/rbac.ts`)
- `checkPermission(permission)` — فحص صلاحية محددة للمستخدم الحالي
- `requirePermission(permission)` — يرمي خطأ إذا لم تتوفر الصلاحية
- `requireAuth()` — التحقق من تسجيل الدخول
- `requireRole(role)` — التحقق من دور محدد
- `getUserPermissions()` — جلب صلاحيات المستخدم من JWT
- `PERMISSIONS` — كائن يحتوي على 13 صلاحية ذرية

### 2. JWT Hook Update (`custom_access_token_hook`)
- تحديث الـ Hook لحقن `permissions[]` في `app_metadata` إلى جانب `user_role`
- الصلاحيات تُجلب من `role_permissions` JOIN `permissions` عند إصدار JWT
- Admin يحصل تلقائياً على `true` لكل صلاحية (bypass في `checkPermission`)

### 3. Admin Roles Page (`/admin/roles`)
- واجهة لعرض جميع الأدوار مع عدد صلاحيات كل دور
- Checkboxes مُجمّعة حسب الفئة لتحديد صلاحيات كل دور
- إمكانية إنشاء أدوار جديدة وحذف الأدوار غير الأساسية
- حماية الأدوار الأساسية (admin, client, photographer, visitor) من الحذف

### 4. Database Changes
- إضافة GRANTs لـ `supabase_auth_admin` على `permissions` و `role_permissions`
- Seed: 13 صلاحية مع ربطها بالأدوار الافتراضية

## الصلاحيات المُعرّفة

| الصلاحية | الوصف |
|-----------|-------|
| `bookings.view_all` | عرض جميع الحجوزات |
| `bookings.manage` | إدارة الحجوزات (قبول/رفض) |
| `products.manage` | إدارة المنتجات |
| `inventory.update` | تحديث المخزون |
| `users.manage` | إدارة المستخدمين |
| `roles.manage` | إدارة الأدوار والصلاحيات |
| `analytics.view` | عرض التقارير |
| `settings.cms` | إدارة إعدادات الموقع |
| `services.manage` | إدارة الخدمات |
| `packages.manage` | إدارة الباقات |
| `tickets.manage` | إدارة تذاكر الدعم |
| `albums.manage` | إدارة الألبومات |
| `ai.manage` | إدارة الذكاء الاصطناعي |

## التوزيع الافتراضي
- **Admin**: جميع الصلاحيات (37)
- **Photographer**: `bookings.view_all` + `albums.manage`
- **Client**: لا صلاحيات إدارية
- **Visitor**: لا صلاحيات
