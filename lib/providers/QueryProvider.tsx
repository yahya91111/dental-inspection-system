'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a client inside the component to ensure each request gets its own instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // البيانات تبقى "طازجة" لمدة 5 دقائق
        staleTime: 5 * 60 * 1000, // 5 minutes
        // Cache البيانات لمدة 10 دقائق
        gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
        // إعادة الجلب عند التركيز على النافذة
        refetchOnWindowFocus: false,
        // إعادة المحاولة مرة واحدة فقط عند الفشل
        retry: 1,
      },
      mutations: {
        // إعادة المحاولة مرة واحدة فقط عند الفشل
        retry: 1,
      }
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools للتطوير فقط - لن تظهر في الإنتاج */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
