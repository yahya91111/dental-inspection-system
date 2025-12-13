"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  const stats = [
    {
      title: "إجمالي المنشآت",
      value: "0",
      icon: "🏥",
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "المهام النشطة",
      value: "0",
      icon: "📋",
      color: "bg-green-50 border-green-200",
    },
    {
      title: "المفتشون",
      value: "0",
      icon: "👥",
      color: "bg-purple-50 border-purple-200",
    },
    {
      title: "المهام المكتملة",
      value: "0",
      icon: "✅",
      color: "bg-amber-50 border-amber-200",
    },
  ]

  const quickActions = [
    { title: "إضافة منشأة جديدة", icon: "➕", action: () => {} },
    { title: "إنشاء مهمة تفتيش", icon: "📝", action: () => {} },
    { title: "إضافة مفتش", icon: "👤", action: () => {} },
    { title: "عرض التقارير", icon: "📊", action: () => {} },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">لوحة المسؤول</h1>
              <p className="text-sm text-gray-500 mt-1">نظام إدارة التفتيش الصحي</p>
            </div>
            <Button variant="outline" className="gap-2">
              <span>تسجيل الخروج</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className={`${stat.color} border-2 shadow-sm hover:shadow-md transition-shadow`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="shadow-md mb-8">
          <CardHeader>
            <CardTitle className="text-lg">الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={action.action}
                >
                  <span className="text-2xl">{action.icon}</span>
                  <span className="text-sm font-medium">{action.title}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">المهام الأخيرة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <p>لا توجد مهام حالياً</p>
                <Button className="mt-4" variant="outline">إنشاء مهمة جديدة</Button>
              </div>
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">المنشآت</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <p>لا توجد منشآت مسجلة</p>
                <Button className="mt-4" variant="outline">إضافة منشأة</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
