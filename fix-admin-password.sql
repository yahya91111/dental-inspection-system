-- ============================================================
-- إصلاح كلمة مرور المستخدم admin
-- ============================================================
-- الإيميل: admin@moh.gov.kw
-- كلمة المرور: 000000
-- ============================================================

-- تحديث كلمة المرور
UPDATE users
SET password_hash = '$2b$10$pEDdq2XxI8/VLdvranrHauA1zfYIfE9AW1wQQ4.caOk4p/WeJoPEi',
    updated_at = NOW()
WHERE email = 'admin@moh.gov.kw';

-- عرض المستخدم المحدث للتأكد
SELECT email, full_name, role, is_active, created_at, updated_at
FROM users
WHERE email = 'admin@moh.gov.kw';
