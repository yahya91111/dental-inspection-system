import { createClient } from '@/lib/supabase/client'

// Types
export interface Clinic {
  id: string
  name: string
  address?: string
  phone?: string
  location_url?: string
  created_at: string
  updated_at: string
}

export interface CreateClinicInput {
  name: string
  address?: string
  phone?: string
  location_url?: string
}

export interface UpdateClinicInput extends Partial<CreateClinicInput> {}

// ═══════════════════════════════════════════════════════════
// 📋 دوال API للعيادات
// ═══════════════════════════════════════════════════════════

/**
 * الحصول على جميع العيادات
 */
export async function getAllClinics(): Promise<Clinic[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clinics - Full error:', JSON.stringify(error, null, 2))
    console.error('Error message:', error.message)
    throw new Error(`Failed to fetch clinics: ${error.message || 'Unknown error'}`)
  }

  return data || []
}

/**
 * الحصول على عيادة واحدة بواسطة ID
 */
export async function getClinicById(id: string): Promise<Clinic | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching clinic:', error)
    return null
  }

  return data
}

/**
 * البحث عن عيادات بالاسم
 */
export async function searchClinics(query: string): Promise<Clinic[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error searching clinics:', error)
    throw new Error('Failed to search clinics')
  }

  return data || []
}

/**
 * إضافة عيادة جديدة
 */
export async function createClinic(input: CreateClinicInput): Promise<Clinic> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('clinics')
    .insert([input])
    .select()
    .single()

  if (error) {
    console.error('Error creating clinic - Full error:', JSON.stringify(error, null, 2))
    console.error('Error message:', error.message)
    console.error('Error details:', error.details)
    console.error('Error hint:', error.hint)
    console.error('Error code:', error.code)
    throw new Error(`Failed to create clinic: ${error.message || 'Unknown error'}`)
  }

  return data
}

/**
 * تحديث عيادة
 */
export async function updateClinic(
  id: string,
  input: UpdateClinicInput
): Promise<Clinic> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('clinics')
    .update(input)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating clinic:', error)
    throw new Error('Failed to update clinic')
  }

  return data
}

/**
 * حذف عيادة
 */
export async function deleteClinic(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('clinics')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting clinic:', error)
    throw new Error('Failed to delete clinic')
  }
}
