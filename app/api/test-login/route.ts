import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const debug: any = {
      step1_input: {
        email_received: email,
        password_received: password ? `${password.length} characters` : 'empty',
        email_trimmed: email?.trim(),
      }
    }

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'Environment variables missing',
        debug
      }, { status: 500 })
    }

    debug.step2_env = {
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      service_key_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }

    // Create Supabase client
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

    // Find user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email?.trim())
      .single()

    debug.step3_user_query = {
      query: `SELECT * FROM users WHERE email = '${email?.trim()}'`,
      user_found: !!user,
      error: userError?.message || null
    }

    if (userError || !user) {
      // Try to find all users to see what's in the database
      const { data: allUsers } = await supabase
        .from("users")
        .select("email, full_name, role")
        .limit(10)

      debug.step3_all_users = allUsers

      return NextResponse.json({
        error: 'User not found',
        debug,
        hint: 'تأكد من أن الإيميل صحيح ومطابق لما في قاعدة البيانات'
      }, { status: 404 })
    }

    debug.step4_user_data = {
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
      password_hash_starts: user.password_hash?.substring(0, 20) + '...'
    }

    // Check if active
    if (!user.is_active) {
      return NextResponse.json({
        error: 'User is not active',
        debug
      }, { status: 403 })
    }

    // Verify password
    debug.step5_password_check = {
      password_provided: password,
      hash_in_db: user.password_hash
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    debug.step6_password_result = {
      is_valid: isPasswordValid,
      bcrypt_version: bcrypt.getRounds ? 'bcryptjs' : 'unknown'
    }

    if (!isPasswordValid) {
      // Try to generate what the hash should be
      const testHash = await bcrypt.hash(password, 10)
      const testCompare = await bcrypt.compare(password, testHash)

      debug.step7_test_hash = {
        generated_hash: testHash,
        test_compare: testCompare,
        hash_matches_db: testHash === user.password_hash
      }

      return NextResponse.json({
        error: 'Password is incorrect',
        debug,
        hint: 'كلمة المرور غير صحيحة أو الـ hash في قاعدة البيانات تالف'
      }, { status: 401 })
    }

    // Success!
    const { password_hash, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح! ✅',
      user: userWithoutPassword,
      debug
    })

  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
