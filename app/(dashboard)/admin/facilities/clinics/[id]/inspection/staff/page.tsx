"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import styles from "./styles.module.css"

interface ImplantDoctor {
  id: string
  name: string
  specialty: string
  implantType: string
  license: string
}

// قائمة أنواع الزرعات المعتمدة من وزارة الصحة
const APPROVED_IMPLANT_TYPES = [
  "AADVA",
  "KLOCKNER",
  "MEGAGEN",
  "WINSIX Implants",
  "XIVE",
  "NeoBiotech",
  "SIC INVENT",
  "(ITI) STRAUMANN",
  "DENTIUM",
  "DENTAURUM (TIOLOGIC IMPLANTS)",
  "SPI Thommen",
  "GMI Frontier",
  "OSSTEM/HIOSSEN",
  "ASTRA TECH",
  "BEGO",
  "OSTEOCARE",
  "JDENTAL CARE",
  "CAMLOG",
  "NOBEL BIOCARE",
  "TBR",
  "TRATE ROOTT",
  "BIOHORIZON",
  "SGS",
  "Biomet 3i Zimmer Biomet",
  "Prime Taper Ev",
  "IRES Implant",
  "Implantswiss",
  "Ankylos",
  "Ritter"
]

export default function StaffPage() {
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

  // عدد الطاقم العاملين
  const [doctorsCount, setDoctorsCount] = useState("")
  const [visitingDoctorsCount, setVisitingDoctorsCount] = useState("")
  const [nursingStaffCount, setNursingStaffCount] = useState("")
  const [techniciansCount, setTechniciansCount] = useState("")

  // عدد العيادات
  const [clinicsCount, setClinicsCount] = useState("")

  // الزراعة
  const [implantStatus, setImplantStatus] = useState<"لا يقوم" | "يقوم" | null>(null)
  const [hasImplantWasher, setHasImplantWasher] = useState<"نعم" | "لا" | null>(null)

  // جدول الأطباء الذين يقومون بالزراعة
  const [implantDoctors, setImplantDoctors] = useState<ImplantDoctor[]>([
    { id: '1', name: '', specialty: '', implantType: '', license: '' }
  ])

  const addDoctorRow = () => {
    const newDoctor: ImplantDoctor = {
      id: Date.now().toString(),
      name: '',
      specialty: '',
      implantType: '',
      license: ''
    }
    setImplantDoctors([...implantDoctors, newDoctor])
  }

  const removeDoctorRow = (id: string) => {
    if (implantDoctors.length > 1) {
      setImplantDoctors(implantDoctors.filter(doc => doc.id !== id))
    }
  }

  const updateDoctor = (id: string, field: keyof ImplantDoctor, value: string) => {
    setImplantDoctors(implantDoctors.map(doc =>
      doc.id === id ? { ...doc, [field]: value } : doc
    ))
  }

  // Load inspection data from sessionStorage or database
  const loadInspectionData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Check sessionStorage first
      const savedData = sessionStorage.getItem('staff_section_data')
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          setDoctorsCount(data.doctorsCount || "")
          setVisitingDoctorsCount(data.visitingDoctorsCount || "")
          setNursingStaffCount(data.nursingStaffCount || "")
          setTechniciansCount(data.techniciansCount || "")
          setClinicsCount(data.clinicsCount || "")
          setImplantStatus(data.implantStatus || null)
          setHasImplantWasher(data.hasImplantWasher || null)
          setImplantDoctors(data.implantDoctors || [{ id: '1', name: '', specialty: '', implantType: '', license: '' }])
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
      doctorsCount,
      visitingDoctorsCount,
      nursingStaffCount,
      techniciansCount,
      clinicsCount,
      implantStatus,
      hasImplantWasher,
      implantDoctors
    }
    sessionStorage.setItem('staff_section_data', JSON.stringify(data))
  }, [
    isDataLoaded,
    doctorsCount,
    visitingDoctorsCount,
    nursingStaffCount,
    techniciansCount,
    clinicsCount,
    implantStatus,
    hasImplantWasher,
    implantDoctors
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
          <h1 className={styles.pageTitle}>العاملين</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.formCard}>

          {/* عدد الطاقم العاملين */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>عدد الطاقم العاملين في المؤسسة العلاجية</h2>

            <div className={styles.staffTable}>
              <div className={styles.tableRow}>
                <div className={styles.tableLabel}>الأطباء</div>
                <input
                  type="text"
                  className={styles.tableInput}
                  value={doctorsCount}
                  onChange={(e) => setDoctorsCount(e.target.value)}
                  placeholder="العدد"
                />
              </div>

              <div className={styles.tableRow}>
                <div className={styles.tableLabel}>الأطباء الزائرين</div>
                <input
                  type="text"
                  className={styles.tableInput}
                  value={visitingDoctorsCount}
                  onChange={(e) => setVisitingDoctorsCount(e.target.value)}
                  placeholder="العدد"
                />
              </div>

              <div className={styles.tableRow}>
                <div className={styles.tableLabel}>الهيئة التمريضية</div>
                <input
                  type="text"
                  className={styles.tableInput}
                  value={nursingStaffCount}
                  onChange={(e) => setNursingStaffCount(e.target.value)}
                  placeholder="العدد"
                />
              </div>

              <div className={styles.tableRow}>
                <div className={styles.tableLabel}>الفنيين</div>
                <input
                  type="text"
                  className={styles.tableInput}
                  value={techniciansCount}
                  onChange={(e) => setTechniciansCount(e.target.value)}
                  placeholder="العدد"
                />
              </div>
            </div>
          </div>

          {/* عدد العيادات */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>عدد العيادات</h2>
            <input
              type="text"
              className={styles.textInput}
              value={clinicsCount}
              onChange={(e) => setClinicsCount(e.target.value)}
              placeholder="أدخل عدد العيادات"
            />
          </div>

          {/* الزراعة */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>الزراعة (Implant)</h2>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>حالة الزراعة في المركز</label>
              <ToggleButton
                value={implantStatus}
                onChange={setImplantStatus}
                options={[
                  { value: "لا يقوم", label: "المركز لا يقوم بإجراء الزراعة", color: "#9ca3af" },
                  { value: "يقوم", label: "المركز يقوم بإجراء الزراعة", color: "#059669" }
                ]}
              />
            </div>

            {implantStatus === "يقوم" && (
              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>هل تتوفر غسالة لأدوات الزراعة؟</label>
                <ToggleButton
                  value={hasImplantWasher}
                  onChange={setHasImplantWasher}
                  options={[
                    { value: "نعم", label: "نعم", color: "#059669" },
                    { value: "لا", label: "لا", color: "#ef4444" }
                  ]}
                />
              </div>
            )}
          </div>

          {/* جدول الأطباء الذين يقومون بالزراعة */}
          {implantStatus === "يقوم" && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>الأطباء الذين يقومون بالزراعة في المركز</h2>

              <div className={styles.doctorsTableContainer}>
                <table className={styles.doctorsTable}>
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>الاسم</th>
                      <th>الاختصاص</th>
                      <th>نوع IMPLANT</th>
                      <th>ترخيص الزراعة</th>
                      <th>إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {implantDoctors.map((doctor, index) => (
                      <tr key={doctor.id}>
                        <td>{index + 1}</td>
                        <td>
                          <input
                            type="text"
                            className={styles.tableTextInput}
                            value={doctor.name}
                            onChange={(e) => updateDoctor(doctor.id, 'name', e.target.value)}
                            placeholder="الاسم"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className={styles.tableTextInput}
                            value={doctor.specialty}
                            onChange={(e) => updateDoctor(doctor.id, 'specialty', e.target.value)}
                            placeholder="الاختصاص"
                          />
                        </td>
                        <td>
                          <select
                            className={styles.tableTextInput}
                            value={doctor.implantType}
                            onChange={(e) => updateDoctor(doctor.id, 'implantType', e.target.value)}
                          >
                            <option value="">اختر نوع الزرعة</option>
                            {APPROVED_IMPLANT_TYPES.map((type, idx) => (
                              <option key={idx} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            className={styles.tableTextInput}
                            value={doctor.license}
                            onChange={(e) => updateDoctor(doctor.id, 'license', e.target.value)}
                            placeholder="ترخيص"
                          />
                        </td>
                        <td>
                          <button
                            className={styles.removeBtn}
                            onClick={() => removeDoctorRow(doctor.id)}
                            disabled={implantDoctors.length === 1}
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <button className={styles.addRowBtn} onClick={addDoctorRow}>
                  + إضافة طبيب
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
