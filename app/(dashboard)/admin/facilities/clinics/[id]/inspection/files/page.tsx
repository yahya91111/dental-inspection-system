"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import styles from "./styles.module.css"

export default function FilesPage() {
  const router = useRouter()

  // Database state
  const [isLoading, setIsLoading] = useState(true)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // Disable automatic scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto'
      }
    }
  }, [])

  const handleBack = () => {
    router.back()
  }

  // الملفات والبطاقات الأصلية
  const [patientResults, setPatientResults] = useState<"وافي" | "غير وافي" | null>(null)
  const [medicalDiagnosis, setMedicalDiagnosis] = useState<"وافي" | "غير وافي" | null>(null)
  const [treatment, setTreatment] = useState<"وافي" | "غير وافي" | null>(null)
  const [priceList, setPriceList] = useState<"وافي" | "غير وافي" | null>(null)
  const [receipts, setReceipts] = useState<"وافي" | "غير وافي" | null>(null)
  const [prescriptionCopies, setPrescriptionCopies] = useState<"وافي" | "غير وافي" | null>(null)
  const [visitorsRecord, setVisitorsRecord] = useState<"وافي" | "غير وافي" | null>(null)
  const [medicineRecord, setMedicineRecord] = useState<"وافي" | "غير وافي" | null>(null)
  const [safetyTests, setSafetyTests] = useState<"وافي" | "غير وافي" | null>(null)

  // القسم الثاني
  const [monthlyStatistics, setMonthlyStatistics] = useState<"نعم" | "لا" | null>(null)
  const [evidenceGuides, setEvidenceGuides] = useState<"نعم" | "لا" | null>(null)
  const [licenseMatching, setLicenseMatching] = useState<"نعم" | "لا" | null>(null)

  // الثبيتات
  const [wasteContract, setWasteContract] = useState<"متوفر" | "غير متوفر" | null>(null)

  // Load inspection data from sessionStorage or database
  const loadInspectionData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Check sessionStorage first
      const savedData = sessionStorage.getItem('files_section_data')
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          setPatientResults(data.patientResults || null)
          setMedicalDiagnosis(data.medicalDiagnosis || null)
          setTreatment(data.treatment || null)
          setPriceList(data.priceList || null)
          setReceipts(data.receipts || null)
          setPrescriptionCopies(data.prescriptionCopies || null)
          setVisitorsRecord(data.visitorsRecord || null)
          setMedicineRecord(data.medicineRecord || null)
          setSafetyTests(data.safetyTests || null)
          setMonthlyStatistics(data.monthlyStatistics || null)
          setEvidenceGuides(data.evidenceGuides || null)
          setLicenseMatching(data.licenseMatching || null)
          setWasteContract(data.wasteContract || null)
          setIsLoading(false)
          setIsDataLoaded(true)
          return
        } catch (error) {
          console.error('Error loading from sessionStorage:', error)
        }
      }

      // If no sessionStorage, load from database (TODO: implement database loading)
      // For now, just mark as loaded
      setIsDataLoaded(true)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load data on mount
  useEffect(() => {
    loadInspectionData()
  }, [loadInspectionData])

  // Auto-save to sessionStorage whenever data changes
  useEffect(() => {
    if (!isDataLoaded) return

    const data = {
      patientResults,
      medicalDiagnosis,
      treatment,
      priceList,
      receipts,
      prescriptionCopies,
      visitorsRecord,
      medicineRecord,
      safetyTests,
      monthlyStatistics,
      evidenceGuides,
      licenseMatching,
      wasteContract
    }
    sessionStorage.setItem('files_section_data', JSON.stringify(data))
  }, [
    isDataLoaded,
    patientResults,
    medicalDiagnosis,
    treatment,
    priceList,
    receipts,
    prescriptionCopies,
    visitorsRecord,
    medicineRecord,
    safetyTests,
    monthlyStatistics,
    evidenceGuides,
    licenseMatching,
    wasteContract
  ])

  const ToggleButton = ({
    value,
    onChange,
    options
  }: {
    value: string | null,
    onChange: (val: any) => void,
    options: { value: string, label: string, color: string }[]
  }) => (
    <div className={styles.toggleGroup}>
      {options.map((option) => (
        <button
          key={option.value}
          className={`${styles.toggleBtn} ${value === option.value ? styles.toggleBtnActive : ''}`}
          onClick={() => onChange(value === option.value ? null : option.value)}
          style={value === option.value ? {
            background: option.color,
            boxShadow: `inset 3px 3px 6px rgba(0,0,0,0.2), inset -2px -2px 6px rgba(255,255,255,0.1)`
          } : {}}
        >
          {option.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={handleBack}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>الملفات</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.formCard}>

          {/* الملفات والبطاقات الأصلية */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>الملفات والبطاقات الأصلية</h2>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>التاريخ المرضي</label>
              <ToggleButton
                value={patientResults}
                onChange={setPatientResults}
                options={[
                  { value: "وافي", label: "وافي", color: "#059669" },
                  { value: "غير وافي", label: "غير وافي", color: "#ef4444" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>التشخيص المرضي</label>
              <ToggleButton
                value={medicalDiagnosis}
                onChange={setMedicalDiagnosis}
                options={[
                  { value: "وافي", label: "وافي", color: "#059669" },
                  { value: "غير وافي", label: "غير وافي", color: "#ef4444" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>العلاج</label>
              <ToggleButton
                value={treatment}
                onChange={setTreatment}
                options={[
                  { value: "وافي", label: "وافي", color: "#059669" },
                  { value: "غير وافي", label: "غير وافي", color: "#ef4444" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>قائمة الأجور</label>
              <ToggleButton
                value={priceList}
                onChange={setPriceList}
                options={[
                  { value: "وافي", label: "وافي", color: "#059669" },
                  { value: "غير وافي", label: "غير وافي", color: "#ef4444" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>إيصالات الأجور</label>
              <ToggleButton
                value={receipts}
                onChange={setReceipts}
                options={[
                  { value: "وافي", label: "وافي", color: "#059669" },
                  { value: "غير وافي", label: "غير وافي", color: "#ef4444" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>نسخ الوصفات الطبية</label>
              <ToggleButton
                value={prescriptionCopies}
                onChange={setPrescriptionCopies}
                options={[
                  { value: "وافي", label: "وافي", color: "#059669" },
                  { value: "غير وافي", label: "غير وافي", color: "#ef4444" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>سجل المراجعين للعيادة</label>
              <ToggleButton
                value={visitorsRecord}
                onChange={setVisitorsRecord}
                options={[
                  { value: "وافي", label: "وافي", color: "#059669" },
                  { value: "غير وافي", label: "غير وافي", color: "#ef4444" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>سجل الأدوية المسعفة</label>
              <ToggleButton
                value={medicineRecord}
                onChange={setMedicineRecord}
                options={[
                  { value: "وافي", label: "وافي", color: "#059669" },
                  { value: "غير وافي", label: "غير وافي", color: "#ef4444" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>احتياطات الأمن والسلامة</label>
              <ToggleButton
                value={safetyTests}
                onChange={setSafetyTests}
                options={[
                  { value: "وافي", label: "وافي", color: "#059669" },
                  { value: "غير وافي", label: "غير وافي", color: "#ef4444" }
                ]}
              />
            </div>
          </div>

          {/* متطلبات إضافية */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>متطلبات إضافية</h2>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>إرسال الإحصائيات الشهرية</label>
              <ToggleButton
                value={monthlyStatistics}
                onChange={setMonthlyStatistics}
                options={[
                  { value: "نعم", label: "نعم", color: "#059669" },
                  { value: "لا", label: "لا", color: "#ef4444" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>اللافتات الاستدلالية</label>
              <ToggleButton
                value={evidenceGuides}
                onChange={setEvidenceGuides}
                options={[
                  { value: "نعم", label: "نعم", color: "#059669" },
                  { value: "لا", label: "لا", color: "#ef4444" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>مطابقة الترخيص</label>
              <ToggleButton
                value={licenseMatching}
                onChange={setLicenseMatching}
                options={[
                  { value: "نعم", label: "نعم", color: "#059669" },
                  { value: "لا", label: "لا", color: "#ef4444" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>عقد النفايات</label>
              <ToggleButton
                value={wasteContract}
                onChange={setWasteContract}
                options={[
                  { value: "متوفر", label: "متوفر", color: "#059669" },
                  { value: "غير متوفر", label: "غير متوفر", color: "#9ca3af" }
                ]}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
