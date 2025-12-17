import type { Metadata } from "next"
import "./globals.css"
import { QueryProvider } from "@/lib/providers/QueryProvider"

export const metadata: Metadata = {
  title: "نظام التفتيش الصحي",
  description: "نظام إدارة التفتيش على المنشآت الصحية",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "نظام التفتيش",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased" style={{ margin: 0, padding: 0, overflow: 'hidden', backgroundColor: '#ffffff', height: '100vh' }}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
