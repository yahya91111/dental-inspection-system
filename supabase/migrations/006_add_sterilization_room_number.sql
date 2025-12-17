-- ═══════════════════════════════════════════════════════════
-- Migration: إضافة حقل sterilization_room_number
-- Created: 2025-12-15
-- ═══════════════════════════════════════════════════════════

-- إضافة عمود sterilization_room_number إلى جدول inspection_tasks
ALTER TABLE inspection_tasks
ADD COLUMN sterilization_room_number TEXT;

-- إضافة تعليق على العمود
COMMENT ON COLUMN inspection_tasks.sterilization_room_number IS 'عدد غرف التعقيم - Sterilization Room Number';
