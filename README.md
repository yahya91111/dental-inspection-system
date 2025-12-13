# نظام التفتيش الصحي

نظام إدارة التفتيش على المنشآت الصحية - Progressive Web App

## المميزات

✅ **تصميم حديث وعصري** - واجهة بيضاء نظيفة مع كروت وظلال
✅ **Mobile-First** - مصمم خصيصاً للهواتف المحمولة
✅ **PWA** - يعمل كتطبيق أصلي على Android و iOS
✅ **Offline Mode** - إمكانية العمل بدون إنترنت
✅ **سريع جداً** - Next.js 14 مع Server-Side Rendering
✅ **آمن** - Row Level Security + تشفير كلمات المرور

---

## التقنيات المستخدمة

- **Frontend:** Next.js 14 + React + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth + bcrypt
- **PWA:** next-pwa
- **Offline:** IndexedDB + Service Workers

---

## البنية الأساسية

### قاعدة البيانات (7 جداول):

1. **users** - المستخدمون (مسؤول / مفتش)
2. **facilities** - المنشآت (عيادات، مستوصفات، مستشفيات، مختبرات)
3. **tasks** - المهام (تفتيش، متابعة، معاينة)
4. **task_inspectors** - ربط المفتشين بالمهام
5. **task_responses** - إجابات النماذج + التوقيع + الختم
6. **attachments** - المرفقات (صور، مستندات)
7. **audit_log** - سجل التعديلات

---

## التثبيت والإعداد

### 1. تثبيت المتطلبات

```bash
cd dental-inspection-app
npm install
```

### 2. إعداد Supabase

#### أ) إنشاء مشروع Supabase

1. اذهب إلى [supabase.com](https://supabase.com)
2. سجل حساب جديد
3. أنشئ مشروع جديد:
   - اسم المشروع: `dental-inspection`
   - كلمة مرور قاعدة البيانات: (احفظها في مكان آمن)
   - المنطقة: اختر الأقرب لك

#### ب) تشغيل SQL Migration

1. بعد إنشاء المشروع، اذهب إلى **SQL Editor**
2. افتح ملف `supabase/migrations/001_initial_schema.sql`
3. انسخ المحتوى كاملاً والصقه في SQL Editor
4. اضغط **Run**
5. ستُنشأ جميع الجداول تلقائياً!

#### ج) الحصول على المفاتيح

1. اذهب إلى **Settings** → **API**
2. انسخ:
   - **Project URL**
   - **anon/public key**
   - **service_role key** (احذر: سري!)

### 3. إعداد ملف البيئة

```bash
# أنشئ ملف .env.local
cp .env.local.example .env.local
```

افتح `.env.local` وأضف المفاتيح:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. تشغيل التطبيق

```bash
npm run dev
```

افتح المتصفح على: `http://localhost:3000`

---

## معاينة التطبيق على الهاتف

### الطريقة 1: على نفس الشبكة (للتطوير)

1. تأكد أن الكمبيوتر والهاتف على نفس الواي فاي
2. افتح Terminal واكتب:

**Windows:**
```bash
ipconfig
```

**Mac/Linux:**
```bash
ifconfig
```

3. ابحث عن **IPv4 Address** (مثلاً: `192.168.1.100`)
4. على الهاتف، افتح: `http://192.168.1.100:3000`

### الطريقة 2: Vercel (للنشر والمشاركة)

#### أ) رفع المشروع على GitHub

```bash
# أنشئ repository جديد على GitHub
# ثم:
git remote add origin https://github.com/your-username/dental-inspection-app.git
git branch -M main
git push -u origin main
```

#### ب) ربط Vercel

1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل الدخول بحساب GitHub
3. اضغط **Import Project**
4. اختر repository: `dental-inspection-app`
5. أضف Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ```
6. اضغط **Deploy**

#### ج) المشاركة مع الزملاء

بعد النشر، ستحصل على رابط مثل:
```
https://dental-inspection-app.vercel.app
```

شارك هذا الرابط مع زملائك!

---

## تثبيت التطبيق على الهاتف (PWA)

### على Android:

1. افتح الرابط في **Chrome**
2. ستظهر رسالة: "Add to Home Screen"
3. اضغط عليها
4. التطبيق سيظهر في الشاشة الرئيسية!

### على iPhone:

1. افتح الرابط في **Safari**
2. اضغط زر المشاركة (المربع + السهم)
3. اختر **"Add to Home Screen"**
4. اضغط **Add**
5. التطبيق سيظهر مع باقي التطبيقات!

---

## إضافة أول مستخدم (مسؤول)

بما أن صفحة التسجيل غير متاحة، ستحتاج لإضافة المسؤول الأول يدوياً:

### عبر Supabase Dashboard:

1. اذهب إلى **Table Editor** → **users**
2. اضغط **Insert** → **Insert row**
3. أدخل البيانات:

```
email: admin@moh.gov.sa
password_hash: (استخدم الكود أدناه لتشفير كلمة المرور)
role: admin
full_name: المسؤول الرئيسي
phone: 0501234567
is_active: true
```

### تشفير كلمة المرور:

استخدم هذا الكود في Node.js:

```javascript
const bcrypt = require('bcryptjs');
const password = '123456'; // كلمة المرور التي تريدها
const hash = bcrypt.hashSync(password, 10);
console.log(hash); // انسخ النتيجة
```

أو استخدم موقع: https://bcrypt-generator.com/

---

## الخطوات التالية

الآن التطبيق جاهز للبدء! الخطوات التالية:

1. ✅ إضافة صفحات إدارة المنشآت
2. ✅ إضافة صفحات إنشاء المهام
3. ✅ بناء نماذج التفتيش
4. ✅ إضافة التوقيع الإلكتروني
5. ✅ إضافة خرائط Google Maps
6. ✅ إضافة التقارير والإحصائيات

---

## الدعم

إذا واجهت أي مشكلة:

1. تحقق من ملف `.env.local`
2. تأكد من تشغيل SQL migration في Supabase
3. تحقق من Console في المتصفح (F12)

---

## الترخيص

هذا المشروع مجهود شخصي لتسهيل عمل التفتيش - غير تابع رسمياً لوزارة الصحة.
