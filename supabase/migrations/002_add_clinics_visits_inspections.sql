-- =====================================================
-- Migration: إضافة جداول العيادات والزيارات ومهام التفتيش
-- Created: 2025-01-15
-- =====================================================

-- =====================================================
-- 1. إنشاء ENUM Types للزيارات
-- =====================================================
CREATE TYPE visit_type_enum AS ENUM (
  'inspection',          -- تفتيش
  'not_inspected',       -- لم يتم التفتيش
  'response',            -- الرد على التفتيش
  'closure',             -- إغلاق عيادة
  'examination'          -- معاينة
);

CREATE TYPE visit_status_enum AS ENUM (
  'draft',               -- مسودة
  'submitted',           -- تم الإرسال
  'completed'            -- مكتمل
);

-- =====================================================
-- 2. جدول العيادات (clinics)
-- =====================================================
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- المعلومات الأساسية
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  location_url TEXT,

  -- التواريخ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- الفهارس
CREATE INDEX idx_clinics_name ON clinics(name);

-- =====================================================
-- 3. جدول الزيارات (visits)
-- =====================================================
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- الربط بالعيادة
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,

  -- معلومات الزيارة
  visit_type visit_type_enum NOT NULL,
  visit_date DATE,
  visit_number INTEGER,
  visit_day TEXT,

  -- الحالة
  status visit_status_enum DEFAULT 'draft',

  -- التواريخ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- الفهارس
CREATE INDEX idx_visits_clinic ON visits(clinic_id);
CREATE INDEX idx_visits_type ON visits(visit_type);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_date ON visits(visit_date);

-- =====================================================
-- 4. جدول مهام التفتيش (inspection_tasks)
-- =====================================================
CREATE TABLE inspection_tasks (
  -- المعرف الأساسي
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,

  -- ═══════════════════════════════════════════════════════════
  -- 📋 البيانات الأساسية (من الصفحة الرئيسية)
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
  -- البيئة
  clinic_environment_hygiene TEXT,

  -- غسل اليدين
  clinic_washing_facilities TEXT,
  clinic_drying_facilities TEXT,
  clinic_disinfectant TEXT,

  -- الحواجز الوقائية
  clinic_sterile_gloves TEXT,
  clinic_non_sterile_gloves TEXT,
  clinic_masks TEXT,
  clinic_coat_gown TEXT,
  clinic_glasses_face_shield TEXT,

  -- المواد المستهلكة
  clinic_hve TEXT,
  clinic_saliva_ejectors TEXT,
  clinic_disposable_covers TEXT,
  clinic_cups TEXT,
  clinic_bib TEXT,
  clinic_disposable_mirrors TEXT,
  clinic_disposable_trays TEXT,
  clinic_air_water_syringe TEXT,

  -- التعقيم
  clinic_surfaces_disinfection TEXT,
  clinic_impression_disinfection TEXT,
  clinic_disinfection_container TEXT,
  clinic_disposable_bags TEXT,

  -- ملاحظات العيادة
  clinic_notes TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- 💉 بيانات غرفة التعقيم (Sterilization)
  -- ═══════════════════════════════════════════════════════════
  -- تنظيف الأدوات
  sterilization_manual_wash TEXT,
  sterilization_ultrasonic_machine TEXT,
  sterilization_washer_disinfector TEXT,

  -- تجفيف الأدوات
  sterilization_lint_free_towels TEXT,
  sterilization_dryer TEXT,

  -- عدد أجهزة التعقيم
  sterilization_autoclaves_count TEXT,

  -- أنواع الاختبارات
  sterilization_biological_test TEXT,
  sterilization_bd_test TEXT,
  sterilization_leak_test TEXT,
  sterilization_periodic_report TEXT,

  -- التخلص من النفايات
  sterilization_infectious_non_sharp TEXT,
  sterilization_infectious_sharp TEXT,
  sterilization_non_infectious TEXT,

  -- ملاحظات التعقيم
  sterilization_notes TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- ☢️ بيانات غرفة الأشعة (X-Ray)
  -- ═══════════════════════════════════════════════════════════
  -- غرفة الأشعة
  xray_environment_hygiene TEXT,
  xray_protective_barriers TEXT,
  xray_surfaces_disinfection TEXT,
  xray_gloves TEXT,
  xray_trash_basket TEXT,
  xray_lead_apron TEXT,

  -- أنواع الأشعة - PA
  xray_pa_type TEXT,
  xray_pa_available TEXT,
  xray_pa_number TEXT,

  -- OPG
  xray_opg_available TEXT,
  xray_opg_number TEXT,

  -- Cephalometric
  xray_cephalometric_available TEXT,
  xray_cephalometric_number TEXT,

  -- CBCT
  xray_cbct_available TEXT,
  xray_cbct_number TEXT,

  -- رخصة RPD
  xray_rpd_license TEXT,

  -- ملاحظات الأشعة
  xray_notes TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- 🔬 بيانات المختبر (Lab)
  -- ═══════════════════════════════════════════════════════════
  -- البيئة
  lab_environment_hygiene TEXT,

  -- التعقيم
  lab_surfaces_disinfection TEXT,

  -- الأنواع
  lab_main_dental_lab TEXT,
  lab_mini_dental_lab TEXT,
  lab_contract TEXT,
  lab_in_other_branch TEXT,

  -- الانطباعات
  lab_appliances TEXT,
  lab_disinfection_container TEXT,
  lab_disposable_bags TEXT,

  -- ملاحظات المختبر
  lab_notes TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- 📁 بيانات الملفات (Files)
  -- ═══════════════════════════════════════════════════════════
  -- الملفات والبطاقات الأصلية
  files_patient_results TEXT,
  files_medical_diagnosis TEXT,
  files_treatment TEXT,
  files_price_list TEXT,
  files_receipts TEXT,
  files_prescription_copies TEXT,
  files_visitors_record TEXT,
  files_medicine_record TEXT,
  files_safety_tests TEXT,

  -- متطلبات إضافية
  files_monthly_statistics TEXT,
  files_evidence_guides TEXT,
  files_license_matching TEXT,

  -- الثبيتات
  files_waste_contract TEXT,

  -- ملاحظات الملفات
  files_notes TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- 👥 بيانات العاملين (Staff)
  -- ═══════════════════════════════════════════════════════════
  -- عدد الطاقم
  staff_doctors_count TEXT,
  staff_visiting_doctors_count TEXT,
  staff_nursing_staff_count TEXT,
  staff_technicians_count TEXT,

  -- عدد العيادات
  staff_clinics_count TEXT,

  -- معلومات الزراعة
  staff_implant_status TEXT,
  staff_implant_has_washer TEXT,
  staff_implant_doctors JSONB, -- Array of {id, name, specialty, implantType, license}

  -- ملاحظات العاملين
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
  notes_additional JSONB, -- Array of {id, title, content}

  -- ═══════════════════════════════════════════════════════════
  -- ⚠️ بيانات المخالفات (Violations)
  -- ═══════════════════════════════════════════════════════════
  violations_inspector1_name TEXT,
  violations_inspector2_name TEXT,
  violations_inspector3_name TEXT,
  violations_date DATE,
  violations_day TEXT,
  violations_time TIME,

  -- معلومات الموقع
  violations_facility_name TEXT,
  violations_area TEXT,
  violations_block TEXT,
  violations_street TEXT,
  violations_plot_number TEXT,
  violations_floor TEXT,

  -- قائمة المخالفات
  violations_list JSONB, -- Array of {id, text}

  -- معلومات المواجهة
  violations_confronted_person TEXT,
  violations_person_title TEXT,
  violations_statement TEXT,

  -- ═══════════════════════════════════════════════════════════
  -- 📎 المرفقات (Attachments)
  -- ═══════════════════════════════════════════════════════════
  attachments JSONB, -- Array of {id, imageUrl, fileName, fileSize, fileType, description}

  -- ═══════════════════════════════════════════════════════════
  -- ✍️ التواقيع والأختام (Signatures)
  -- ═══════════════════════════════════════════════════════════
  -- توقيع المفتش 1
  signature_inspector1_signature TEXT,
  signature_inspector1_stamp TEXT,

  -- توقيع المفتش 2
  signature_inspector2_signature TEXT,
  signature_inspector2_stamp TEXT,

  -- توقيع المفتش 3
  signature_inspector3_signature TEXT,
  signature_inspector3_stamp TEXT,

  -- توقيع الطبيب المخاطب
  signature_doctor_signature TEXT,
  signature_doctor_stamp TEXT,

  -- ختم العيادة
  signature_clinic_stamp TEXT,

  -- توقيع رئيس اللجنة
  signature_committee_head_signature TEXT,
  signature_committee_head_stamp TEXT,

  -- التواريخ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- الفهارس
CREATE INDEX idx_inspection_tasks_visit ON inspection_tasks(visit_id);

-- =====================================================
-- 5. Triggers للتحديث التلقائي
-- =====================================================
CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON clinics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at
  BEFORE UPDATE ON visits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspection_tasks_updated_at
  BEFORE UPDATE ON inspection_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. Row Level Security (RLS)
-- =====================================================

-- تفعيل RLS
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_tasks ENABLE ROW LEVEL SECURITY;

-- سياسات جدول العيادات
CREATE POLICY "المستخدمون المصادقون يمكنهم عرض العيادات"
  ON clinics FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "المسؤولون يمكنهم إضافة عيادات"
  ON clinics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "المسؤولون يمكنهم تحديث العيادات"
  ON clinics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

-- سياسات جدول الزيارات
CREATE POLICY "المستخدمون المصادقون يمكنهم عرض الزيارات"
  ON visits FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المصادقون يمكنهم إضافة زيارات"
  ON visits FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المصادقون يمكنهم تحديث الزيارات"
  ON visits FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- سياسات جدول مهام التفتيش
CREATE POLICY "المستخدمون المصادقون يمكنهم عرض مهام التفتيش"
  ON inspection_tasks FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المصادقون يمكنهم إضافة مهام التفتيش"
  ON inspection_tasks FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "المستخدمون المصادقون يمكنهم تحديث مهام التفتيش"
  ON inspection_tasks FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 7. إضافة تعليقات على الجداول
-- =====================================================
COMMENT ON TABLE clinics IS 'جدول العيادات الخاصة';
COMMENT ON TABLE visits IS 'جدول الزيارات لجميع أنواع المهام';
COMMENT ON TABLE inspection_tasks IS 'جدول مهام التفتيش الشامل مع جميع البيانات';
