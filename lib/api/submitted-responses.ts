import { createClient } from '@/lib/supabase/client'
import type { ResponseDraft } from './response-drafts'

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface SubmittedResponse {
  id: string
  visit_id: string

  // Submission Metadata
  submitted_by: string
  submitted_by_name: string
  submitted_at: string

  // معلومات الرد
  original_inspection_visit_id: string
  response_date: string
  response_day: string

  // حالة الملاحظات
  observations_status: 'resolved' | 'not_resolved'
  unresolved_observations?: string

  // أعضاء لجنة التفتيش
  inspector1_name: string
  inspector1_signature?: string
  inspector1_stamp?: string

  inspector2_name?: string
  inspector2_signature?: string
  inspector2_stamp?: string

  inspector3_name?: string
  inspector3_signature?: string
  inspector3_stamp?: string

  // Committee head
  committee_head_name: string
  committee_head_signature?: string
  committee_head_stamp?: string

  // التواريخ
  created_at: string
}

// ═══════════════════════════════════════════════════════════
// 📤 دوال API لمحاضر الرد المرسلة
// ═══════════════════════════════════════════════════════════

/**
 * الحصول على محضر رد مرسل بواسطة visit_id
 */
export async function getSubmittedResponseByVisitId(visitId: string): Promise<SubmittedResponse | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('submitted_responses')
    .select('*')
    .eq('visit_id', visitId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching submitted response:', error)
    return null
  }

  return data
}

/**
 * أرشفة وإرسال محضر الرد (نقل من المسودات إلى المرسلة)
 */
export async function archiveAndSubmitResponse(
  draftData: ResponseDraft,
  userId: string,
  userName: string
): Promise<SubmittedResponse | null> {
  const supabase = createClient()

  // إعداد البيانات للأرشفة
  const submittedData = {
    visit_id: draftData.visit_id,
    submitted_by: userId,
    submitted_by_name: userName,
    submitted_at: new Date().toISOString(),

    // معلومات الرد
    original_inspection_visit_id: draftData.original_inspection_visit_id,
    response_date: draftData.response_date,
    response_day: draftData.response_day,

    // حالة الملاحظات
    observations_status: draftData.observations_status,
    unresolved_observations: draftData.unresolved_observations,

    // أعضاء لجنة التفتيش
    inspector1_name: draftData.inspector1_name,
    inspector1_signature: draftData.inspector1_signature,
    inspector1_stamp: draftData.inspector1_stamp,

    inspector2_name: draftData.inspector2_name,
    inspector2_signature: draftData.inspector2_signature,
    inspector2_stamp: draftData.inspector2_stamp,

    inspector3_name: draftData.inspector3_name,
    inspector3_signature: draftData.inspector3_signature,
    inspector3_stamp: draftData.inspector3_stamp,

    // Committee head
    committee_head_name: draftData.committee_head_name,
    committee_head_signature: draftData.committee_head_signature,
    committee_head_stamp: draftData.committee_head_stamp,
  }

  // إدراج في جدول submitted_responses
  const { data, error } = await supabase
    .from('submitted_responses')
    .insert([submittedData])
    .select()
    .single()

  if (error) {
    console.error('Error archiving response:', error)
    return null
  }

  return data
}

/**
 * الحصول على جميع محاضر الرد المرسلة
 */
export async function getAllSubmittedResponses(): Promise<SubmittedResponse[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('submitted_responses')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Error fetching submitted responses:', error)
    return []
  }

  return data || []
}

/**
 * الحصول على محاضر الرد المرسلة لتفتيش أصلي محدد
 */
export async function getSubmittedResponsesByOriginalInspectionId(
  originalInspectionVisitId: string
): Promise<SubmittedResponse[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('submitted_responses')
    .select('*')
    .eq('original_inspection_visit_id', originalInspectionVisitId)
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Error fetching submitted responses by original inspection:', error)
    return []
  }

  return data || []
}
