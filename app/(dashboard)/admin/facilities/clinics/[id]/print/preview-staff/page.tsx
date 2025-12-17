"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import styles from "../preview/styles.module.css"
import { getVisitById, type Visit } from "@/lib/api/visits"
import { getSubmittedInspectionByVisitId, type SubmittedInspection } from "@/lib/api/submitted-inspections"
import { getClinicById, type Clinic } from "@/lib/api/clinics"

export default function StaffPrintPreview() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const visitId = searchParams.get('visitId')

  // State for loading data
  const [isLoading, setIsLoading] = useState(true)
  const [visit, setVisit] = useState<Visit | null>(null)
  const [inspection, setInspection] = useState<SubmittedInspection | null>(null)
  const [clinic, setClinic] = useState<Clinic | null>(null)

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      if (!visitId) {
        alert('معرف الزيارة غير موجود')
        router.back()
        return
      }

      try {
        setIsLoading(true)

        // Get visit data
        const visitData = await getVisitById(visitId)
        if (!visitData) {
          alert('لم يتم العثور على بيانات الزيارة')
          router.back()
          return
        }
        setVisit(visitData)

        // Get submitted inspection data
        const inspectionData = await getSubmittedInspectionByVisitId(visitId)
        console.log('📋 Staff page - Loaded inspection data:', inspectionData)
        console.log('👥 Staff data from database:', {
          doctors: inspectionData?.staff_doctors_count,
          visitingDoctors: inspectionData?.staff_visiting_doctors_count,
          nursingStaff: inspectionData?.staff_nursing_staff_count,
          technicians: inspectionData?.staff_technicians_count,
          clinicsCount: inspectionData?.staff_clinics_count,
          implantStatus: inspectionData?.staff_implant_status,
          hasWasher: inspectionData?.staff_implant_has_washer,
          implantDoctors: inspectionData?.staff_implant_doctors
        })
        setInspection(inspectionData)

        // Get clinic data
        const clinicData = await getClinicById(visitData.clinic_id)
        setClinic(clinicData)

      } catch (error) {
        console.error('Error loading data:', error)
        alert('حدث خطأ في تحميل البيانات')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [visitId, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.noPrint}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            رجوع
          </button>
        </div>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <p>جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  // Transform database data to display format
  const inspectionData = {
    date: visit?.visit_date || "",
    clinicName: clinic?.name || "",

    // Staff Count
    staff: {
      doctors: inspection?.staff_doctors_count || 0,
      visitingDoctors: inspection?.staff_visiting_doctors_count || 0,
      nursingStaff: inspection?.staff_nursing_staff_count || 0,
      technicians: inspection?.staff_technicians_count || 0
    },

    // Clinics Count
    clinicsCount: inspection?.staff_clinics_count || 0,

    // Implant Options
    implant: {
      noImplant: inspection?.staff_implant_status === "no-implant",
      hasImplant: inspection?.staff_implant_status === "has-implant",
      hasWasher: inspection?.staff_implant_has_washer === "yes"
    },

    // Implant Doctors
    implantDoctors: inspection?.staff_implant_doctors || []
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className={styles.page}>
      {/* Print/Back Buttons */}
      <div className={styles.noPrint}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          رجوع
        </button>
        <button className={styles.printBtn} onClick={handlePrint}>
          طباعة
        </button>
      </div>

      {/* Official Document */}
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
              {/* Kuwait Emblem */}
              <div className={styles.emblemCircle}>
                <img
                  src="/images/kuwait-emblem.png"
                  alt="شعار دولة الكويت"
                />
              </div>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.headerTextAr}>وزارة الصحة</div>
            <div className={styles.headerTextAr}>إدارة طب الأسنان</div>
            <div className={styles.headerTextAr}>دولة الكويت</div>
          </div>
        </div>

        {/* Title Section */}
        <div className={styles.titleSection}>
          <div className={styles.mainTitle}>
            تقرير أطباء لجنة تفتيش الأسنان في القطاع الأهلي
          </div>

          <div className={styles.titleRow}>
            <div className={styles.dateField}>
              <span className={styles.fieldLabel}>التاريخ:</span>
              <span className={styles.fieldValue}>{inspectionData.date}</span>
            </div>
            <div className={styles.clinicNameField}>
              <span className={styles.fieldLabel}>اسم المؤسسة العلاجية:</span>
              <span className={styles.fieldValue}>{inspectionData.clinicName}</span>
            </div>
          </div>
        </div>

        {/* Staff Count Table */}
        <div className={styles.staffSection}>
          <h3 className={styles.sectionTitle}>عدد الطاقم العاملين في المؤسسة العلاجية</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.subHeader}>No</th>
                <th className={styles.subHeader}>التصنيف</th>
                <th className={styles.subHeader}>العدد</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={styles.checkCell}>.1</td>
                <td className={styles.itemCell}>الأطباء</td>
                <td className={styles.checkCell}>{inspectionData.staff.doctors}</td>
              </tr>
              <tr>
                <td className={styles.checkCell}>.2</td>
                <td className={styles.itemCell}>الأطباء الزائرين</td>
                <td className={styles.checkCell}>{inspectionData.staff.visitingDoctors}</td>
              </tr>
              <tr>
                <td className={styles.checkCell}>.3</td>
                <td className={styles.itemCell}>الهيئة التمريضية</td>
                <td className={styles.checkCell}>{inspectionData.staff.nursingStaff}</td>
              </tr>
              <tr>
                <td className={styles.checkCell}>.4</td>
                <td className={styles.itemCell}>التشيين</td>
                <td className={styles.checkCell}>{inspectionData.staff.technicians}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Clinics Count */}
        <div className={styles.clinicsCount}>
          <span className={styles.fieldLabel}>عدد العيادات :</span>
          <span className={styles.fieldValue}>{inspectionData.clinicsCount}</span>
        </div>

        {/* Divider */}
        <div className={styles.dividerLine}></div>

        {/* Implant Options */}
        <div className={styles.implantOptions}>
          <div className={styles.checkboxRow}>
            <input type="checkbox" checked={inspectionData.implant.noImplant} readOnly />
            <label>المركز لا يقوم بإجراء الزراعة</label>
          </div>
          <div className={styles.checkboxRow}>
            <input type="checkbox" checked={inspectionData.implant.hasImplant} readOnly />
            <label>المركز يقوم بإجراء الزراعة</label>
          </div>
          <div className={styles.checkboxRow}>
            <input type="checkbox" checked={inspectionData.implant.hasWasher} readOnly />
            <label>هل تتوفر غسالة لأدوات الزراعة:</label>
            <span className={styles.checkboxInline}>
              <input type="checkbox" checked={inspectionData.implant.hasWasher} readOnly />
              <label>نعم</label>
            </span>
            <span className={styles.checkboxInline}>
              <input type="checkbox" checked={!inspectionData.implant.hasWasher} readOnly />
              <label>لا</label>
            </span>
          </div>
        </div>

        {/* Implant Doctors Table */}
        <div className={styles.implantSection}>
          <h3 className={styles.sectionTitle}>الأطباء الذين يقومون بالزراعة في المركز</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.subHeader}>No</th>
                <th className={styles.subHeader}>الاسم</th>
                <th className={styles.subHeader}>الاختصاص</th>
                <th className={styles.subHeader}>نوع IMPLANT</th>
                <th className={styles.subHeader}>ترخيص الزراعة</th>
              </tr>
            </thead>
            <tbody>
              {inspectionData.implantDoctors.length > 0 ? (
                inspectionData.implantDoctors.map((doctor: any, index: number) => (
                  <tr key={index}>
                    <td className={styles.checkCell}>.{index + 1}</td>
                    <td className={styles.itemCell}>{doctor.name}</td>
                    <td className={styles.itemCell}>{doctor.specialty}</td>
                    <td className={styles.itemCell}>{doctor.implantType}</td>
                    <td className={styles.checkCell}>{doctor.license}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className={styles.itemCell} style={{ textAlign: 'center' }}>
                    لا توجد بيانات لأطباء الزراعة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Page Number */}
        <div className={styles.pageNumber}>- 8 -</div>
      </div>
    </div>
  )
}
