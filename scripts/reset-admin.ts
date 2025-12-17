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

async function resetAdmin() {
  try {
    console.log('🗑️  حذف المستخدم القديم...')

    // Delete old admin
    await supabase
      .from('users')
      .delete()
      .eq('email', 'admin@moh.gov.sa')

    console.log('✅ تم الحذف')
    console.log('🔐 إنشاء مستخدم جديد...')

    // Hash the password
    const password = '123456'
    const passwordHash = await bcrypt.hash(password, 10)

    console.log('🔑 Password Hash:', passwordHash)

    // Insert new admin user
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
      throw error
    }

    console.log('✅ تم إنشاء المسؤول بنجاح!')
    console.log('📧 البريد: admin@moh.gov.sa')
    console.log('🔑 كلمة المرور: 123456')
    console.log('\n📊 بيانات المستخدم:')
    console.log(JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('❌ خطأ:', error)
  }
}

resetAdmin()
