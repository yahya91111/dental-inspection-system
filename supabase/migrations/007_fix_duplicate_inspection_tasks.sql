-- ═══════════════════════════════════════════════════════════
-- Migration: إصلاح مهام التفتيش المكررة وإضافة قيد فريد
-- Created: 2025-12-15
-- ═══════════════════════════════════════════════════════════

-- الخطوة 1: حذف المهام المكررة (نحتفظ بالأحدث فقط)
-- Delete duplicate inspection tasks, keeping only the most recent one per visit

WITH ranked_tasks AS (
  SELECT
    id,
    visit_id,
    ROW_NUMBER() OVER (
      PARTITION BY visit_id
      ORDER BY created_at DESC
    ) as rn
  FROM inspection_tasks
)
DELETE FROM inspection_tasks
WHERE id IN (
  SELECT id
  FROM ranked_tasks
  WHERE rn > 1
);

-- الخطوة 2: إضافة قيد فريد على visit_id لمنع التكرار مستقبلاً
-- Add unique constraint on visit_id to prevent future duplicates

ALTER TABLE inspection_tasks
ADD CONSTRAINT inspection_tasks_visit_id_unique UNIQUE (visit_id);

-- الخطوة 3: إضافة تعليق توضيحي
COMMENT ON CONSTRAINT inspection_tasks_visit_id_unique ON inspection_tasks
IS 'يضمن أن كل زيارة لها مهمة تفتيش واحدة فقط - Ensures each visit has only one inspection task';
