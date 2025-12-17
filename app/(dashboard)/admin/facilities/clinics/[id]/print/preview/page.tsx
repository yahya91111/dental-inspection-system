"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import styles from "./styles.module.css"
import { getVisitById, type Visit } from "@/lib/api/visits"
import { getSubmittedInspectionByVisitId, type SubmittedInspection } from "@/lib/api/submitted-inspections"
import { getClinicById, type Clinic } from "@/lib/api/clinics"
import { getViolationReportsByVisitId, type ViolationReport } from "@/lib/api/violation-reports"

export default function PrintPreviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get visitId from URL params
  const visitId = searchParams.get('visitId')
  const sectionsParam = searchParams.get('sections')
  const selectedSections = sectionsParam ? sectionsParam.split(',') : null

  // State for loading data
  const [isLoading, setIsLoading] = useState(true)
  const [visit, setVisit] = useState<Visit | null>(null)
  const [inspection, setInspection] = useState<SubmittedInspection | null>(null)
  const [clinic, setClinic] = useState<Clinic | null>(null)

  // State for violations data from sessionStorage
  const [violationReports, setViolationReports] = useState<any[]>([])
  const [violatorSignature, setViolatorSignature] = useState("")

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
        console.log('📋 Loaded inspection data:', inspectionData)
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

  // Load violations data from database
  useEffect(() => {
    const loadViolations = async () => {
      if (!visitId) return

      try {
        // Load all violation reports from database
        const dbReports = await getViolationReportsByVisitId(visitId)

        if (dbReports && dbReports.length > 0) {
          console.log('📋 Loading violation reports from DATABASE:', dbReports.length, 'reports')

          // Convert database reports to display format
          const allReports = dbReports.map(dbReport => ({
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

          console.log('✅ Loaded', allReports.length, 'violation reports from database')
          setViolationReports(allReports)

          // Use violator signature from first report
          if (dbReports[0]?.violator_signature) {
            console.log('✍️ Violator signature from database: Found')
            setViolatorSignature(dbReports[0].violator_signature)
          }
        } else {
          console.log('📋 No violation reports found in database')
        }
      } catch (error) {
        console.error('Error loading violation reports from database:', error)
      }
    }

    loadViolations()
  }, [visitId])

  // Auto print when data is loaded
  useEffect(() => {
    if (!isLoading && inspection) {
      // Small delay to ensure rendering is complete
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [isLoading, inspection])

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

    // Clinic data - من قاعدة البيانات
    environment: {
      environmentHygiene: inspection?.clinic_environment_hygiene || null,
    },
    handWashing: {
      washingFacilities: inspection?.clinic_washing_facilities || null,
      dryingFacilities: inspection?.clinic_drying_facilities || null,
      disinfectant: inspection?.clinic_disinfectant || null,
    },
    protectiveBarriers: {
      sterileGloves: inspection?.clinic_sterile_gloves || null,
      nonSterileGloves: inspection?.clinic_non_sterile_gloves || null,
      masks: inspection?.clinic_masks || null,
      coatOrGown: inspection?.clinic_coat_gown || null,
      glassesOrFaceShield: inspection?.clinic_glasses_face_shield || null,
    },
    useOfDisposable: {
      hve: inspection?.clinic_hve || null,
      salivaEjectors: inspection?.clinic_saliva_ejectors || null,
      disposableCovers: inspection?.clinic_disposable_covers || null,
      cups: inspection?.clinic_cups || null,
      bib: inspection?.clinic_bib || null,
      disposableMirrors: inspection?.clinic_disposable_mirrors || null,
      disposableImpTrays: inspection?.clinic_disposable_trays || null,
      airWaterSyringeNozzles: inspection?.clinic_air_water_syringe || null,
    },

    // Sterilization Room data - من قاعدة البيانات
    sterilizationRooms: inspection?.sterilization_room_number || "",
    cleaningInstruments: {
      manualWash: inspection?.sterilization_manual_wash || null,
      ultrasonicMachine: inspection?.sterilization_ultrasonic_machine || null,
      washerDisinfector: inspection?.sterilization_washer_disinfector || null,
    },
    dryingInstruments: {
      lintFreeTowels: inspection?.sterilization_lint_free_towels || null,
      dryer: inspection?.sterilization_dryer || null,
    },
    autoclaves: {
      number: inspection?.sterilization_autoclaves_count || "0",
      biologicalTest: inspection?.sterilization_biological_test || null,
      bdTest: inspection?.sterilization_bd_test || null,
      leakTest: inspection?.sterilization_leak_test || null,
      periodicReport: inspection?.sterilization_periodic_report || null,
    },
    otherNotes: inspection?.sterilization_notes || "",

    // Disinfection data - من قاعدة البيانات
    disinfection: {
      surfacesDisinfection: inspection?.clinic_surfaces_disinfection || null,
      impressionDisinfection: inspection?.clinic_impression_disinfection || null,
      disinfectionContainer: inspection?.clinic_disinfection_container || null,
      disposableBags: inspection?.clinic_disposable_bags || null,
    },

    // Waste disposal data - من قاعدة البيانات
    wasteDisposal: {
      infectiousNonSharp: inspection?.sterilization_infectious_non_sharp || null,
      infectiousSharp: inspection?.sterilization_infectious_sharp || null,
      nonInfectiousNonHazardous: inspection?.sterilization_non_infectious || null,
    },

    // Page 2 - Files and Records Section
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
    },

    // Staff Page (Page 3)
    staff: {
      doctors: inspection?.staff_doctors_count || 0,
      visitingDoctors: inspection?.staff_visiting_doctors_count || 0,
      nursingStaff: inspection?.staff_nursing_staff_count || 0,
      technicians: inspection?.staff_technicians_count || 0
    },
    clinicsCount: inspection?.staff_clinics_count || 0,
    implant: {
      noImplant: inspection?.staff_implant_status === "no-implant",
      hasImplant: inspection?.staff_implant_status === "has-implant",
      hasWasher: inspection?.staff_implant_has_washer === "yes"
    },
    implantDoctors: inspection?.staff_implant_doctors || []
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className={styles.page}>
      {/* Print button - hidden when printing */}
      <div className={styles.noPrint}>
        <button className={styles.printBtn} onClick={handlePrint}>
          طباعة المحضر
        </button>
        <button className={styles.backBtn} onClick={() => router.back()}>
          رجوع
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
              <span className={styles.fieldLabel}>اسم المؤسسة العلاجية:</span>
              <span className={styles.fieldValue}>{inspectionData.clinicName}</span>
            </div>
          </div>
          <div className={styles.mainTitle}>INSPECTION FORM INFECTION CONTROL CHECK LIST</div>
        </div>

        {/* Main Tables Section */}
        <div className={styles.tablesContainer}>
          {/* Clinic Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th colSpan={3} className={styles.tableHeader}>Clinic</th>
                </tr>
              </thead>
              <tbody>
                {/* Environment */}
                <tr>
                  <td className={styles.categoryCell}>Environment:</td>
                  <td className={styles.checkCell}>Good</td>
                  <td className={styles.checkCell}>Not Good</td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Environment Hygiene Inspection</td>
                  <td className={styles.checkCell}>
                    {inspectionData.environment.environmentHygiene === "good" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.environment.environmentHygiene === "not-good" && "✓"}
                  </td>
                </tr>

                {/* Hand Washing */}
                <tr>
                  <td className={styles.categoryCell}>Hand Washing:</td>
                  <td className={styles.checkCell}>Available</td>
                  <td className={styles.checkCell}>Not Available</td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Washing Facilities</td>
                  <td className={styles.checkCell}>
                    {inspectionData.handWashing.washingFacilities === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.handWashing.washingFacilities === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Drying Facilities</td>
                  <td className={styles.checkCell}>
                    {inspectionData.handWashing.dryingFacilities === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.handWashing.dryingFacilities === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Disinfectant (Hand rub)</td>
                  <td className={styles.checkCell}>
                    {inspectionData.handWashing.disinfectant === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.handWashing.disinfectant === "not-available" && "✓"}
                  </td>
                </tr>

                {/* Protective Barriers */}
                <tr>
                  <td className={styles.categoryCell}>Protective Barriers</td>
                  <td className={styles.checkCell}>Available</td>
                  <td className={styles.checkCell}>Not Available</td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Sterile Gloves</td>
                  <td className={styles.checkCell}>
                    {inspectionData.protectiveBarriers.sterileGloves === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.protectiveBarriers.sterileGloves === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Non-Sterile Gloves</td>
                  <td className={styles.checkCell}>
                    {inspectionData.protectiveBarriers.nonSterileGloves === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.protectiveBarriers.nonSterileGloves === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Masks</td>
                  <td className={styles.checkCell}>
                    {inspectionData.protectiveBarriers.masks === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.protectiveBarriers.masks === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Coat or Gown</td>
                  <td className={styles.checkCell}>
                    {inspectionData.protectiveBarriers.coatOrGown === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.protectiveBarriers.coatOrGown === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Glasses or Face Shield</td>
                  <td className={styles.checkCell}>
                    {inspectionData.protectiveBarriers.glassesOrFaceShield === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.protectiveBarriers.glassesOrFaceShield === "not-available" && "✓"}
                  </td>
                </tr>

                {/* Use of Disposable */}
                <tr>
                  <td className={styles.categoryCell}>Use of Disposable</td>
                  <td className={styles.checkCell}>Available</td>
                  <td className={styles.checkCell}>Not Available</td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>H.V.E</td>
                  <td className={styles.checkCell}>
                    {inspectionData.useOfDisposable.hve === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.useOfDisposable.hve === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Saliva Ejectors</td>
                  <td className={styles.checkCell}>
                    {inspectionData.useOfDisposable.salivaEjectors === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.useOfDisposable.salivaEjectors === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Disposable Covers</td>
                  <td className={styles.checkCell}>
                    {inspectionData.useOfDisposable.disposableCovers === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.useOfDisposable.disposableCovers === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Cups</td>
                  <td className={styles.checkCell}>
                    {inspectionData.useOfDisposable.cups === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.useOfDisposable.cups === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Bib</td>
                  <td className={styles.checkCell}>
                    {inspectionData.useOfDisposable.bib === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.useOfDisposable.bib === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Disposable Mirrors</td>
                  <td className={styles.checkCell}>
                    {inspectionData.useOfDisposable.disposableMirrors === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.useOfDisposable.disposableMirrors === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Disposable Imp. Trays</td>
                  <td className={styles.checkCell}>
                    {inspectionData.useOfDisposable.disposableImpTrays === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.useOfDisposable.disposableImpTrays === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Air / Water Syringe Nozzles</td>
                  <td className={styles.checkCell}>
                    {inspectionData.useOfDisposable.airWaterSyringeNozzles === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.useOfDisposable.airWaterSyringeNozzles === "not-available" && "✓"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sterilization Room Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th colSpan={4} className={styles.tableHeader}>Sterilization Room</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={3} className={styles.categoryCell}>Sterilization Room:</td>
                  <td className={styles.checkCell}>{inspectionData.sterilizationRooms}</td>
                </tr>
                <tr>
                  <td colSpan={4} className={styles.sectionDivider}></td>
                </tr>

                {/* Cleaning of instruments */}
                <tr>
                  <td colSpan={2} className={styles.categoryCell}>cleaning of instruments</td>
                  <td className={styles.checkCell}>Available</td>
                  <td className={styles.checkCell}>Not Available</td>
                </tr>
                <tr>
                  <td colSpan={2} className={styles.itemCell}>Manual Wash</td>
                  <td className={styles.checkCell}>
                    {inspectionData.cleaningInstruments.manualWash === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.cleaningInstruments.manualWash === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className={styles.itemCell}>Ultrasonic Machine</td>
                  <td className={styles.checkCell}>
                    {inspectionData.cleaningInstruments.ultrasonicMachine === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.cleaningInstruments.ultrasonicMachine === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className={styles.itemCell}>Washer Disinfector</td>
                  <td className={styles.checkCell}>
                    {inspectionData.cleaningInstruments.washerDisinfector === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.cleaningInstruments.washerDisinfector === "not-available" && "✓"}
                  </td>
                </tr>

                {/* Drying of Instruments */}
                <tr>
                  <td colSpan={2} className={styles.categoryCell}>Drying of Instruments</td>
                  <td className={styles.checkCell}>Available</td>
                  <td className={styles.checkCell}>Not Available</td>
                </tr>
                <tr>
                  <td colSpan={2} className={styles.itemCell}>Lint Free Towels</td>
                  <td className={styles.checkCell}>
                    {inspectionData.dryingInstruments.lintFreeTowels === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.dryingInstruments.lintFreeTowels === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className={styles.itemCell}>Dryer</td>
                  <td className={styles.checkCell}>
                    {inspectionData.dryingInstruments.dryer === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.dryingInstruments.dryer === "not-available" && "✓"}
                  </td>
                </tr>

                {/* Numbers of Autoclaves */}
                <tr>
                  <td colSpan={4} className={styles.categoryCell}>Numbers of Autoclaves: {inspectionData.autoclaves.number}</td>
                </tr>

                {/* Types of Tests */}
                <tr>
                  <td colSpan={2} className={styles.categoryCell}>Types of Tests:</td>
                  <td className={styles.checkCell}>Available</td>
                  <td className={styles.checkCell}>Not Available</td>
                </tr>
                <tr>
                  <td colSpan={2} className={styles.itemCell}>Biological Test</td>
                  <td className={styles.checkCell}>
                    {inspectionData.autoclaves.biologicalTest === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.autoclaves.biologicalTest === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className={styles.itemCell}>B & D Test</td>
                  <td className={styles.checkCell}>
                    {inspectionData.autoclaves.bdTest === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.autoclaves.bdTest === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className={styles.itemCell}>Leak Test</td>
                  <td className={styles.checkCell}>
                    {inspectionData.autoclaves.leakTest === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.autoclaves.leakTest === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td colSpan={2} className={styles.itemCell}>Periodically Report maintenance of Autoclaves</td>
                  <td className={styles.checkCell}>
                    {inspectionData.autoclaves.periodicReport === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.autoclaves.periodicReport === "not-available" && "✓"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Tables Section */}
        <div className={styles.bottomTablesContainer}>
          {/* Disinfection Table */}
          <div className={styles.bottomTableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th colSpan={3} className={styles.tableHeader}>DISINFECTION</th>
                </tr>
                <tr>
                  <th colSpan={1} className={styles.subHeader}>Topic</th>
                  <th className={styles.subHeader}>Available</th>
                  <th className={styles.subHeader}>Not Available</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.itemCell}>Surfaces Disinfection</td>
                  <td className={styles.checkCell}>
                    {inspectionData.disinfection.surfacesDisinfection === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.disinfection.surfacesDisinfection === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Impression Disinfection</td>
                  <td className={styles.checkCell}>
                    {inspectionData.disinfection.impressionDisinfection === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.disinfection.impressionDisinfection === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Disinfection Container</td>
                  <td className={styles.checkCell}>
                    {inspectionData.disinfection.disinfectionContainer === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.disinfection.disinfectionContainer === "not-available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Disposable Bags</td>
                  <td className={styles.checkCell}>
                    {inspectionData.disinfection.disposableBags === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.disinfection.disposableBags === "not-available" && "✓"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Waste Disposal Table */}
          <div className={styles.bottomTableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th colSpan={2} className={styles.tableHeader}>WASTE DISPOSAL</th>
                </tr>
                <tr>
                  <th className={styles.subHeader}>Topic</th>
                  <th className={styles.subHeader}>Available</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.itemCell}>
                    <div><strong>1- Infectious waste (Non sharp)</strong></div>
                    <div className={styles.smallText}>(Yellow labeled bags)</div>
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.wasteDisposal.infectiousNonSharp === "available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>
                    <div><strong>2- Infectious waste (Sharp)</strong></div>
                    <div className={styles.smallText}>(Sharp Container)</div>
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.wasteDisposal.infectiousSharp === "available" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>
                    <div><strong>3- Non infectious and non-hazardous waste/</strong></div>
                    <div className={styles.smallText}>Color coded plastic bags</div>
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.wasteDisposal.nonInfectiousNonHazardous === "available" && "✓"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Page Number */}
        <div className={styles.pageNumber}>- 6 -</div>
      </div>

      {/* PAGE 2 - Official Document */}
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

        {/* Top Row - Main Tables Section */}
        <div className={styles.tablesContainer}>
          {/* Right Column - Files Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th colSpan={3} className={styles.tableHeader}>الملفات والبطاقات الأصلية</th>
                </tr>
                <tr>
                  <th className={styles.categoryCell}>البـــــــــــــند</th>
                  <th className={styles.subHeader}>وافي</th>
                  <th className={styles.subHeader}>غير وافي</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.itemCell}>تاريخ المرضي</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.patientHistory === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.patientHistory === "غير وافي" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>التشخيص المرضي</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.medicalDiagnosis === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.medicalDiagnosis === "غير وافي" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>العلاج</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.treatment === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.treatment === "غير وافي" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>قائمة الأجور</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.priceList === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.priceList === "غير وافي" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>إيصالات الأجور</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.receipts === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.receipts === "غير وافي" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>نسخ الوصفات الطبية</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.prescriptionCopies === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.prescriptionCopies === "غير وافي" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>سجل المراجعين للعيادة</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.visitorsRecord === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.visitorsRecord === "غير وافي" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>سجل الأدوية المسعفة</td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.medicineRecord === "وافي" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.files.medicineRecord === "غير وافي" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>احتياطات الأمن والسلامة</td>
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

          {/* Left Column - Checklist Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.categoryCell}>البــــــــــــــــــند</th>
                  <th className={styles.subHeader}>نعم</th>
                  <th className={styles.subHeader}>لا</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.itemCell}>إرسال الإحصائيات الشهرية</td>
                  <td className={styles.checkCell}>
                    {inspectionData.additionalRequirements.monthlyStatistics === "نعم" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.additionalRequirements.monthlyStatistics === "لا" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>اللافتات الاستدلالية</td>
                  <td className={styles.checkCell}>
                    {inspectionData.additionalRequirements.evidenceGuides === "نعم" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.additionalRequirements.evidenceGuides === "لا" && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>مطابقة الترخيص</td>
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

        {/* Middle Row - X-RAY Room and X-RAY Types */}
        <div className={styles.tablesContainer}>
          {/* X-RAY Room Table */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th colSpan={3} className={styles.tableHeader}>X-RAY Room</th>
                </tr>
                <tr>
                  <th className={styles.categoryCell}>Environment Hygiene Inspection</th>
                  <th className={styles.subHeader}>Good</th>
                  <th className={styles.subHeader}>Not Good</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.itemCell}></td>
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
                  <th className={styles.categoryCell}></th>
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
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th colSpan={5} className={styles.tableHeader}>X-RAY Types</th>
                </tr>
                <tr>
                  <th className={styles.subHeader}>Type</th>
                  <th className={styles.subHeader}>Available</th>
                  <th className={styles.subHeader}>Fixed</th>
                  <th className={styles.subHeader}>Mobile</th>
                  <th className={styles.subHeader}>Number</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.categoryCell}>P.A</td>
                  <td className={styles.checkCell}>
                    {inspectionData.xrayTypes.pa.available === "yes" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.xrayTypes.pa.type === "fixed" && "✓"}
                  </td>
                  <td className={styles.checkCell}>
                    {inspectionData.xrayTypes.pa.type === "mobile" && "✓"}
                  </td>
                  <td className={styles.checkCell}>{inspectionData.xrayTypes.pa.number}</td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>O.P.G.</td>
                  <td className={styles.checkCell}>
                    {inspectionData.xrayTypes.opg.available === "yes" && "✓"}
                  </td>
                  <td className={styles.checkCell}></td>
                  <td className={styles.checkCell}></td>
                  <td className={styles.checkCell}>{inspectionData.xrayTypes.opg.number}</td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>Cephalometric</td>
                  <td className={styles.checkCell}>
                    {inspectionData.xrayTypes.cephalometric.available === "yes" && "✓"}
                  </td>
                  <td className={styles.checkCell}></td>
                  <td className={styles.checkCell}></td>
                  <td className={styles.checkCell}>{inspectionData.xrayTypes.cephalometric.number}</td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>CBCT</td>
                  <td className={styles.checkCell}>
                    {inspectionData.xrayTypes.cbct.available === "yes" && "✓"}
                  </td>
                  <td className={styles.checkCell}></td>
                  <td className={styles.checkCell}></td>
                  <td className={styles.checkCell}>{inspectionData.xrayTypes.cbct.number}</td>
                </tr>
                <tr>
                  <td className={styles.categoryCell}>RPD License</td>
                  <td className={styles.checkCell}>
                    {inspectionData.xrayTypes.rpdLicense === "available" && "✓"}
                  </td>
                  <td className={styles.checkCell} colSpan={3}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Row - Dental Lab and Disinfection */}
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
                  <td className={styles.categoryCell}>Environment Hygiene Inspection</td>
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
                  <th className={styles.categoryCell}>Types</th>
                  <th className={styles.subHeader} colSpan={2}>Available</th>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Main Dental Lab</td>
                  <td className={styles.checkCell} colSpan={2}>
                    {inspectionData.dentalLab.types.mainDentalLab && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Mini Dental Lab</td>
                  <td className={styles.checkCell} colSpan={2}>
                    {inspectionData.dentalLab.types.miniDentalLab && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>Contract</td>
                  <td className={styles.checkCell} colSpan={2}>
                    {inspectionData.dentalLab.types.contract && "✓"}
                  </td>
                </tr>
                <tr>
                  <td className={styles.itemCell}>IN Other Branch</td>
                  <td className={styles.checkCell} colSpan={2}>
                    {inspectionData.dentalLab.types.inOtherBranch && "✓"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Disinfection Table */}
          <div className={styles.bottomTableWrapper}>
            <table className={styles.bottomTable}>
              <thead>
                <tr>
                  <th colSpan={3} className={styles.tableHeader}>Disinfection</th>
                </tr>
                <tr>
                  <th className={styles.categoryCell}>Topic</th>
                  <th className={styles.subHeader} colSpan={2}>Available</th>
                </tr>
              </thead>
              <tbody>
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
        </div>

        {/* Page Number */}
        <div className={styles.pageNumber}>- 7 -</div>
      </div>

      {/* Page 3 - Staff Information */}
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
                <td className={styles.staffItemCell}>الأطباء</td>
                <td className={styles.checkCell}>{inspectionData.staff.doctors}</td>
              </tr>
              <tr>
                <td className={styles.checkCell}>.2</td>
                <td className={styles.staffItemCell}>الأطباء الزائرين</td>
                <td className={styles.checkCell}>{inspectionData.staff.visitingDoctors}</td>
              </tr>
              <tr>
                <td className={styles.checkCell}>.3</td>
                <td className={styles.staffItemCell}>الهيئة التمريضية</td>
                <td className={styles.checkCell}>{inspectionData.staff.nursingStaff}</td>
              </tr>
              <tr>
                <td className={styles.checkCell}>.4</td>
                <td className={styles.staffItemCell}>التشيين</td>
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
              {inspectionData.implantDoctors.map((doctor: any, index: number) => (
                <tr key={index}>
                  <td className={styles.checkCell}>.{index + 1}</td>
                  <td className={styles.itemCell}>{doctor.name}</td>
                  <td className={styles.itemCell}>{doctor.specialty}</td>
                  <td className={styles.itemCell}>{doctor.implantType}</td>
                  <td className={styles.checkCell}>{doctor.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Page Number */}
        <div className={styles.pageNumber}>- 8 -</div>
      </div>

      {/* Page 4 - General Comments/Notes */}
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

        {/* General Comments Section */}
        <div className={styles.notesSection}>
          <h3 className={styles.sectionTitle}>الملاحظات المجمعة</h3>

          {/* Clinic Notes */}
          {inspection?.notes_clinic && (
            <div className={styles.noteBlock}>
              <div className={styles.noteTitle}>ملاحظات العيادة:</div>
              <div className={styles.noteContent}>{inspection.notes_clinic}</div>
            </div>
          )}

          {/* Sterilization Notes */}
          {inspection?.notes_sterilization && (
            <div className={styles.noteBlock}>
              <div className={styles.noteTitle}>ملاحظات غرفة التعقيم:</div>
              <div className={styles.noteContent}>{inspection.notes_sterilization}</div>
            </div>
          )}

          {/* X-Ray Notes */}
          {inspection?.notes_xray && (
            <div className={styles.noteBlock}>
              <div className={styles.noteTitle}>ملاحظات غرفة الأشعة:</div>
              <div className={styles.noteContent}>{inspection.notes_xray}</div>
            </div>
          )}

          {/* Lab Notes */}
          {inspection?.notes_lab && (
            <div className={styles.noteBlock}>
              <div className={styles.noteTitle}>ملاحظات المختبر:</div>
              <div className={styles.noteContent}>{inspection.notes_lab}</div>
            </div>
          )}

          {/* Files Notes */}
          {inspection?.notes_files && (
            <div className={styles.noteBlock}>
              <div className={styles.noteTitle}>ملاحظات الملفات:</div>
              <div className={styles.noteContent}>{inspection.notes_files}</div>
            </div>
          )}

          {/* Staff Notes */}
          {inspection?.notes_staff && (
            <div className={styles.noteBlock}>
              <div className={styles.noteTitle}>ملاحظات العاملين:</div>
              <div className={styles.noteContent}>{inspection.notes_staff}</div>
            </div>
          )}

          {/* Additional Notes */}
          {Array.isArray(inspection?.notes_additional) && inspection.notes_additional.length > 0 && (
            <div className={styles.additionalNotesSection}>
              <div className={styles.noteTitle}>ملاحظات إضافية:</div>
              {inspection.notes_additional.map((note: any, index: number) => (
                <div key={index} className={styles.additionalNoteItem}>
                  {note.title && (
                    <div className={styles.additionalNoteTitle}>{note.title}</div>
                  )}
                  {note.content && (
                    <div className={styles.additionalNoteContent}>{note.content}</div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!inspection?.notes_clinic &&
           !inspection?.notes_sterilization &&
           !inspection?.notes_xray &&
           !inspection?.notes_lab &&
           !inspection?.notes_files &&
           !inspection?.notes_staff &&
           (!Array.isArray(inspection?.notes_additional) || inspection.notes_additional.length === 0) && (
            <div className={styles.emptyState}>
              <p>لا توجد ملاحظات مسجلة</p>
            </div>
          )}
        </div>

        {/* Page Number */}
        <div className={styles.pageNumber}>- 9 -</div>
      </div>

      {/* Page 5 - Official Letter */}
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

        {/* Letter Content */}
        <div className={styles.page5Content}>
          {/* Recipient */}
          <div className={styles.page5Recipient}>
            <span>السيد / مدير إدارة التراخيص الصحية</span>
            <span className={styles.page5Respected}>المحترم</span>
          </div>

          {/* Greeting */}
          <div className={styles.page5Greeting}>
            تحية طيبة وبعد ،،،،
          </div>

          {/* Body */}
          <div className={styles.page5Body}>
            <p className={styles.page5Text}>
              مرفق طيه تقرير أطباء لجنة تفتيش الأسنان في القطاع الأهلي على /
            </p>
            <div className={styles.page5FacilityLine}>{clinic?.name || ''}</div>
          </div>

          {/* Request */}
          <div className={styles.page5Request}>
            <p className={styles.page5RequestText}>يرجى بعد الاطلاع اتخاذ اللازم</p>
            <p className={styles.page5ClosingText}>وتفضلوا بقبول وافر التحية</p>
          </div>

          {/* Facility Info Section */}
          <div className={styles.page5FacilityInfo}>
            <div className={styles.page5InfoRow}>
              <span className={styles.page5InfoLabel}>اسم المؤسسة العلاجية:</span>
              <div className={styles.page5InfoLine}>{clinic?.name || ''}</div>
            </div>
            <div className={styles.page5InfoRow}>
              <span className={styles.page5InfoLabel}>العنوان:</span>
              <div className={styles.page5InfoLine}>{clinic?.address || ''}</div>
            </div>
            <div className={styles.page5InfoRowDouble}>
              <div className={styles.page5InfoRowHalf}>
                <span className={styles.page5InfoLabel}>التليفون:</span>
                <div className={styles.page5InfoLine}>{clinic?.phone || ''}</div>
              </div>
              <div className={styles.page5InfoRowHalf}>
                <span className={styles.page5InfoLabel}>التاريخ:</span>
                <div className={styles.page5InfoLine}>{visit?.visit_date || ''}</div>
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div className={styles.page5Details}>
            <div className={styles.page5InfoRow}>
              <span className={styles.page5InfoLabel}>التصنيف:</span>
              <div className={styles.page5InfoLine}>{inspection?.classification || ''}</div>
            </div>
            <div className={styles.page5InfoRow}>
              <span className={styles.page5InfoLabel}>صاحب الترخيص المؤسسة العلاجية:</span>
              <div className={styles.page5InfoLine}>{inspection?.license_owner || ''}</div>
            </div>
            <div className={styles.page5VisitInfo}>
              <div className={styles.page5VisitField}>
                <span className={styles.page5VisitLabel}>رقم الزيارة لهذه السنة:</span>
                <div className={styles.page5VisitBox}>{visit?.visit_number || ''}</div>
              </div>
              <div className={styles.page5VisitField}>
                <span className={styles.page5VisitLabel}>اليوم:</span>
                <div className={styles.page5VisitBox}>{visit?.visit_day || ''}</div>
              </div>
              <div className={styles.page5VisitField}>
                <span className={styles.page5VisitLabel}>التاريخ:</span>
                <div className={styles.page5VisitBox}>{visit?.visit_date || ''}</div>
              </div>
            </div>
          </div>

          {/* Inspection Committee Members */}
          <div className={styles.page5CommitteeSection}>
            <h3 className={styles.page5SectionTitle}>أعضاء لجنة التفتيش</h3>

            {/* 3 Committee Members */}
            <div className={styles.page5MembersGrid}>
              {/* Member 1 */}
              <div className={styles.page5MemberCard}>
                <div className={styles.page5MemberField}>
                  <span className={styles.page5FieldLabel}>الاسم:</span>
                  <div className={styles.page5FieldLine}>{inspection?.inspector_1_name || ''}</div>
                </div>
                <div className={styles.page5SignatureRow}>
                  <div className={styles.page5SignatureBox}>
                    <span className={styles.page5BoxLabel}>الختم</span>
                    {inspection?.signature_inspector1_stamp && (
                      <img src={inspection.signature_inspector1_stamp} alt="ختم المفتش 1" style={{maxWidth: '70px', maxHeight: '40px', objectFit: 'contain', display: 'block', margin: '2px auto 0'}} />
                    )}
                  </div>
                  <div className={styles.page5SignatureBox}>
                    <span className={styles.page5BoxLabel}>التوقيع</span>
                    {inspection?.signature_inspector1_signature && (
                      <img src={inspection.signature_inspector1_signature} alt="توقيع المفتش 1" style={{maxWidth: '70px', maxHeight: '40px', objectFit: 'contain', display: 'block', margin: '2px auto 0'}} />
                    )}
                  </div>
                </div>
              </div>

              {/* Member 2 */}
              <div className={styles.page5MemberCard}>
                <div className={styles.page5MemberField}>
                  <span className={styles.page5FieldLabel}>الاسم:</span>
                  <div className={styles.page5FieldLine}>{inspection?.inspector_2_name || ''}</div>
                </div>
                <div className={styles.page5SignatureRow}>
                  <div className={styles.page5SignatureBox}>
                    <span className={styles.page5BoxLabel}>الختم</span>
                    {inspection?.signature_inspector2_stamp && (
                      <img src={inspection.signature_inspector2_stamp} alt="ختم المفتش 2" style={{maxWidth: '70px', maxHeight: '40px', objectFit: 'contain', display: 'block', margin: '2px auto 0'}} />
                    )}
                  </div>
                  <div className={styles.page5SignatureBox}>
                    <span className={styles.page5BoxLabel}>التوقيع</span>
                    {inspection?.signature_inspector2_signature && (
                      <img src={inspection.signature_inspector2_signature} alt="توقيع المفتش 2" style={{maxWidth: '70px', maxHeight: '40px', objectFit: 'contain', display: 'block', margin: '2px auto 0'}} />
                    )}
                  </div>
                </div>
              </div>

              {/* Member 3 */}
              <div className={styles.page5MemberCard}>
                <div className={styles.page5MemberField}>
                  <span className={styles.page5FieldLabel}>الاسم:</span>
                  <div className={styles.page5FieldLine}>{inspection?.inspector_3_name || ''}</div>
                </div>
                <div className={styles.page5SignatureRow}>
                  <div className={styles.page5SignatureBox}>
                    <span className={styles.page5BoxLabel}>الختم</span>
                    {inspection?.signature_inspector3_stamp && (
                      <img src={inspection.signature_inspector3_stamp} alt="ختم المفتش 3" style={{maxWidth: '70px', maxHeight: '40px', objectFit: 'contain', display: 'block', margin: '2px auto 0'}} />
                    )}
                  </div>
                  <div className={styles.page5SignatureBox}>
                    <span className={styles.page5BoxLabel}>التوقيع</span>
                    {inspection?.signature_inspector3_signature && (
                      <img src={inspection.signature_inspector3_signature} alt="توقيع المفتش 3" style={{maxWidth: '70px', maxHeight: '40px', objectFit: 'contain', display: 'block', margin: '2px auto 0'}} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Committee Head */}
          <div className={styles.page5HeadSection}>
            <h3 className={styles.page5SectionTitle}>رئيس لجنة التفتيش</h3>
            <div className={styles.page5HeadCard}>
              <div className={styles.page5SignatureRow}>
                <div className={styles.page5SignatureBox}>
                  <span className={styles.page5BoxLabel}>الختم</span>
                  {inspection?.signature_committee_head_stamp && (
                    <img src={inspection.signature_committee_head_stamp} alt="ختم رئيس اللجنة" style={{maxWidth: '70px', maxHeight: '40px', objectFit: 'contain', display: 'block', margin: '2px auto 0'}} />
                  )}
                </div>
                <div className={styles.page5SignatureBox}>
                  <span className={styles.page5BoxLabel}>التوقيع</span>
                  {inspection?.signature_committee_head_signature && (
                    <img src={inspection.signature_committee_head_signature} alt="توقيع رئيس اللجنة" style={{maxWidth: '70px', maxHeight: '40px', objectFit: 'contain', display: 'block', margin: '2px auto 0'}} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div className={styles.page5ContactSection}>
            <h3 className={styles.page5SectionTitle}>المخاطب عند التفتيش</h3>
            <div className={styles.page5ContactCard}>
              <div className={styles.page5MemberField}>
                <span className={styles.page5FieldLabel}>الاسم:</span>
                <div className={styles.page5FieldLine}>{inspection?.contact_person || ''}</div>
              </div>
              <div className={styles.page5SignatureRow}>
                <div className={styles.page5SignatureBox}>
                  <span className={styles.page5BoxLabel}>التوقيع</span>
                  {inspection?.signature_doctor_signature && (
                    <img src={inspection.signature_doctor_signature} alt="توقيع المخاطب" style={{maxWidth: '70px', maxHeight: '40px', objectFit: 'contain', display: 'block', margin: '2px auto 0'}} />
                  )}
                </div>
                <div className={styles.page5SignatureBox}>
                  <span className={styles.page5BoxLabel}>الختم</span>
                  {inspection?.signature_doctor_stamp && (
                    <img src={inspection.signature_doctor_stamp} alt="ختم المخاطب" style={{maxWidth: '70px', maxHeight: '40px', objectFit: 'contain', display: 'block', margin: '2px auto 0'}} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Facility Stamp */}
          <div className={styles.page5StampSection}>
            <h3 className={styles.page5SectionTitle}>ختم المؤسسة العلاجية</h3>
            <div className={styles.page5StampBox}>
              {inspection?.signature_clinic_stamp && (
                <img src={inspection.signature_clinic_stamp} alt="ختم المؤسسة العلاجية" style={{maxWidth: '150px', maxHeight: '75px', objectFit: 'contain', display: 'block', margin: '2px auto 0'}} />
              )}
            </div>
          </div>
        </div>

        {/* Page Number */}
        <div className={styles.pageNumber}>- 5 -</div>
      </div>

      {/* Page 6 - Violation Reports (محاضر إثبات المخالفات) */}
      {violationReports.map((report, index) => (
        <div key={report.reportNumber} className={styles.document} style={{ pageBreakAfter: index < violationReports.length - 1 ? 'always' : 'auto' }}>
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

          {/* Content */}
          <div className={styles.content}>
            {/* Title */}
            <div className={styles.title}>محضر إثبات مخالفة</div>

            {/* Legal Reference */}
            <div className={styles.legalReference}>
              <p>إشارة إلى قانون رقم (70) لسنة 2020 في شأن مزاولة مهنة طب الأسنان وطب الأسنان التكميلي والمهن المعاونة لهما</p>
            </div>

            {/* Legal Text */}
            <div className={styles.legalText}>
              <p>
                إنه في يوم <span className={styles.inputLine}>{report.inspectionDay}</span> الموافق{' '}
                <span className={styles.inputLine}>{report.inspectionDate}</span> وإستناداً على القرار الإداري رقم (70) لسنة 2020 بشأن مزاولة مهنة الطب والمهن المساعدة لها وحقوق المرضى والمنشآت الصحية، والمكلفين بالقرار من العاملين في وزارة الصحة بمندب بالتفتيش على المؤسسات العلاجية وفقاً لأحكام القوانين المشار إليها أعلاه.. قمنا نحن المفتشين:
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
                    <tr key={idx}>
                      <td className={styles.tableCell}>
                        {inspector.name}
                      </td>
                      <td className={styles.tableCell}>
                        {inspector.stamp && (
                          <img
                            src={inspector.stamp}
                            alt={`ختم المفتش ${idx + 1}`}
                            style={{maxWidth: '150px', maxHeight: '60px', objectFit: 'contain', display: 'block', margin: '0 auto'}}
                          />
                        )}
                      </td>
                      <td className={styles.tableCell}>
                        {inspector.signature && (
                          <img
                            src={inspector.signature}
                            alt={`توقيع المفتش ${idx + 1}`}
                            style={{maxWidth: '150px', maxHeight: '60px', objectFit: 'contain', display: 'block', margin: '0 auto'}}
                          />
                        )}
                      </td>
                    </tr>
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
                <div className={styles.detailLine}>{report.facilityName || clinic?.name || ''}</div>
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
          <div className={styles.pageNumber}>محضر مخالفة</div>
        </div>
      ))}
    </div>
  )
}
