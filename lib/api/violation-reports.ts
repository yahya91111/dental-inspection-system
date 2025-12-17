import { createClient } from '@/lib/supabase/client'

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ViolationReport {
  id: string
  visit_id: string
  report_number: number

  // معلومات أساسية (مشتركة)
  inspector1_name: string
  inspector2_name: string
  inspector3_name: string
  inspection_date: string
  inspection_day: string
  inspection_time: string

  // معلومات الموقع (مشتركة)
  facility_name: string
  area: string
  block: string
  street: string
  plot_number: string
  floor: string

  // المخالفات (مختلفة لكل محضر)
  violations_list: Array<{
    id: string
    text: string
  }>

  // معلومات المواجهة (مختلفة لكل محضر)
  confronted_person: string
  person_title: string
  statement: string

  // توقيع المخالف (مختلف لكل محضر)
  violator_signature: string

  created_at: string
  updated_at: string
}

export interface ViolationReportInput {
  visit_id: string
  report_number: number
  inspector1_name: string
  inspector2_name: string
  inspector3_name: string
  inspection_date: string
  inspection_day: string
  inspection_time: string
  facility_name: string
  area: string
  block: string
  street: string
  plot_number: string
  floor: string
  violations_list: Array<{
    id: string
    text: string
  }>
  confronted_person: string
  person_title: string
  statement: string
  violator_signature: string
}

// ═══════════════════════════════════════════════════════════
// 📋 دوال API لمحاضر المخالفات
// ═══════════════════════════════════════════════════════════

/**
 * الحصول على جميع محاضر المخالفات لزيارة معينة
 */
export async function getViolationReportsByVisitId(visitId: string): Promise<ViolationReport[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('violation_reports')
    .select('*')
    .eq('visit_id', visitId)
    .order('report_number', { ascending: true })

  if (error) {
    console.error('Error fetching violation reports:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      visitId: visitId
    })
    return []
  }

  return data || []
}

/**
 * الحصول على محضر مخالفة معين بواسطة ID
 */
export async function getViolationReportById(id: string): Promise<ViolationReport | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('violation_reports')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching violation report:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      reportId: id
    })
    return null
  }

  return data
}

/**
 * إنشاء محضر مخالفة جديد
 */
export async function createViolationReport(
  reportData: ViolationReportInput
): Promise<ViolationReport | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('violation_reports')
    .insert([reportData])
    .select()
    .single()

  if (error) {
    console.error('Error creating violation report:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return null
  }

  return data
}

/**
 * تحديث محضر مخالفة
 */
export async function updateViolationReport(
  id: string,
  reportData: Partial<ViolationReportInput>
): Promise<ViolationReport | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('violation_reports')
    .update(reportData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating violation report:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      reportId: id
    })
    return null
  }

  return data
}

/**
 * حذف محضر مخالفة
 */
export async function deleteViolationReport(id: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('violation_reports')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting violation report:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      reportId: id
    })
    return false
  }

  return true
}

/**
 * الحصول على رقم المحضر التالي لزيارة معينة
 */
export async function getNextReportNumber(visitId: string): Promise<number> {
  const reports = await getViolationReportsByVisitId(visitId)

  if (reports.length === 0) {
    return 1
  }

  const maxReportNumber = Math.max(...reports.map(r => r.report_number))
  return maxReportNumber + 1
}

/**
 * نسخ البيانات المشتركة من محضر إلى آخر
 */
export async function copyCommonDataFromFirstReport(
  visitId: string
): Promise<Partial<ViolationReportInput> | null> {
  const reports = await getViolationReportsByVisitId(visitId)

  if (reports.length === 0) {
    return null
  }

  const firstReport = reports[0]

  return {
    visit_id: visitId,
    inspector1_name: firstReport.inspector1_name,
    inspector2_name: firstReport.inspector2_name,
    inspector3_name: firstReport.inspector3_name,
    inspection_date: firstReport.inspection_date,
    inspection_day: firstReport.inspection_day,
    inspection_time: firstReport.inspection_time,
    facility_name: firstReport.facility_name,
    area: firstReport.area,
    block: firstReport.block,
    street: firstReport.street,
    plot_number: firstReport.plot_number,
    floor: firstReport.floor
  }
}
