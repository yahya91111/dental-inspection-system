-- ═══════════════════════════════════════════════════════════
-- تعطيل Row Level Security على الجداول الجديدة للتطوير
-- DISABLE ROW LEVEL SECURITY ON NEW TABLES FOR DEVELOPMENT
-- ═══════════════════════════════════════════════════════════
--
-- تحذير: هذا للتطوير فقط! يجب تفعيل RLS مرة أخرى في الإنتاج
-- WARNING: This is for development only! Re-enable RLS for production
--
-- ═══════════════════════════════════════════════════════════

-- تعطيل RLS على جدول مسودات التفتيش
-- Disable RLS on inspection_drafts table
ALTER TABLE inspection_drafts DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول التفتيشات المرسلة
-- Disable RLS on submitted_inspections table
ALTER TABLE submitted_inspections DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول المستخدمين النشطين
-- Disable RLS on active_users table
ALTER TABLE active_users DISABLE ROW LEVEL SECURITY;
