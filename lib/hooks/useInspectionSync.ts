import { useEffect, useRef, useCallback } from 'react'
import { debounce } from 'lodash'
import { upsertDraft } from '@/lib/api/inspection-drafts'

interface UseInspectionSyncOptions {
  visitId: string
  userId: string
  userName: string
  isDataLoaded: boolean
}

/**
 * Hook للـ Hybrid System: sessionStorage + debounced database sync
 *
 * يحفظ البيانات في sessionStorage فوراً (سريع)
 * ويرسلها إلى database كل 3 ثواني (للمشاركة مع المستخدمين الآخرين)
 */
export function useInspectionSync<T extends Record<string, any>>(
  storageKey: string,
  data: T,
  options: UseInspectionSyncOptions
) {
  const { visitId, userId, userName, isDataLoaded } = options
  const syncTimeoutRef = useRef<NodeJS.Timeout>()
  const lastSyncedDataRef = useRef<string>('')

  // Debounced function للحفظ في database
  const debouncedDatabaseSync = useRef(
    debounce(async (dataToSync: T) => {
      try {
        await upsertDraft(
          {
            visit_id: visitId,
            ...dataToSync
          },
          userId,
          userName
        )
        console.log(`✅ Synced ${storageKey} to database`)
      } catch (error) {
        console.error(`❌ Error syncing ${storageKey}:`, error)
      }
    }, 3000) // Sync every 3 seconds
  ).current

  // Auto-save to sessionStorage + database
  useEffect(() => {
    if (!isDataLoaded) return

    // 1. حفظ فوراً في sessionStorage (سريع)
    sessionStorage.setItem(storageKey, JSON.stringify(data))

    // 2. حفظ في database بعد 3 ثواني (للمشاركة)
    const dataString = JSON.stringify(data)
    if (dataString !== lastSyncedDataRef.current) {
      debouncedDatabaseSync(data)
      lastSyncedDataRef.current = dataString
    }
  }, [data, storageKey, isDataLoaded, debouncedDatabaseSync])

  // Cleanup
  useEffect(() => {
    return () => {
      debouncedDatabaseSync.cancel()
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [debouncedDatabaseSync])
}
