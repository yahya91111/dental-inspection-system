-- ═══════════════════════════════════════════════════════════
-- إصلاح Foreign Key Constraints للإشارة إلى جدول users الصحيح
-- FIX FOREIGN KEY CONSTRAINTS TO REFERENCE CORRECT USERS TABLE
-- ═══════════════════════════════════════════════════════════
--
-- المشكلة: الجداول الجديدة تشير إلى auth.users بدلاً من public.users
-- Problem: New tables reference auth.users instead of public.users
--
-- ═══════════════════════════════════════════════════════════

-- إصلاح جدول inspection_drafts
-- Fix inspection_drafts table
ALTER TABLE inspection_drafts
  DROP CONSTRAINT IF EXISTS inspection_drafts_last_updated_by_fkey;

ALTER TABLE inspection_drafts
  ADD CONSTRAINT inspection_drafts_last_updated_by_fkey
  FOREIGN KEY (last_updated_by) REFERENCES users(id) ON DELETE SET NULL;

-- إصلاح جدول submitted_inspections
-- Fix submitted_inspections table
ALTER TABLE submitted_inspections
  DROP CONSTRAINT IF EXISTS submitted_inspections_submitted_by_fkey;

ALTER TABLE submitted_inspections
  ADD CONSTRAINT submitted_inspections_submitted_by_fkey
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL;

-- إصلاح جدول active_users
-- Fix active_users table
ALTER TABLE active_users
  DROP CONSTRAINT IF EXISTS active_users_user_id_fkey;

ALTER TABLE active_users
  ADD CONSTRAINT active_users_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
