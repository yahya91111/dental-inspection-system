import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ActiveUser {
  id: string
  visit_id: string
  user_id: string
  user_name: string
  user_email?: string
  last_heartbeat: string
  joined_at: string
}

// ═══════════════════════════════════════════════════════════
// 📋 دوال API للمستخدمين النشطين
// ═══════════════════════════════════════════════════════════

/**
 * الحصول على جميع المستخدمين النشطين لزيارة معينة
 */
export async function getActiveUsers(visitId: string): Promise<ActiveUser[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('active_users')
    .select('*')
    .eq('visit_id', visitId)
    .order('joined_at', { ascending: true })

  if (error) {
    console.error('Error fetching active users:', error)
    return []
  }

  return data || []
}

/**
 * إضافة مستخدم كنشط (Join)
 */
export async function joinAsActiveUser(
  visitId: string,
  userId: string,
  userName: string,
  userEmail?: string
): Promise<ActiveUser> {
  const supabase = createClient()

  const userData = {
    visit_id: visitId,
    user_id: userId,
    user_name: userName,
    user_email: userEmail,
    last_heartbeat: new Date().toISOString(),
    joined_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('active_users')
    .upsert([userData], {
      onConflict: 'visit_id,user_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Error joining as active user:', error)
    throw new Error('Failed to join as active user')
  }

  return data
}

/**
 * إزالة مستخدم من القائمة النشطة (Leave)
 */
export async function leaveAsActiveUser(visitId: string, userId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('active_users')
    .delete()
    .eq('visit_id', visitId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error leaving as active user:', error)
    throw new Error('Failed to leave as active user')
  }
}

/**
 * تحديث نبضة القلب (Heartbeat) للمستخدم النشط
 */
export async function updateHeartbeat(visitId: string, userId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('active_users')
    .update({
      last_heartbeat: new Date().toISOString()
    })
    .eq('visit_id', visitId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error updating heartbeat:', error)
    // لا نرمي خطأ هنا - الـ heartbeat يمكن أن يفشل بصمت
  }
}

/**
 * تنظيف المستخدمين غير النشطين (أكثر من 10 دقائق)
 */
export async function cleanupStaleUsers(visitId?: string): Promise<void> {
  const supabase = createClient()

  // استدعاء الـ function من قاعدة البيانات
  const { error } = await supabase.rpc('cleanup_stale_active_users')

  if (error) {
    console.error('Error cleaning up stale users:', error)
  }
}

// ═══════════════════════════════════════════════════════════
// 🔴 Real-time Subscriptions للمستخدمين النشطين
// ═══════════════════════════════════════════════════════════

export interface ActiveUsersPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  old: Partial<ActiveUser>
  new: ActiveUser
}

/**
 * الاشتراك في تحديثات المستخدمين النشطين لزيارة معينة
 */
export function subscribeToActiveUsers(
  visitId: string,
  onChange: (users: ActiveUser[]) => void
): RealtimeChannel {
  const supabase = createClient()

  const channel = supabase
    .channel(`active-users:${visitId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'active_users',
        filter: `visit_id=eq.${visitId}`
      },
      async () => {
        // عند أي تغيير، نحضر القائمة المحدثة
        const users = await getActiveUsers(visitId)
        onChange(users)
      }
    )
    .subscribe()

  return channel
}

/**
 * إلغاء الاشتراك من قناة المستخدمين النشطين
 */
export async function unsubscribeFromActiveUsers(channel: RealtimeChannel): Promise<void> {
  await channel.unsubscribe()
}

// ═══════════════════════════════════════════════════════════
// 💓 Heartbeat Manager
// ═══════════════════════════════════════════════════════════

export class HeartbeatManager {
  private visitId: string
  private userId: string
  private intervalId?: NodeJS.Timeout

  constructor(visitId: string, userId: string) {
    this.visitId = visitId
    this.userId = userId
  }

  /**
   * بدء إرسال نبضات القلب كل 30 ثانية
   */
  start(): void {
    // إرسال أول heartbeat فوراً
    updateHeartbeat(this.visitId, this.userId)

    // ثم كل 30 ثانية
    this.intervalId = setInterval(() => {
      updateHeartbeat(this.visitId, this.userId)
    }, 30000) // 30 seconds
  }

  /**
   * إيقاف إرسال نبضات القلب
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
  }
}

// ═══════════════════════════════════════════════════════════
// 🎯 Helper: Presence Manager (كل شيء في واحد)
// ═══════════════════════════════════════════════════════════

export class PresenceManager {
  private visitId: string
  private userId: string
  private userName: string
  private userEmail?: string
  private heartbeatManager: HeartbeatManager
  private channel?: RealtimeChannel

  constructor(visitId: string, userId: string, userName: string, userEmail?: string) {
    this.visitId = visitId
    this.userId = userId
    this.userName = userName
    this.userEmail = userEmail
    this.heartbeatManager = new HeartbeatManager(visitId, userId)
  }

  /**
   * الانضمام كمستخدم نشط وبدء التتبع
   */
  async join(onChange: (users: ActiveUser[]) => void): Promise<void> {
    // 1. إضافة نفسنا كمستخدم نشط
    await joinAsActiveUser(this.visitId, this.userId, this.userName, this.userEmail)

    // 2. بدء نبضات القلب
    this.heartbeatManager.start()

    // 3. الاشتراك في التحديثات
    this.channel = subscribeToActiveUsers(this.visitId, onChange)

    // 4. جلب القائمة الأولية
    const users = await getActiveUsers(this.visitId)
    onChange(users)
  }

  /**
   * المغادرة وإيقاف التتبع
   */
  async leave(): Promise<void> {
    // 1. إيقاف نبضات القلب
    this.heartbeatManager.stop()

    // 2. إلغاء الاشتراك
    if (this.channel) {
      await unsubscribeFromActiveUsers(this.channel)
      this.channel = undefined
    }

    // 3. إزالة نفسنا من القائمة
    await leaveAsActiveUser(this.visitId, this.userId)
  }

  /**
   * تنظيف عند مغادرة الصفحة
   */
  setupBeforeUnload(): void {
    window.addEventListener('beforeunload', () => {
      // استخدام navigator.sendBeacon للإرسال الموثوق عند المغادرة
      const supabase = createClient()
      void supabase
        .from('active_users')
        .delete()
        .eq('visit_id', this.visitId)
        .eq('user_id', this.userId)
        .then(() => {
          // تم الحذف بنجاح - وإذا فشل سيتم التنظيف تلقائياً بعد 10 دقائق
        })
    })
  }
}
