"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import styles from "../preview/styles.module.css"
import { getSubmittedInspectionByVisitId } from "@/lib/api/submitted-inspections"
import { getVisitById } from "@/lib/api/visits"
import { getClinicById } from "@/lib/api/clinics"

export default function PrintPreviewPage2() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const visitId = searchParams.get('visitId')

  const [isLoading, setIsLoading] = useState(true)
  const [inspectionData, setInspectionData] = useState<any>(null)

  useEffect(() => {
    async function loadData() {
      if (!visitId) {
        console.error('No visitId provided')
        setIsLoading(false)
        return
      }

      try {
        // جلب بيانات التفتيش المحفوظة
        const inspection = await getSubmittedInspectionByVisitId(visitId)
        if (!inspection) {
          console.error('Submitted inspection not found')
          setIsLoading(false)
          return
        }

        console.log('📋 Inspection data loaded:', inspection)
        console.log('📄 Files data:', {
          patientHistory: inspection.files_patient_results,
          medicalDiagnosis: inspection.files_medical_diagnosis,
          treatment: inspection.files_treatment,
          priceList: inspection.files_price_list,
          receipts: inspection.files_receipts,
          prescriptionCopies: inspection.files_prescription_copies,
          visitorsRecord: inspection.files_visitors_record,
          medicineRecord: inspection.files_medicine_record,
          safetyPrecautions: inspection.files_safety_tests,
          monthlyStatistics: inspection.files_monthly_statistics,
          evidenceGuides: inspection.files_evidence_guides,
          licenseMatching: inspection.files_license_matching,
          wasteContract: inspection.files_waste_contract
        })

        // جلب بيانات الزيارة
        const visit = await getVisitById(visitId)

        // جلب بيانات العيادة
        const clinic = visit ? await getClinicById(visit.clinic_id) : null

        // تحويل البيانات للشكل المطلوب
        const transformedData = {
          date: visit?.visit_date || "",
          clinicName: clinic?.name || "",

          // Files and Records Section
          files: {
            patientHistory: inspection?.files_patient_results || null,
            medicalDiagnosis: inspection?.files_medical_diagnosis || null,
            treatment: inspection?.files_treatment || null,
            priceList: inspection?.files_price_list || null,
            receipts: inspection?.files_receipts || null,
            prescriptionCopies: inspection?.files_prescription_copies || null,
            visitorsRecord: inspection?.files_visitors_record || null,
            medicineRecord: inspection?.files_medicine_record || null,
            safetyPrecautions: inspection?.files_safety_tests || null
          },

          // Additional Requirements
          additionalRequirements: {
            monthlyStatistics: inspection?.files_monthly_statistics || null,
            evidenceGuides: inspection?.files_evidence_guides || null,
            licenseMatching: inspection?.files_license_matching || null,
            wasteContract: inspection?.files_waste_contract || null
          },

          // X-RAY Room
          xrayRoom: {
            environmentHygiene: inspection?.xray_environment_hygiene || null,
            protectiveBarriers: inspection?.xray_protective_barriers || null,
            surfacesDisinfection: inspection?.xray_surfaces_disinfection || null,
            gloves: inspection?.xray_gloves || null,
            trashBasket: inspection?.xray_trash_basket || null,
            leadApron: inspection?.xray_lead_apron || null
          },

          // X-RAY Types
          xrayTypes: {
            pa: {
              type: inspection?.xray_pa_type || null,
              available: inspection?.xray_pa_available || null,
              number: inspection?.xray_pa_number || "0"
            },
            opg: {
              available: inspection?.xray_opg_available || null,
              number: inspection?.xray_opg_number || "0"
            },
            cephalometric: {
              available: inspection?.xray_cephalometric_available || null,
              number: inspection?.xray_cephalometric_number || "0"
            },
            cbct: {
              available: inspection?.xray_cbct_available || null,
              number: inspection?.xray_cbct_number || "0"
            },
            rpdLicense: inspection?.xray_rpd_license || null
          },

          // Dental Lab
          dentalLab: {
            environmentHygiene: inspection?.lab_environment_hygiene || null,
            surfacesDisinfection: inspection?.lab_surfaces_disinfection || null,
            types: {
              mainDentalLab: inspection?.lab_main_dental_lab === "available",
              miniDentalLab: inspection?.lab_mini_dental_lab === "available",
              contract: inspection?.lab_contract === "available",
              inOtherBranch: inspection?.lab_in_other_branch === "available"
            },
            impression: inspection?.lab_disinfection_container || null,
            appliances: inspection?.lab_appliances || null,
            disinfectionContainer: inspection?.lab_disinfection_container || null,
            disposableBags: inspection?.lab_disposable_bags || null
          }
        }

        setInspectionData(transformedData)
      } catch (error) {
        console.error('Error loading inspection data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [visitId])

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          جاري تحميل البيانات...
        </div>
      </div>
    )
  }

  if (!inspectionData) {
    return (
      <div className={styles.page}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          لم يتم العثور على بيانات التفتيش
        </div>
      </div>
    )
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
            <div className={styles.headerTextAr}>وزارة الصحة</div>
            <div className={styles.headerTextAr}>إدارة طب الأسنان</div>
            <div className={styles.headerTextAr}>دولة الكويت</div>
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
            <div className={styles.headerTextEn}>Ministry of Health</div>
            <div className={styles.headerTextEn}>Dental Administration</div>
            <div className={styles.headerTextEn}>Department Kuwait</div>
          </div>
        </div>

        {/* Title Section */}
        <div className={styles.titleSection}>
          <div className={styles.titleRow}>
            <div className={styles.dateField}>
              <span className={styles.fieldLabel}>التاريخ:</span>
              <span className={styles.fieldValue}>{inspectionData.date}</span>
            </div>
            <div className={styles.clinicNameField}>
              <span className={styles.fieldLabel}>اسم المؤسسة الصحية:</span>
              <span className={styles.fieldValue}>{inspectionData.clinicName}</span>
            </div>
          </div>

          <div className={styles.mainTitle}>
            DENTAL INSPECTION FORM - PAGE 2
          </div>
        </div>

        {/* Row 1: Files Tables Side by Side */}
        <div className={styles.bottomTablesContainer}>
          {/* Files and Original Cards Table */}
          <div className={styles.bottomTableWrapper}>
            <table className={styles.bottomTable}>
              <thead>
                <tr>
                  <th colSpan={4} className={styles.tableHeader}>الملفات والبطاقات الأصلية</th>
                </tr>
                <tr>
                  <th className={styles.subHeader}>بند</th>
                  <th className={styles.subHeader}>وافي</th>
                  <th className={styles.subHeader}>غير وافي</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.categoryCell}>التاريخ المرضي</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.patientHistory === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.patientHistory === "غير وافي" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>التشخيص المرضي</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.medicalDiagnosis === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.medicalDiagnosis === "غير وافي" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>العلاج</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.treatment === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.treatment === "غير وافي" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>قائمة الأجور</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.priceList === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.priceList === "غير وافي" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>إيصالات الأجور</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.receipts === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.receipts === "غير وافي" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>نسخ الوصفات الطبية</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.prescriptionCopies === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.prescriptionCopies === "غير وافي" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>سجل المراجعين للعيادة</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.visitorsRecord === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.visitorsRecord === "غير وافي" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>سجل الأدوية المسعفة</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.medicineRecord === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.medicineRecord === "غير وافي" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>احتياطات الأمن والسلامة</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.safetyPrecautions === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.safetyPrecautions === "غير وافي" && "✓"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Additional Requirements Table */}
          <div className={styles.bottomTableWrapper}>
            <table className={styles.bottomTable}>
              <thead>
                <tr>
                  <th colSpan={3} className={styles.tableHeader}>المتطلبات الإضافية</th>
                </tr>
                <tr>
                  <th className={styles.subHeader}>بند</th>
                  <th className={styles.subHeader}>نعم</th>
                  <th className={styles.subHeader}>لا</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.categoryCell}>إرسال الإحصائيات الشهرية</td>
                  <td className={styles.checkCell}>
                    {inspectionData.additionalRequirements.monthlyStatistics === "نعم" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.additionalRequirements.monthlyStatistics === "لا" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>اللافتات الاستدلالية</td>
                  <td className={styles.checkCell}>
                    {inspectionData.additionalRequirements.evidenceGuides === "نعم" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.additionalRequirements.evidenceGuides === "لا" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>مطابقة الترخيص</td>
                  <td className={styles.checkCell}>
                    {inspectionData.additionalRequirements.licenseMatching === "نعم" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.additionalRequirements.licenseMatching === "لا" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className={styles.sectionDivider}></td>
                </tr>
                <tr>
                  <th className={styles.categoryCell}>عقد النفايات:</th>
                  <th className={styles.subHeader}>متوفر</th>
                  <th className={styles.subHeader}>غير متوفر</th>
                </tr>
                <tr>
                  <td className={styles.itemCell}>عقد النفايات</td>
                  <td className={styles.checkCell}>
                    {inspectionData.additionalRequirements.wasteContract === "متوفر" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.additionalRequirements.wasteContract === "غير متوفر" && "✓"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 2: X-RAY Tables Side by Side */}
        <div className={styles.bottomTablesContainer}>
          {/* X-RAY Room Table */}
          <div className={styles.bottomTableWrapper}>
            <table className={styles.bottomTable}>
              <thead>
                <tr>
                  <th colSpan={3} className={styles.tableHeader}>X-RAY Room</th>
                </tr>
                <tr>
                  <th className={styles.subHeader}>Environment Hygiene Inspection</th>
                  <th className={styles.subHeader}>Good</th>
                  <th className={styles.subHeader}>Not Good</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.categoryCell}>Environment Hygiene</td>
                  <td className={styles.checkCell}>
                    {inspectionData.xrayRoom.environmentHygiene === "good" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.xrayRoom.environmentHygiene === "not-good" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className={styles.sectionDivider}></td>
                </tr>
                <tr>
                  <th className={styles.categoryCell}>Item</th>
                  <th className={styles.subHeader} colSpan={2}>Available</th>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Protective Barriers</td>
                  <td className={styles.checkCell} colSpan={2}>
                    {inspectionData.xrayRoom.protectiveBarriers === "available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Surfaces Disinfection</td>
                  <td className={styles.checkCell} colSpan={2}>
                    {inspectionData.xrayRoom.surfacesDisinfection === "available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Gloves</td>
                  <td className={styles.checkCell} colSpan={2}>
                    {inspectionData.xrayRoom.gloves === "available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Trash Basket</td>
                  <td className={styles.checkCell} colSpan={2}>
                    {inspectionData.xrayRoom.trashBasket === "available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Lead Apron</td>
                  <td className={styles.checkCell} colSpan={2}>
                    {inspectionData.xrayRoom.leadApron === "available" && "✓"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* X-RAY Types Table */}
          <div className={styles.bottomTableWrapper}>
            <table className={styles.bottomTable}>
              <thead>
                <tr>
                  <th colSpan={4} className={styles.tableHeader}>X-RAY Types</th>
                </tr>
                <tr>
                  <th className={styles.subHeader}>Type</th>
                  <th className={styles.subHeader}>Available</th>
                  <th className={styles.subHeader}>Fixed/Mobile</th>
                  <th className={styles.subHeader}>Number</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.categoryCell}>P.A</td>
                  <td className={styles.checkCell}>
                    {inspectionData.xrayTypes.pa.available === "yes" && "✓"}
                  </td>
                  <td className={styles.itemCell}>
                    {inspectionData.xrayTypes.pa.type === "fixed" ? "Fixed" : inspectionData.xrayTypes.pa.type === "mobile" ? "Mobile" : "-"}
                  </td>
                  <td className={styles.checkCell}>{inspectionData.xrayTypes.pa.number}</td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>O.P.G.</td>
                  <td className={styles.checkCell}>
                    {inspectionData.xrayTypes.opg.available === "yes" && "✓"}
                  </td>
                  <td className={styles.itemCell}>-</td>
                  <td className={styles.checkCell}>{inspectionData.xrayTypes.opg.number}</td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>Cephalometric</td>
                  <td className={styles.checkCell}>
                    {inspectionData.xrayTypes.cephalometric.available === "yes" && "✓"}
                  </td>
                  <td className={styles.itemCell}>-</td>
                  <td className={styles.checkCell}>{inspectionData.xrayTypes.cephalometric.number}</td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>CBCT</td>
                  <td className={styles.checkCell}>
                    {inspectionData.xrayTypes.cbct.available === "yes" && "✓"}
                  </td>
                  <td className={styles.itemCell}>-</td>
                  <td className={styles.checkCell}>{inspectionData.xrayTypes.cbct.number}</td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>RPD License</td>
                  <td className={styles.checkCell}>
                    {inspectionData.xrayTypes.rpdLicense === "available" && "✓"}
                  </td>
                  <td className={styles.itemCell} colSpan={2}>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 3: Dental Lab Tables Side by Side */}
        <div className={styles.bottomTablesContainer}>
          {/* Dental Lab Table */}
          <div className={styles.bottomTableWrapper}>
            <table className={styles.bottomTable}>
              <thead>
                <tr>
                  <th colSpan={3} className={styles.tableHeader}>Dental Lab</th>
                </tr>
                <tr>
                  <th className={styles.subHeader}>Topic</th>
                  <th className={styles.subHeader}>Good</th>
                  <th className={styles.subHeader}>Not Good</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.categoryCell}>Environment Hygiene</td>
                  <td className={styles.checkCell}>
                    {inspectionData.dentalLab.environmentHygiene === "good" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.dentalLab.environmentHygiene === "not-good" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className={styles.sectionDivider}></td>
                </tr>
                <tr>
                  <th className={styles.categoryCell}>Item</th>
                  <th className={styles.subHeader} colSpan={2}>Available</th>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Surfaces Disinfection</td>
                  <td className={styles.checkCell} colSpan={2}>
                    {inspectionData.dentalLab.surfacesDisinfection === "available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Impression</td>
                  <td className={styles.checkCell} colSpan={2}>
                    {inspectionData.dentalLab.impression === "available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Appliances</td>
                  <td className={styles.checkCell} colSpan={2}>
                    {inspectionData.dentalLab.appliances === "available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Disinfection Container</td>
                  <td className={styles.checkCell} colSpan={2}>
                    {inspectionData.dentalLab.disinfectionContainer === "available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Disposable Bags</td>
                  <td className={styles.checkCell} colSpan={2}>
                    {inspectionData.dentalLab.disposableBags === "available" && "✓"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Lab Types Table */}
          <div className={styles.bottomTableWrapper}>
            <table className={styles.bottomTable}>
              <thead>
                <tr>
                  <th colSpan={2} className={styles.tableHeader}>Lab Types</th>
                </tr>
                <tr>
                  <th className={styles.subHeader}>Type</th>
                  <th className={styles.subHeader}>Available</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.categoryCell}>Main Dental Lab</td>
                  <td className={styles.checkCell}>
                    {inspectionData.dentalLab.types.mainDentalLab && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>Mini Dental Lab</td>
                  <td className={styles.checkCell}>
                    {inspectionData.dentalLab.types.miniDentalLab && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>Contract</td>
                  <td className={styles.checkCell}>
                    {inspectionData.dentalLab.types.contract && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>IN Other Branch</td>
                  <td className={styles.checkCell}>
                    {inspectionData.dentalLab.types.inOtherBranch && "✓"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Page Number */}
        <div className={styles.pageNumber}>- 7 -</div>
      </div>
    </div>
  )
}
