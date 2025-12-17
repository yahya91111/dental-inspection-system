import { createClient } from '@/lib/supabase/client'

// Types
export type VisitType = 'inspection' | 'not_inspected' | 'response' | 'closure' | 'examination'
export type VisitStatus = 'draft' | 'submitted' | 'completed'

export interface Visit {
  id: string
  clinic_id: string
  visit_type: VisitType
  visit_date?: string
  visit_number?: number
  visit_day?: string
  status: VisitStatus
  created_at: string
  updated_at: string
}

export interface CreateVisitInput {
  clinic_id: string
  visit_type: VisitType
  visit_date?: string
  visit_number?: number
  visit_day?: string
  status?: VisitStatus
}

export interface UpdateVisitInput extends Partial<CreateVisitInput> {}

// ═══════════════════════════════════════════════════════════
// 📋 دوال API للزيارات
// ═══════════════════════════════════════════════════════════

/**
 * الحصول على جميع الزيارات
 */
export async function getAllVisits(): Promise<Visit[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching visits:', error)
    throw new Error('Failed to fetch visits')
  }

  return data || []
}

/**
 * الحصول على زيارات عيادة معينة
 */
export async function getVisitsByClinicId(clinicId: string): Promise<Visit[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clinic visits:', error)
    throw new Error('Failed to fetch clinic visits')
  }

  return data || []
}

/**
 * الحصول على زيارة واحدة بواسطة ID
 */
export async function getVisitById(id: string): Promise<Visit | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching visit:', error)
    return null
  }

  return data
}

/**
 * الحصول على الزيارات حسب النوع
 */
export async function getVisitsByType(
  clinicId: string,
  type: VisitType
): Promise<Visit[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('visit_type', type)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching visits by type:', error)
    throw new Error('Failed to fetch visits by type')
  }

  return data || []
}

/**
 * إضافة زيارة جديدة
 */
export async function createVisit(input: CreateVisitInput): Promise<Visit> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('visits')
    .insert([input])
    .select()
    .single()

  if (error) {
    // إذا كان الخطأ بسبب تكرار المفتاح (زيارة draft موجودة)، قم بجلبها
    if (error.code === '23505' && input.status === 'draft') {
      console.log('Draft visit already exists, fetching it...')
      return getDraftVisit(input.clinic_id, input.visit_type)
        .then(visit => {
          if (visit) return visit
          throw new Error('Failed to fetch existing draft visit')
        })
    }

    console.error('Error creating visit:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fullError: error
    })
    throw new Error(`Failed to create visit: ${error.message || JSON.stringify(error)}`)
  }

  return data
}

/**
 * تحديث زيارة
 */
export async function updateVisit(
  id: string,
  input: UpdateVisitInput
): Promise<Visit> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('visits')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating visit:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      fullError: error
    })
    throw new Error(`Failed to update visit: ${error.message || JSON.stringify(error)}`)
  }

  return data
}

/**
 * حذف زيارة
 */
export async function deleteVisit(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('visits')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting visit:', error)
    throw new Error('Failed to delete visit')
  }
}

/**
 * تحديث حالة الزيارة
 */
export async function updateVisitStatus(
  id: string,
  status: VisitStatus
): Promise<Visit> {
  return updateVisit(id, { status })
}

/**
 * الحصول على زيارة Draft من نوع معين
 * (يبحث عن visit واحد فقط بحالة draft)
 */
export async function getDraftVisit(
  clinicId: string,
  type: VisitType
): Promise<Visit | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('visit_type', type)
    .eq('status', 'draft')
    .maybeSingle()

  if (error) {
    console.error('Error fetching draft visit:', error)
    return null
  }

  return data
}
