import { createClient } from '@/lib/supabase/client'
import type { InspectionDraft } from './inspection-drafts'

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface SubmittedInspection {
  id: string
  visit_id: string

  // Submission Metadata
  submitted_by: string
  submitted_by_name: string
  submitted_at: string

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
}

// ═══════════════════════════════════════════════════════════
// 📋 دوال API للتفتيشات المرسلة
// ═══════════════════════════════════════════════════════════

/**
 * الحصول على تفتيش مرسل بواسطة visit_id
 */
export async function getSubmittedInspectionByVisitId(visitId: string): Promise<SubmittedInspection | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('submitted_inspections')
    .select('*')
    .eq('visit_id', visitId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching submitted inspection:', {
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
 * الحصول على تفتيش مرسل بواسطة ID
 */
export async function getSubmittedInspectionById(id: string): Promise<SubmittedInspection | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('submitted_inspections')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching submitted inspection:', {
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
 * الحصول على جميع التفتيشات المرسلة
 */
export async function getAllSubmittedInspections(): Promise<SubmittedInspection[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('submitted_inspections')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Error fetching submitted inspections:', error)
    return []
  }

  return data || []
}

/**
 * الحصول على التفتيشات المرسلة بواسطة مستخدم معين
 */
export async function getSubmittedInspectionsByUser(userId: string): Promise<SubmittedInspection[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('submitted_inspections')
    .select('*')
    .eq('submitted_by', userId)
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Error fetching user submitted inspections:', error)
    return []
  }

  return data || []
}

/**
 * إنشاء تفتيش مرسل من مسودة
 */
export async function submitInspection(
  draft: InspectionDraft,
  userId: string,
  userName: string
): Promise<SubmittedInspection> {
  const supabase = createClient()

  // نسخ جميع البيانات من المسودة باستثناء الحقول الخاصة بالمسودة
  const { id, last_updated_by, last_updated_by_name, last_updated_at, updated_at, ...draftData } = draft

  const submissionData = {
    ...draftData,
    submitted_by: userId,
    submitted_by_name: userName,
    submitted_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('submitted_inspections')
    .insert([submissionData])
    .select()
    .single()

  if (error) {
    console.error('Error submitting inspection:', error)
    throw new Error('Failed to submit inspection')
  }

  return data
}

/**
 * نقل المسودة إلى الأرشيف وحذفها
 * This is the main function to use when submitting an inspection
 */
export async function archiveAndSubmitInspection(
  visitId: string,
  userId: string,
  userName: string
): Promise<SubmittedInspection> {
  const supabase = createClient()

  // 1. الحصول على المسودة
  const { data: draft, error: fetchError } = await supabase
    .from('inspection_drafts')
    .select('*')
    .eq('visit_id', visitId)
    .single()

  if (fetchError || !draft) {
    console.error('Error fetching draft for submission:', fetchError)
    throw new Error('Draft not found')
  }

  // 2. نقل البيانات إلى الأرشيف
  const submittedInspection = await submitInspection(draft, userId, userName)

  // 3. حذف المسودة
  const { error: deleteError } = await supabase
    .from('inspection_drafts')
    .delete()
    .eq('visit_id', visitId)

  if (deleteError) {
    console.error('Error deleting draft after submission:', deleteError)
    // لا نرمي خطأ هنا لأن التفتيش تم حفظه بنجاح
  }

  return submittedInspection
}
