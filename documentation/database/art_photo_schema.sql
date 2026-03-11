-- ============================================================================
-- Art Photo Studio - Complete Database Schema
-- نظام إلكتروني ذكي لإدارة إستوديو تصوير
-- Stack: Next.js (App Router) + Supabase (PostgreSQL)
-- ============================================================================
-- يشمل: RBAC, RLS, Functions, Triggers, pgvector, pg_cron
-- ============================================================================

-- ============================================================================
-- 0. تفعيل الإضافات المطلوبة (Extensions)
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- توليد UUID
CREATE EXTENSION IF NOT EXISTS "pgvector";        -- دعم الذكاء الاصطناعي والتوصيات
CREATE EXTENSION IF NOT EXISTS "pg_cron";         -- المهام المجدولة
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- البحث النصي المتقدم (Trigram)

-- ============================================================================
-- 1. نظام RBAC (Role-Based Access Control)
-- ============================================================================
-- جدول الأدوار: يحدد أنواع المستخدمين في النظام
-- الأدوار الأساسية: visitor, client, photographer, admin
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول الصلاحيات: يحدد الأفعال المسموحة في النظام
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول ربط الصلاحيات بالأدوار (Many-to-Many)
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

-- جدول ربط المستخدمين بالأدوار (Many-to-Many)
-- يربط مع auth.users الخاص بـ Supabase Auth
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, role_id)
);

-- ============================================================================
-- 2. جدول الملفات الشخصية (Profiles)
-- يمتد من auth.users ويحتوي على البيانات الإضافية
-- ============================================================================
-- ⚠️ Soft Delete Strategy: بدلاً من حذف المستخدم فعلياً، يتم تعيين deleted_at
-- هذا يحافظ على السجلات المالية والتاريخية (الحجوزات، الطلبات، الفواتير)
-- حتى لو غادر العميل المنصة
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    bio TEXT,
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    address TEXT,
    gdpr_consent BOOLEAN NOT NULL DEFAULT FALSE,          -- NFR-SEC3: الامتثال للخصوصية
    gdpr_consent_at TIMESTAMPTZ,                          -- طابع زمني للموافقة
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at TIMESTAMPTZ,                               -- Soft Delete: NULL = نشط، قيمة = محذوف
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. جدول المصورين (Photographers) - بيانات مهنية إضافية
-- ============================================================================
CREATE TABLE photographers (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    specialty VARCHAR(100),                                -- تخصص المصور (زفاف، بورتريه، منتجات...)
    experience_years INTEGER DEFAULT 0,
    portfolio_url TEXT,                                    -- رابط معرض الأعمال
    average_rating NUMERIC(3,2) DEFAULT 0.00,             -- متوسط التقييم (يُحدث آلياً عبر Trigger)
    total_reviews INTEGER DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,            -- حالة التوفر العامة
    hourly_rate NUMERIC(10,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. جداول الخدمات والباقات (Services & Packages)
-- ============================================================================

-- تصنيفات الخدمات
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول الخدمات الأساسية
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    base_price NUMERIC(10,2) NOT NULL,
    duration_minutes INTEGER NOT NULL,                     -- مدة الجلسة بالدقائق
    cover_image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول الباقات (تجميع خدمات بسعر مخفض)
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    cover_image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ربط الخدمات بالباقات (Many-to-Many)
CREATE TABLE package_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE(package_id, service_id)
);

-- ============================================================================
-- 5. جداول المتجر والمنتجات (Products / E-Commerce)
-- ============================================================================

-- تصنيفات المنتجات
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول المنتجات (المعدات والإكسسوارات)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,              -- كمية المخزون اللحظية
    sku VARCHAR(50) UNIQUE,                                 -- رمز المنتج
    cover_image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- صور المنتجات (جدول فرعي لدعم صور متعددة)
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. جداول الحجوزات والمواعيد (Bookings & Appointments)
-- ============================================================================

-- جدول الحجوزات الرئيسي
-- ⚠️ client_id: ON DELETE SET NULL بدلاً من CASCADE
-- لضمان بقاء السجلات المالية والتاريخية حتى لو حُذف حساب العميل
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    photographer_id UUID REFERENCES photographers(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected')),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT,
    client_notes TEXT,                                     -- ملاحظات العميل للتحضير (FR-P3)
    admin_notes TEXT,
    total_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,                              -- طابع زمني لإتمام الجلسة (FR-P4)
    -- SR1: قيد فريد لمنع تداخل المواعيد على مستوى المصور
    -- يتم التحقق الإضافي عبر دالة RPC (check_photographer_availability)
    CONSTRAINT chk_booking_time CHECK (end_time > start_time),
    CONSTRAINT chk_service_or_package CHECK (service_id IS NOT NULL OR package_id IS NOT NULL)
);

-- فهرس مركب لمنع التداخل (يُستخدم مع دالة التحقق)
CREATE UNIQUE INDEX idx_unique_photographer_slot
    ON bookings (photographer_id, booking_date, start_time)
    WHERE status NOT IN ('cancelled', 'rejected');

-- جدول فترات عدم توفر المصور (إجازات، أوقات محجوزة شخصياً)
CREATE TABLE photographer_unavailability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
    unavailable_date DATE NOT NULL,
    start_time TIME,                                       -- NULL يعني اليوم كامل
    end_time TIME,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(photographer_id, unavailable_date, start_time)
);

-- ============================================================================
-- 7. سلة المشتريات (Cart) - تُحفظ في DB كنسخة احتياطية
-- الإدارة الأساسية عبر Zustand + localStorage (FR-C5)
-- ============================================================================
CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_cart_item_type CHECK (
        (product_id IS NOT NULL)::int +
        (service_id IS NOT NULL)::int +
        (package_id IS NOT NULL)::int = 1
    )
);

-- ============================================================================
-- 8. الطلبات والفواتير (Orders & Invoices)
-- ============================================================================

-- جدول الطلبات (شراء منتجات من المتجر)
-- ⚠️ client_id: ON DELETE SET NULL للحفاظ على السجلات المالية
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    total_amount NUMERIC(10,2) NOT NULL,
    shipping_address TEXT,
    payment_method VARCHAR(50),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid'
        CHECK (payment_status IN ('unpaid', 'paid', 'failed', 'refunded')),
    stripe_payment_intent_id VARCHAR(255),                 -- معرف الدفع في Stripe
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- تفاصيل الطلب (عناصر الطلب)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- جدول الفواتير (للحجوزات والطلبات معاً)
-- ⚠️ client_id: ON DELETE SET NULL للحفاظ على السجلات المحاسبية
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) NOT NULL UNIQUE,            -- رقم الفاتورة التسلسلي
    client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    tax_amount NUMERIC(10,2) DEFAULT 0,
    total_amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'issued'
        CHECK (status IN ('issued', 'paid', 'overdue', 'cancelled', 'refunded')),
    payment_method VARCHAR(50),
    payment_date TIMESTAMPTZ,
    pdf_url TEXT,                                           -- رابط ملف PDF للفاتورة
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. التقييمات والمراجعات (Reviews & Ratings) - FR-C9
-- ============================================================================
-- ⚠️ client_id: ON DELETE SET NULL للحفاظ على سجل التقييمات التاريخي
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    photographer_id UUID REFERENCES photographers(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,               -- يمكن للمدير إخفاء تقييمات غير لائقة
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- كل عميل يقيّم حجز واحد مرة واحدة فقط
    UNIQUE(client_id, booking_id)
);

-- ============================================================================
-- 10. نظام التذاكر والشكاوى (Support Tickets) - FR-A7
-- ============================================================================
-- ⚠️ user_id: ON DELETE SET NULL للحفاظ على سجل الشكاوى
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ردود التذاكر
CREATE TABLE ticket_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 11. نظام الإشعارات (Notifications) - FR-P6, SR7
-- يعمل مع Supabase Realtime لإرسال إشعارات لحظية
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,  -- الإشعارات تُحذف مع حذف المستخدم (ليست سجلات مالية)
    title VARCHAR(255) NOT NULL,
    body TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'general'
        CHECK (type IN ('general', 'booking', 'order', 'review', 'ticket', 'system', 'assignment')),
    reference_id UUID,                                      -- معرف العنصر المرتبط (حجز، طلب، الخ)
    reference_type VARCHAR(50),                             -- نوع العنصر المرتبط
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 12. إعدادات النظام (System Settings) - FR-A9 (CMS)
-- ============================================================================
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value TEXT,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 13. تتبع سلوك المستخدم (User Behavior Tracking) - للذكاء الاصطناعي
-- ============================================================================
CREATE TABLE user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(100),                                -- معرف جلسة التصفح
    action_type VARCHAR(50) NOT NULL,                       -- view, click, search, purchase, booking
    entity_type VARCHAR(50),                                -- service, product, package, photographer
    entity_id UUID,
    metadata JSONB DEFAULT '{}',                            -- بيانات إضافية (search_query, page_url...)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 14. سجل النظام (System Logs) - NFR-AR4
-- ============================================================================
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20) NOT NULL DEFAULT 'info'
        CHECK (level IN ('debug', 'info', 'warning', 'error', 'critical')),
    source VARCHAR(100),                                    -- المصدر (payment, booking, auth...)
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 15. ألبومات الصور (Photo Albums) - FR-P5
-- لتنظيم الصور المرفوعة من المصورين بعد الجلسات
-- ============================================================================
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    photographer_id UUID NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
    title VARCHAR(200),
    description TEXT,
    is_delivered BOOLEAN NOT NULL DEFAULT FALSE,            -- هل تم تسليم الألبوم للعميل
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- صور الألبوم
CREATE TABLE album_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,                              -- المسار في Supabase Storage
    file_name VARCHAR(255),
    file_size_bytes BIGINT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 16. جداول pgvector للذكاء الاصطناعي والتوصيات - FR-C7, SR4
-- ============================================================================

-- متجهات تفضيلات المستخدم (User Preference Embeddings)
-- تُستخدم لمحرك التوصيات الذكية بناءً على سلوك العميل
CREATE TABLE user_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    embedding vector(1536),                                  -- OpenAI text-embedding-3-small
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- متجهات المنتجات والخدمات (Item Embeddings)
-- تُستخدم للبحث عن العناصر الأكثر تشابهاً مع اهتمامات العميل
CREATE TABLE item_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,                       -- 'product', 'service', 'package'
    entity_id UUID NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(entity_type, entity_id)
);

-- ============================================================================
-- 17. الفهارس (Indexes) - NFR-PE2
-- لضمان سرعة الاستعلامات على الأعمدة الأكثر استخداماً
-- ============================================================================

-- فهارس المنتجات
CREATE INDEX idx_products_name ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_price ON products (price);
CREATE INDEX idx_products_active ON products (is_active) WHERE is_active = TRUE;

-- فهارس الخدمات
CREATE INDEX idx_services_name ON services USING gin (name gin_trgm_ops);
CREATE INDEX idx_services_category ON services (category_id);
CREATE INDEX idx_services_price ON services (base_price);
CREATE INDEX idx_services_active ON services (is_active) WHERE is_active = TRUE;

-- فهارس الحجوزات
CREATE INDEX idx_bookings_client ON bookings (client_id);
CREATE INDEX idx_bookings_photographer ON bookings (photographer_id);
CREATE INDEX idx_bookings_date ON bookings (booking_date);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_photographer_date ON bookings (photographer_id, booking_date);

-- فهارس الطلبات
CREATE INDEX idx_orders_client ON orders (client_id);
CREATE INDEX idx_orders_status ON orders (status);

-- فهارس الفواتير
CREATE INDEX idx_invoices_client ON invoices (client_id);
CREATE INDEX idx_invoices_number ON invoices (invoice_number);

-- فهارس الإشعارات
CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_unread ON notifications (user_id, is_read) WHERE is_read = FALSE;

-- فهارس التقييمات
CREATE INDEX idx_reviews_photographer ON reviews (photographer_id);
CREATE INDEX idx_reviews_service ON reviews (service_id);

-- فهارس تتبع السلوك
CREATE INDEX idx_activity_user ON user_activity_logs (user_id);
CREATE INDEX idx_activity_type ON user_activity_logs (action_type);
CREATE INDEX idx_activity_entity ON user_activity_logs (entity_type, entity_id);

-- فهارس التذاكر
CREATE INDEX idx_tickets_user ON tickets (user_id);
CREATE INDEX idx_tickets_status ON tickets (status);

-- فهارس pgvector للبحث بالتشابه (Cosine Similarity)
CREATE INDEX idx_user_embeddings ON user_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_item_embeddings ON item_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- فهرس البحث النصي الكامل (Full Text Search) - FR-V3
ALTER TABLE services ADD COLUMN search_vector tsvector;
CREATE INDEX idx_services_search ON services USING gin (search_vector);

ALTER TABLE products ADD COLUMN search_vector tsvector;
CREATE INDEX idx_products_search ON products USING gin (search_vector);

-- فهرس Soft Delete للملفات الشخصية (لتصفية المستخدمين النشطين بسرعة)
CREATE INDEX idx_profiles_active ON profiles (deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- 18. الدوال (Functions) والـ RPC
-- ============================================================================

-- --------------------------------------------------------------------------
-- دالة: الحذف الآمن للمستخدم (Soft Delete) بدلاً من الحذف الفعلي
-- ⚠️ هذه الدالة تحافظ على جميع السجلات المالية والتاريخية
-- تقوم بـ: تعطيل الحساب + إخفاء البيانات الشخصية + الإبقاء على السجلات المالية
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION soft_delete_user(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- التحقق من وجود المستخدم
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND deleted_at IS NULL) THEN
        RETURN jsonb_build_object('success', FALSE, 'error', 'المستخدم غير موجود أو محذوف مسبقاً');
    END IF;

    -- تعطيل الحساب وإخفاء البيانات الشخصية (GDPR Compliance)
    UPDATE profiles
    SET deleted_at = NOW(),
        is_active = FALSE,
        full_name = 'مستخدم محذوف',
        phone = NULL,
        avatar_url = NULL,
        bio = NULL,
        address = NULL,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- إلغاء السلة المتروكة
    DELETE FROM cart_items WHERE user_id = p_user_id;

    -- تحديد الإشعارات كمقروءة
    UPDATE notifications SET is_read = TRUE WHERE user_id = p_user_id;

    RETURN jsonb_build_object(
        'success', TRUE,
        'message', 'تم حذف الحساب بنجاح مع الحفاظ على السجلات المالية والتاريخية'
    );
END;
$$;

-- --------------------------------------------------------------------------
-- دالة: التحقق من توفر المصور ومنع تداخل المواعيد (FR-C4, SR1)
-- تُستدعى عبر Supabase RPC قبل إنشاء أي حجز
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION check_photographer_availability(
    p_photographer_id UUID,
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_conflict_count INTEGER;
    v_unavailable_count INTEGER;
BEGIN
    -- التحقق من عدم وجود فترة عدم توفر
    SELECT COUNT(*) INTO v_unavailable_count
    FROM photographer_unavailability
    WHERE photographer_id = p_photographer_id
      AND unavailable_date = p_date
      AND (
          start_time IS NULL  -- اليوم كامل غير متاح
          OR (start_time < p_end_time AND end_time > p_start_time)  -- تداخل جزئي
      );

    IF v_unavailable_count > 0 THEN
        RETURN jsonb_build_object(
            'available', FALSE,
            'reason', 'photographer_unavailable',
            'message', 'المصور غير متاح في هذا التاريخ/الوقت'
        );
    END IF;

    -- التحقق من عدم وجود حجز متداخل
    SELECT COUNT(*) INTO v_conflict_count
    FROM bookings
    WHERE photographer_id = p_photographer_id
      AND booking_date = p_date
      AND status NOT IN ('cancelled', 'rejected')
      AND (id != COALESCE(p_exclude_booking_id, '00000000-0000-0000-0000-000000000000'))
      AND (start_time < p_end_time AND end_time > p_start_time);

    IF v_conflict_count > 0 THEN
        RETURN jsonb_build_object(
            'available', FALSE,
            'reason', 'time_conflict',
            'message', 'يوجد حجز آخر في نفس الفترة الزمنية'
        );
    END IF;

    RETURN jsonb_build_object(
        'available', TRUE,
        'reason', NULL,
        'message', 'المصور متاح في الفترة المطلوبة'
    );
END;
$$;

-- --------------------------------------------------------------------------
-- دالة: إنشاء حجز جديد مع التحقق الآلي (FR-C3 + FR-C4)
-- تُنفذ كمعاملة واحدة (Transaction) لضمان سلامة البيانات
-- ⚠️ الأمان: السعر يُحسب من السيرفر (Server-side) من جداول services/packages
-- ولا يُقبل كمدخل من الواجهة الأمامية لمنع التلاعب بالأسعار
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION create_booking(
    p_client_id UUID,
    p_photographer_id UUID,
    p_service_id UUID,
    p_package_id UUID,
    p_booking_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_location TEXT,
    p_client_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_availability JSONB;
    v_booking_id UUID;
    v_total_price NUMERIC(10,2) := 0;
    v_service_record RECORD;
    v_package_record RECORD;
BEGIN
    -- الخطوة 1: التحقق من وجود خدمة أو باقة
    IF p_service_id IS NULL AND p_package_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', 'يجب تحديد خدمة أو باقة للحجز'
        );
    END IF;

    -- الخطوة 2: حساب السعر من السيرفر (Server-side Price Calculation)
    -- ⚠️ السعر يُجلب مباشرة من قاعدة البيانات ولا يُقبل من العميل
    IF p_service_id IS NOT NULL THEN
        SELECT id, base_price, is_active INTO v_service_record
        FROM services
        WHERE id = p_service_id;

        IF NOT FOUND OR NOT v_service_record.is_active THEN
            RETURN jsonb_build_object(
                'success', FALSE,
                'error', 'الخدمة المحددة غير موجودة أو غير متاحة'
            );
        END IF;
        v_total_price := v_service_record.base_price;
    END IF;

    IF p_package_id IS NOT NULL THEN
        SELECT id, price, is_active INTO v_package_record
        FROM packages
        WHERE id = p_package_id;

        IF NOT FOUND OR NOT v_package_record.is_active THEN
            RETURN jsonb_build_object(
                'success', FALSE,
                'error', 'الباقة المحددة غير موجودة أو غير متاحة'
            );
        END IF;
        -- إذا تم تحديد باقة، يُستخدم سعر الباقة (يتضمن خصماً عادة)
        -- إذا تم تحديد خدمة وباقة معاً، سعر الباقة له الأولوية
        v_total_price := v_package_record.price;
    END IF;

    -- الخطوة 3: التحقق من التوفر
    v_availability := check_photographer_availability(
        p_photographer_id, p_booking_date, p_start_time, p_end_time
    );

    IF NOT (v_availability->>'available')::BOOLEAN THEN
        RETURN jsonb_build_object(
            'success', FALSE,
            'error', v_availability->>'message'
        );
    END IF;

    -- الخطوة 4: إنشاء الحجز بالسعر المحسوب من السيرفر
    INSERT INTO bookings (
        client_id, photographer_id, service_id, package_id,
        booking_date, start_time, end_time, location,
        client_notes, total_price, status
    ) VALUES (
        p_client_id, p_photographer_id, p_service_id, p_package_id,
        p_booking_date, p_start_time, p_end_time, p_location,
        p_client_notes, v_total_price, 'pending'
    ) RETURNING id INTO v_booking_id;

    -- الخطوة 5: إرسال إشعار للمصور
    INSERT INTO notifications (user_id, title, body, type, reference_id, reference_type)
    VALUES
        (p_photographer_id, 'حجز جديد', 'تم إسناد جلسة تصوير جديدة إليك', 'assignment', v_booking_id, 'booking');

    RETURN jsonb_build_object(
        'success', TRUE,
        'booking_id', v_booking_id,
        'total_price', v_total_price,
        'message', 'تم إنشاء الحجز بنجاح'
    );
END;
$$;

-- --------------------------------------------------------------------------
-- دالة: إتمام طلب شراء مع خصم المخزون (SR5, NFR-AR3)
-- معاملة واحدة: خصم المخزون + تسجيل الطلب + إصدار الفاتورة
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION complete_order(
    p_client_id UUID,
    p_items JSONB,            -- [{"product_id": "...", "quantity": 2}, ...]
    p_shipping_address TEXT,
    p_payment_method VARCHAR(50),
    p_stripe_payment_intent_id VARCHAR(255)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_total NUMERIC(10,2) := 0;
    v_item JSONB;
    v_product RECORD;
    v_invoice_number VARCHAR(50);
BEGIN
    -- التحقق من توفر المخزون لكل عنصر
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT id, name, price, stock_quantity INTO v_product
        FROM products
        WHERE id = (v_item->>'product_id')::UUID
          AND is_active = TRUE
        FOR UPDATE;  -- قفل الصف لمنع التحديث المتزامن

        IF NOT FOUND THEN
            RAISE EXCEPTION 'المنتج غير موجود أو غير متاح: %', v_item->>'product_id';
        END IF;

        IF v_product.stock_quantity < (v_item->>'quantity')::INTEGER THEN
            RAISE EXCEPTION 'الكمية المطلوبة من "%" غير متوفرة في المخزون. المتوفر: %',
                v_product.name, v_product.stock_quantity;
        END IF;

        v_total := v_total + (v_product.price * (v_item->>'quantity')::INTEGER);
    END LOOP;

    -- إنشاء الطلب
    INSERT INTO orders (client_id, total_amount, shipping_address, payment_method, payment_status, stripe_payment_intent_id)
    VALUES (p_client_id, v_total, p_shipping_address, p_payment_method, 'paid', p_stripe_payment_intent_id)
    RETURNING id INTO v_order_id;

    -- إدراج عناصر الطلب وخصم المخزون
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        SELECT price INTO v_product FROM products WHERE id = (v_item->>'product_id')::UUID;

        INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
        VALUES (
            v_order_id,
            (v_item->>'product_id')::UUID,
            (v_item->>'quantity')::INTEGER,
            v_product.price,
            v_product.price * (v_item->>'quantity')::INTEGER
        );

        -- خصم المخزون
        UPDATE products
        SET stock_quantity = stock_quantity - (v_item->>'quantity')::INTEGER,
            updated_at = NOW()
        WHERE id = (v_item->>'product_id')::UUID;
    END LOOP;

    -- إصدار فاتورة
    v_invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(v_order_id::TEXT, 1, 8);
    INSERT INTO invoices (invoice_number, client_id, order_id, amount, total_amount, status, payment_method, payment_date)
    VALUES (v_invoice_number, p_client_id, v_order_id, v_total, v_total, 'paid', p_payment_method, NOW());

    RETURN jsonb_build_object(
        'success', TRUE,
        'order_id', v_order_id,
        'invoice_number', v_invoice_number,
        'total', v_total,
        'message', 'تم إتمام الطلب بنجاح'
    );
END;
$$;

-- --------------------------------------------------------------------------
-- دالة: البحث المتقدم (FR-V3) - Supabase Postgres Search
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION search_catalog(
    p_query TEXT,
    p_type VARCHAR(20) DEFAULT 'all'  -- 'all', 'services', 'products', 'packages'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_results JSONB := '[]'::JSONB;
    v_services JSONB;
    v_products JSONB;
    v_packages JSONB;
    v_ts_query tsquery;
BEGIN
    v_ts_query := plainto_tsquery('simple', p_query);

    -- البحث في الخدمات
    IF p_type IN ('all', 'services') THEN
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'id', s.id, 'type', 'service', 'name', s.name,
            'description', s.description, 'price', s.base_price,
            'image', s.cover_image_url
        )), '[]'::JSONB)
        INTO v_services
        FROM services s
        WHERE s.is_active = TRUE
          AND (s.search_vector @@ v_ts_query
               OR s.name ILIKE '%' || p_query || '%'
               OR s.description ILIKE '%' || p_query || '%');

        v_results := v_results || v_services;
    END IF;

    -- البحث في المنتجات
    IF p_type IN ('all', 'products') THEN
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'id', p.id, 'type', 'product', 'name', p.name,
            'description', p.description, 'price', p.price,
            'image', p.cover_image_url, 'stock', p.stock_quantity
        )), '[]'::JSONB)
        INTO v_products
        FROM products p
        WHERE p.is_active = TRUE
          AND (p.search_vector @@ v_ts_query
               OR p.name ILIKE '%' || p_query || '%'
               OR p.description ILIKE '%' || p_query || '%');

        v_results := v_results || v_products;
    END IF;

    -- البحث في الباقات
    IF p_type IN ('all', 'packages') THEN
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'id', pk.id, 'type', 'package', 'name', pk.name,
            'description', pk.description, 'price', pk.price,
            'image', pk.cover_image_url
        )), '[]'::JSONB)
        INTO v_packages
        FROM packages pk
        WHERE pk.is_active = TRUE
          AND (pk.name ILIKE '%' || p_query || '%'
               OR pk.description ILIKE '%' || p_query || '%');

        v_results := v_results || v_packages;
    END IF;

    RETURN jsonb_build_object('results', v_results, 'count', jsonb_array_length(v_results));
END;
$$;

-- --------------------------------------------------------------------------
-- دالة: جلب التوصيات الذكية بناءً على pgvector (FR-C7, SR4)
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_ai_recommendations(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_embedding vector(1536);
    v_results JSONB;
BEGIN
    -- جلب متجه تفضيلات المستخدم
    SELECT embedding INTO v_user_embedding
    FROM user_embeddings
    WHERE user_id = p_user_id;

    IF v_user_embedding IS NULL THEN
        -- إذا لم يكن لدى المستخدم متجه، أرجع المنتجات الأكثر مبيعاً
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
            'entity_type', 'product', 'entity_id', p.id,
            'name', p.name, 'price', p.price, 'image', p.cover_image_url
        )), '[]'::JSONB)
        INTO v_results
        FROM products p
        WHERE p.is_active = TRUE
        ORDER BY p.created_at DESC
        LIMIT p_limit;

        RETURN jsonb_build_object('recommendations', v_results, 'source', 'popular');
    END IF;

    -- البحث بالتشابه (Cosine Similarity)
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'entity_type', ie.entity_type,
        'entity_id', ie.entity_id,
        'similarity', 1 - (ie.embedding <=> v_user_embedding),
        'metadata', ie.metadata
    )), '[]'::JSONB)
    INTO v_results
    FROM item_embeddings ie
    ORDER BY ie.embedding <=> v_user_embedding
    LIMIT p_limit;

    RETURN jsonb_build_object('recommendations', v_results, 'source', 'ai_similarity');
END;
$$;

-- --------------------------------------------------------------------------
-- دالة: الجدولة الذكية (FR-A8) - توزيع الحجوزات على المصورين
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION smart_assign_photographer(
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_specialty VARCHAR(100) DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_photographer RECORD;
    v_result JSONB;
BEGIN
    -- اختيار المصور الأقل حجوزات في ذلك اليوم (Load Balancing)
    SELECT ph.id, p.full_name, ph.average_rating, ph.specialty,
           COUNT(b.id) AS booking_count
    INTO v_photographer
    FROM photographers ph
    JOIN profiles p ON p.id = ph.id
    LEFT JOIN bookings b ON b.photographer_id = ph.id
        AND b.booking_date = p_date
        AND b.status NOT IN ('cancelled', 'rejected')
    WHERE ph.is_available = TRUE
      AND (p_specialty IS NULL OR ph.specialty ILIKE '%' || p_specialty || '%')
      AND NOT EXISTS (
          SELECT 1 FROM photographer_unavailability pu
          WHERE pu.photographer_id = ph.id
            AND pu.unavailable_date = p_date
      )
      AND NOT EXISTS (
          SELECT 1 FROM bookings eb
          WHERE eb.photographer_id = ph.id
            AND eb.booking_date = p_date
            AND eb.status NOT IN ('cancelled', 'rejected')
            AND eb.start_time < p_end_time
            AND eb.end_time > p_start_time
      )
    GROUP BY ph.id, p.full_name, ph.average_rating, ph.specialty
    ORDER BY booking_count ASC, ph.average_rating DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'found', FALSE,
            'message', 'لا يوجد مصور متاح في الفترة المطلوبة'
        );
    END IF;

    RETURN jsonb_build_object(
        'found', TRUE,
        'photographer_id', v_photographer.id,
        'name', v_photographer.full_name,
        'rating', v_photographer.average_rating,
        'specialty', v_photographer.specialty,
        'current_bookings', v_photographer.booking_count
    );
END;
$$;

-- --------------------------------------------------------------------------
-- دالة: إحصائيات لوحة التحكم (FR-A6) - SQL View بديل
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats(
    p_start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_bookings', (SELECT COUNT(*) FROM bookings WHERE created_at::DATE BETWEEN p_start_date AND p_end_date),
        'confirmed_bookings', (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed' AND created_at::DATE BETWEEN p_start_date AND p_end_date),
        'completed_bookings', (SELECT COUNT(*) FROM bookings WHERE status = 'completed' AND created_at::DATE BETWEEN p_start_date AND p_end_date),
        'total_orders', (SELECT COUNT(*) FROM orders WHERE created_at::DATE BETWEEN p_start_date AND p_end_date),
        'total_revenue_bookings', (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status IN ('confirmed', 'completed') AND created_at::DATE BETWEEN p_start_date AND p_end_date),
        'total_revenue_orders', (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid' AND created_at::DATE BETWEEN p_start_date AND p_end_date),
        'new_clients', (SELECT COUNT(*) FROM profiles WHERE created_at::DATE BETWEEN p_start_date AND p_end_date),
        'avg_rating', (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE created_at::DATE BETWEEN p_start_date AND p_end_date),
        'open_tickets', (SELECT COUNT(*) FROM tickets WHERE status IN ('open', 'in_progress')),
        'low_stock_products', (SELECT COUNT(*) FROM products WHERE stock_quantity < 5 AND is_active = TRUE)
    ) INTO v_stats;

    RETURN v_stats;
END;
$$;

-- ============================================================================
-- 19. التريجرات (Triggers)
-- ============================================================================

-- --------------------------------------------------------------------------
-- تريجر: تحديث متوسط تقييم المصور آلياً عند إضافة تقييم جديد (FR-C9)
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_photographer_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE photographers
    SET average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM reviews
            WHERE photographer_id = COALESCE(NEW.photographer_id, OLD.photographer_id)
              AND is_visible = TRUE
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM reviews
            WHERE photographer_id = COALESCE(NEW.photographer_id, OLD.photographer_id)
              AND is_visible = TRUE
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.photographer_id, OLD.photographer_id);

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_update_photographer_rating_insert
    AFTER INSERT ON reviews
    FOR EACH ROW
    WHEN (NEW.photographer_id IS NOT NULL)
    EXECUTE FUNCTION update_photographer_rating();

CREATE TRIGGER trg_update_photographer_rating_update
    AFTER UPDATE ON reviews
    FOR EACH ROW
    WHEN (NEW.photographer_id IS NOT NULL)
    EXECUTE FUNCTION update_photographer_rating();

CREATE TRIGGER trg_update_photographer_rating_delete
    AFTER DELETE ON reviews
    FOR EACH ROW
    WHEN (OLD.photographer_id IS NOT NULL)
    EXECUTE FUNCTION update_photographer_rating();

-- --------------------------------------------------------------------------
-- تريجر: تحديث search_vector للخدمات والمنتجات آلياً (FR-V3)
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_services_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.search_vector := to_tsvector('simple', COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.description, ''));
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_services_search_vector
    BEFORE INSERT OR UPDATE OF name, description ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_services_search_vector();

CREATE OR REPLACE FUNCTION update_products_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.search_vector := to_tsvector('simple', COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.description, ''));
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_products_search_vector
    BEFORE INSERT OR UPDATE OF name, description ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_search_vector();

-- --------------------------------------------------------------------------
-- تريجر: تحديث updated_at آلياً عند تعديل أي صف
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- تطبيق تريجر updated_at على جميع الجداول ذات العمود
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_photographers_updated_at BEFORE UPDATE ON photographers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_albums_updated_at BEFORE UPDATE ON albums FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------------
-- تريجر: إرسال إشعار عند تغيير حالة الحجز (SR7, FR-P6)
-- يعمل مع Supabase Realtime لتنبيه المصور والعميل لحظياً
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION notify_booking_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_title TEXT;
    v_body TEXT;
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        CASE NEW.status
            WHEN 'confirmed' THEN
                v_title := 'تم تأكيد الحجز';
                v_body := 'تم تأكيد حجزك بتاريخ ' || NEW.booking_date::TEXT;
            WHEN 'in_progress' THEN
                v_title := 'الجلسة قيد التنفيذ';
                v_body := 'جلسة التصوير بدأت الآن';
            WHEN 'completed' THEN
                v_title := 'تم إتمام الجلسة';
                v_body := 'تم إتمام جلسة التصوير بنجاح. يمكنك تقييم الخدمة الآن.';
                NEW.completed_at := NOW();
            WHEN 'cancelled' THEN
                v_title := 'تم إلغاء الحجز';
                v_body := 'تم إلغاء الحجز بتاريخ ' || NEW.booking_date::TEXT;
            WHEN 'rejected' THEN
                v_title := 'تم رفض الحجز';
                v_body := 'تم رفض طلب الحجز. يرجى التواصل مع الإدارة.';
            ELSE
                v_title := 'تحديث حالة الحجز';
                v_body := 'تم تحديث حالة حجزك إلى: ' || NEW.status;
        END CASE;

        -- إشعار العميل
        INSERT INTO notifications (user_id, title, body, type, reference_id, reference_type)
        VALUES (NEW.client_id, v_title, v_body, 'booking', NEW.id, 'booking');

        -- إشعار المصور (إن وجد)
        IF NEW.photographer_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, title, body, type, reference_id, reference_type)
            VALUES (NEW.photographer_id, v_title, v_body, 'booking', NEW.id, 'booking');
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_booking_status_notification
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION notify_booking_status_change();

-- --------------------------------------------------------------------------
-- تريجر: إنشاء ملف شخصي تلقائياً عند تسجيل مستخدم جديد
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_client_role_id UUID;
    v_current_metadata JSONB;
BEGIN
    -- إنشاء الملف الشخصي
    INSERT INTO profiles (id, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد')
    );

    -- تعيين دور "عميل" افتراضياً
    SELECT id INTO v_client_role_id FROM roles WHERE name = 'client';
    IF v_client_role_id IS NOT NULL THEN
        INSERT INTO user_roles (user_id, role_id)
        VALUES (NEW.id, v_client_role_id);
    END IF;

    -- ⚡ مزامنة الدور مع app_metadata لدعم JWT Claims
    -- يضمن أن الـ Custom Access Token Hook يقرأ الدور الصحيح فوراً
    v_current_metadata := COALESCE(NEW.raw_app_meta_data, '{}'::JSONB);
    UPDATE auth.users
    SET raw_app_meta_data = v_current_metadata || jsonb_build_object('user_role', 'client')
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- --------------------------------------------------------------------------
-- تريجر: تحديث المخزون عند تغيير حالة الطلب إلى "ملغى" (إعادة المخزون)
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_order_cancellation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
        -- إعادة المخزون
        UPDATE products p
        SET stock_quantity = p.stock_quantity + oi.quantity,
            updated_at = NOW()
        FROM order_items oi
        WHERE oi.order_id = NEW.id
          AND p.id = oi.product_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_order_cancellation_restock
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_order_cancellation();

-- ============================================================================
-- 20. SQL Views للتقارير (FR-A6)
-- ============================================================================

-- عرض: ملخص الإيرادات اليومية
CREATE OR REPLACE VIEW v_daily_revenue AS
SELECT
    d.date,
    COALESCE(b.booking_revenue, 0) AS booking_revenue,
    COALESCE(o.order_revenue, 0) AS order_revenue,
    COALESCE(b.booking_revenue, 0) + COALESCE(o.order_revenue, 0) AS total_revenue
FROM generate_series(
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE,
    '1 day'::INTERVAL
) AS d(date)
LEFT JOIN (
    SELECT booking_date AS date, SUM(total_price) AS booking_revenue
    FROM bookings WHERE status IN ('confirmed', 'completed')
    GROUP BY booking_date
) b ON d.date = b.date
LEFT JOIN (
    SELECT created_at::DATE AS date, SUM(total_amount) AS order_revenue
    FROM orders WHERE payment_status = 'paid'
    GROUP BY created_at::DATE
) o ON d.date = o.date
ORDER BY d.date DESC;

-- عرض: أداء المصورين
CREATE OR REPLACE VIEW v_photographer_performance AS
SELECT
    ph.id AS photographer_id,
    p.full_name,
    ph.specialty,
    ph.average_rating,
    ph.total_reviews,
    COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed') AS completed_sessions,
    COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'cancelled') AS cancelled_sessions,
    COALESCE(SUM(b.total_price) FILTER (WHERE b.status IN ('confirmed', 'completed')), 0) AS total_revenue
FROM photographers ph
JOIN profiles p ON p.id = ph.id
LEFT JOIN bookings b ON b.photographer_id = ph.id
GROUP BY ph.id, p.full_name, ph.specialty, ph.average_rating, ph.total_reviews;

-- عرض: المنتجات منخفضة المخزون
CREATE OR REPLACE VIEW v_low_stock_products AS
SELECT id, name, sku, stock_quantity, price, category_id
FROM products
WHERE is_active = TRUE AND stock_quantity < 5
ORDER BY stock_quantity ASC;

-- ============================================================================
-- 21. Row Level Security (RLS)
-- ============================================================================

-- ============================================================================
-- 21.1 JWT Claims-Based Role Verification (تحسين أداء RLS)
-- ============================================================================
-- ⚡ الاستراتيجية: بدلاً من استعلام جدول user_roles في كل فحص RLS لكل صف،
-- يتم تخزين دور المستخدم في app_metadata داخل الـ JWT Token.
-- هذا يجعل التحقق من الدور فوري O(1) بدون أي استعلام إضافي.
--
-- المكونات:
-- 1. custom_access_token_hook: يُحقن الدور في JWT عند كل تسجيل دخول/تجديد Token
-- 2. auth_has_role: يقرأ الدور من JWT مباشرة (لا استعلام DB)
-- 3. sync_user_role_to_metadata: يُحدّث app_metadata عند تغيير الدور في user_roles
-- 4. handle_new_user المُحدّثة: تُعيّن الدور في app_metadata عند التسجيل
-- ============================================================================

-- --------------------------------------------------------------------------
-- دالة: Custom Access Token Hook
-- تُستدعى تلقائياً من Supabase Auth عند إصدار/تجديد JWT Token
-- تُحقن user_role في claims ليتم قراءتها بـ auth.jwt() في سياسات RLS
-- --------------------------------------------------------------------------
-- ⚠️ إعداد مطلوب في Supabase Dashboard:
--   Authentication > Hooks > Custom Access Token (JWT)
--   Schema: public | Function: custom_access_token_hook
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    claims JSONB;
    v_user_role TEXT;
    v_user_id UUID;
BEGIN
    -- استخراج معرف المستخدم من الحدث
    v_user_id := (event->>'user_id')::UUID;

    -- جلب الدور الأساسي للمستخدم من جدول user_roles
    -- (في حالة وجود أدوار متعددة، يتم اختيار الدور الأعلى أولوية)
    SELECT r.name INTO v_user_role
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_user_id
    ORDER BY
        CASE r.name
            WHEN 'admin' THEN 1
            WHEN 'photographer' THEN 2
            WHEN 'client' THEN 3
            WHEN 'visitor' THEN 4
            ELSE 5
        END
    LIMIT 1;

    -- القيمة الافتراضية إذا لم يُعثر على دور
    v_user_role := COALESCE(v_user_role, 'client');

    -- استخراج الـ claims الحالية من الحدث
    claims := event->'claims';

    -- حقن الدور في app_metadata داخل الـ JWT
    IF claims->'app_metadata' IS NULL THEN
        claims := jsonb_set(claims, '{app_metadata}', jsonb_build_object('user_role', v_user_role));
    ELSE
        claims := jsonb_set(claims, '{app_metadata, user_role}', to_jsonb(v_user_role));
    END IF;

    -- إرجاع الحدث مع الـ claims المُحدّثة
    event := jsonb_set(event, '{claims}', claims);
    RETURN event;
END;
$$;

-- منح صلاحية تنفيذ الدالة لـ supabase_auth_admin (مطلوب للـ Hook)
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION custom_access_token_hook TO supabase_auth_admin;

-- --------------------------------------------------------------------------
-- دالة مساعدة: التحقق من دور المستخدم الحالي (JWT-Based)
-- ⚡ الأداء: O(1) - قراءة مباشرة من JWT بدون استعلام DB
-- Fallback: إذا لم يكن الدور في JWT، يتم الاستعلام من الجدول (أمان إضافي)
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION auth_has_role(p_role_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    v_jwt_role TEXT;
BEGIN
    -- المسار السريع: قراءة الدور من JWT Claims (O(1))
    v_jwt_role := (auth.jwt() -> 'app_metadata' ->> 'user_role');

    IF v_jwt_role IS NOT NULL THEN
        RETURN v_jwt_role = p_role_name;
    END IF;

    -- Fallback: استعلام الجدول في حالة عدم وجود الدور في JWT
    -- (يحدث فقط في الجلسات القديمة قبل تفعيل الـ Hook، أو عند مشاكل تقنية)
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = auth.uid()
          AND r.name = p_role_name
    );
END;
$$;

-- دالة مساعدة: الحصول على معرف المستخدم الحالي
CREATE OR REPLACE FUNCTION auth_uid()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
    SELECT auth.uid();
$$;

-- --------------------------------------------------------------------------
-- دالة: مزامنة الدور مع app_metadata عند تغيير user_roles
-- تضمن أن الـ JWT يحتوي دائماً على أحدث دور عند التجديد التالي
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sync_user_role_to_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_new_role TEXT;
    v_current_metadata JSONB;
BEGIN
    -- تحديد المستخدم المتأثر (INSERT/UPDATE أو DELETE)
    v_user_id := COALESCE(NEW.user_id, OLD.user_id);

    -- جلب الدور الأعلى أولوية للمستخدم
    SELECT r.name INTO v_new_role
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = v_user_id
    ORDER BY
        CASE r.name
            WHEN 'admin' THEN 1
            WHEN 'photographer' THEN 2
            WHEN 'client' THEN 3
            WHEN 'visitor' THEN 4
            ELSE 5
        END
    LIMIT 1;

    -- القيمة الافتراضية
    v_new_role := COALESCE(v_new_role, 'client');

    -- جلب الـ metadata الحالية
    SELECT COALESCE(raw_app_meta_data, '{}'::JSONB)
    INTO v_current_metadata
    FROM auth.users
    WHERE id = v_user_id;

    -- تحديث app_metadata في auth.users
    -- هذا يضمن أن الـ Hook يقرأ الدور الصحيح في الجلسة التالية
    UPDATE auth.users
    SET raw_app_meta_data = v_current_metadata || jsonb_build_object('user_role', v_new_role)
    WHERE id = v_user_id;

    RETURN COALESCE(NEW, OLD);
END;
$$;

-- تريجر: مزامنة الدور عند أي تغيير في user_roles
CREATE TRIGGER trg_sync_role_metadata_insert
    AFTER INSERT ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_role_to_metadata();

CREATE TRIGGER trg_sync_role_metadata_update
    AFTER UPDATE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_role_to_metadata();

CREATE TRIGGER trg_sync_role_metadata_delete
    AFTER DELETE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_role_to_metadata();

-- ========== تفعيل RLS على جميع الجداول ==========

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE photographers ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE photographer_unavailability ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_embeddings ENABLE ROW LEVEL SECURITY;

-- ========== سياسات RLS ==========

-- ---------- profiles ----------
-- الجميع يمكنهم قراءة الملفات الشخصية العامة
CREATE POLICY "profiles_select_public" ON profiles
    FOR SELECT USING (TRUE);

-- المستخدم يعدل ملفه الشخصي فقط
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- المدير يعدل أي ملف
CREATE POLICY "profiles_update_admin" ON profiles
    FOR UPDATE USING (auth_has_role('admin'));

-- ---------- photographers ----------
-- الجميع يمكنهم قراءة بيانات المصورين (FR-V4)
CREATE POLICY "photographers_select_public" ON photographers
    FOR SELECT USING (TRUE);

-- المصور يعدل بياناته فقط
CREATE POLICY "photographers_update_own" ON photographers
    FOR UPDATE USING (auth.uid() = id);

-- المدير يتحكم بالكامل
CREATE POLICY "photographers_admin_all" ON photographers
    FOR ALL USING (auth_has_role('admin'));

-- ---------- roles, permissions, role_permissions ----------
-- القراءة للجميع (لتحديد الصلاحيات في الواجهة)
CREATE POLICY "roles_select_all" ON roles FOR SELECT USING (TRUE);
CREATE POLICY "permissions_select_all" ON permissions FOR SELECT USING (TRUE);
CREATE POLICY "role_permissions_select_all" ON role_permissions FOR SELECT USING (TRUE);

-- الكتابة للمدير فقط (FR-A11)
CREATE POLICY "roles_admin_write" ON roles FOR ALL USING (auth_has_role('admin'));
CREATE POLICY "permissions_admin_write" ON permissions FOR ALL USING (auth_has_role('admin'));
CREATE POLICY "role_permissions_admin_write" ON role_permissions FOR ALL USING (auth_has_role('admin'));

-- ---------- user_roles ----------
-- المستخدم يقرأ أدواره فقط
CREATE POLICY "user_roles_select_own" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- المدير يقرأ ويعدل الجميع (FR-A5, FR-A11)
CREATE POLICY "user_roles_admin_all" ON user_roles
    FOR ALL USING (auth_has_role('admin'));

-- ---------- service_categories, services, packages, package_services ----------
-- القراءة العامة (FR-V1) - الزوار والجميع
CREATE POLICY "service_categories_select_public" ON service_categories FOR SELECT USING (TRUE);
CREATE POLICY "services_select_public" ON services FOR SELECT USING (TRUE);
CREATE POLICY "packages_select_public" ON packages FOR SELECT USING (TRUE);
CREATE POLICY "package_services_select_public" ON package_services FOR SELECT USING (TRUE);

-- الكتابة للمدير فقط (FR-A3)
CREATE POLICY "service_categories_admin_write" ON service_categories FOR ALL USING (auth_has_role('admin'));
CREATE POLICY "services_admin_write" ON services FOR ALL USING (auth_has_role('admin'));
CREATE POLICY "packages_admin_write" ON packages FOR ALL USING (auth_has_role('admin'));
CREATE POLICY "package_services_admin_write" ON package_services FOR ALL USING (auth_has_role('admin'));

-- ---------- product_categories, products, product_images ----------
-- القراءة العامة (FR-V2)
CREATE POLICY "product_categories_select_public" ON product_categories FOR SELECT USING (TRUE);
CREATE POLICY "products_select_public" ON products FOR SELECT USING (TRUE);
CREATE POLICY "product_images_select_public" ON product_images FOR SELECT USING (TRUE);

-- الكتابة للمدير فقط (FR-A4)
CREATE POLICY "product_categories_admin_write" ON product_categories FOR ALL USING (auth_has_role('admin'));
CREATE POLICY "products_admin_write" ON products FOR ALL USING (auth_has_role('admin'));
CREATE POLICY "product_images_admin_write" ON product_images FOR ALL USING (auth_has_role('admin'));

-- ---------- bookings ----------
-- العميل يقرأ حجوزاته فقط (FR-C8)
CREATE POLICY "bookings_select_client" ON bookings
    FOR SELECT USING (auth.uid() = client_id);

-- المصور يقرأ الحجوزات المسندة إليه فقط (FR-P2, FR-P3)
CREATE POLICY "bookings_select_photographer" ON bookings
    FOR SELECT USING (auth.uid() = photographer_id);

-- المدير يقرأ جميع الحجوزات (FR-A2)
CREATE POLICY "bookings_select_admin" ON bookings
    FOR SELECT USING (auth_has_role('admin'));

-- العميل ينشئ حجوزات جديدة (FR-C3)
CREATE POLICY "bookings_insert_client" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = client_id AND auth_has_role('client'));

-- المصور يحدث حالة الحجز (FR-P4) - فقط الحقول المسموحة
CREATE POLICY "bookings_update_photographer" ON bookings
    FOR UPDATE USING (auth.uid() = photographer_id AND auth_has_role('photographer'));

-- المدير يحدث أي حجز (FR-A2)
CREATE POLICY "bookings_update_admin" ON bookings
    FOR UPDATE USING (auth_has_role('admin'));

-- ---------- photographer_unavailability ----------
-- المصور يدير فترات عدم توفره
CREATE POLICY "unavailability_photographer_own" ON photographer_unavailability
    FOR ALL USING (auth.uid() = photographer_id);

-- المدير يدير فترات عدم توفر أي مصور
CREATE POLICY "unavailability_admin_all" ON photographer_unavailability
    FOR ALL USING (auth_has_role('admin'));

-- ---------- cart_items ----------
-- المستخدم يدير سلته فقط (FR-C5)
CREATE POLICY "cart_own" ON cart_items
    FOR ALL USING (auth.uid() = user_id);

-- ---------- orders ----------
-- العميل يقرأ طلباته فقط (FR-C8)
CREATE POLICY "orders_select_client" ON orders
    FOR SELECT USING (auth.uid() = client_id);

-- العميل ينشئ طلبات (FR-C5, FR-C6)
CREATE POLICY "orders_insert_client" ON orders
    FOR INSERT WITH CHECK (auth.uid() = client_id AND auth_has_role('client'));

-- المدير يقرأ ويحدث جميع الطلبات
CREATE POLICY "orders_admin_all" ON orders
    FOR ALL USING (auth_has_role('admin'));

-- ---------- order_items ----------
-- العميل يقرأ عناصر طلباته
CREATE POLICY "order_items_select_client" ON order_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND o.client_id = auth.uid())
    );

-- المدير يقرأ الجميع
CREATE POLICY "order_items_admin_all" ON order_items
    FOR ALL USING (auth_has_role('admin'));

-- ---------- invoices ----------
-- العميل يقرأ فواتيره فقط (FR-C6, FR-C11)
CREATE POLICY "invoices_select_client" ON invoices
    FOR SELECT USING (auth.uid() = client_id);

-- المدير يتحكم بالكامل
CREATE POLICY "invoices_admin_all" ON invoices
    FOR ALL USING (auth_has_role('admin'));

-- ---------- reviews ----------
-- القراءة العامة (لعرض التقييمات في الصفحات)
CREATE POLICY "reviews_select_public" ON reviews
    FOR SELECT USING (is_visible = TRUE);

-- المدير يقرأ جميع التقييمات (بما فيها المخفية)
CREATE POLICY "reviews_select_admin" ON reviews
    FOR SELECT USING (auth_has_role('admin'));

-- العميل يضيف تقييماً (FR-C9) - فقط للحجوزات المكتملة
CREATE POLICY "reviews_insert_client" ON reviews
    FOR INSERT WITH CHECK (
        auth.uid() = client_id
        AND auth_has_role('client')
        AND EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.id = booking_id
              AND b.client_id = auth.uid()
              AND b.status = 'completed'
        )
    );

-- العميل يعدل تقييمه فقط
CREATE POLICY "reviews_update_own" ON reviews
    FOR UPDATE USING (auth.uid() = client_id);

-- المدير يتحكم بالتقييمات (إخفاء/حذف)
CREATE POLICY "reviews_admin_all" ON reviews
    FOR ALL USING (auth_has_role('admin'));

-- ---------- tickets ----------
-- المستخدم يقرأ تذاكره فقط (FR-A7 من جهة العميل)
CREATE POLICY "tickets_select_own" ON tickets
    FOR SELECT USING (auth.uid() = user_id);

-- المستخدم ينشئ تذكرة
CREATE POLICY "tickets_insert_own" ON tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- المدير يتحكم بالكامل (FR-A7)
CREATE POLICY "tickets_admin_all" ON tickets
    FOR ALL USING (auth_has_role('admin'));

-- ---------- ticket_replies ----------
-- قراءة الردود لمالك التذكرة أو المدير
CREATE POLICY "ticket_replies_select" ON ticket_replies
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR auth_has_role('admin')))
    );

-- إنشاء رد (المستخدم على تذاكره أو المدير)
CREATE POLICY "ticket_replies_insert" ON ticket_replies
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR auth_has_role('admin')))
        AND auth.uid() = user_id
    );

-- ---------- notifications ----------
-- المستخدم يقرأ إشعاراته فقط (FR-P6)
CREATE POLICY "notifications_select_own" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- المستخدم يحدث إشعاراته (مثل تحديد كمقروء)
CREATE POLICY "notifications_update_own" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- المدير يرسل إشعارات
CREATE POLICY "notifications_admin_insert" ON notifications
    FOR INSERT WITH CHECK (auth_has_role('admin'));

-- النظام يرسل إشعارات (عبر service_role)
-- يتم التعامل مع هذا عبر SECURITY DEFINER في الدوال

-- ---------- system_settings ----------
-- القراءة العامة (لعرض المحتوى الديناميكي)
CREATE POLICY "settings_select_public" ON system_settings
    FOR SELECT USING (TRUE);

-- الكتابة للمدير فقط (FR-A9)
CREATE POLICY "settings_admin_write" ON system_settings
    FOR ALL USING (auth_has_role('admin'));

-- ---------- user_activity_logs ----------
-- المستخدم يقرأ سجله فقط
CREATE POLICY "activity_select_own" ON user_activity_logs
    FOR SELECT USING (auth.uid() = user_id);

-- المدير يقرأ الجميع
CREATE POLICY "activity_admin_select" ON user_activity_logs
    FOR SELECT USING (auth_has_role('admin'));

-- أي مستخدم مسجل يضيف نشاطاً
CREATE POLICY "activity_insert_auth" ON user_activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---------- system_logs ----------
-- المدير فقط (NFR-AR4)
CREATE POLICY "system_logs_admin_all" ON system_logs
    FOR ALL USING (auth_has_role('admin'));

-- ---------- albums ----------
-- المصور يدير ألبوماته (FR-P5)
CREATE POLICY "albums_photographer_own" ON albums
    FOR ALL USING (auth.uid() = photographer_id);

-- العميل يقرأ ألبومات حجوزاته
CREATE POLICY "albums_client_select" ON albums
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_id AND b.client_id = auth.uid())
    );

-- المدير يتحكم بالكامل
CREATE POLICY "albums_admin_all" ON albums
    FOR ALL USING (auth_has_role('admin'));

-- ---------- album_photos ----------
-- نفس سياسات الألبومات
CREATE POLICY "album_photos_photographer" ON album_photos
    FOR ALL USING (
        EXISTS (SELECT 1 FROM albums a WHERE a.id = album_id AND a.photographer_id = auth.uid())
    );

CREATE POLICY "album_photos_client_select" ON album_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM albums a
            JOIN bookings b ON b.id = a.booking_id
            WHERE a.id = album_id AND b.client_id = auth.uid()
        )
    );

CREATE POLICY "album_photos_admin_all" ON album_photos
    FOR ALL USING (auth_has_role('admin'));

-- ---------- user_embeddings ----------
-- المستخدم يقرأ متجهاته فقط
CREATE POLICY "user_embeddings_select_own" ON user_embeddings
    FOR SELECT USING (auth.uid() = user_id);

-- المدير يقرأ الجميع
CREATE POLICY "user_embeddings_admin_all" ON user_embeddings
    FOR ALL USING (auth_has_role('admin'));

-- ---------- item_embeddings ----------
-- القراءة العامة (للتوصيات)
CREATE POLICY "item_embeddings_select_public" ON item_embeddings
    FOR SELECT USING (TRUE);

-- الكتابة للمدير فقط
CREATE POLICY "item_embeddings_admin_write" ON item_embeddings
    FOR ALL USING (auth_has_role('admin'));

-- ============================================================================
-- 22. البيانات الأولية (Seed Data) - الأدوار والصلاحيات
-- ============================================================================

-- إدراج الأدوار الأساسية
INSERT INTO roles (name, description) VALUES
    ('admin', 'مدير النظام - صلاحيات كاملة'),
    ('photographer', 'مصور - إدارة الجلسات ورفع الصور'),
    ('client', 'عميل مسجل - حجز وشراء وتقييم');

-- إدراج الصلاحيات الأساسية
INSERT INTO permissions (name, description) VALUES
    -- صلاحيات الحجوزات
    ('bookings.create', 'إنشاء حجز جديد'),
    ('bookings.read.own', 'قراءة الحجوزات الخاصة'),
    ('bookings.read.all', 'قراءة جميع الحجوزات'),
    ('bookings.update.own', 'تحديث الحجوزات الخاصة'),
    ('bookings.update.all', 'تحديث جميع الحجوزات'),
    ('bookings.cancel.own', 'إلغاء الحجوزات الخاصة'),
    -- صلاحيات المنتجات
    ('products.read', 'قراءة المنتجات'),
    ('products.manage', 'إدارة المنتجات (إضافة/تعديل/حذف)'),
    ('inventory.manage', 'إدارة المخزون'),
    -- صلاحيات الخدمات
    ('services.read', 'قراءة الخدمات'),
    ('services.manage', 'إدارة الخدمات والباقات'),
    -- صلاحيات الطلبات
    ('orders.create', 'إنشاء طلبات'),
    ('orders.read.own', 'قراءة الطلبات الخاصة'),
    ('orders.read.all', 'قراءة جميع الطلبات'),
    -- صلاحيات المستخدمين
    ('users.manage', 'إدارة حسابات المستخدمين'),
    ('roles.manage', 'إدارة الأدوار والصلاحيات'),
    -- صلاحيات المصور
    ('photographer.schedule.read', 'قراءة جدول المهام'),
    ('photographer.session.update', 'تحديث حالة الجلسة'),
    ('photographer.photos.upload', 'رفع الصور'),
    -- صلاحيات الإدارة
    ('dashboard.access', 'الوصول للوحة التحكم'),
    ('reports.view', 'عرض التقارير'),
    ('reports.export', 'تصدير التقارير'),
    ('settings.manage', 'إدارة إعدادات النظام'),
    ('tickets.manage', 'إدارة التذاكر والشكاوى'),
    ('content.manage', 'إدارة المحتوى الديناميكي'),
    -- صلاحيات التقييم
    ('reviews.create', 'إضافة تقييم'),
    ('reviews.moderate', 'إدارة التقييمات (إخفاء/حذف)'),
    -- صلاحيات الذكاء الاصطناعي
    ('ai.recommendations', 'استخدام التوصيات الذكية'),
    ('ai.smart_scheduling', 'استخدام الجدولة الذكية');

-- ربط الصلاحيات بالأدوار
-- دور العميل (Client)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'client' AND p.name IN (
    'bookings.create', 'bookings.read.own', 'bookings.update.own', 'bookings.cancel.own',
    'products.read', 'services.read',
    'orders.create', 'orders.read.own',
    'reviews.create', 'ai.recommendations'
);

-- دور المصور (Photographer)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'photographer' AND p.name IN (
    'photographer.schedule.read', 'photographer.session.update', 'photographer.photos.upload',
    'bookings.read.own', 'bookings.update.own'
);

-- دور المدير (Admin) - جميع الصلاحيات
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin';

-- إدراج إعدادات النظام الأولية (FR-A9 - CMS)
INSERT INTO system_settings (key, value, description) VALUES
    ('studio_name', 'Art Photo Studio', 'اسم الإستوديو'),
    ('studio_phone', '+966XXXXXXXXX', 'رقم الهاتف'),
    ('studio_email', 'info@artphoto.com', 'البريد الإلكتروني'),
    ('studio_address', 'المملكة العربية السعودية', 'العنوان'),
    ('about_us', 'نحن إستوديو تصوير احترافي متخصص في جميع أنواع التصوير.', 'نص صفحة من نحن'),
    ('terms_of_service', '', 'شروط الخدمة'),
    ('privacy_policy', '', 'سياسة الخصوصية'),
    ('working_hours_start', '09:00', 'بداية ساعات العمل'),
    ('working_hours_end', '21:00', 'نهاية ساعات العمل'),
    ('working_days', '["Sunday","Monday","Tuesday","Wednesday","Thursday"]', 'أيام العمل'),
    ('currency', 'SAR', 'العملة'),
    ('tax_rate', '15', 'نسبة الضريبة %');

-- ============================================================================
-- 23. وظائف Cron المجدولة (pg_cron)
-- ============================================================================

-- تنظيف سلات المشتريات المتروكة (أقدم من 7 أيام)
SELECT cron.schedule(
    'cleanup_abandoned_carts',
    '0 3 * * *',  -- كل يوم الساعة 3 صباحاً
    $$DELETE FROM cart_items WHERE updated_at < NOW() - INTERVAL '7 days'$$
);

-- إرسال تذكيرات المواعيد (الحجوزات المؤكدة بعد 24 ساعة)
SELECT cron.schedule(
    'send_booking_reminders',
    '0 9 * * *',  -- كل يوم الساعة 9 صباحاً
    $$
    INSERT INTO notifications (user_id, title, body, type, reference_id, reference_type)
    SELECT
        b.client_id,
        'تذكير بموعد التصوير',
        'لديك جلسة تصوير غداً بتاريخ ' || b.booking_date::TEXT || ' الساعة ' || b.start_time::TEXT,
        'booking',
        b.id,
        'booking'
    FROM bookings b
    WHERE b.booking_date = CURRENT_DATE + INTERVAL '1 day'
      AND b.status = 'confirmed';
    $$
);

-- تحديث حالة الحجوزات المنتهية الصلاحية (pending أكثر من 48 ساعة)
SELECT cron.schedule(
    'expire_pending_bookings',
    '0 */6 * * *',  -- كل 6 ساعات
    $$
    UPDATE bookings
    SET status = 'cancelled', updated_at = NOW()
    WHERE status = 'pending'
      AND created_at < NOW() - INTERVAL '48 hours';
    $$
);

-- تنظيف سجلات النشاط القديمة (أقدم من 90 يوم)
SELECT cron.schedule(
    'cleanup_old_activity_logs',
    '0 4 * * 0',  -- كل أحد الساعة 4 صباحاً
    $$DELETE FROM user_activity_logs WHERE created_at < NOW() - INTERVAL '90 days'$$
);

-- تنظيف الإشعارات المقروءة القديمة (أقدم من 30 يوم)
SELECT cron.schedule(
    'cleanup_old_notifications',
    '0 4 * * 0',  -- كل أحد الساعة 4 صباحاً
    $$DELETE FROM notifications WHERE is_read = TRUE AND created_at < NOW() - INTERVAL '30 days'$$
);

-- ============================================================================
-- 24. تفعيل Supabase Realtime للجداول المطلوبة
-- ============================================================================
-- يتم تفعيلها عبر لوحة تحكم Supabase أو عبر الأوامر التالية:

ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE ticket_replies;

-- ============================================================================
-- نهاية الملف
-- ============================================================================
