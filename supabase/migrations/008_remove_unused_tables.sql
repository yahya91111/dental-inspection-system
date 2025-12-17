-- ═══════════════════════════════════════════════════════════
-- Migration: حذف الجداول غير المستخدمة
-- Created: 2025-12-15
-- Description: حذف الجداول التالية لأنها غير مستخدمة في النظام:
--   - facilities (تم استبدالها بـ clinics)
--   - task_inspectors
--   - task_responses
--   - tasks
-- ═══════════════════════════════════════════════════════════

-- الخطوة 1: حذف الجداول بالترتيب الصحيح (الجداول التابعة أولاً)
-- Drop tables in correct order (dependent tables first)

-- حذف task_responses أولاً (قد تكون لديها foreign keys إلى tasks)
DROP TABLE IF EXISTS task_responses CASCADE;

-- حذف task_inspectors (قد تكون لديها foreign keys إلى tasks)
DROP TABLE IF EXISTS task_inspectors CASCADE;

-- حذف tasks
DROP TABLE IF EXISTS tasks CASCADE;

-- حذف facilities (قد تكون لديها foreign keys من جداول أخرى)
DROP TABLE IF EXISTS facilities CASCADE;

-- الخطوة 2: تأكيد الحذف
-- Confirm deletion
COMMENT ON SCHEMA public IS 'تم حذف الجداول غير المستخدمة: facilities, task_inspectors, task_responses, tasks في 2025-12-15';
