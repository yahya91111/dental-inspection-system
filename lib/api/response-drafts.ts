import { createClient } from '@/lib/supabase/client'

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ResponseDraft {
  id: string
  visit_id: string

  // Real-time Metadata
  last_updated_by?: string
  last_updated_by_name?: string
  last_updated_at?: string

  // معلومات الرد
  original_inspection_visit_id?: string
  response_date?: string
  response_day?: string

  // حالة الملاحظات
  observations_status?: 'resolved' | 'not_resolved'
  unresolved_observations?: string

  // أعضاء لجنة التفتيش
  inspector1_name?: string
  inspector1_signature?: string
  inspector1_stamp?: string

  inspector2_name?: string
  inspector2_signature?: string
  inspector2_stamp?: string

  inspector3_name?: string
  inspector3_signature?: string
  inspector3_stamp?: string

  // Committee head
  committee_head_name?: string
  committee_head_signature?: string
  committee_head_stamp?: string

  // التواريخ
  created_at?: string
  updated_at?: string
}

// ═══════════════════════════════════════════════════════════
// 📋 دوال API لمسودات محاضر الرد
// ═══════════════════════════════════════════════════════════

/**
 * الحصول على المسودة بواسطة visit_id
 */
export async function getDraftByVisitId(visitId: string): Promise<ResponseDraft | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('response_drafts')
    .select('*')
    .eq('visit_id', visitId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching response draft:', error)
    return null
  }

  return data
}

/**
 * إنشاء أو تحديث مسودة
 */
export async function upsertDraft(
  draftData: Partial<ResponseDraft>,
  userId: string,
  userName: string
): Promise<ResponseDraft | null> {
  const supabase = createClient()

  const dataToSave = {
    ...draftData,
    last_updated_by: userId,
    last_updated_by_name: userName,
    last_updated_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('response_drafts')
    .upsert(dataToSave, {
      onConflict: 'visit_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting response draft:', error)
    return null
  }

  return data
}

/**
 * حذف المسودة
 */
export async function deleteDraft(visitId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('response_drafts')
    .delete()
    .eq('visit_id', visitId)

  if (error) {
    console.error('Error deleting response draft:', error)
    return false
  }

  return true
}

/**
 * الحصول على جميع المسودات
 */
export async function getAllDrafts(): Promise<ResponseDraft[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('response_drafts')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching all response drafts:', error)
    return []
  }

  return data || []
}
