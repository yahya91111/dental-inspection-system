-- ═══════════════════════════════════════════════════════════
-- Migration: إنشاء جدول active_users لتتبع المستخدمين النشطين
-- Created: 2025-12-15
-- Description: جدول لتتبع المستخدمين الذين يعملون حالياً على التفتيش (Presence System)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE active_users (
  -- المعرف الأساسي
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- معلومات الجلسة
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_email TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- 💓 Heartbeat System
  -- ═══════════════════════════════════════════════════════════
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- معلومات إضافية
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- ضمان أن كل مستخدم له جلسة واحدة فقط لكل زيارة
  UNIQUE(visit_id, user_id)
);

-- ═══════════════════════════════════════════════════════════
-- الفهارس
-- ═══════════════════════════════════════════════════════════
CREATE INDEX idx_active_users_visit ON active_users(visit_id);
CREATE INDEX idx_active_users_user ON active_users(user_id);
CREATE INDEX idx_active_users_heartbeat ON active_users(last_heartbeat DESC);

-- ═══════════════════════════════════════════════════════════
-- Function لتنظيف الجلسات القديمة (أكثر من 10 دقائق بدون heartbeat)
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION cleanup_stale_active_users()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM active_users
  WHERE last_heartbeat < NOW() - INTERVAL '10 minutes';
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- Scheduled job لتنظيف الجلسات القديمة (يعمل كل 5 دقائق)
-- ملاحظة: يتطلب pg_cron extension
-- ═══════════════════════════════════════════════════════════
-- UNCOMMENT IF pg_cron IS AVAILABLE:
-- SELECT cron.schedule('cleanup-stale-active-users', '*/5 * * * *', 'SELECT cleanup_stale_active_users()');

-- ═══════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE active_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active users"
  ON active_users FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own presence"
  ON active_users FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presence"
  ON active_users FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presence"
  ON active_users FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- Enable Realtime
-- ═══════════════════════════════════════════════════════════
ALTER TABLE active_users REPLICA IDENTITY FULL;

-- ═══════════════════════════════════════════════════════════
-- Comments
-- ═══════════════════════════════════════════════════════════
COMMENT ON TABLE active_users IS 'جدول تتبع المستخدمين النشطين الذين يعملون حالياً على التفتيش (Presence System)';
COMMENT ON COLUMN active_users.last_heartbeat IS 'آخر إشارة حياة من المستخدم (يتم التحديث كل 30 ثانية)';
COMMENT ON COLUMN active_users.joined_at IS 'وقت انضمام المستخدم إلى جلسة التفتيش';
COMMENT ON FUNCTION cleanup_stale_active_users IS 'تنظيف الجلسات القديمة (أكثر من 10 دقائق بدون heartbeat)';
