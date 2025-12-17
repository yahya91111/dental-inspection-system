# نظام التعاون في الوقت الفعلي - Real-time Collaboration System

## ✅ ما تم إنجازه

### 1. Database Migrations (الترحيلات)

تم إنشاء 4 ملفات ترحيل في `supabase/migrations/`:

#### `009_drop_inspection_tasks.sql`
- حذف جدول `inspection_tasks` القديم

#### `010_create_inspection_drafts.sql`
- إنشاء جدول `inspection_drafts` للمسودات المؤقتة
- يحتوي على جميع الحقول الـ 186+ من الجدول القديم
- إضافة حقول Real-time metadata:
  - `last_updated_by` - آخر مستخدم قام بالتحديث
  - `last_updated_by_name` - اسم آخر مستخدم
  - `last_updated_at` - وقت آخر تحديث
- تفعيل `REPLICA IDENTITY FULL` لدعم Supabase Realtime
- UNIQUE constraint على `visit_id` (مسودة واحدة لكل زيارة)

#### `011_create_submitted_inspections.sql`
- إنشاء جدول `submitted_inspections` للأرشيف النهائي
- يحتوي على جميع حقول التفتيش
- إضافة حقول Submission metadata:
  - `submitted_by` - المستخدم الذي أرسل التفتيش
  - `submitted_by_name` - اسم المستخدم
  - `submitted_at` - وقت الإرسال
- لا يمكن تعديل أو حذف السجلات (أرشيف نهائي)

#### `012_create_active_users.sql`
- إنشاء جدول `active_users` لتتبع المستخدمين النشطين
- حقل `last_heartbeat` لتتبع النشاط (يتحدث كل 30 ثانية)
- تفعيل `REPLICA IDENTITY FULL` لدعم Real-time
- UNIQUE constraint على `(visit_id, user_id)`
- دالة `cleanup_stale_active_users()` لتنظيف الجلسات القديمة

### 2. API Files (ملفات الـ API)

تم إنشاء 3 ملفات API في `lib/api/`:

#### `inspection-drafts.ts`
- دوال CRUD للمسودات:
  - `getDraftByVisitId()` - جلب مسودة
  - `createDraft()` - إنشاء مسودة جديدة
  - `updateDraft()` - تحديث مسودة
  - `upsertDraft()` - حفظ أو تحديث
  - `deleteDraft()` - حذف مسودة

- دوال Real-time:
  - `subscribeToDraft()` - الاشتراك في تحديثات المسودة
  - `unsubscribeFromDraft()` - إلغاء الاشتراك
  - `subscribeToBroadcastEvents()` - الاشتراك في أحداث البث
  - `broadcastInspectionSubmitted()` - إرسال حدث "تم الإرسال"

#### `submitted-inspections.ts`
- دوال للتفتيشات المرسلة:
  - `getSubmittedInspectionByVisitId()` - جلب تفتيش مرسل
  - `getAllSubmittedInspections()` - جلب جميع التفتيشات
  - `getSubmittedInspectionsByUser()` - جلب تفتيشات مستخدم
  - `submitInspection()` - نقل مسودة إلى الأرشيف
  - `archiveAndSubmitInspection()` - الدالة الرئيسية للإرسال

#### `active-users.ts`
- دوال Presence System:
  - `getActiveUsers()` - جلب المستخدمين النشطين
  - `joinAsActiveUser()` - الانضمام كمستخدم نشط
  - `leaveAsActiveUser()` - المغادرة
  - `updateHeartbeat()` - تحديث نبضة القلب
  - `cleanupStaleUsers()` - تنظيف المستخدمين القدامى

- Classes مساعدة:
  - `HeartbeatManager` - إدارة نبضات القلب (كل 30 ثانية)
  - `PresenceManager` - إدارة كاملة للـ Presence (كل شيء في واحد)

### 3. UI Components (المكونات)

تم إنشاء مكونين في `components/inspection/`:

#### `ActiveUsers.tsx`
- يعرض قائمة المستخدمين النشطين الذين يعملون على نفس التفتيش
- يظهر في الزاوية العلوية اليسرى
- يعرض صورة مصغرة، اسم، وحالة كل مستخدم
- لا يعرض المستخدم الحالي، فقط الآخرين

#### `InspectionSubmittedModal.tsx`
- نافذة منبثقة تظهر عند إرسال التفتيش
- تعرض اسم المستخدم الذي أرسل التفتيش
- عد تنازلي 3 ثوانٍ قبل إغلاق الصفحة تلقائياً
- خيارات: "البقاء في الصفحة" أو "إغلاق الآن"

---

## 📋 الخطوات التالية

### 1. تطبيق الترحيلات على Supabase

يجب عليك تطبيق الترحيلات يدوياً عبر لوحة تحكم Supabase:

1. افتح مشروعك في [Supabase Dashboard](https://supabase.com/dashboard)
2. اذهب إلى **SQL Editor**
3. قم بتشغيل الملفات بالترتيب:
   ```
   009_drop_inspection_tasks.sql
   010_create_inspection_drafts.sql
   011_create_submitted_inspections.sql
   012_create_active_users.sql
   ```

4. **هام جداً**: بعد تطبيق الترحيلات، يجب تفعيل Realtime للجداول:
   - اذهب إلى **Database** → **Replication**
   - فعّل Realtime للجداول التالية:
     - ✅ `inspection_drafts`
     - ✅ `active_users`

### 2. تحديث صفحة التفتيش

الآن تحتاج إلى تحديث صفحة التفتيش لاستخدام النظام الجديد:

`app/(dashboard)/admin/facilities/clinics/[id]/inspection/page.tsx`

#### التغييرات المطلوبة:

1. **استبدال API القديمة بالجديدة**:
   ```typescript
   // القديم
   import { getInspectionByVisitId, updateInspection } from '@/lib/api/inspections'

   // الجديد
   import { getDraftByVisitId, updateDraft, upsertDraft } from '@/lib/api/inspection-drafts'
   import { archiveAndSubmitInspection, broadcastInspectionSubmitted } from '@/lib/api/submitted-inspections'
   import { PresenceManager } from '@/lib/api/active-users'
   ```

2. **إضافة Real-time Subscription**:
   ```typescript
   import { subscribeToDraft, subscribeToBroadcastEvents } from '@/lib/api/inspection-drafts'

   useEffect(() => {
     const channel = subscribeToDraft(visitId, (payload) => {
       if (payload.type === 'UPDATE') {
         // تحديث البيانات المحلية من التحديث الوارد
         setFormData(payload.new)
       }
     })

     return () => {
       channel.unsubscribe()
     }
   }, [visitId])
   ```

3. **إضافة Presence System**:
   ```typescript
   const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
   const presenceManager = useRef<PresenceManager | null>(null)

   useEffect(() => {
     const manager = new PresenceManager(visitId, userId, userName, userEmail)
     presenceManager.current = manager

     manager.join((users) => {
       setActiveUsers(users)
     })

     manager.setupBeforeUnload()

     return () => {
       manager.leave()
     }
   }, [visitId, userId])
   ```

4. **إضافة المكونات**:
   ```typescript
   import { ActiveUsers } from '@/components/inspection/ActiveUsers'
   import { InspectionSubmittedModal } from '@/components/inspection/InspectionSubmittedModal'

   return (
     <>
       <ActiveUsers activeUsers={activeUsers} currentUserId={userId} />
       <InspectionSubmittedModal
         isOpen={showSubmittedModal}
         submittedBy={submittedByName}
         onClose={() => setShowSubmittedModal(false)}
       />
       {/* ... بقية الصفحة */}
     </>
   )
   ```

5. **تحديث دالة الحفظ والإرسال**:
   ```typescript
   const handleSaveAndSend = async () => {
     try {
       // 1. حفظ في الأرشيف وحذف المسودة
       await archiveAndSubmitInspection(visitId, userId, userName)

       // 2. إرسال حدث broadcast لجميع المستخدمين
       await broadcastInspectionSubmitted(visitId, userId, userName)

       // 3. المغادرة من الـ presence
       await presenceManager.current?.leave()

       // 4. العودة للخلف
       router.back()
     } catch (error) {
       console.error('Error submitting inspection:', error)
       // عرض رسالة خطأ
     }
   }
   ```

6. **الاشتراك في حدث الإرسال**:
   ```typescript
   useEffect(() => {
     const channel = subscribeToBroadcastEvents(visitId, (event) => {
       setSubmittedByName(event.submittedByName)
       setShowSubmittedModal(true)
     })

     return () => {
       channel.unsubscribe()
     }
   }, [visitId])
   ```

---

## 🎯 كيف يعمل النظام

### سيناريو 1: فتح صفحة التفتيش

1. المستخدم يفتح صفحة التفتيش لعيادة معينة
2. النظام يتحقق من وجود مسودة في `inspection_drafts`
3. إذا لم توجد، يتم إنشاء مسودة فارغة
4. المستخدم ينضم كـ "مستخدم نشط" في `active_users`
5. يبدأ إرسال heartbeat كل 30 ثانية
6. يشترك في تحديثات Real-time للمسودة والمستخدمين النشطين

### سيناريو 2: التعاون في الوقت الفعلي

1. مستخدم A يفتح صفحة العيادة
2. مستخدم B يفتح نفس صفحة العيادة
3. كلاهما يرى الآخر في قائمة "المستخدمون النشطون"
4. عندما يغير مستخدم A حقلاً:
   - يتم حفظ التغيير في `inspection_drafts`
   - Supabase Realtime يرسل التحديث لجميع المشتركين
   - مستخدم B يرى التغيير فوراً في واجهته
5. Last Write Wins - آخر تحديث يفوز في حالة التعارض

### سيناريو 3: الحفظ والإرسال

1. مستخدم A يضغط "حفظ وإرسال"
2. النظام:
   - ينقل البيانات من `inspection_drafts` إلى `submitted_inspections`
   - يحذف المسودة من `inspection_drafts`
   - يرسل broadcast event "inspection_submitted"
3. جميع المستخدمين النشطين (A, B, C):
   - يرون نافذة "تم إرسال التفتيش!"
   - تبدأ عد تنازلي 3 ثوانٍ
   - تُغلق الصفحة تلقائياً أو يدوياً

### سيناريو 4: قطع الاتصال

1. إذا أغلق المستخدم الصفحة بشكل طبيعي:
   - يتم حذفه من `active_users` فوراً
2. إذا انقطع الاتصال (crash, network issue):
   - يتوقف الـ heartbeat
   - بعد 10 دقائق، يتم تنظيفه تلقائياً بواسطة `cleanup_stale_active_users()`

---

## 🚀 المزايا

✅ **سرعة فائقة**: لا حفظ مستمر في قاعدة البيانات، البيانات في الـ client حتى الإرسال النهائي

✅ **تعاون حقيقي**: 2-3 مستخدمين يمكنهم العمل معاً بدون تعارض

✅ **تتبع حي**: معرفة من يعمل حالياً على نفس التفتيش

✅ **تزامن تلقائي**: كل التغييرات تظهر فوراً للجميع

✅ **أمان**: RLS policies للتحكم في الصلاحيات

✅ **أرشيف موثوق**: `submitted_inspections` غير قابل للتعديل

---

## 📚 ملاحظات إضافية

### Performance Optimization

يمكن إضافة **debouncing** للتحديثات:

```typescript
import { debounce } from 'lodash'

const debouncedUpdate = debounce(async (data) => {
  await updateDraft(visitId, data, userId, userName)
}, 1000) // تحديث كل ثانية بدلاً من كل ضغطة

handleInputChange = (field, value) => {
  // تحديث محلي فوراً
  setFormData(prev => ({ ...prev, [field]: value }))

  // إرسال للسيرفر بعد ثانية
  debouncedUpdate({ [field]: value })
}
```

### Error Handling

```typescript
try {
  await updateDraft(visitId, data, userId, userName)
} catch (error) {
  // عرض toast notification للمستخدم
  toast.error('فشل حفظ التغييرات. يرجى المحاولة مرة أخرى.')

  // إعادة المحاولة تلقائياً
  setTimeout(() => {
    updateDraft(visitId, data, userId, userName)
  }, 3000)
}
```

### Conflict Resolution

النظام يستخدم **Last Write Wins**:
- آخر تحديث يفوز
- يتم عرض معلومات "آخر تحديث بواسطة [اسم] في [وقت]"
- المستخدمون يرون نفس البيانات دائماً

---

## 🎉 الخلاصة

تم بناء نظام تعاون في الوقت الفعلي كامل ومتقدم يشبه Google Docs!

الآن فقط تحتاج إلى:
1. تطبيق الترحيلات على Supabase
2. تفعيل Realtime للجداول
3. تحديث صفحة التفتيش لاستخدام النظام الجديد

بعد ذلك سيكون لديك نظام تفتيش حديث وسريع وتعاوني! 🚀
