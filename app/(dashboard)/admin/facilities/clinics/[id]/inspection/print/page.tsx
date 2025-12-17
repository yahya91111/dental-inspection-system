"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import styles from "./styles.module.css"
import { getVisitById, type Visit } from "@/lib/api/visits"
import { getInspectionByVisitId, type InspectionTask } from "@/lib/api/inspections"

export default function PrintPage() {
  const router = useRouter()
  const params = useParams()
  const clinicId = params.id as string

  const [visit, setVisit] = useState<Visit | null>(null)
  const [inspection, setInspection] = useState<InspectionTask | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load visit data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Get visit ID from URL params or query string
        const urlParams = new URLSearchParams(window.location.search)
        const visitId = urlParams.get('visitId')

        if (!visitId) {
          alert('لم يتم العثور على معلومات الزيارة')
          router.push(`/admin/facilities/clinics/${clinicId}/inspection`)
          return
        }

        const visitData = await getVisitById(visitId)
        if (!visitData) {
          alert('لم يتم العثور على معلومات الزيارة')
          router.push(`/admin/facilities/clinics/${clinicId}/inspection`)
          return
        }

        const inspectionData = await getInspectionByVisitId(visitId)

        setVisit(visitData)
        setInspection(inspectionData)
      } catch (error) {
        console.error('Error loading data:', error)
        alert('حدث خطأ في تحميل البيانات')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [clinicId, router])

  const handlePrintPage1 = () => {
    router.push(`/admin/facilities/clinics/${clinicId}/print/preview?visitId=${new URLSearchParams(window.location.search).get('visitId')}`)
  }

  const handlePrintPage2 = () => {
    router.push(`/admin/facilities/clinics/${clinicId}/print/preview-page2?visitId=${new URLSearchParams(window.location.search).get('visitId')}`)
  }

  const handlePrintStaff = () => {
    router.push(`/admin/facilities/clinics/${clinicId}/print/preview-staff?visitId=${new URLSearchParams(window.location.search).get('visitId')}`)
  }

  const handlePrintComments = () => {
    router.push(`/admin/facilities/clinics/${clinicId}/print/preview?visitId=${new URLSearchParams(window.location.search).get('visitId')}#page-9`)
  }

  const handlePrintLetter = () => {
    router.push(`/admin/facilities/clinics/${clinicId}/print/preview?visitId=${new URLSearchParams(window.location.search).get('visitId')}&page=5`)
  }

  const handlePrintViolations = () => {
    router.push(`/admin/facilities/clinics/${clinicId}/print/preview?visitId=${new URLSearchParams(window.location.search).get('visitId')}&page=6`)
  }

  const handleBack = () => {
    router.push(`/admin/facilities/clinics`)
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>محضر التفتيش</h1>
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.reportCard}>
            <p style={{ textAlign: 'center', color: '#6b7280' }}>جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={handleBack}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>محضر التفتيش</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        {/* Report Card */}
        <div className={styles.reportCard}>
          <h2 className={styles.reportTitle}>محضر التفتيش</h2>

          <div className={styles.infoSection}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>تاريخ الزيارة:</span>
              <span className={styles.infoValue}>
                {visit?.visit_date || 'غير محدد'}
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>يوم الزيارة:</span>
              <span className={styles.infoValue}>
                {visit?.visit_day || 'غير محدد'}
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>رقم الزيارة:</span>
              <span className={styles.infoValue}>
                {visit?.visit_number || 'غير محدد'}
              </span>
            </div>

            {inspection && (
              <>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>التصنيف:</span>
                  <span className={styles.infoValue}>
                    {inspection.classification || 'غير محدد'}
                  </span>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>صاحب الترخيص:</span>
                  <span className={styles.infoValue}>
                    {inspection.license_owner || 'غير محدد'}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className={styles.printBtnsGroup}>
            <button className={styles.printBtn} onClick={handlePrintPage1}>
              <svg
                className={styles.printIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              الصفحة الأولى - العيادة والتعقيم
            </button>

            <button className={styles.printBtn} onClick={handlePrintPage2}>
              <svg
                className={styles.printIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              الصفحة الثانية - الملفات والأشعة
            </button>

            <button className={styles.printBtn} onClick={handlePrintStaff}>
              <svg
                className={styles.printIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              الصفحة الثالثة - الموظفين
            </button>

            <button className={styles.printBtn} onClick={handlePrintComments}>
              <svg
                className={styles.printIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              الصفحة الرابعة - الملاحظات العامة
            </button>

            <button className={styles.printBtn} onClick={handlePrintLetter}>
              <svg
                className={styles.printIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              الصفحة الخامسة - الخطاب الرسمي
            </button>

            <button className={styles.printBtn} onClick={handlePrintViolations}>
              <svg
                className={styles.printIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              الصفحة السادسة - محضر إثبات المخالفات
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
