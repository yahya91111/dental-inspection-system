-- ═══════════════════════════════════════════════════════════
-- Migration: إنشاء جدول submitted_responses للبيانات النهائية المؤرشفة
-- Created: 2025-12-17
-- Description: جدول الأرشيف النهائي لمحاضر الرد على التفتيش (غير قابل للتعديل)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE public.submitted_responses (
  -- المعرف الأساسي
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL UNIQUE REFERENCES public.visits(id) ON DELETE CASCADE,

  -- ═══════════════════════════════════════════════════════════
  -- 📤 Submission Metadata
  -- ═══════════════════════════════════════════════════════════
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  submitted_by_name TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- ═══════════════════════════════════════════════════════════
  -- 📋 معلومات الرد
  -- ═══════════════════════════════════════════════════════════
  original_inspection_visit_id UUID NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  response_date TEXT NOT NULL,
  response_day TEXT NOT NULL,

  -- حالة الملاحظات
  observations_status TEXT NOT NULL CHECK (observations_status IN ('resolved', 'not_resolved')),
  unresolved_observations TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- 👥 أعضاء لجنة التفتيش
  -- ═══════════════════════════════════════════════════════════

  -- Inspector 1
  inspector1_name TEXT NOT NULL,
  inspector1_signature TEXT,
  inspector1_stamp TEXT,

  -- Inspector 2
  inspector2_name TEXT,
  inspector2_signature TEXT,
  inspector2_stamp TEXT,

  -- Inspector 3
  inspector3_name TEXT,
  inspector3_signature TEXT,
  inspector3_stamp TEXT,

  -- Committee head
  committee_head_name TEXT NOT NULL,
  committee_head_signature TEXT,
  committee_head_stamp TEXT,

  -- التواريخ
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- الفهارس
-- ═══════════════════════════════════════════════════════════
CREATE INDEX idx_submitted_responses_visit ON public.submitted_responses(visit_id);
CREATE INDEX idx_submitted_responses_original_visit ON public.submitted_responses(original_inspection_visit_id);
CREATE INDEX idx_submitted_responses_submitted_by ON public.submitted_responses(submitted_by);
CREATE INDEX idx_submitted_responses_submitted_at ON public.submitted_responses(submitted_at DESC);

-- ═══════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.submitted_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view submitted responses"
  ON public.submitted_responses FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert submitted responses"
  ON public.submitted_responses FOR INSERT TO authenticated WITH CHECK (true);

-- لا يمكن تعديل أو حذف محاضر الرد المرسلة (أرشيف نهائي)
-- Submitted responses cannot be updated or deleted (final archive)

-- ═══════════════════════════════════════════════════════════
-- Comments
-- ═══════════════════════════════════════════════════════════
COMMENT ON TABLE public.submitted_responses IS 'جدول الأرشيف النهائي لمحاضر الرد على التفتيش المكتملة والمرسلة (غير قابل للتعديل)';
COMMENT ON COLUMN public.submitted_responses.submitted_by IS 'المستخدم الذي قام بإرسال محضر الرد';
COMMENT ON COLUMN public.submitted_responses.submitted_by_name IS 'اسم المستخدم الذي قام بإرسال محضر الرد';
COMMENT ON COLUMN public.submitted_responses.submitted_at IS 'وقت إرسال محضر الرد';
