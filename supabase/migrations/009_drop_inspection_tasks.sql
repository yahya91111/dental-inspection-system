-- ═══════════════════════════════════════════════════════════
-- Migration: حذف جدول inspection_tasks القديم
-- Created: 2025-12-15
-- Description: حذف جدول inspection_tasks لأننا سننتقل إلى نظام real-time
--              باستخدام inspection_drafts و submitted_inspections
-- ═══════════════════════════════════════════════════════════

-- حذف الجدول القديم
DROP TABLE IF EXISTS inspection_tasks CASCADE;

-- تأكيد الحذف
COMMENT ON SCHEMA public IS 'تم حذف جدول inspection_tasks في 2025-12-15 - الانتقال إلى نظام real-time';
