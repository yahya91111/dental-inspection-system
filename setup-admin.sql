-- إنشاء جدول المستخدمين إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'inspector',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE
);

-- حذف المستخدم admin إذا كان موجوداً (لتجنب التكرار)
DELETE FROM users WHERE email = 'admin@moh.gov.kw';

-- إضافة مستخدم admin
INSERT INTO users (
  id,
  email,
  password_hash,
  full_name,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@moh.gov.kw',
  '$2b$10$D58TK/DY.Q8sANm/zCItSeM09wNX49h3vY6x3rRqlWIQblwrODnpC',
  'مدير النظام',
  'admin',
  true,
  NOW(),
  NOW()
);

-- عرض المستخدمين الموجودين
SELECT id, email, full_name, role, is_active, created_at FROM users;
