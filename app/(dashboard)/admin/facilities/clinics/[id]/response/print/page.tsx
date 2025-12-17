"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { getSubmittedResponseByVisitId, type SubmittedResponse } from "@/lib/api/submitted-responses"
import { getClinicById, type Clinic } from "@/lib/api/clinics"
import styles from "./styles.module.css"

export default function ResponsePrintPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const clinicId = params.id as string
  const visitId = searchParams.get('visitId')

  const [response, setResponse] = useState<SubmittedResponse | null>(null)
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [loading, setLoading] = useState(true)

  // Format date from ISO to readable format
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "___________"

    // If already formatted (contains Arabic or dashes with spaces), return as is
    if (!dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString
    }

    // Convert ISO date (2025-01-15) to readable format
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()

    return `${day}-${month}-${year}`
  }

  useEffect(() => {
    async function loadData() {
      if (!visitId) {
        setLoading(false)
        return
      }

      const responseData = await getSubmittedResponseByVisitId(visitId)
      if (responseData) {
        setResponse(responseData)
        const clinicData = await getClinicById(clinicId)
        setClinic(clinicData)
      }
      setLoading(false)
    }
    loadData()
  }, [visitId, clinicId])

  // Auto-print when data is loaded
  useEffect(() => {
    if (!loading && response) {
      setTimeout(() => {
        window.print()
      }, 300)
    }
  }, [loading, response])

  if (loading) {
    return <div className={styles.printPage}>جاري التحميل...</div>
  }

  if (!response) {
    return <div className={styles.printPage}>لم يتم العثور على البيانات</div>
  }

  return (
    <div className={styles.printPage}>
      {/* رأس الصفحة الرسمي */}
      <div className={styles.officialHeader}>
        <div className={styles.headerRight}>
          <div className={styles.ministryAr}>وزارة الصحة</div>
          <div className={styles.sectorAr}>القطاع الصحي</div>
          <div className={styles.deptAr}>إدارة طب الأسنان</div>
        </div>

        <div className={styles.headerCenter}>
          <img
            src="/images/kuwait-emblem.png"
            alt="Kuwait Emblem"
            className={styles.emblem}
          />
        </div>

        <div className={styles.headerLeft}>
          <div className={styles.ministryEn}>Ministry of Health</div>
          <div className={styles.sectorEn}>Health Sector</div>
          <div className={styles.deptEn}>Dental Department</div>
        </div>
      </div>

      {/* النص الترحيبي والموضوع */}
      <div className={styles.introSection}>
        <div className={styles.recipient}>
          السيدة/ مراقب التفتيش إدارة التراخيص الصحية المحترمـــــة
        </div>
        <div className={styles.greeting}>
          تحية طيبة وبعد ،،،،،
        </div>
        <div className={styles.subject}>
          الموضوع : الرد على تقرير لجنة تفتيش الأسنان على
        </div>
      </div>

      {/* اسم المؤسسة العلاجية */}
      <div className={styles.facilitySection}>
        <span className={styles.facilityLabel}>اسم المؤسسة العلاجية :</span>
        <span className={styles.facilityName}>{clinic?.name || "---"}</span>
      </div>

      {/* نص اللجنة */}
      <div className={styles.committeeText}>
        فلقد قامت لجنة تفتيش الأسنان المكونة من
      </div>

      {/* جدول أعضاء اللجنة */}
      <table className={styles.committeeTable}>
        <thead>
          <tr>
            <th className={styles.th}>الاسم</th>
            <th className={styles.th}>التوقيع</th>
            <th className={styles.th}>الختم</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={styles.td}>{response.inspector1_name || ""}</td>
            <td className={styles.td}>
              {response.inspector1_signature && (
                <img src={response.inspector1_signature} alt="توقيع" className={styles.signatureImg} />
              )}
            </td>
            <td className={styles.td}>
              {response.inspector1_stamp && (
                <img src={response.inspector1_stamp} alt="ختم" className={styles.stampImg} />
              )}
            </td>
          </tr>
          <tr>
            <td className={styles.td}>{response.inspector2_name || ""}</td>
            <td className={styles.td}>
              {response.inspector2_signature && (
                <img src={response.inspector2_signature} alt="توقيع" className={styles.signatureImg} />
              )}
            </td>
            <td className={styles.td}>
              {response.inspector2_stamp && (
                <img src={response.inspector2_stamp} alt="ختم" className={styles.stampImg} />
              )}
            </td>
          </tr>
          <tr>
            <td className={styles.td}>{response.inspector3_name || ""}</td>
            <td className={styles.td}>
              {response.inspector3_signature && (
                <img src={response.inspector3_signature} alt="توقيع" className={styles.signatureImg} />
              )}
            </td>
            <td className={styles.td}>
              {response.inspector3_stamp && (
                <img src={response.inspector3_stamp} alt="ختم" className={styles.stampImg} />
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* نص التأكد والتاريخ */}
      <div className={styles.verificationText}>
        تم التأكد من المطلوب في يوم <span className={styles.underline}>{response.response_day || "___________"}</span> الموافق <span className={styles.underline}>{formatDate(response.response_date)}</span> على المكان المذكور أعلاه وقد وجد التالي :
      </div>

      {/* حالة الملاحظات */}
      <div className={styles.observationsStatus}>
        <div className={styles.statusOption}>
          <span className={styles.checkbox}>
            {response.observations_status === 'resolved' ? '☑' : '☐'}
          </span>
          <span>تم تلافي الملاحظات</span>
        </div>
        <div className={styles.statusOption}>
          <span className={styles.checkbox}>
            {response.observations_status === 'not_resolved' ? '☑' : '☐'}
          </span>
          <span>لم يتم تلافي الملاحظات</span>
        </div>
      </div>

      {/* مربع نص الملاحظات */}
      <div className={styles.notesBox}>
        {response.unresolved_observations ? (
          <div style={{ padding: '2mm', fontSize: '8pt', textAlign: 'right', whiteSpace: 'pre-wrap' }}>
            {response.unresolved_observations}
          </div>
        ) : (
          <>
            <div className={styles.notesLine}></div>
            <div className={styles.notesLine}></div>
            <div className={styles.notesLine}></div>
            <div className={styles.notesLine}></div>
          </>
        )}
      </div>

      {/* رئيس اللجنة */}
      <div className={styles.headSection}>
        <div className={styles.headTitle}>رئيس اللجنة</div>
        <table className={styles.headTable}>
          <thead>
            <tr>
              <th className={styles.th}>الاسم</th>
              <th className={styles.th}>التوقيع</th>
              <th className={styles.th}>الختم</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.td}>{response.committee_head_name}</td>
              <td className={styles.td}>
                {response.committee_head_signature && (
                  <img src={response.committee_head_signature} alt="توقيع" className={styles.signatureImg} />
                )}
              </td>
              <td className={styles.td}>
                {response.committee_head_stamp && (
                  <img src={response.committee_head_stamp} alt="ختم" className={styles.stampImg} />
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* النص الختامي */}
      <div className={styles.closingText}>
        وتفضلوا بقبول فائق الاحترام
      </div>

    </div>
  )
}
