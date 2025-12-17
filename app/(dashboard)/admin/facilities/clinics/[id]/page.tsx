"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import styles from "./styles.module.css"
import ClinicModal, { ClinicData } from "../ClinicModal"
import { getClinicById, updateClinic, type Clinic } from "@/lib/api/clinics"

export default function ClinicDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const queryClient = useQueryClient()
  const clinicId = params.id as string
  const [isReasonsOpen, setIsReasonsOpen] = useState(false)
  const accordionRef = useRef<HTMLDivElement>(null)

  // Location state
  const [locationUrl, setLocationUrl] = useState("")
  const [isEditingLocation, setIsEditingLocation] = useState(false)

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // 🚀 React Query - جلب بيانات العيادة مع Cache
  const { data: clinic, isLoading, error } = useQuery({
    queryKey: ['clinic', clinicId],
    queryFn: () => getClinicById(clinicId),
  })

  // Handle error or not found
  useEffect(() => {
    if (error || (clinic === null && !isLoading)) {
      alert('العيادة غير موجودة')
      router.back()
    }
  }, [error, clinic, isLoading, router])

  // Load location from clinic data
  useEffect(() => {
    if (clinic?.location_url) {
      setLocationUrl(clinic.location_url)
    }
  }, [clinic])

  const handleInspectionClick = () => {
    router.push(`/admin/facilities/clinics/${clinicId}/inspection`)
  }

  const handleNotInspectedClick = () => {
    router.push(`/admin/facilities/clinics/${clinicId}/not-inspected`)
  }

  const handleResponseClick = () => {
    router.push(`/admin/facilities/clinics/${clinicId}/response`)
  }

  const handleCloseClick = () => {
    router.push(`/admin/facilities/clinics/${clinicId}/close`)
  }

  const handleExaminationClick = () => {
    router.push(`/admin/facilities/clinics/${clinicId}/examination`)
  }

  const handlePreviousVisitsClick = () => {
    router.push(`/admin/facilities/clinics/${clinicId}/previous-visits`)
  }

  const handlePrintClick = () => {
    router.push(`/admin/facilities/clinics/${clinicId}/print`)
  }

  // ⚡ Mutation for updating location
  const updateLocationMutation = useMutation({
    mutationFn: (locationUrl: string) => updateClinic(clinicId, { location_url: locationUrl }),
    onSuccess: () => {
      setIsEditingLocation(false)
      alert("تم حفظ رابط الموقع بنجاح!")
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['clinic', clinicId] })
    },
    onError: (error) => {
      console.error('Error saving location:', error)
      alert('حدث خطأ في حفظ رابط الموقع')
    }
  })

  const handleSaveLocation = () => {
    updateLocationMutation.mutate(locationUrl)
  }

  const handleOpenLocation = () => {
    if (locationUrl) {
      window.open(locationUrl, '_blank')
    }
  }

  const handleCancelLocation = () => {
    setLocationUrl(clinic?.location_url || "")
    setIsEditingLocation(false)
  }

  const handleEditClinic = () => {
    setIsEditModalOpen(true)
  }

  // ⚡ Mutation for updating clinic info
  const updateClinicMutation = useMutation({
    mutationFn: (clinicData: ClinicData) => updateClinic(clinicId, clinicData),
    onSuccess: (data, variables) => {
      alert(`تم تحديث معلومات العيادة "${variables.name}" بنجاح!`)
      setIsEditModalOpen(false)
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['clinic', clinicId] })
      queryClient.invalidateQueries({ queryKey: ['clinics'] }) // Also invalidate the list
    },
    onError: (error) => {
      console.error('Error updating clinic:', error)
      alert('حدث خطأ في تحديث معلومات العيادة')
    }
  })

  const handleSaveClinic = (clinicData: ClinicData) => {
    updateClinicMutation.mutate(clinicData)
  }

  // Auto scroll when accordion opens
  useEffect(() => {
    if (isReasonsOpen && accordionRef.current) {
      setTimeout(() => {
        accordionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      }, 100)
    }
  }, [isReasonsOpen])

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <button className={styles.backBtn} onClick={() => router.back()}>
              &gt;
            </button>
            <h1 className={styles.pageTitle}>جاري التحميل...</h1>
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.infoCard}>
            <p>جاري تحميل بيانات العيادة...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!clinic) {
    return null
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>{clinic.name}</h1>
          <button className={styles.editBtn} onClick={handleEditClinic}>
            <svg className={styles.editIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        {/* Clinic Information Card */}
        <div className={styles.infoCard}>
          <h2 className={styles.infoTitle}>معلومات العيادة</h2>

          {clinic.address && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>العنوان:</span>
              <span className={styles.infoValue}>{clinic.address}</span>
            </div>
          )}

          {clinic.phone && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>الهاتف:</span>
              <span className={styles.infoValue}>{clinic.phone}</span>
            </div>
          )}

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>تاريخ التسجيل:</span>
            <span className={styles.infoValue}>
              {new Date(clinic.created_at).toLocaleDateString('ar-SA')}
            </span>
          </div>

          {/* Location Section */}
          <div className={styles.locationSection}>
            <div className={styles.locationHeader}>
              <span className={styles.infoLabel}>موقع العيادة:</span>
              {!isEditingLocation && (
                <button
                  className={styles.editLocationBtn}
                  onClick={() => setIsEditingLocation(true)}
                >
                  {locationUrl ? "تعديل" : "إضافة"}
                </button>
              )}
            </div>

            {isEditingLocation ? (
              <div className={styles.locationInputContainer}>
                <input
                  type="url"
                  className={styles.locationInput}
                  value={locationUrl}
                  onChange={(e) => setLocationUrl(e.target.value)}
                  placeholder="الصق رابط الموقع من Google Maps هنا..."
                  dir="ltr"
                />
                <div className={styles.locationActions}>
                  <button className={styles.cancelLocationBtn} onClick={handleCancelLocation}>
                    إلغاء
                  </button>
                  <button className={styles.saveLocationBtn} onClick={handleSaveLocation}>
                    حفظ
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.locationDisplay}>
                {locationUrl ? (
                  <>
                    <span className={styles.locationValue}>{locationUrl}</span>
                    <button className={styles.openLocationBtn} onClick={handleOpenLocation}>
                      <svg className={styles.mapIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      فتح الخريطة
                    </button>
                  </>
                ) : (
                  <span className={styles.noLocationText}>لم يتم إضافة موقع بعد</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Visit Reasons / Tasks - Accordion */}
        <div className={styles.tasksSection} ref={accordionRef}>
          <button
            className={styles.accordionHeader}
            onClick={() => setIsReasonsOpen(!isReasonsOpen)}
          >
            <h2 className={styles.accordionTitle}>أسباب الزيارة</h2>
            <span className={styles.accordionIcon}>{isReasonsOpen ? '−' : '+'}</span>
          </button>

          <div className={`${styles.accordionContent} ${isReasonsOpen ? styles.accordionContentOpen : ''}`}>
            <div className={styles.tasksGrid}>
              {/* Inspection Button */}
              <button className={styles.taskBtn} onClick={handleInspectionClick}>
                <h3 className={styles.taskTitle}>تفتيش</h3>
              </button>

              {/* Not Inspected Button */}
              <button className={styles.taskBtn} onClick={handleNotInspectedClick}>
                <h3 className={styles.taskTitle}>لم يتم التفتيش</h3>
              </button>

              {/* Response to Inspection Report Button */}
              <button className={styles.taskBtn} onClick={handleResponseClick}>
                <h3 className={styles.taskTitle}>الرد على تقرير التفتيش</h3>
              </button>

              {/* Close Clinic Button */}
              <button className={styles.taskBtn} onClick={handleCloseClick}>
                <h3 className={styles.taskTitle}>إغلاق عيادة</h3>
              </button>

              {/* Examination Button */}
              <button className={styles.taskBtn} onClick={handleExaminationClick}>
                <h3 className={styles.taskTitle}>معاينة</h3>
              </button>
            </div>
          </div>
        </div>

        {/* Previous Visits Card */}
        <div className={styles.extraCardsSection}>
          <button
            className={styles.extraCard}
            onClick={handlePreviousVisitsClick}
          >
            <h3 className={styles.extraCardTitle}>الزيارات السابقة</h3>
          </button>

          {/* Print Card */}
          <button
            className={styles.extraCard}
            onClick={handlePrintClick}
          >
            <h3 className={styles.extraCardTitle}>محاضر التفتيش</h3>
          </button>
        </div>
      </div>

      {/* Edit Clinic Modal */}
      <ClinicModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveClinic}
        initialData={{
          name: clinic.name,
          address: clinic.address || "",
          phone: clinic.phone || ""
        }}
        mode="edit"
      />
    </div>
  )
}
