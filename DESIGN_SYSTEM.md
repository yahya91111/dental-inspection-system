# 🎨 دليل نظام التصميم - نظام التفتيش الصحي
## Design System Documentation

---

## 📋 نظرة عامة

هذا هو دليل نظام التصميم الموحد لتطبيق نظام التفتيش الصحي. جميع الصفحات والمكونات في التطبيق يجب أن تتبع هذا التصميم للحفاظ على الاتساق والاحترافية.

**نمط التصميم**: Neumorphism (التصميم الناعم ثلاثي الأبعاد)
**اللون الأساسي**: الأخضر (Green Healthcare Theme)

---

## 🎨 الألوان الأساسية

```css
--primary-green: #059669;      /* الأخضر الأساسي */
--light-green: #10b981;         /* الأخضر الفاتح */
--lighter-green: #34d399;       /* الأخضر الأفتح */
--soft-green: #d1fae5;          /* الأخضر الناعم */
--softer-green: #a7f3d0;        /* الأخضر الأنعم */
--bg-green: #e8f5f0;            /* خلفية خضراء ناعمة */
```

---

## 🔘 الأزرار (Buttons)

### 1. الزر الأساسي (Primary Button)
```tsx
import styles from '@/app/shared-components.module.css'

<button className={styles.primaryBtn}>
  حفظ
</button>
```

**الاستخدام**: للأزرار الرئيسية مثل حفظ، إرسال، تأكيد

---

### 2. الزر الثانوي (Secondary Button)
```tsx
<button className={styles.secondaryBtn}>
  إلغاء
</button>
```

**الاستخدام**: للأزرار الثانوية مثل إلغاء، إغلاق

---

### 3. زر الرجوع (Back Button)
```tsx
<button className={styles.backBtn} onClick={() => router.back()}>
  ← العودة
</button>
```

**الاستخدام**: للرجوع إلى الصفحة السابقة

---

### 4. زر الإضافة (Add Button)
```tsx
<button className={styles.addBtn}>
  +
</button>
```

**الاستخدام**: لإضافة عناصر جديدة (دائري، ثابت في الزاوية)

---

### 5. زر الأيقونة (Icon Button)
```tsx
<button className={styles.iconBtn}>
  🔍
</button>
```

**الاستخدام**: للأزرار الصغيرة بالأيقونات

---

## 📦 الكروت (Cards)

### 1. كارت Neumorphism الأساسي
```tsx
<div className={styles.card}>
  <h3>عنوان الكارت</h3>
  <p>المحتوى...</p>
</div>
```

### 2. كارت قابل للنقر
```tsx
<div className={`${styles.card} ${styles.clickableCard}`} onClick={handleClick}>
  <h3>عنوان الكارت</h3>
</div>
```

### 3. كارت بسيط (بدون تأثيرات hover)
```tsx
<div className={styles.flatCard}>
  <h3>عنوان الكارت</h3>
</div>
```

---

## 🪟 النوافذ المنبثقة (Modals)

### مثال كامل:
```tsx
"use client"

import { useState } from 'react'
import styles from '@/app/shared-components.module.css'

export default function ExamplePage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button className={styles.primaryBtn} onClick={() => setIsModalOpen(true)}>
        فتح النافذة
      </button>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>عنوان النافذة</h2>
              <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>

            {/* Body */}
            <div className={styles.modalBody}>
              <p>محتوى النافذة المنبثقة...</p>
            </div>

            {/* Footer */}
            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={() => setIsModalOpen(false)}>
                إلغاء
              </button>
              <button className={styles.primaryBtn}>
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

---

## 📝 حقول الإدخال (Input Fields)

### 1. حقل النص (Text Input)
```tsx
<div className={styles.formGroup}>
  <label className={styles.label}>اسم المنشأة</label>
  <input
    type="text"
    className={styles.input}
    placeholder="أدخل اسم المنشأة..."
  />
</div>
```

### 2. حقل النص الطويل (Textarea)
```tsx
<div className={styles.formGroup}>
  <label className={styles.label}>الملاحظات</label>
  <textarea
    className={styles.textarea}
    placeholder="أدخل الملاحظات..."
  />
</div>
```

### 3. القائمة المنسدلة (Select)
```tsx
<div className={styles.formGroup}>
  <label className={styles.label}>نوع المنشأة</label>
  <select className={styles.select}>
    <option value="">اختر نوع المنشأة</option>
    <option value="hospital">مستشفى</option>
    <option value="clinic">عيادة</option>
    <option value="pharmacy">صيدلية</option>
  </select>
</div>
```

---

## 🔔 التنبيهات (Alerts)

### 1. تنبيه النجاح (Success)
```tsx
<div className={styles.alertSuccess}>
  ✓ تم الحفظ بنجاح!
</div>
```

### 2. تنبيه الخطأ (Error)
```tsx
<div className={styles.alertError}>
  ✗ حدث خطأ! الرجاء المحاولة مرة أخرى.
</div>
```

### 3. تنبيه التحذير (Warning)
```tsx
<div className={styles.alertWarning}>
  ⚠ تحذير: هذا الإجراء لا يمكن التراجع عنه!
</div>
```

### 4. تنبيه المعلومات (Info)
```tsx
<div className={styles.alertInfo}>
  ℹ معلومة: يمكنك تعديل البيانات لاحقاً.
</div>
```

---

## 📱 رأس الصفحة (Page Header)

### 1. الرأس الناعم (Soft Green Header)
```tsx
<div className={styles.headerSoft}>
  <div className={styles.headerContent}>
    <button className={styles.backBtn} onClick={() => router.back()}>
      ← العودة
    </button>
    <h1 className={styles.pageTitle}>عنوان الصفحة</h1>
  </div>
</div>
```

**الاستخدام**: للصفحات الفرعية والداخلية

---

### 2. الرأس المتدرج (Gradient Header)
```tsx
<div className={styles.headerGradient}>
  <div className={styles.headerContent}>
    <button className={styles.backBtn} onClick={() => router.back()}>
      ← العودة
    </button>
    <h1 className={styles.pageTitleWhite}>عنوان الصفحة</h1>
  </div>
</div>
```

**الاستخدام**: للصفحات الرئيسية والمميزة

---

## 📋 القوائم (Lists)

### مثال قائمة:
```tsx
<div className={styles.listContainer}>
  <div className={styles.listItem} onClick={handleClick}>
    <h3>عنصر القائمة 1</h3>
    <p>وصف العنصر...</p>
  </div>
  <div className={styles.listItem} onClick={handleClick}>
    <h3>عنصر القائمة 2</h3>
    <p>وصف العنصر...</p>
  </div>
</div>
```

---

## 🏷️ الشارات (Badges)

### أمثلة:
```tsx
<span className={`${styles.badge} ${styles.badgeSuccess}`}>مكتملة</span>
<span className={`${styles.badge} ${styles.badgeWarning}`}>قيد المراجعة</span>
<span className={`${styles.badge} ${styles.badgeError}`}>مرفوضة</span>
<span className={`${styles.badge} ${styles.badgeInfo}`}>جديدة</span>
```

---

## ⏳ التحميل (Loading)

### مؤشر التحميل:
```tsx
<div className={styles.loaderContainer}>
  <div className={styles.loader}></div>
</div>
```

---

## 📐 هيكل الصفحة الموحد

### مثال صفحة كاملة:
```tsx
"use client"

import { useRouter } from 'next/navigation'
import styles from './styles.module.css'
import sharedStyles from '@/app/shared-components.module.css'

export default function ExamplePage() {
  const router = useRouter()

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={sharedStyles.headerSoft}>
        <div className={sharedStyles.headerContent}>
          <button className={sharedStyles.backBtn} onClick={() => router.back()}>
            ← العودة
          </button>
          <h1 className={sharedStyles.pageTitle}>عنوان الصفحة</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={sharedStyles.card}>
          <h2>محتوى الصفحة</h2>
          <p>النص...</p>
        </div>
      </div>
    </div>
  )
}
```

---

## 🎯 قواعد مهمة

### ✅ افعل (DO):
- استخدم المكونات المشتركة من `shared-components.module.css`
- احفظ نمط Neumorphism في جميع العناصر
- استخدم الألوان الخضراء المحددة فقط
- حافظ على التباعد والمسافات الموحدة
- استخدم الظلال بنفس الأسلوب

### ❌ لا تفعل (DON'T):
- لا تستخدم ألوان مختلفة خارج نطاق الأخضر
- لا تستخدم أنماط Flat Design أو Material Design
- لا تخلط بين أنماط التصميم المختلفة
- لا تنشئ أزرار أو كروت بتصاميم مخصصة مختلفة

---

## 📱 استجابة الشاشة (Responsive)

جميع المكونات المشتركة تحتوي على تصميم استجابي تلقائي للشاشات الصغيرة (الهواتف).

---

## 🚀 البدء السريع

1. استورد الملف في أي صفحة:
```tsx
import sharedStyles from '@/app/shared-components.module.css'
```

2. استخدم الكلاسات مباشرة:
```tsx
<button className={sharedStyles.primaryBtn}>زر</button>
```

3. يمكنك الجمع بين عدة كلاسات:
```tsx
<div className={`${sharedStyles.card} ${sharedStyles.clickableCard}`}>
  ...
</div>
```

---

## 📞 للمطورين

عند إضافة صفحة جديدة أو ميزة جديدة:
1. راجع هذا الدليل أولاً
2. استخدم المكونات الموجودة
3. إذا احتجت مكون جديد، أضفه إلى `shared-components.module.css`
4. حدّث هذا الدليل

---

**تاريخ آخر تحديث**: 2025
**الإصدار**: 1.0.0
