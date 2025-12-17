"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import styles from "./styles.module.css"
import {
  getViolationReportById,
  createViolationReport,
  updateViolationReport,
  copyCommonDataFromFirstReport,
  type ViolationReportInput
} from "@/lib/api/violation-reports"

interface Violation {
  id: string
  text: string
}

export default function ViolationFormPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const clinicId = params.id as string
  const visitId = searchParams.get('visitId') || ""
  const reportId = searchParams.get('reportId') || ""
  const reportNumber = parseInt(searchParams.get('reportNumber') || "1")

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  // معلومات أساسية
  const [inspector1Name, setInspector1Name] = useState("")
  const [inspector2Name, setInspector2Name] = useState("")
  const [inspector3Name, setInspector3Name] = useState("")
  const [inspectionDate, setInspectionDate] = useState("")
  const [inspectionDay, setInspectionDay] = useState("")
  const [inspectionTime, setInspectionTime] = useState("")

  // معلومات الموقع
  const [facilityName, setFacilityName] = useState("")
  const [area, setArea] = useState("")
  const [block, setBlock] = useState("")
  const [street, setStreet] = useState("")
  const [plotNumber, setPlotNumber] = useState("")
  const [floor, setFloor] = useState("")

  // المخالفات
  const [violations, setViolations] = useState<Violation[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
    { id: '3', text: '' },
    { id: '4', text: '' },
    { id: '5', text: '' }
  ])

  // معلومات المواجهة
  const [confrontedPerson, setConfrontedPerson] = useState("")
  const [personTitle, setPersonTitle] = useState("")
  const [statement, setStatement] = useState("")

  // توقيع المخالف
  const [violatorSignature, setViolatorSignature] = useState("")
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // If reportId exists, we're editing an existing report
        if (reportId) {
          setIsEditMode(true)
          const report = await getViolationReportById(reportId)

          if (report) {
            // Load all data from existing report
            setInspector1Name(report.inspector1_name || "")
            setInspector2Name(report.inspector2_name || "")
            setInspector3Name(report.inspector3_name || "")
            setInspectionDate(report.inspection_date || "")
            setInspectionDay(report.inspection_day || "")
            setInspectionTime(report.inspection_time || "")
            setFacilityName(report.facility_name || "")
            setArea(report.area || "")
            setBlock(report.block || "")
            setStreet(report.street || "")
            setPlotNumber(report.plot_number || "")
            setFloor(report.floor || "")
            setViolations(report.violations_list || [
              { id: '1', text: '' },
              { id: '2', text: '' },
              { id: '3', text: '' },
              { id: '4', text: '' },
              { id: '5', text: '' }
            ])
            setConfrontedPerson(report.confronted_person || "")
            setPersonTitle(report.person_title || "")
            setStatement(report.statement || "")
            setViolatorSignature(report.violator_signature || "")
          }
        } else if (reportNumber > 1) {
          // If creating a new report and it's not the first one, copy common data
          const commonData = await copyCommonDataFromFirstReport(visitId)

          if (commonData) {
            setInspector1Name(commonData.inspector1_name || "")
            setInspector2Name(commonData.inspector2_name || "")
            setInspector3Name(commonData.inspector3_name || "")
            setInspectionDate(commonData.inspection_date || "")
            setInspectionDay(commonData.inspection_day || "")
            setInspectionTime(commonData.inspection_time || "")
            setFacilityName(commonData.facility_name || "")
            setArea(commonData.area || "")
            setBlock(commonData.block || "")
            setStreet(commonData.street || "")
            setPlotNumber(commonData.plot_number || "")
            setFloor(commonData.floor || "")
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
        alert('حدث خطأ في تحميل البيانات')
      } finally {
        setIsLoading(false)
      }
    }

    if (visitId) {
      loadData()
    }
  }, [visitId, reportId, reportNumber])

  const handleBack = () => {
    router.push(`/admin/facilities/clinics/${clinicId}/inspection/violations/list?visitId=${visitId}`)
  }

  const addViolation = () => {
    const newViolation: Violation = {
      id: Date.now().toString(),
      text: ''
    }
    setViolations([...violations, newViolation])
  }

  const removeViolation = (id: string) => {
    if (violations.length > 1) {
      setViolations(violations.filter(v => v.id !== id))
    }
  }

  const updateViolation = (id: string, text: string) => {
    setViolations(violations.map(v =>
      v.id === id ? { ...v, text } : v
    ))
  }

  // Signature canvas functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const signatureDataUrl = canvas.toDataURL('image/png')
    setViolatorSignature(signatureDataUrl)
    setShowSignatureModal(false)
    clearCanvas()
  }

  const openSignatureModal = () => {
    setShowSignatureModal(true)
  }

  const closeSignatureModal = () => {
    setShowSignatureModal(false)
    clearCanvas()
  }

  const removeSignature = () => {
    setViolatorSignature("")
  }

  const handleSave = async () => {
    try {
      // Validation
      if (!inspector1Name.trim() || !inspector2Name.trim()) {
        alert('يرجى إدخال أسماء المفتشين الأول والثاني على الأقل')
        return
      }

      if (!facilityName.trim()) {
        alert('يرجى إدخال اسم المنشأة')
        return
      }

      if (!inspectionDate) {
        alert('يرجى إدخال تاريخ التفتيش')
        return
      }

      const hasViolations = violations.some(v => v.text.trim())
      if (!hasViolations) {
        alert('يرجى إدخال مخالفة واحدة على الأقل')
        return
      }

      setIsSaving(true)

      const reportData: ViolationReportInput = {
        visit_id: visitId,
        report_number: reportNumber,
        inspector1_name: inspector1Name,
        inspector2_name: inspector2Name,
        inspector3_name: inspector3Name,
        inspection_date: inspectionDate,
        inspection_day: inspectionDay,
        inspection_time: inspectionTime,
        facility_name: facilityName,
        area: area,
        block: block,
        street: street,
        plot_number: plotNumber,
        floor: floor,
        violations_list: violations,
        confronted_person: confrontedPerson,
        person_title: personTitle,
        statement: statement,
        violator_signature: violatorSignature
      }

      if (isEditMode && reportId) {
        // Update existing report
        const result = await updateViolationReport(reportId, reportData)
        if (result) {
          alert('تم تحديث المحضر بنجاح')
          router.push(`/admin/facilities/clinics/${clinicId}/inspection/violations/list?visitId=${visitId}`)
        } else {
          alert('حدث خطأ في تحديث المحضر')
        }
      } else {
        // Create new report
        const result = await createViolationReport(reportData)
        if (result) {
          alert('تم حفظ المحضر بنجاح')
          router.push(`/admin/facilities/clinics/${clinicId}/inspection/violations/list?visitId=${visitId}`)
        } else {
          alert('حدث خطأ في حفظ المحضر')
        }
      }
    } catch (error) {
      console.error('Error saving report:', error)
      alert('حدث خطأ في حفظ المحضر')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <button className={styles.backBtn} onClick={handleBack}>
              &gt;
            </button>
            <h1 className={styles.pageTitle}>جاري التحميل...</h1>
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
          <h1 className={styles.pageTitle}>
            {isEditMode ? `تعديل محضر مخالفة رقم ${reportNumber}` : `محضر مخالفة رقم ${reportNumber}`}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.formCard}>

          {/* معلومات أساسية */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>معلومات أساسية</h2>
            {reportNumber > 1 && (
              <p className={styles.sectionHint}>
                تم نسخ المعلومات العامة من المحضر الأول
              </p>
            )}

            <div className={styles.formGroup}>
              <label className={styles.label}>الاسم الأول</label>
              <input
                type="text"
                className={styles.input}
                value={inspector1Name}
                onChange={(e) => setInspector1Name(e.target.value)}
                placeholder="اسم المفتش الأول"
                disabled={reportNumber > 1}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>الاسم الثاني</label>
              <input
                type="text"
                className={styles.input}
                value={inspector2Name}
                onChange={(e) => setInspector2Name(e.target.value)}
                placeholder="اسم المفتش الثاني"
                disabled={reportNumber > 1}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>الاسم الثالث</label>
              <input
                type="text"
                className={styles.input}
                value={inspector3Name}
                onChange={(e) => setInspector3Name(e.target.value)}
                placeholder="اسم المفتش الثالث"
                disabled={reportNumber > 1}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>التاريخ</label>
                <input
                  type="date"
                  className={styles.input}
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  disabled={reportNumber > 1}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>اليوم</label>
                <input
                  type="text"
                  className={styles.input}
                  value={inspectionDay}
                  onChange={(e) => setInspectionDay(e.target.value)}
                  placeholder="اليوم"
                  disabled={reportNumber > 1}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>الوقت</label>
                <input
                  type="time"
                  className={styles.input}
                  value={inspectionTime}
                  onChange={(e) => setInspectionTime(e.target.value)}
                  disabled={reportNumber > 1}
                />
              </div>
            </div>
          </div>

          {/* بالتفتيش على الموقع التالي */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>بالتفتيش على الموقع التالي</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>اسم المؤسسة</label>
              <input
                type="text"
                className={styles.input}
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                placeholder="اسم المؤسسة"
                disabled={reportNumber > 1}
              />
            </div>

            <div className={styles.addressGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>المنطقة</label>
                <input
                  type="text"
                  className={styles.input}
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="المنطقة"
                  disabled={reportNumber > 1}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>قطعة</label>
                <input
                  type="text"
                  className={styles.input}
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  placeholder="قطعة"
                  disabled={reportNumber > 1}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>الشارع</label>
                <input
                  type="text"
                  className={styles.input}
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="الشارع"
                  disabled={reportNumber > 1}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>رقم القسيمة</label>
                <input
                  type="text"
                  className={styles.input}
                  value={plotNumber}
                  onChange={(e) => setPlotNumber(e.target.value)}
                  placeholder="رقم القسيمة"
                  disabled={reportNumber > 1}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>الدور</label>
                <input
                  type="text"
                  className={styles.input}
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="الدور"
                  disabled={reportNumber > 1}
                />
              </div>
            </div>
          </div>

          {/* المخالفات */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>وقد تم إثبات المخالفات الآتية بحق صاحب الترخيص المذكور:</h2>

            <div className={styles.violationsList}>
              {violations.map((violation, index) => (
                <div key={violation.id} className={styles.violationItem}>
                  <span className={styles.violationNumber}>{index + 1}.</span>
                  <input
                    type="text"
                    className={styles.violationInput}
                    value={violation.text}
                    onChange={(e) => updateViolation(violation.id, e.target.value)}
                    placeholder={`المخالفة رقم ${index + 1}`}
                  />
                  {violations.length > 1 && (
                    <button
                      className={styles.removeViolationBtn}
                      onClick={() => removeViolation(violation.id)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              <button className={styles.addViolationBtn} onClick={addViolation}>
                + إضافة مخالفة
              </button>
            </div>
          </div>

          {/* معلومات المواجهة */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>معلومات المواجهة</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>وقد تم مواجهة السيد/السيدة</label>
                <input
                  type="text"
                  className={styles.input}
                  value={confrontedPerson}
                  onChange={(e) => setConfrontedPerson(e.target.value)}
                  placeholder="اسم الشخص"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>بصفته/بصفتها</label>
                <input
                  type="text"
                  className={styles.input}
                  value={personTitle}
                  onChange={(e) => setPersonTitle(e.target.value)}
                  placeholder="الصفة"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>بهذه المخالفات وتمت الإفادة بأن:</label>
              <textarea
                className={styles.textarea}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="اكتب الإفادة هنا..."
                rows={6}
              />
            </div>

            {/* توقيع المخالف */}
            <div className={styles.formGroup}>
              <label className={styles.label}>توقيع المخالف</label>
              <div className={styles.signatureContainer}>
                {violatorSignature ? (
                  <div className={styles.signaturePreview}>
                    <img src={violatorSignature} alt="توقيع المخالف" className={styles.signatureImage} />
                    <button
                      type="button"
                      className={styles.removeSignatureBtn}
                      onClick={removeSignature}
                    >
                      إزالة التوقيع
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.addSignatureBtn}
                    onClick={openSignatureModal}
                  >
                    + إضافة توقيع المخالف
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className={styles.saveButtonContainer}>
            <button
              className={styles.saveButton}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'جاري الحفظ...' : (isEditMode ? 'تحديث المحضر' : 'حفظ المحضر')}
            </button>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>توقيع المخالف</h3>
            <canvas
              ref={canvasRef}
              className={styles.signatureCanvas}
              width={600}
              height={300}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            <div className={styles.modalActions}>
              <button className={styles.clearBtn} onClick={clearCanvas}>
                مسح
              </button>
              <button className={styles.cancelBtn} onClick={closeSignatureModal}>
                إلغاء
              </button>
              <button className={styles.saveBtn} onClick={saveSignature}>
                حفظ التوقيع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
