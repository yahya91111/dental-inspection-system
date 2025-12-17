-- ═══════════════════════════════════════════════════════════
-- تعطيل Row Level Security مؤقتاً للتطوير
-- DISABLE ROW LEVEL SECURITY TEMPORARILY FOR DEVELOPMENT
-- ═══════════════════════════════════════════════════════════
--
-- تحذير: هذا للتطوير فقط! يجب تفعيل RLS مرة أخرى في الإنتاج
-- WARNING: This is for development only! Re-enable RLS for production
--
-- ═══════════════════════════════════════════════════════════

-- تعطيل RLS على جدول العيادات
-- Disable RLS on clinics table
ALTER TABLE clinics DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول الزيارات
-- Disable RLS on visits table
ALTER TABLE visits DISABLE ROW LEVEL SECURITY;

-- تعطيل RLS على جدول مهام التفتيش
-- Disable RLS on inspection_tasks table
ALTER TABLE inspection_tasks DISABLE ROW LEVEL SECURITY;

-- حذف جميع السياسات الموجودة (اختياري - لتنظيف السياسات القديمة)
-- Drop all existing policies (optional - to clean up old policies)
DROP POLICY IF EXISTS "المسؤولون يمكنهم قراءة العيادات" ON clinics;
DROP POLICY IF EXISTS "المسؤولون يمكنهم إضافة عيادات" ON clinics;
DROP POLICY IF EXISTS "المسؤولون يمكنهم تعديل العيادات" ON clinics;
DROP POLICY IF EXISTS "المسؤولون يمكنهم حذف العيادات" ON clinics;
DROP POLICY IF EXISTS "السماح للجميع بإضافة عيادات" ON clinics;

DROP POLICY IF EXISTS "المسؤولون يمكنهم قراءة الزيارات" ON visits;
DROP POLICY IF EXISTS "المسؤولون يمكنهم إضافة الزيارات" ON visits;
DROP POLICY IF EXISTS "المسؤولون يمكنهم تعديل الزيارات" ON visits;
DROP POLICY IF EXISTS "المسؤولون يمكنهم حذف الزيارات" ON visits;

DROP POLICY IF EXISTS "المسؤولون يمكنهم قراءة مهام التفتيش" ON inspection_tasks;
DROP POLICY IF EXISTS "المسؤولون يمكنهم إضافة مهام التفتيش" ON inspection_tasks;
DROP POLICY IF EXISTS "المسؤولون يمكنهم تعديل مهام التفتيش" ON inspection_tasks;
DROP POLICY IF EXISTS "المسؤولون يمكنهم حذف مهام التفتيش" ON inspection_tasks;
