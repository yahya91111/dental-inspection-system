import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Load environment variables
config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...')

    // Hash the password
    const password = '123456' // كلمة المرور الافتراضية
    const passwordHash = await bcrypt.hash(password, 10)

    // Insert admin user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: 'admin@moh.gov.sa',
          password_hash: passwordHash,
          role: 'admin',
          full_name: 'المسؤول الرئيسي',
          phone: '0501234567',
          is_active: true
        }
      ])
      .select()

    if (error) {
      if (error.code === '23505') {
        console.log('✅ المستخدم موجود مسبقاً!')
      } else {
        throw error
      }
    } else {
      console.log('✅ تم إنشاء المسؤول بنجاح!')
      console.log('📧 البريد: admin@moh.gov.sa')
      console.log('🔑 كلمة المرور: 123456')
    }
  } catch (error) {
    console.error('❌ خطأ:', error)
  }
}

createAdmin()
