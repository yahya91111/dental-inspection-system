"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
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

export default function ViolationsPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const clinicId = params.id as string
  const visitId = searchParams.get('visitId') || sessionStorage.getItem('current_visit_id') || ""

  const [isLoading, setIsLoading] = useState(true)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // معلومات أساسية (مشتركة)
  const [inspector1Name, setInspector1Name] = useState("")
  const [inspector2Name, setInspector2Name] = useState("")
  const [inspector3Name, setInspector3Name] = useState("")
  const [inspectionDate, setInspectionDate] = useState("")
  const [inspectionDay, setInspectionDay] = useState("")
  const [inspectionTime, setInspectionTime] = useState("")

  // معلومات الموقع (مشتركة)
  const [facilityName, setFacilityName] = useState("")
  const [area, setArea] = useState("")
  const [block, setBlock] = useState("")
  const [street, setStreet] = useState("")
  const [plotNumber, setPlotNumber] = useState("")
  const [floor, setFloor] = useState("")

  // معلومات المواجهة (مشتركة لجميع المحاضر)
  const [confrontedPerson, setConfrontedPerson] = useState("")
  const [personTitle, setPersonTitle] = useState("")

  // المحضر الأول
  const [violations1, setViolations1] = useState<Violation[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
    { id: '3', text: '' },
    { id: '4', text: '' },
    { id: '5', text: '' }
  ])
  const [statement1, setStatement1] = useState("")

  // المحاضر الإضافية (2، 3، إلخ)
  const [additionalReports, setAdditionalReports] = useState<AdditionalReport[]>([])

  // Load data from sessionStorage
  useEffect(() => {
    const loadData = () => {
      try {
        setIsLoading(true)

        const savedData = sessionStorage.getItem('violations_section_data')
        if (savedData) {
          const data = JSON.parse(savedData)
          setInspector1Name(data.inspector1Name || "")
          setInspector2Name(data.inspector2Name || "")
          setInspector3Name(data.inspector3Name || "")
          setInspectionDate(data.inspectionDate || "")
          setInspectionDay(data.inspectionDay || "")
          setInspectionTime(data.inspectionTime || "")
          setFacilityName(data.facilityName || "")
          setArea(data.area || "")
          setBlock(data.block || "")
          setStreet(data.street || "")
          setPlotNumber(data.plotNumber || "")
          setFloor(data.floor || "")
          setConfrontedPerson(data.confrontedPerson || "")
          setPersonTitle(data.personTitle || "")
          setViolations1(data.violations1 || [
            { id: '1', text: '' },
            { id: '2', text: '' },
            { id: '3', text: '' },
            { id: '4', text: '' },
            { id: '5', text: '' }
          ])
          setStatement1(data.statement1 || "")
          setAdditionalReports(data.additionalReports || [])
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
        setIsDataLoaded(true)
      }
    }

    loadData()
  }, [])

  // Auto-save to sessionStorage
  useEffect(() => {
    if (!isDataLoaded) return

    const data = {
      inspector1Name,
      inspector2Name,
      inspector3Name,
      inspectionDate,
      inspectionDay,
      inspectionTime,
      facilityName,
      area,
      block,
      street,
      plotNumber,
      floor,
      confrontedPerson,
      personTitle,
      violations1,
      statement1,
      additionalReports
    }

    try {
      sessionStorage.setItem('violations_section_data', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving to sessionStorage:', error)
    }
  }, [
    isDataLoaded,
    inspector1Name,
    inspector2Name,
    inspector3Name,
    inspectionDate,
    inspectionDay,
    inspectionTime,
    facilityName,
    area,
    block,
    street,
    plotNumber,
    floor,
    confrontedPerson,
    personTitle,
    violations1,
    statement1,
    additionalReports
  ])

  const handleBack = () => {
    router.back()
  }

  // Violation management for report 1
  const addViolation1 = () => {
    const newViolation: Violation = {
      id: Date.now().toString(),
      text: ''
    }
    setViolations1([...violations1, newViolation])
  }

  const removeViolation1 = (id: string) => {
    if (violations1.length > 1) {
      setViolations1(violations1.filter(v => v.id !== id))
    }
  }

  const updateViolation1 = (id: string, text: string) => {
    setViolations1(violations1.map(v =>
      v.id === id ? { ...v, text } : v
    ))
  }

  // Add new additional report
  const addNewReport = () => {
    const newReportNumber = additionalReports.length + 2
    const newReport: AdditionalReport = {
      reportNumber: newReportNumber,
      violations: [
        { id: '1', text: '' },
        { id: '2', text: '' },
        { id: '3', text: '' }
      ],
      statement: ""
    }
    setAdditionalReports([...additionalReports, newReport])
  }

  // Remove additional report
  const removeAdditionalReport = (index: number) => {
    setAdditionalReports(additionalReports.filter((_, i) => i !== index))
  }

  // Update additional report violations
  const addViolationToReport = (reportIndex: number) => {
    const newViolation: Violation = {
      id: Date.now().toString(),
      text: ''
    }
    const updated = [...additionalReports]
    updated[reportIndex].violations.push(newViolation)
    setAdditionalReports(updated)
  }

  const removeViolationFromReport = (reportIndex: number, violationId: string) => {
    const updated = [...additionalReports]
    if (updated[reportIndex].violations.length > 1) {
      updated[reportIndex].violations = updated[reportIndex].violations.filter(v => v.id !== violationId)
      setAdditionalReports(updated)
    }
  }

  const updateReportViolation = (reportIndex: number, violationId: string, text: string) => {
    const updated = [...additionalReports]
    updated[reportIndex].violations = updated[reportIndex].violations.map(v =>
      v.id === violationId ? { ...v, text } : v
    )
    setAdditionalReports(updated)
  }

  // Update additional report statement
  const updateReportStatement = (reportIndex: number, statement: string) => {
    const updated = [...additionalReports]
    updated[reportIndex].statement = statement
    setAdditionalReports(updated)
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
          <h1 className={styles.pageTitle}>محضر إثبات مخالفة</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.formCard}>

          {/* معلومات أساسية (مشتركة لجميع المحاضر) */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>معلومات أساسية (مشتركة لجميع المحاضر)</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>الاسم الأول</label>
              <input
                type="text"
                className={styles.input}
                value={inspector1Name}
                onChange={(e) => setInspector1Name(e.target.value)}
                placeholder="اسم المفتش الأول"
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
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>الوقت</label>
                <input
                  type="time"
                  className={styles.input}
                  value={inspectionTime}
                  onChange={(e) => setInspectionTime(e.target.value)}
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
                />
              </div>
            </div>
          </div>

          {/* معلومات المواجهة (مشتركة لجميع المحاضر) */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>معلومات المواجهة (مشتركة لجميع المحاضر)</h2>

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
          </div>

          {/* المحضر الأول */}
          <div className={styles.reportSection}>
            <div className={styles.reportHeader}>
              <h2 className={styles.reportTitle}>محضر مخالفة رقم 1</h2>
            </div>

            {/* المخالفات */}
            <div className={styles.section}>
              <h3 className={styles.subsectionTitle}>وقد تم إثبات المخالفات الآتية بحق صاحب الترخيص المذكور:</h3>

              <div className={styles.violationsList}>
                {violations1.map((violation, index) => (
                  <div key={violation.id} className={styles.violationItem}>
                    <span className={styles.violationNumber}>{index + 1}.</span>
                    <input
                      type="text"
                      className={styles.violationInput}
                      value={violation.text}
                      onChange={(e) => updateViolation1(violation.id, e.target.value)}
                      placeholder={`المخالفة رقم ${index + 1}`}
                    />
                    {violations1.length > 1 && (
                      <button
                        className={styles.removeViolationBtn}
                        onClick={() => removeViolation1(violation.id)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                <button className={styles.addViolationBtn} onClick={addViolation1}>
                  + إضافة مخالفة
                </button>
              </div>
            </div>

            {/* الإفادة */}
            <div className={styles.section}>
              <h3 className={styles.subsectionTitle}>الإفادة</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>بهذه المخالفات وتمت الإفادة بأن:</label>
                <textarea
                  className={styles.textarea}
                  value={statement1}
                  onChange={(e) => setStatement1(e.target.value)}
                  placeholder="اكتب الإفادة هنا..."
                  rows={6}
                />
              </div>
            </div>
          </div>

          {/* المحاضر الإضافية */}
          {additionalReports.map((report, reportIndex) => (
            <div key={report.reportNumber} className={styles.reportSection}>
              <div className={styles.reportHeader}>
                <h2 className={styles.reportTitle}>محضر مخالفة رقم {report.reportNumber}</h2>
                <button
                  className={styles.removeReportBtn}
                  onClick={() => removeAdditionalReport(reportIndex)}
                >
                  حذف المحضر
                </button>
              </div>

              {/* المخالفات */}
              <div className={styles.section}>
                <h3 className={styles.subsectionTitle}>وقد تم إثبات المخالفات الآتية بحق صاحب الترخيص المذكور:</h3>

                <div className={styles.violationsList}>
                  {report.violations.map((violation, index) => (
                    <div key={violation.id} className={styles.violationItem}>
                      <span className={styles.violationNumber}>{index + 1}.</span>
                      <input
                        type="text"
                        className={styles.violationInput}
                        value={violation.text}
                        onChange={(e) => updateReportViolation(reportIndex, violation.id, e.target.value)}
                        placeholder={`المخالفة رقم ${index + 1}`}
                      />
                      {report.violations.length > 1 && (
                        <button
                          className={styles.removeViolationBtn}
                          onClick={() => removeViolationFromReport(reportIndex, violation.id)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    className={styles.addViolationBtn}
                    onClick={() => addViolationToReport(reportIndex)}
                  >
                    + إضافة مخالفة
                  </button>
                </div>
              </div>

              {/* الإفادة */}
              <div className={styles.section}>
                <h3 className={styles.subsectionTitle}>الإفادة</h3>

                <div className={styles.formGroup}>
                  <label className={styles.label}>بهذه المخالفات وتمت الإفادة بأن:</label>
                  <textarea
                    className={styles.textarea}
                    value={report.statement}
                    onChange={(e) => updateReportStatement(reportIndex, e.target.value)}
                    placeholder="اكتب الإفادة هنا..."
                    rows={6}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add New Report Button */}
          <div className={styles.addReportContainer}>
            <button className={styles.addReportBtn} onClick={addNewReport}>
              + إضافة محضر مخالفة جديد
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
