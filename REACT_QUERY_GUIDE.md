# React Query - دليل الاستخدام

## 📌 لماذا React Query؟

✅ **Cache تلقائي** - البيانات تُخزن في الذاكرة
✅ **Loading states** - حالات تحميل تلقائية
✅ **Refetching** - إعادة جلب تلقائية
✅ **Optimistic updates** - تحديثات فورية
✅ **Better performance** - أداء أفضل بكثير
✅ **Less code** - كود أقل وأنظف

---

## 📋 القاعدة: **استخدم React Query في ALL الصفحات**

### ❌ **الطريقة القديمة (لا تستخدمها):**
```typescript
const [data, setData] = useState(null)
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  const loadData = async () => {
    setIsLoading(true)
    const result = await fetchData()
    setData(result)
    setIsLoading(false)
  }
  loadData()
}, [])
```

### ✅ **الطريقة الجديدة (استخدمها دائماً):**
```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// للقراءة (GET)
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => fetchData(id),
})

// للكتابة (POST/PUT/DELETE)
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: (newData) => createData(newData),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resource'] })
  }
})
```

---

## 🎯 أمثلة عملية

### 1️⃣ **صفحة قائمة (List Page)**

```typescript
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAllItems, createItem, type Item } from "@/lib/api/items"

export default function ItemsPage() {
  const queryClient = useQueryClient()

  // 📥 Fetch data
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: getAllItems,
  })

  // 📝 Create mutation
  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      alert('تم الإنشاء بنجاح!')
      queryClient.invalidateQueries({ queryKey: ['items'] })
    },
    onError: (error) => {
      alert('حدث خطأ!')
    }
  })

  const handleCreate = (data) => {
    createMutation.mutate(data)
  }

  if (isLoading) return <div>جاري التحميل...</div>

  return (
    <div>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

### 2️⃣ **صفحة تفاصيل (Details Page)**

```typescript
"use client"

import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getItemById, updateItem, type Item } from "@/lib/api/items"

export default function ItemDetailsPage() {
  const params = useParams()
  const queryClient = useQueryClient()
  const itemId = params.id as string

  // 📥 Fetch item
  const { data: item, isLoading } = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => getItemById(itemId),
  })

  // ✏️ Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => updateItem(itemId, data),
    onSuccess: () => {
      alert('تم التحديث بنجاح!')
      queryClient.invalidateQueries({ queryKey: ['item', itemId] })
      queryClient.invalidateQueries({ queryKey: ['items'] }) // Update list too
    }
  })

  const handleUpdate = (data) => {
    updateMutation.mutate(data)
  }

  if (isLoading) return <div>جاري التحميل...</div>
  if (!item) return <div>لم يتم العثور على البيانات</div>

  return (
    <div>
      <h1>{item.name}</h1>
      <button onClick={() => handleUpdate({...})}>
        تحديث
      </button>
    </div>
  )
}
```

### 3️⃣ **Optimistic Updates (تحديثات فورية)**

```typescript
const createMutation = useMutation({
  mutationFn: createItem,
  onMutate: async (newItem) => {
    // إلغاء queries جارية
    await queryClient.cancelQueries({ queryKey: ['items'] })

    // حفظ البيانات السابقة
    const previousItems = queryClient.getQueryData<Item[]>(['items'])

    // ⚡ تحديث فوري في الواجهة
    queryClient.setQueryData<Item[]>(['items'], (old = []) => [
      { id: 'temp-' + Date.now(), ...newItem },
      ...old,
    ])

    return { previousItems }
  },
  onError: (error, variables, context) => {
    // إذا فشل، نرجع للبيانات السابقة
    if (context?.previousItems) {
      queryClient.setQueryData(['items'], context.previousItems)
    }
  },
  onSettled: () => {
    // إعادة جلب للتأكد من التزامن
    queryClient.invalidateQueries({ queryKey: ['items'] })
  },
})
```

### 4️⃣ **Prefetching (تحميل مسبق)**

```typescript
const handleItemHover = (itemId: string) => {
  queryClient.prefetchQuery({
    queryKey: ['item', itemId],
    queryFn: () => getItemById(itemId),
  })
}

return (
  <div onMouseEnter={() => handleItemHover(item.id)}>
    {item.name}
  </div>
)
```

---

## 🔑 Query Keys (المفاتيح)

**القاعدة:** استخدم مصفوفة مفصّلة

```typescript
// ❌ سيء
queryKey: ['data']

// ✅ جيد
queryKey: ['clinics']
queryKey: ['clinic', clinicId]
queryKey: ['clinic', clinicId, 'visits']
queryKey: ['visit', visitId]
queryKey: ['inspection', inspectionId]
```

---

## 📝 Mutations (العمليات)

### Create (إنشاء)
```typescript
const createMutation = useMutation({
  mutationFn: (data) => createResource(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resources'] })
  }
})
```

### Update (تحديث)
```typescript
const updateMutation = useMutation({
  mutationFn: (data) => updateResource(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resource', id] })
    queryClient.invalidateQueries({ queryKey: ['resources'] })
  }
})
```

### Delete (حذف)
```typescript
const deleteMutation = useMutation({
  mutationFn: (id) => deleteResource(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resources'] })
  }
})
```

---

## ⚠️ ملاحظات مهمة

1. **دائماً** استورد من `@tanstack/react-query`
2. **لا تنسى** `useQueryClient()` في الصفحات التي تحدّث البيانات
3. **استخدم** `invalidateQueries` بعد كل mutation
4. **استخدم** `prefetchQuery` للأداء الأفضل
5. **استخدم** optimistic updates للتجربة الأفضل

---

## 🚀 الخلاصة

✅ **جميع** صفحات التطبيق يجب أن تستخدم React Query
✅ **لا** useState + useEffect للبيانات من API
✅ **نعم** useQuery + useMutation دائماً

**الفوائد:**
- كود أقل بـ 50%
- أداء أفضل بـ 10x
- تجربة مستخدم أفضل بكثير
- cache تلقائي
- error handling أفضل
