"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import styles from "./styles.module.css"
import { getViolationReportsByVisitId, type ViolationReport } from "@/lib/api/violation-reports"

export default function ViolationsListPage() {
  const router = useRouter()
  const params = useParams()
  const clinicId = params.id as string

  const [reports, setReports] = useState<ViolationReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [visitId, setVisitId] = useState<string>("")

  // Load visit ID from URL or session
  useEffect(() => {
    // Try to get visit_id from query params or session
    const urlParams = new URLSearchParams(window.location.search)
    const visitIdFromUrl = urlParams.get('visitId')

    if (visitIdFromUrl) {
      setVisitId(visitIdFromUrl)
    } else {
      // Try to get from sessionStorage
      const storedVisitId = sessionStorage.getItem('current_visit_id')
      if (storedVisitId) {
        setVisitId(storedVisitId)
      }
    }
  }, [])

  // Load violation reports
  useEffect(() => {
    const loadReports = async () => {
      if (!visitId) return

      try {
        setIsLoading(true)
        const data = await getViolationReportsByVisitId(visitId)
        setReports(data)
      } catch (error) {
        console.error('Error loading violation reports:', error)
        alert('حدث خطأ في تحميل محاضر المخالفات')
      } finally {
        setIsLoading(false)
      }
    }

    loadReports()
  }, [visitId])

  const handleBack = () => {
    router.back()
  }

  const handleAddNewReport = () => {
    // Navigate to form page for new report
    const nextReportNumber = reports.length + 1
    router.push(`/admin/facilities/clinics/${clinicId}/inspection/violations/form?visitId=${visitId}&reportNumber=${nextReportNumber}`)
  }

  const handleEditReport = (reportId: string, reportNumber: number) => {
    // Navigate to form page for editing
    router.push(`/admin/facilities/clinics/${clinicId}/inspection/violations/form?visitId=${visitId}&reportId=${reportId}&reportNumber=${reportNumber}`)
  }

  const handlePrintReport = (reportId: string, reportNumber: number) => {
    // Navigate to print page for this specific report
    router.push(`/admin/facilities/clinics/${clinicId}/inspection/violations/print?reportId=${reportId}`)
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={handleBack}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>محاضر إثبات المخالفات</h1>
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
            {/* Add New Report Button */}
            <div className={styles.addButtonContainer}>
              <button className={styles.addButton} onClick={handleAddNewReport}>
                + إضافة محضر مخالفة جديد
              </button>
            </div>

            {/* Reports List */}
            {reports.length === 0 ? (
              <div className={styles.noReportsCard}>
                <p>لا توجد محاضر مخالفات لهذه الزيارة</p>
                <p className={styles.hint}>اضغط على الزر أعلاه لإضافة محضر مخالفة جديد</p>
              </div>
            ) : (
              <div className={styles.reportsGrid}>
                {reports.map((report) => {
                  const violationsCount = report.violations_list?.filter(v => v.text?.trim()).length || 0

                  return (
                    <div key={report.id} className={styles.reportCard}>
                      <div className={styles.reportCardHeader}>
                        <h3 className={styles.reportTitle}>
                          محضر مخالفة رقم {report.report_number}
                        </h3>
                        <span className={styles.reportDate}>
                          {report.inspection_date || 'غير محدد'}
                        </span>
                      </div>

                      <div className={styles.reportInfo}>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>المنشأة:</span>
                          <span className={styles.infoValue}>
                            {report.facility_name || 'غير محدد'}
                          </span>
                        </div>

                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>عدد المخالفات:</span>
                          <span className={styles.infoValue}>{violationsCount}</span>
                        </div>

                        {report.confronted_person && (
                          <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>تمت المواجهة مع:</span>
                            <span className={styles.infoValue}>
                              {report.confronted_person}
                            </span>
                          </div>
                        )}

                        {report.person_title && (
                          <div className={styles.infoRow}>
                            <span className={styles.infoLabel}>الصفة:</span>
                            <span className={styles.infoValue}>
                              {report.person_title}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className={styles.reportActions}>
                        <button
                          className={styles.editBtn}
                          onClick={() => handleEditReport(report.id, report.report_number)}
                        >
                          <svg className={styles.btnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          تعديل
                        </button>

                        <button
                          className={styles.printBtn}
                          onClick={() => handlePrintReport(report.id, report.report_number)}
                        >
                          <svg className={styles.btnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          طباعة
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
