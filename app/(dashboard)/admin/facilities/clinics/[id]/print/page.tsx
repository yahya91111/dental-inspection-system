"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import styles from "./styles.module.css"
import { getVisitsByClinicId, type Visit } from "@/lib/api/visits"

// Map visit types to Arabic names
const VISIT_TYPE_NAMES: Record<string, string> = {
  "inspection": "تفتيش",
  "not-inspected": "لم يتم التفتيش",
  "response": "الرد على تقرير التفتيش",
  "close": "إغلاق عيادة",
  "examination": "معاينة"
}

export default function PrintListPage() {
  const router = useRouter()
  const params = useParams()
  const clinicId = params.id as string

  const [visits, setVisits] = useState<Visit[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load all submitted visits for this clinic
  useEffect(() => {
    const loadVisits = async () => {
      try {
        setIsLoading(true)
        const allVisits = await getVisitsByClinicId(clinicId)

        // Filter only submitted visits
        const submittedVisits = allVisits.filter(visit => visit.status === 'submitted')

        setVisits(submittedVisits)
      } catch (error) {
        console.error('Error loading visits:', error)
        alert('حدث خطأ في تحميل المحاضر')
      } finally {
        setIsLoading(false)
      }
    }

    loadVisits()
  }, [clinicId])

  const handlePrintClick = (visit: Visit) => {
    // For inspection visits, navigate directly to preview page for comprehensive printing
    if (visit.visit_type === 'inspection') {
      router.push(`/admin/facilities/clinics/${clinicId}/print/preview?visitId=${visit.id}`)
    } else if (visit.visit_type === 'response') {
      // For response visits, navigate to response print page (to be created)
      router.push(`/admin/facilities/clinics/${clinicId}/response/print?visitId=${visit.id}`)
    } else {
      // For other visit types, navigate to their specific print page
      router.push(`/admin/facilities/clinics/${clinicId}/${visit.visit_type}/print?visitId=${visit.id}`)
    }
  }

  const handleBackClick = () => {
    router.back()
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={handleBackClick}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>المحاضر المحفوظة</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        {isLoading ? (
          <div className={styles.loadingCard}>
            <p>جاري تحميل المحاضر...</p>
          </div>
        ) : (
          <>
            {visits.length === 0 ? (
              <div className={styles.noReportsCard}>
                <p>لا توجد محاضر محفوظة لهذه العيادة</p>
              </div>
            ) : (
              <div className={styles.reportsGrid}>
                {visits.map((visit) => (
                  <div key={visit.id} className={styles.reportCard}>
                    <div className={styles.reportCardContent}>
                      <h3 className={styles.reportTitle}>
                        {VISIT_TYPE_NAMES[visit.visit_type] || visit.visit_type}
                      </h3>

                      <div className={styles.reportInfo}>
                        <div className={styles.reportInfoRow}>
                          <span className={styles.reportLabel}>تاريخ الزيارة:</span>
                          <span className={styles.reportValue}>
                            {visit.visit_date || 'غير محدد'}
                          </span>
                        </div>

                        {visit.visit_number && (
                          <div className={styles.reportInfoRow}>
                            <span className={styles.reportLabel}>رقم الزيارة:</span>
                            <span className={styles.reportValue}>{visit.visit_number}</span>
                          </div>
                        )}

                        {visit.visit_day && (
                          <div className={styles.reportInfoRow}>
                            <span className={styles.reportLabel}>يوم الزيارة:</span>
                            <span className={styles.reportValue}>{visit.visit_day}</span>
                          </div>
                        )}
                      </div>

                      <button
                        className={styles.printBtn}
                        onClick={() => handlePrintClick(visit)}
                      >
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
                        طباعة المحضر
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
