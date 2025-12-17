-- ═══════════════════════════════════════════════════════════
-- إضافة Indices لتحسين الأداء
-- ADD PERFORMANCE INDICES
-- ═══════════════════════════════════════════════════════════
--
-- هذه الـ indices تحسن سرعة البحث والاستعلامات
-- These indices improve search and query performance
--
-- ═══════════════════════════════════════════════════════════

-- Index على clinic_id في جدول visits
-- لتسريع البحث عن زيارات عيادة معينة
CREATE INDEX IF NOT EXISTS idx_visits_clinic_id
ON visits(clinic_id);

-- Index على visit_type و clinic_id معاً
-- لتسريع البحث عن زيارات من نوع معين لعيادة معينة
CREATE INDEX IF NOT EXISTS idx_visits_clinic_type
ON visits(clinic_id, visit_type);

-- Index على visit_id في جدول inspection_tasks
-- لتسريع البحث عن مهمة تفتيش بواسطة visit_id
CREATE INDEX IF NOT EXISTS idx_inspection_tasks_visit_id
ON inspection_tasks(visit_id);

-- Index على created_at في جدول visits
-- لتسريع الترتيب حسب تاريخ الإنشاء
CREATE INDEX IF NOT EXISTS idx_visits_created_at
ON visits(created_at DESC);

-- Index على created_at في جدول clinics
-- لتسريع الترتيب حسب تاريخ الإنشاء
CREATE INDEX IF NOT EXISTS idx_clinics_created_at
ON clinics(created_at DESC);

-- Index على name في جدول clinics
-- لتسريع البحث بالاسم
CREATE INDEX IF NOT EXISTS idx_clinics_name
ON clinics(name);

-- Index على status في جدول visits
-- لتسريع البحث حسب الحالة
CREATE INDEX IF NOT EXISTS idx_visits_status
ON visits(status);
