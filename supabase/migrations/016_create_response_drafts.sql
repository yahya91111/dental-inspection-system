-- ═══════════════════════════════════════════════════════════
-- Migration: إنشاء جدول response_drafts للمسودات المؤقتة
-- Created: 2025-12-17
-- Description: جدول المسودات المؤقتة لمحاضر الرد على التفتيش
-- ═══════════════════════════════════════════════════════════

-- حذف الجدول القديم إذا كان موجوداً
DROP TABLE IF EXISTS public.inspection_responses CASCADE;

-- إنشاء جدول response_drafts
CREATE TABLE public.response_drafts (
  -- المعرف الأساسي
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL UNIQUE REFERENCES public.visits(id) ON DELETE CASCADE,

  -- ═══════════════════════════════════════════════════════════
  -- 🔴 Real-time Metadata
  -- ═══════════════════════════════════════════════════════════
  last_updated_by UUID REFERENCES auth.users(id),
  last_updated_by_name TEXT,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- ═══════════════════════════════════════════════════════════
  -- 📋 معلومات الرد
  -- ═══════════════════════════════════════════════════════════
  original_inspection_visit_id UUID REFERENCES public.visits(id) ON DELETE CASCADE,
  response_date TEXT,
  response_day TEXT,

  -- حالة الملاحظات
  observations_status TEXT CHECK (observations_status IN ('resolved', 'not_resolved')),
  unresolved_observations TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- 👥 أعضاء لجنة التفتيش
  -- ═══════════════════════════════════════════════════════════

  -- Inspector 1
  inspector1_name TEXT,
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
  committee_head_name TEXT,
  committee_head_signature TEXT,
  committee_head_stamp TEXT,

  -- التواريخ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- الفهارس
-- ═══════════════════════════════════════════════════════════
CREATE INDEX idx_response_drafts_visit ON public.response_drafts(visit_id);
CREATE INDEX idx_response_drafts_original_visit ON public.response_drafts(original_inspection_visit_id);
CREATE INDEX idx_response_drafts_updated_by ON public.response_drafts(last_updated_by);
CREATE INDEX idx_response_drafts_updated_at ON public.response_drafts(last_updated_at DESC);

-- ═══════════════════════════════════════════════════════════
-- Trigger للتحديث التلقائي
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_response_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_response_drafts_updated_at ON public.response_drafts;

CREATE TRIGGER update_response_drafts_updated_at
  BEFORE UPDATE ON public.response_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_response_drafts_updated_at();

-- ═══════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.response_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view response drafts"
  ON public.response_drafts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert response drafts"
  ON public.response_drafts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update response drafts"
  ON public.response_drafts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete response drafts"
  ON public.response_drafts FOR DELETE TO authenticated USING (true);

-- ═══════════════════════════════════════════════════════════
-- Enable Realtime
-- ═══════════════════════════════════════════════════════════
ALTER TABLE public.response_drafts REPLICA IDENTITY FULL;

-- ═══════════════════════════════════════════════════════════
-- Comments
-- ═══════════════════════════════════════════════════════════
COMMENT ON TABLE public.response_drafts IS 'جدول المسودات المؤقتة لمحاضر الرد على التفتيش';
COMMENT ON COLUMN public.response_drafts.last_updated_by IS 'آخر مستخدم قام بالتحديث';
COMMENT ON COLUMN public.response_drafts.last_updated_by_name IS 'اسم آخر مستخدم قام بالتحديث';
COMMENT ON COLUMN public.response_drafts.last_updated_at IS 'وقت آخر تحديث';
