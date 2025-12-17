"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import styles from "./styles.module.css"
import ClinicModal, { ClinicData } from "./ClinicModal"
import ClinicCardSkeleton from "@/components/ClinicCardSkeleton"
import { getAllClinics, createClinic, getClinicById, type Clinic } from "@/lib/api/clinics"

export default function ClinicsPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // 🚀 React Query - جلب العيادات مع Cache تلقائي
  const { data: clinics = [], isLoading } = useQuery({
    queryKey: ['clinics'],
    queryFn: getAllClinics,
  })

  // البحث في العيادات (client-side filtering)
  const filteredClinics = searchQuery.trim() === ""
    ? clinics
    : clinics.filter((clinic) =>
        clinic.name.toLowerCase().includes(searchQuery.toLowerCase())
      )

  // ⚡ Optimistic Update - Create Clinic
  const createClinicMutation = useMutation({
    mutationFn: createClinic,
    onMutate: async (newClinic) => {
      // إلغاء أي queries جارية
      await queryClient.cancelQueries({ queryKey: ['clinics'] })

      // حفظ البيانات السابقة
      const previousClinics = queryClient.getQueryData<Clinic[]>(['clinics'])

      // ⚡ تحديث الواجهة فوراً (Optimistic)
      queryClient.setQueryData<Clinic[]>(['clinics'], (old = []) => [
        {
          id: 'temp-' + Date.now(),
          name: newClinic.name,
          address: newClinic.address || undefined,
          phone: newClinic.phone || undefined,
          location_url: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...old,
      ])

      return { previousClinics }
    },
    onError: (error, newClinic, context) => {
      // إذا فشل، نرجع للبيانات السابقة
      if (context?.previousClinics) {
        queryClient.setQueryData(['clinics'], context.previousClinics)
      }
      console.error('Error saving clinic:', error)
      alert('حدث خطأ في حفظ العيادة')
    },
    onSuccess: (data, variables) => {
      alert(`تم إضافة العيادة "${variables.name}" بنجاح!`)
      setIsModalOpen(false)
    },
    onSettled: () => {
      // إعادة جلب البيانات للتأكد من التزامن
      queryClient.invalidateQueries({ queryKey: ['clinics'] })
    },
  })

  const handleAddClick = () => {
    setIsModalOpen(true)
  }

  const handleSaveClinic = (clinicData: ClinicData) => {
    createClinicMutation.mutate(clinicData)
  }

  // 🚀 Prefetching - تحميل البيانات قبل الضغط
  const handleClinicHover = (clinicId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['clinic', clinicId],
      queryFn: () => getClinicById(clinicId),
    })
  }

  const handleClinicClick = (clinicId: string) => {
    router.push(`/admin/facilities/clinics/${clinicId}`)
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>Private Clinics</h1>
          <button className={styles.addBtn} onClick={handleAddClick}>
            +
          </button>
        </div>

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for a clinic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        {isLoading ? (
          /* ⚡ Skeleton Loading State */
          <div className={styles.clinicsGrid}>
            {[...Array(6)].map((_, i) => (
              <ClinicCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className={styles.clinicsGrid}>
              {filteredClinics.map((clinic) => (
                <div
                  key={clinic.id}
                  className={styles.clinicCard}
                  onClick={() => handleClinicClick(clinic.id)}
                  onMouseEnter={() => handleClinicHover(clinic.id)}
                >
                  <h3 className={styles.clinicName}>{clinic.name}</h3>
                </div>
              ))}
            </div>

            {filteredClinics.length === 0 && !isLoading && (
              <div className={styles.noResults}>
                <p>No clinics found</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Clinic Modal */}
      <ClinicModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClinic}
        mode="add"
      />
    </div>
  )
}
