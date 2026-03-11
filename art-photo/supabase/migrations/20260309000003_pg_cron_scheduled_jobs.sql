-- ============================================================================
-- Art Photo Studio - pg_cron Scheduled Jobs Migration
-- ⚠️ يجب تفعيل pg_cron من Supabase Dashboard أولاً:
--    Database > Extensions > بحث عن "pg_cron" > Enable
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";

-- تنظيف سلات المشتريات المتروكة (أقدم من 7 أيام)
SELECT cron.schedule(
    'cleanup_abandoned_carts',
    '0 3 * * *',
    $$DELETE FROM cart_items WHERE updated_at < NOW() - INTERVAL '7 days'$$
);

-- إرسال تذكيرات المواعيد (الحجوزات المؤكدة بعد 24 ساعة)
SELECT cron.schedule(
    'send_booking_reminders',
    '0 9 * * *',
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
    '0 */6 * * *',
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
    '0 4 * * 0',
    $$DELETE FROM user_activity_logs WHERE created_at < NOW() - INTERVAL '90 days'$$
);

-- تنظيف الإشعارات المقروءة القديمة (أقدم من 30 يوم)
SELECT cron.schedule(
    'cleanup_old_notifications',
    '0 4 * * 0',
    $$DELETE FROM notifications WHERE is_read = TRUE AND created_at < NOW() - INTERVAL '30 days'$$
);
