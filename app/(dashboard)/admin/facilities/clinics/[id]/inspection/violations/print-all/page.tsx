"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { getSubmittedInspectionByVisitId } from "@/lib/api/submitted-inspections"
import { getViolationReportsByVisitId } from "@/lib/api/violation-reports"
import styles from "./styles.module.css"

interface Violation {
  id: string
  text: string
}

interface AdditionalReport {
  reportNumber: number
  violations: Violation[]
  statement: string
}

interface ReportData {
  reportNumber: number
  inspector1Name: string
  inspector2Name: string
  inspector3Name: string
  inspectionDate: string
  inspectionDay: string
  inspectionTime: string
  facilityName: string
  area: string
  block: string
  street: string
  plotNumber: string
  floor: string
  confrontedPerson: string
  personTitle: string
  violations: Violation[]
  statement: string
}

export default function ViolationsPrintAllPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const clinicId = params.id as string
  const visitId = searchParams.get('visitId') || ""

  const [reports, setReports] = useState<ReportData[]>([])
  const [inspection, setInspection] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [violatorSignature, setViolatorSignature] = useState("")

  // Load all reports from database or sessionStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        if (!visitId) {
          alert('معرف الزيارة غير موجود')
          router.back()
          return
        }

        // Load inspection data for signatures and stamps
        const inspectionData = await getSubmittedInspectionByVisitId(visitId)
        setInspection(inspectionData)

        // Try to load from database first
        const dbReports = await getViolationReportsByVisitId(visitId)

        if (dbReports && dbReports.length > 0) {
          console.log('📋 Loading from DATABASE:', dbReports.length, 'reports')

          // Convert database reports to ReportData format
          const allReports: ReportData[] = dbReports.map(dbReport => ({
            reportNumber: dbReport.report_number,
            inspector1Name: dbReport.inspector1_name || '',
            inspector2Name: dbReport.inspector2_name || '',
            inspector3Name: dbReport.inspector3_name || '',
            inspectionDate: dbReport.inspection_date || '',
            inspectionDay: dbReport.inspection_day || '',
            inspectionTime: dbReport.inspection_time || '',
            facilityName: dbReport.facility_name || '',
            area: dbReport.area || '',
            block: dbReport.block || '',
            street: dbReport.street || '',
            plotNumber: dbReport.plot_number || '',
            floor: dbReport.floor || '',
            confrontedPerson: dbReport.confronted_person || '',
            personTitle: dbReport.person_title || '',
            violations: dbReport.violations_list || [],
            statement: dbReport.statement || ''
          }))

          console.log('📋 All reports from database:', allReports)

          setReports(allReports)

          // Use violator signature from first report in database
          if (dbReports[0]?.violator_signature) {
            setViolatorSignature(dbReports[0].violator_signature)
          }
        } else {
          // Fallback to sessionStorage if no database reports
          console.log('📋 No database reports, loading from SESSIONSTORAGE')

          const violationsData = sessionStorage.getItem('violations_section_data')
          if (!violationsData) {
            alert('لا توجد بيانات محاضر مخالفات')
            router.back()
            return
          }

          const parsed = JSON.parse(violationsData)

          console.log('📋 Parsed violations data:', parsed)
          console.log('📋 Additional reports:', parsed.additionalReports)
          console.log('📋 Additional reports length:', parsed.additionalReports?.length)

          // Build array of all reports from sessionStorage
          const allReports: ReportData[] = []

          // First report
          allReports.push({
            reportNumber: 1,
            inspector1Name: parsed.inspector1Name || '',
            inspector2Name: parsed.inspector2Name || '',
            inspector3Name: parsed.inspector3Name || '',
            inspectionDate: parsed.inspectionDate || '',
            inspectionDay: parsed.inspectionDay || '',
            inspectionTime: parsed.inspectionTime || '',
            facilityName: parsed.facilityName || '',
            area: parsed.area || '',
            block: parsed.block || '',
            street: parsed.street || '',
            plotNumber: parsed.plotNumber || '',
            floor: parsed.floor || '',
            confrontedPerson: parsed.confrontedPerson || '',
            personTitle: parsed.personTitle || '',
            violations: parsed.violations1 || [],
            statement: parsed.statement1 || ''
          })

          // Additional reports
          if (parsed.additionalReports && Array.isArray(parsed.additionalReports)) {
            parsed.additionalReports.forEach((additionalReport: AdditionalReport) => {
              allReports.push({
                reportNumber: additionalReport.reportNumber,
                inspector1Name: parsed.inspector1Name || '',
                inspector2Name: parsed.inspector2Name || '',
                inspector3Name: parsed.inspector3Name || '',
                inspectionDate: parsed.inspectionDate || '',
                inspectionDay: parsed.inspectionDay || '',
                inspectionTime: parsed.inspectionTime || '',
                facilityName: parsed.facilityName || '',
                area: parsed.area || '',
                block: parsed.block || '',
                street: parsed.street || '',
                plotNumber: parsed.plotNumber || '',
                floor: parsed.floor || '',
                confrontedPerson: parsed.confrontedPerson || '',
                personTitle: parsed.personTitle || '',
                violations: additionalReport.violations || [],
                statement: additionalReport.statement || ''
              })
            })
          }

          console.log('📋 Total reports built from sessionStorage:', allReports.length)

          if (allReports.length === 0) {
            alert('لا توجد محاضر مخالفات للطباعة')
            router.back()
            return
          }

          setReports(allReports)

          // Load violator signature from sessionStorage
          try {
            const signaturesData = sessionStorage.getItem('signatures_section_data')
            if (signaturesData) {
              const parsedSigs = JSON.parse(signaturesData)
              setViolatorSignature(parsedSigs.violatorSignature || "")
            }
          } catch (err) {
            console.error('Error loading violator signature:', err)
          }
        }

      } catch (error) {
        console.error('Error loading data:', error)
        alert('حدث خطأ في تحميل البيانات')
        router.back()
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [visitId, router])

  // Auto print when data is loaded
  useEffect(() => {
    if (!isLoading && reports.length > 0) {
      // Small delay to ensure rendering is complete
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [isLoading, reports])

  const handleBack = () => {
    router.back()
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <p>جاري تحميل المحاضر...</p>
      </div>
    )
  }

  console.log('🖨️ Rendering reports, count:', reports.length)
  console.log('🖨️ Reports to render:', reports)

  return (
    <div>
      {/* Print Button - Hidden when printing */}
      <div className={styles.noPrint}>
        <div className={styles.toolbar}>
          <button className={styles.backButton} onClick={handleBack}>
            رجوع
          </button>
          <button className={styles.printButton} onClick={() => window.print()}>
            طباعة
          </button>
        </div>
      </div>

      {/* Print all reports */}
      {reports.map((report, index) => (
        <div key={report.reportNumber} className={styles.document} style={{ pageBreakAfter: index < reports.length - 1 ? 'always' : 'auto' }}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerTextEn}>Ministry of Health</div>
              <div className={styles.headerTextEn}>Dental Administration</div>
              <div className={styles.headerTextEn}>Department Kuwait</div>
            </div>

            <div className={styles.headerCenter}>
              <div className={styles.emblem}>
                <div className={styles.emblemCircle}>
                  <svg width="60" height="60" viewBox="0 0 60 60">
                    <circle cx="30" cy="30" r="25" stroke="#000" strokeWidth="1.5" fill="none" />
                    <circle cx="30" cy="30" r="20" stroke="#000" strokeWidth="1" fill="none" />
                    <text x="30" y="35" fontSize="24" textAnchor="middle" fill="#000">⚕</text>
                  </svg>
                </div>
              </div>
            </div>

            <div className={styles.headerRight}>
              <div className={styles.headerTextAr}>وزارة الصحة</div>
              <div className={styles.headerTextAr}>إدارة طب الأسنان</div>
              <div className={styles.headerTextAr}>دولة الكويت</div>
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {/* Title */}
            <div className={styles.title}>محضر إثبات مخالفة رقم {report.reportNumber}</div>

            {/* Legal Reference */}
            <div className={styles.legalReference}>
              <p>إشارة إلى قانون رقم (70) لسنة 2020 في شأن مزاولة مهنة طب الأسنان وطب الأسنان التكميلي والمهن المعاونة لهما</p>
            </div>

            {/* Legal Text */}
            <div className={styles.legalText}>
              <p>
                إنه في يوم <span className={styles.inputLine}>{report.inspectionDay}</span> الموافق{' '}
                <span className={styles.inputLine}>{report.inspectionDate}</span> وبناء على تكليف مدير إدارة طب الأسنان
              </p>
            </div>

            {/* Inspectors Table */}
            <div className={styles.inspectorsTable}>
              <table>
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الختم</th>
                    <th>التوقيع</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: report.inspector1Name || '',
                      stamp: inspection?.signature_inspector1_stamp || '',
                      signature: inspection?.signature_inspector1_signature || ''
                    },
                    {
                      name: report.inspector2Name || '',
                      stamp: inspection?.signature_inspector2_stamp || '',
                      signature: inspection?.signature_inspector2_signature || ''
                    },
                    {
                      name: report.inspector3Name || '',
                      stamp: inspection?.signature_inspector3_stamp || '',
                      signature: inspection?.signature_inspector3_signature || ''
                    }
                  ].map((inspector, idx) => (
                    inspector.name && (
                      <tr key={idx}>
                        <td className={styles.tableCell}>
                          <div className={styles.inputLine}>{inspector.name}</div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.stampBox}>
                            {inspector.stamp && (
                              <img src={inspector.stamp} alt={`ختم المفتش ${idx + 1}`}
                                   style={{maxWidth: '60px', maxHeight: '24px', objectFit: 'contain'}} />
                            )}
                          </div>
                        </td>
                        <td className={styles.tableCell}>
                          <div className={styles.signBox}>
                            {inspector.signature && (
                              <img src={inspector.signature} alt={`توقيع المفتش ${idx + 1}`}
                                   style={{maxWidth: '60px', maxHeight: '24px', objectFit: 'contain'}} />
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  ))}
                </tbody>
              </table>
            </div>

            {/* Inspection Time */}
            <div className={styles.sectionText}>
              في الساعة <span className={styles.inputLine}>{report.inspectionTime}</span> صباحاً / مساءً
            </div>

            {/* Inspection Location */}
            <div className={styles.sectionText}>بالتفتيش على الموقع التالي:</div>

            {/* Facility Details */}
            <div className={styles.facilityDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>اسم المؤسسة:</span>
                <div className={styles.detailLine}>{report.facilityName || ''}</div>
              </div>
              <div className={styles.detailRowMulti}>
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}>المنطقة:</span>
                  <div className={styles.detailLine}>{report.area || ''}</div>
                </div>
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}>قطعة:</span>
                  <div className={styles.detailLine}>{report.block || ''}</div>
                </div>
              </div>
              <div className={styles.detailRowMulti}>
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}>الشارع:</span>
                  <div className={styles.detailLine}>{report.street || ''}</div>
                </div>
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}>رقم القسيمة:</span>
                  <div className={styles.detailLine}>{report.plotNumber || ''}</div>
                </div>
                <div className={styles.detailField}>
                  <span className={styles.detailLabel}>الدور:</span>
                  <div className={styles.detailLine}>{report.floor || ''}</div>
                </div>
              </div>
            </div>

            {/* Violations Section */}
            <div className={styles.sectionText}>
              وقد تم إثبات المخالفات الآتية بحق صاحب الترخيص المذكور:
            </div>

            {/* Violations List - Always show 5 numbered lines */}
            <div className={styles.violationsList}>
              {[1, 2, 3, 4, 5].map((lineNumber) => {
                const violation = report.violations?.[lineNumber - 1]
                return (
                  <div key={lineNumber} className={styles.violationItem}>
                    <span className={styles.violationNumber}>{lineNumber}-</span>
                    <div className={styles.violationLine}>{violation?.text || ''}</div>
                  </div>
                )
              })}
            </div>

            {/* Confrontation Section */}
            <div className={styles.confrontSection}>
              <div className={styles.confrontRow}>
                <span className={styles.confrontLabel}>وقد تم مواجهة السيد \ السيدة:</span>
                <div className={styles.confrontLine}>{report.confrontedPerson || ''}</div>
              </div>
              <div className={styles.confrontRow}>
                <span className={styles.confrontLabel}>بصفتها:</span>
                <div className={styles.confrontLine}>{report.personTitle || ''}</div>
              </div>
            </div>

            {/* Statement Section */}
            <div className={styles.statementSection}>
              <div className={styles.statementText}>لهذه المخالفات وتمت الإفادة بأن:</div>
              <div className={styles.statementLines}>
                <div className={styles.statementLine}>{report.statement || ''}</div>
              </div>
            </div>

            {/* Violator Signature */}
            <div className={styles.signatureSection}>
              <div className={styles.signatureLabel}>توقيع المخالف / المدير الطبي (أو من ينوب عنه)</div>
              <div className={styles.signatureBox}>
                {violatorSignature && (
                  <img
                    src={violatorSignature}
                    alt="توقيع المخالف"
                    style={{maxWidth: '160px', maxHeight: '50px', objectFit: 'contain', display: 'block', margin: '0 auto'}}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Page Number */}
          <div className={styles.pageNumber}>محضر مخالفة رقم {report.reportNumber}</div>
        </div>
      ))}
    </div>
  )
}
