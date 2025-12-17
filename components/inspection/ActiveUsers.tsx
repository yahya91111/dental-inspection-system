'use client'

import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import type { ActiveUser } from '@/lib/api/active-users'

interface ActiveUsersProps {
  activeUsers: ActiveUser[]
  currentUserId: string
}

export function ActiveUsers({ activeUsers, currentUserId }: ActiveUsersProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // فلترة المستخدمين الآخرين (ليس المستخدم الحالي)
  const otherUsers = activeUsers.filter(user => user.user_id !== currentUserId)

  if (otherUsers.length === 0) {
    return null
  }

  return (
    <div className="fixed top-20 left-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 max-w-xs">
      <div className="flex items-center gap-2 mb-3">
        <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
          المستخدمون النشطون
        </h3>
      </div>

      <div className="space-y-2">
        {otherUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-2 text-sm"
          >
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                {user.user_name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {user.user_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                يعمل الآن
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          {otherUsers.length === 1 ? 'مستخدم واحد' : `${otherUsers.length} مستخدمين`} يعملون معك
        </p>
      </div>
    </div>
  )
}
