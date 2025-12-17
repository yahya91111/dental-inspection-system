-- ═══════════════════════════════════════════════════════════
-- Migration: إنشاء جدول inspection_drafts للبيانات المؤقتة مع Real-time
-- Created: 2025-12-15
-- Description: جدول للمسودات المؤقتة مع دعم Real-time collaboration
-- ═══════════════════════════════════════════════════════════

CREATE TABLE inspection_drafts (
  -- المعرف الأساسي
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL UNIQUE REFERENCES visits(id) ON DELETE CASCADE,

  -- ═══════════════════════════════════════════════════════════
  -- 🔴 Real-time Metadata
  -- ═══════════════════════════════════════════════════════════
  last_updated_by UUID REFERENCES auth.users(id),
  last_updated_by_name TEXT,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- ═══════════════════════════════════════════════════════════
  -- 📋 البيانات الأساسية
  -- ═══════════════════════════════════════════════════════════
  classification TEXT,
  license_owner TEXT,
  contact_person TEXT,

  -- أعضاء لجنة التفتيش
  inspector_1_name TEXT,
  inspector_2_name TEXT,
  inspector_3_name TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- 🏥 بيانات العيادة (Clinic)
  -- ═══════════════════════════════════════════════════════════
  clinic_environment_hygiene TEXT,
  clinic_washing_facilities TEXT,
  clinic_drying_facilities TEXT,
  clinic_disinfectant TEXT,
  clinic_sterile_gloves TEXT,
  clinic_non_sterile_gloves TEXT,
  clinic_masks TEXT,
  clinic_coat_gown TEXT,
  clinic_glasses_face_shield TEXT,
  clinic_hve TEXT,
  clinic_saliva_ejectors TEXT,
  clinic_disposable_covers TEXT,
  clinic_cups TEXT,
  clinic_bib TEXT,
  clinic_disposable_mirrors TEXT,
  clinic_disposable_trays TEXT,
  clinic_air_water_syringe TEXT,
  clinic_surfaces_disinfection TEXT,
  clinic_impression_disinfection TEXT,
  clinic_disinfection_container TEXT,
  clinic_disposable_bags TEXT,
  clinic_notes TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- 💉 بيانات غرفة التعقيم (Sterilization)
  -- ═══════════════════════════════════════════════════════════
  sterilization_manual_wash TEXT,
  sterilization_ultrasonic_machine TEXT,
  sterilization_washer_disinfector TEXT,
  sterilization_lint_free_towels TEXT,
  sterilization_dryer TEXT,
  sterilization_room_number TEXT,
  sterilization_autoclaves_count TEXT,
  sterilization_biological_test TEXT,
  sterilization_bd_test TEXT,
  sterilization_leak_test TEXT,
  sterilization_periodic_report TEXT,
  sterilization_infectious_non_sharp TEXT,
  sterilization_infectious_sharp TEXT,
  sterilization_non_infectious TEXT,
  sterilization_notes TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- ☢️ بيانات غرفة الأشعة (X-Ray)
  -- ═══════════════════════════════════════════════════════════
  xray_environment_hygiene TEXT,
  xray_protective_barriers TEXT,
  xray_surfaces_disinfection TEXT,
  xray_gloves TEXT,
  xray_trash_basket TEXT,
  xray_lead_apron TEXT,
  xray_pa_type TEXT,
  xray_pa_available TEXT,
  xray_pa_number TEXT,
  xray_opg_available TEXT,
  xray_opg_number TEXT,
  xray_cephalometric_available TEXT,
  xray_cephalometric_number TEXT,
  xray_cbct_available TEXT,
  xray_cbct_number TEXT,
  xray_rpd_license TEXT,
  xray_notes TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- 🔬 بيانات المختبر (Lab)
  -- ═══════════════════════════════════════════════════════════
  lab_environment_hygiene TEXT,
  lab_surfaces_disinfection TEXT,
  lab_main_dental_lab TEXT,
  lab_mini_dental_lab TEXT,
  lab_contract TEXT,
  lab_in_other_branch TEXT,
  lab_appliances TEXT,
  lab_disinfection_container TEXT,
  lab_disposable_bags TEXT,
  lab_notes TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- 📁 بيانات الملفات (Files)
  -- ═══════════════════════════════════════════════════════════
  files_patient_results TEXT,
  files_medical_diagnosis TEXT,
  files_treatment TEXT,
  files_price_list TEXT,
  files_receipts TEXT,
  files_prescription_copies TEXT,
  files_visitors_record TEXT,
  files_medicine_record TEXT,
  files_safety_tests TEXT,
  files_monthly_statistics TEXT,
  files_evidence_guides TEXT,
  files_license_matching TEXT,
  files_waste_contract TEXT,
  files_notes TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- 👥 بيانات العاملين (Staff)
  -- ═══════════════════════════════════════════════════════════
  staff_doctors_count TEXT,
  staff_visiting_doctors_count TEXT,
  staff_nursing_staff_count TEXT,
  staff_technicians_count TEXT,
  staff_clinics_count TEXT,
  staff_implant_status TEXT,
  staff_implant_has_washer TEXT,
  staff_implant_doctors JSONB,
  staff_notes TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- 📝 الملاحظات المجمعة (Notes)
  -- ═══════════════════════════════════════════════════════════
  notes_clinic TEXT,
  notes_sterilization TEXT,
  notes_xray TEXT,
  notes_lab TEXT,
  notes_files TEXT,
  notes_staff TEXT,
  notes_additional JSONB,

  -- ═══════════════════════════════════════════════════════════
  -- ⚠️ بيانات المخالفات (Violations)
  -- ═══════════════════════════════════════════════════════════
  violations_inspector1_name TEXT,
  violations_inspector2_name TEXT,
  violations_inspector3_name TEXT,
  violations_date DATE,
  violations_day TEXT,
  violations_time TIME,
  violations_facility_name TEXT,
  violations_area TEXT,
  violations_block TEXT,
  violations_street TEXT,
  violations_plot_number TEXT,
  violations_floor TEXT,
  violations_list JSONB,
  violations_confronted_person TEXT,
  violations_person_title TEXT,
  violations_statement TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- 📎 المرفقات (Attachments)
  -- ═══════════════════════════════════════════════════════════
  attachments JSONB,

  -- ═══════════════════════════════════════════════════════════
  -- ✍️ التواقيع والأختام (Signatures)
  -- ═══════════════════════════════════════════════════════════
  signature_inspector1_signature TEXT,
  signature_inspector1_stamp TEXT,
  signature_inspector2_signature TEXT,
  signature_inspector2_stamp TEXT,
  signature_inspector3_signature TEXT,
  signature_inspector3_stamp TEXT,
  signature_doctor_signature TEXT,
  signature_doctor_stamp TEXT,
  signature_clinic_stamp TEXT,
  signature_committee_head_signature TEXT,
  signature_committee_head_stamp TEXT,

  -- التواريخ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════
-- الفهارس
-- ═══════════════════════════════════════════════════════════
CREATE INDEX idx_inspection_drafts_visit ON inspection_drafts(visit_id);
CREATE INDEX idx_inspection_drafts_updated_by ON inspection_drafts(last_updated_by);
CREATE INDEX idx_inspection_drafts_updated_at ON inspection_drafts(last_updated_at DESC);

-- ═══════════════════════════════════════════════════════════
-- Trigger للتحديث التلقائي
-- ═══════════════════════════════════════════════════════════
CREATE TRIGGER update_inspection_drafts_updated_at
  BEFORE UPDATE ON inspection_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════════
ALTER TABLE inspection_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view drafts"
  ON inspection_drafts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert drafts"
  ON inspection_drafts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update drafts"
  ON inspection_drafts FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete drafts"
  ON inspection_drafts FOR DELETE TO authenticated USING (true);

-- ═══════════════════════════════════════════════════════════
-- Enable Realtime
-- ═══════════════════════════════════════════════════════════
ALTER TABLE inspection_drafts REPLICA IDENTITY FULL;

-- ═══════════════════════════════════════════════════════════
-- Comments
-- ═══════════════════════════════════════════════════════════
COMMENT ON TABLE inspection_drafts IS 'جدول المسودات المؤقتة لمهام التفتيش مع دعم Real-time collaboration';
COMMENT ON COLUMN inspection_drafts.last_updated_by IS 'آخر مستخدم قام بالتحديث';
COMMENT ON COLUMN inspection_drafts.last_updated_by_name IS 'اسم آخر مستخدم قام بالتحديث';
COMMENT ON COLUMN inspection_drafts.last_updated_at IS 'وقت آخر تحديث';
