"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function InspectorDashboard() {
  const stats = [
    {
      title: "المهام المعلقة",
      value: "0",
      icon: "⏳",
      color: "bg-yellow-50 border-yellow-200",
    },
    {
      title: "قيد التنفيذ",
      value: "0",
      icon: "🔄",
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "المكتملة",
      value: "0",
      icon: "✅",
      color: "bg-green-50 border-green-200",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">مهامي</h1>
              <p className="text-sm text-gray-500 mt-1">مرحباً بك في نظام التفتيش</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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

        {/* Tasks List */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">قائمة المهام</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">الكل</Button>
              <Button variant="outline" size="sm">معلقة</Button>
              <Button variant="outline" size="sm">مكتملة</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16 text-gray-500">
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">لا توجد مهام حالياً</p>
              <p className="text-sm mt-2">سيتم إشعارك عند تعيين مهمة جديدة لك</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
