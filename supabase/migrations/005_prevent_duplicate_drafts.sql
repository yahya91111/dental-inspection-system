-- ═══════════════════════════════════════════════════════════
-- منع إنشاء أكثر من Visit واحد من نفس النوع بحالة Draft
-- PREVENT DUPLICATE DRAFT VISITS
-- ═══════════════════════════════════════════════════════════
--
-- هذا الـ Index يمنع إنشاء أكثر من visit واحد من نفس النوع
-- (مثل inspection) بحالة draft لنفس العيادة
--
-- This index prevents creating multiple draft visits
-- of the same type for the same clinic
--
-- ═══════════════════════════════════════════════════════════

-- Unique Index للتأكد من وجود draft واحد فقط لكل نوع زيارة لكل عيادة
CREATE UNIQUE INDEX IF NOT EXISTS idx_visits_unique_draft
ON visits(clinic_id, visit_type)
WHERE status = 'draft';
