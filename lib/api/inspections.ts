import { createClient } from '@/lib/supabase/client'

// Types
export interface InspectionTask {
  id: string
  visit_id: string

  // البيانات الأساسية
  classification?: string
  license_owner?: string
  contact_person?: string
  inspector_1_name?: string
  inspector_2_name?: string
  inspector_3_name?: string

  // بيانات العيادة
  clinic_environment_hygiene?: string
  clinic_washing_facilities?: string
  clinic_drying_facilities?: string
  clinic_disinfectant?: string
  clinic_sterile_gloves?: string
  clinic_non_sterile_gloves?: string
  clinic_masks?: string
  clinic_coat_gown?: string
  clinic_glasses_face_shield?: string
  clinic_hve?: string
  clinic_saliva_ejectors?: string
  clinic_disposable_covers?: string
  clinic_cups?: string
  clinic_bib?: string
  clinic_disposable_mirrors?: string
  clinic_disposable_trays?: string
  clinic_air_water_syringe?: string
  clinic_surfaces_disinfection?: string
  clinic_impression_disinfection?: string
  clinic_disinfection_container?: string
  clinic_disposable_bags?: string
  clinic_notes?: string

  // بيانات التعقيم
  sterilization_manual_wash?: string
  sterilization_ultrasonic_machine?: string
  sterilization_washer_disinfector?: string
  sterilization_lint_free_towels?: string
  sterilization_dryer?: string
  sterilization_room_number?: string
  sterilization_autoclaves_count?: string
  sterilization_biological_test?: string
  sterilization_bd_test?: string
  sterilization_leak_test?: string
  sterilization_periodic_report?: string
  sterilization_infectious_non_sharp?: string
  sterilization_infectious_sharp?: string
  sterilization_non_infectious?: string
  sterilization_notes?: string

  // بيانات الأشعة
  xray_environment_hygiene?: string
  xray_protective_barriers?: string
  xray_surfaces_disinfection?: string
  xray_gloves?: string
  xray_trash_basket?: string
  xray_lead_apron?: string
  xray_pa_type?: string
  xray_pa_available?: string
  xray_pa_number?: string
  xray_opg_available?: string
  xray_opg_number?: string
  xray_cephalometric_available?: string
  xray_cephalometric_number?: string
  xray_cbct_available?: string
  xray_cbct_number?: string
  xray_rpd_license?: string
  xray_notes?: string

  // بيانات المختبر
  lab_environment_hygiene?: string
  lab_surfaces_disinfection?: string
  lab_main_dental_lab?: string
  lab_mini_dental_lab?: string
  lab_contract?: string
  lab_in_other_branch?: string
  lab_appliances?: string
  lab_disinfection_container?: string
  lab_disposable_bags?: string
  lab_notes?: string

  // بيانات الملفات
  files_patient_results?: string
  files_medical_diagnosis?: string
  files_treatment?: string
  files_price_list?: string
  files_receipts?: string
  files_prescription_copies?: string
  files_visitors_record?: string
  files_medicine_record?: string
  files_safety_tests?: string
  files_monthly_statistics?: string
  files_evidence_guides?: string
  files_license_matching?: string
  files_waste_contract?: string
  files_notes?: string

  // بيانات العاملين
  staff_doctors_count?: string
  staff_visiting_doctors_count?: string
  staff_nursing_staff_count?: string
  staff_technicians_count?: string
  staff_clinics_count?: string
  staff_implant_status?: string
  staff_implant_has_washer?: string
  staff_implant_doctors?: any // JSONB
  staff_notes?: string

  // الملاحظات
  notes_clinic?: string
  notes_sterilization?: string
  notes_xray?: string
  notes_lab?: string
  notes_files?: string
  notes_staff?: string
  notes_additional?: any // JSONB

  // المخالفات
  violations_inspector1_name?: string
  violations_inspector2_name?: string
  violations_inspector3_name?: string
  violations_date?: string
  violations_day?: string
  violations_time?: string
  violations_facility_name?: string
  violations_area?: string
  violations_block?: string
  violations_street?: string
  violations_plot_number?: string
  violations_floor?: string
  violations_list?: any // JSONB
  violations_confronted_person?: string
  violations_person_title?: string
  violations_statement?: string

  // المرفقات
  attachments?: any // JSONB

  // التواقيع والأختام
  signature_inspector1_signature?: string
  signature_inspector1_stamp?: string
  signature_inspector2_signature?: string
  signature_inspector2_stamp?: string
  signature_inspector3_signature?: string
  signature_inspector3_stamp?: string
  signature_doctor_signature?: string
  signature_doctor_stamp?: string
  signature_clinic_stamp?: string
  signature_committee_head_signature?: string
  signature_committee_head_stamp?: string

  created_at: string
  updated_at: string
}

export interface CreateInspectionInput extends Partial<Omit<InspectionTask, 'id' | 'created_at' | 'updated_at'>> {
  visit_id: string
}

export interface UpdateInspectionInput extends Partial<Omit<InspectionTask, 'id' | 'visit_id' | 'created_at' | 'updated_at'>> {}

// ═══════════════════════════════════════════════════════════
// 📋 دوال API لمهام التفتيش
// ═══════════════════════════════════════════════════════════

/**
 * الحصول على مهمة تفتيش بواسطة visit_id
 */
export async function getInspectionByVisitId(visitId: string): Promise<InspectionTask | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('inspection_drafts')
    .select('*')
    .eq('visit_id', visitId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching inspection:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      visitId: visitId
    })
    return null
  }

  return data
}

/**
 * الحصول على مهمة تفتيش بواسطة ID
 */
export async function getInspectionById(id: string): Promise<InspectionTask | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('inspection_drafts')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching inspection:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      inspectionId: id
    })
    return null
  }

  return data
}

/**
 * إنشاء مهمة تفتيش جديدة
 */
export async function createInspection(input: CreateInspectionInput): Promise<InspectionTask> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('inspection_drafts')
    .insert([input])
    .select()
    .single()

  if (error) {
    console.error('Error creating inspection:', error)
    throw new Error('Failed to create inspection')
  }

  return data
}

/**
 * تحديث مهمة تفتيش
 */
export async function updateInspection(
  id: string,
  input: UpdateInspectionInput
): Promise<InspectionTask> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('inspection_drafts')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating inspection:', error)
    throw new Error('Failed to update inspection')
  }

  return data
}

/**
 * تحديث مهمة تفتيش بواسطة visit_id
 */
export async function updateInspectionByVisitId(
  visitId: string,
  input: UpdateInspectionInput
): Promise<InspectionTask> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('inspection_drafts')
    .update(input)
    .eq('visit_id', visitId)
    .select()
    .single()

  if (error) {
    console.error('Error updating inspection:', error)
    throw new Error('Failed to update inspection')
  }

  return data
}

/**
 * حذف مهمة تفتيش
 */
export async function deleteInspection(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('inspection_drafts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting inspection:', error)
    throw new Error('Failed to delete inspection')
  }
}

/**
 * حفظ أو تحديث مهمة تفتيش (upsert)
 * إذا كانت موجودة يتم تحديثها، وإلا يتم إنشاؤها
 */
export async function upsertInspection(input: CreateInspectionInput): Promise<InspectionTask> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('inspection_drafts')
    .upsert([input], {
      onConflict: 'visit_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting inspection:', error)
    throw new Error('Failed to save inspection')
  }

  return data
}

// ═══════════════════════════════════════════════════════════
// 🚀 دوال محسّنة للأداء - جلب بيانات صفحات محددة فقط
// Performance Optimized Functions - Fetch Only Page-Specific Data
// ═══════════════════════════════════════════════════════════

/**
 * الحصول على بيانات قسم العيادة فقط (24 حقل بدلاً من 186)
 * Get only clinic section data (24 fields instead of 186)
 */
export async function getInspectionClinicSection(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('inspection_drafts')
    .select(`
      id,
      visit_id,
      classification,
      license_owner,
      contact_person,
      inspector_1_name,
      inspector_2_name,
      inspector_3_name,
      clinic_environment_hygiene,
      clinic_washing_facilities,
      clinic_drying_facilities,
      clinic_disinfectant,
      clinic_sterile_gloves,
      clinic_non_sterile_gloves,
      clinic_masks,
      clinic_coat_gown,
      clinic_glasses_face_shield,
      clinic_hve,
      clinic_saliva_ejectors,
      clinic_disposable_covers,
      clinic_cups,
      clinic_bib,
      clinic_disposable_mirrors,
      clinic_disposable_trays,
      clinic_air_water_syringe,
      clinic_surfaces_disinfection,
      clinic_impression_disinfection,
      clinic_disinfection_container,
      clinic_disposable_bags,
      clinic_notes
    `)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching clinic section:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      inspectionId: id
    })
    return null
  }

  return data
}
