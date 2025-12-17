import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    const debug: any = {
      timestamp: new Date().toISOString(),
      env_check: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ موجود' : '❌ غير موجود',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ موجود' : '❌ غير موجود',
      }
    }

    // Test Supabase connection
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      // Test query
      const { data, error } = await supabase
        .from("users")
        .select("email, full_name, role, is_active")
        .limit(5)

      if (error) {
        debug.supabase_test = {
          status: '❌ خطأ',
          error: error.message,
          hint: error.hint || 'لا يوجد',
          details: error.details || 'لا يوجد'
        }
      } else {
        debug.supabase_test = {
          status: '✅ نجح',
          users_found: data?.length || 0,
          users: data
        }
      }
    } else {
      debug.supabase_test = '❌ لم يتم الاختبار - المتغيرات البيئية غير موجودة'
    }

    return NextResponse.json(debug, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
