"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { getSubmittedInspectionByVisitId } from "@/lib/api/submitted-inspections"
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

export default function ViolationReportPrintPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const clinicId = params.id as string
  const reportNumber = searchParams.get('reportId') || "1"
  const visitId = searchParams.get('visitId') || ""

  const [report, setReport] = useState<ReportData | null>(null)
  const [inspection, setInspection] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [violatorSignature, setViolatorSignature] = useState("")

  // Load report data from sessionStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        if (!reportNumber) {
          alert('رقم المحضر غير موجود')
          router.back()
          return
        }

        // Load violations data from sessionStorage
        const violationsData = sessionStorage.getItem('violations_section_data')
        if (!violationsData) {
          alert('لا توجد بيانات محضر المخالفة')
          router.back()
          return
        }

        const parsed = JSON.parse(violationsData)
        const reportNum = parseInt(reportNumber)

        let reportData: ReportData | null = null

        // Check if it's the first report
        if (reportNum === 1) {
          reportData = {
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
          }
        } else {
          // Find in additional reports
          const additionalReport = parsed.additionalReports?.find(
            (r: AdditionalReport) => r.reportNumber === reportNum
          )

          if (additionalReport) {
            reportData = {
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
            }
          }
        }

        if (!reportData) {
          alert('لم يتم العثور على المحضر')
          router.back()
          return
        }

        setReport(reportData)

        // Load inspection data for signatures and stamps
        if (visitId) {
          const inspectionData = await getSubmittedInspectionByVisitId(visitId)
          setInspection(inspectionData)
        }

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

      } catch (error) {
        console.error('Error loading data:', error)
        alert('حدث خطأ في تحميل البيانات')
        router.back()
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [reportNumber, visitId, router])

  // Auto print when data is loaded
  useEffect(() => {
    if (!isLoading && report) {
      // Small delay to ensure rendering is complete
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [isLoading, report])

  const handleBack = () => {
    router.back()
  }

  if (isLoading || !report) {
    return (
      <div className={styles.loadingContainer}>
        <p>جاري تحميل المحضر...</p>
      </div>
    )
  }

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

      {/* Violation Report Document */}
      <div className={styles.document}>
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
                ].map((inspector, index) => (
                  inspector.name && (
                    <tr key={index}>
                      <td className={styles.tableCell}>
                        <div className={styles.inputLine}>{inspector.name}</div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.stampBox}>
                          {inspector.stamp && (
                            <img src={inspector.stamp} alt={`ختم المفتش ${index + 1}`}
                                 style={{maxWidth: '60px', maxHeight: '24px', objectFit: 'contain'}} />
                          )}
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <div className={styles.signBox}>
                          {inspector.signature && (
                            <img src={inspector.signature} alt={`توقيع المفتش ${index + 1}`}
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
    </div>
  )
}
