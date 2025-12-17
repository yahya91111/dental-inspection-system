"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useParams, usePathname } from "next/navigation"
import { debounce } from "lodash"
import styles from "./styles.module.css"
import { createVisit, getDraftVisit, updateVisit, type Visit } from "@/lib/api/visits"
import { getDraftByVisitId, upsertDraft, subscribeToDraft, subscribeToBroadcastEvents, broadcastInspectionSubmitted, type InspectionDraft } from "@/lib/api/inspection-drafts"
import { archiveAndSubmitInspection } from "@/lib/api/submitted-inspections"
import { PresenceManager, type ActiveUser } from "@/lib/api/active-users"
import { ActiveUsers } from "@/components/inspection/ActiveUsers"
import { InspectionSubmittedModal } from "@/components/inspection/InspectionSubmittedModal"
import { createViolationReport, getViolationReportsByVisitId } from "@/lib/api/violation-reports"

export default function InspectionPage() {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const clinicId = params.id as string

  // Database state
  const [visit, setVisit] = useState<Visit | null>(null)
  const [inspectionDraft, setInspectionDraft] = useState<InspectionDraft | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // Get user info from localStorage
  const [userId, setUserId] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [userInfoLoaded, setUserInfoLoaded] = useState(false)

  // Real-time collaboration state
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([])
  const [showSubmittedModal, setShowSubmittedModal] = useState(false)
  const [submittedByName, setSubmittedByName] = useState('')
  const presenceManagerRef = useRef<PresenceManager | null>(null)

  useEffect(() => {
    const getUserInfo = () => {
      try {
        console.log('🔍 Loading user info from localStorage...')

        // Get user data from localStorage (set by login page)
        const userJson = localStorage.getItem('user')

        if (!userJson) {
          console.log('⚠️ No user found in localStorage - continuing as guest')
          setUserId('')
          setUserName('')
          setUserInfoLoaded(true)
          return
        }

        const user = JSON.parse(userJson)
        console.log('✅ User logged in:', user.id, user.email)
        console.log('  - userId:', user.id)
        console.log('  - userName:', user.full_name || user.email)

        setUserId(user.id)
        setUserName(user.full_name || user.email || 'مستخدم')
        setUserInfoLoaded(true)
      } catch (err) {
        console.error('❌ Exception in getUserInfo:', err)
        setUserId('')
        setUserName('')
        setUserInfoLoaded(true)
      }
    }
    getUserInfo()
  }, [])

  // Form state
  const [classification, setClassification] = useState("")
  const [licenseOwner, setLicenseOwner] = useState("")
  const [visitNumber, setVisitNumber] = useState("")
  const [day, setDay] = useState("")
  const [date, setDate] = useState("")
  const [inspector1, setInspector1] = useState("")
  const [inspector2, setInspector2] = useState("")
  const [inspector3, setInspector3] = useState("")
  const [committeeHead, setCommitteeHead] = useState("")
  const [contactPerson, setContactPerson] = useState("")

  const classifications = [
    "عيادة أسنان",
    "عيادة أسنان في مستشفى",
    "عيادة أسنان في مستوصف",
    "مركز أسنان تخصصي",
    "عيادة أسنان في مركز تخصصي",
    "عيادة أسنان متنقلة",
    "مختبر أسنان",
    "محل تركيبات"
  ]

  // Load or create inspection visit and task
  const loadOrCreateInspection = async () => {
    console.log('📋 loadOrCreateInspection called')
    console.log('  - clinicId:', clinicId)
    console.log('  - userId:', userId)
    console.log('  - userName:', userName)

    try {
      setIsLoading(true)
      console.log('  - Loading started...')

      // Check if we have unsaved data in sessionStorage first
      const savedMainData = sessionStorage.getItem('inspection_main_data')
      if (savedMainData) {
        console.log('  - Found sessionStorage data')
        try {
          const data = JSON.parse(savedMainData)
          setClassification(data.classification || "")
          setLicenseOwner(data.licenseOwner || "")
          setVisitNumber(data.visitNumber || "")
          setDay(data.day || "")
          setDate(data.date || "")
          setInspector1(data.inspector1 || "")
          setInspector2(data.inspector2 || "")
          setInspector3(data.inspector3 || "")
          setCommitteeHead(data.committeeHead || "")
          setContactPerson(data.contactPerson || "")

          // Still need to load visit and draft IDs from database
          console.log('  - Loading visit from database...')
          let currentVisit = await getDraftVisit(clinicId, 'inspection')
          let currentInspectionDraft: InspectionDraft | null = null

          if (!currentVisit) {
            console.log('  - No visit found, creating new visit...')
            currentVisit = await createVisit({
              clinic_id: clinicId,
              visit_type: 'inspection',
              status: 'draft'
            })
            console.log('  - Visit created:', currentVisit?.id)
          } else {
            console.log('  - Visit found:', currentVisit.id)
          }

          if (currentVisit) {
            console.log('  - Loading inspection draft...')
            currentInspectionDraft = await getDraftByVisitId(currentVisit.id)

            if (!currentInspectionDraft && userId && userName) {
              console.log('  - No draft found, creating new draft...')
              currentInspectionDraft = await upsertDraft({
                visit_id: currentVisit.id
              }, userId, userName)
              console.log('  - Draft created:', currentInspectionDraft?.id)
            } else if (!currentInspectionDraft) {
              console.log('  - No draft found, but user not authenticated - skipping creation')
            } else {
              console.log('  - Draft found:', currentInspectionDraft.id)
            }
          }

          setVisit(currentVisit)
          setInspectionDraft(currentInspectionDraft)

          if (currentVisit) {
            sessionStorage.setItem('current_visit_id', currentVisit.id)
          }
          if (currentInspectionDraft) {
            sessionStorage.setItem('current_inspection_draft_id', currentInspectionDraft.id)
            // For backward compatibility with sub-pages
            sessionStorage.setItem('current_inspection_task_id', currentInspectionDraft.id)
          }

          setIsLoading(false)
          setIsDataLoaded(true)
          console.log('✅ Loading completed (from sessionStorage)')
          return // Use sessionStorage data
        } catch (error) {
          console.error('❌ Error loading from sessionStorage:', error)
        }
      }

      // If no sessionStorage data, load from database
      console.log('  - No sessionStorage data, loading from database...')
      let currentVisit = await getDraftVisit(clinicId, 'inspection')
      let currentInspectionDraft: InspectionDraft | null = null

      if (!currentVisit) {
        console.log('  - No visit found, creating new visit...')
        currentVisit = await createVisit({
          clinic_id: clinicId,
          visit_type: 'inspection',
          status: 'draft'
        })
        console.log('  - Visit created:', currentVisit?.id)
      } else {
        console.log('  - Visit found:', currentVisit.id)
      }

      if (currentVisit) {
        console.log('  - Loading inspection draft...')
        currentInspectionDraft = await getDraftByVisitId(currentVisit.id)

        if (!currentInspectionDraft && userId && userName) {
          console.log('  - No draft found, creating new draft...')
          currentInspectionDraft = await upsertDraft({
            visit_id: currentVisit.id
          }, userId, userName)
          console.log('  - Draft created:', currentInspectionDraft?.id)
        } else if (!currentInspectionDraft) {
          console.log('  - No draft found, but user not authenticated - skipping creation')
        } else {
          console.log('  - Draft found:', currentInspectionDraft.id)
        }
      }

      setVisit(currentVisit)
      setInspectionDraft(currentInspectionDraft)

      if (currentVisit) {
        sessionStorage.setItem('current_visit_id', currentVisit.id)
      }
      if (currentInspectionDraft) {
        sessionStorage.setItem('current_inspection_draft_id', currentInspectionDraft.id)
        // For backward compatibility with sub-pages
        sessionStorage.setItem('current_inspection_task_id', currentInspectionDraft.id)
      }

      // Load data into form fields from database
      if (currentInspectionDraft) {
        setClassification(currentInspectionDraft.classification || "")
        setLicenseOwner(currentInspectionDraft.license_owner || "")
        setInspector1(currentInspectionDraft.inspector_1_name || "")
        setInspector2(currentInspectionDraft.inspector_2_name || "")
        setInspector3(currentInspectionDraft.inspector_3_name || "")
        setContactPerson(currentInspectionDraft.contact_person || "")
      }

      if (currentVisit) {
        setVisitNumber(currentVisit.visit_number?.toString() || "")
        setDay(currentVisit.visit_day || "")
        setDate(currentVisit.visit_date || "")
      }

      setIsDataLoaded(true)
      console.log('✅ Loading completed (from database)')
    } catch (error) {
      console.error('❌ Error loading inspection:', error)
      alert('حدث خطأ في تحميل بيانات التفتيش')
    } finally {
      setIsLoading(false)
      console.log('  - setIsLoading(false) called')
    }
  }

  // Load inspection data on mount - only once when user info is loaded
  useEffect(() => {
    console.log('🎯 useEffect triggered - userInfoLoaded:', userInfoLoaded)
    if (userInfoLoaded) {
      console.log('  - Calling loadOrCreateInspection...')
      loadOrCreateInspection()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfoLoaded])

  // Auto-save to sessionStorage whenever data changes (only after initial load)
  useEffect(() => {
    if (!isDataLoaded) return

    const data = {
      classification,
      licenseOwner,
      visitNumber,
      day,
      date,
      inspector1,
      inspector2,
      inspector3,
      committeeHead,
      contactPerson
    }
    sessionStorage.setItem('inspection_main_data', JSON.stringify(data))
  }, [
    isDataLoaded,
    classification,
    licenseOwner,
    visitNumber,
    day,
    date,
    inspector1,
    inspector2,
    inspector3,
    contactPerson
  ])

  // Debounced sync to database (every 3 seconds) for real-time collaboration
  const debouncedDatabaseSync = useRef(
    debounce(async (data: any, visitIdParam: string, userIdParam: string, userNameParam: string) => {
      if (!visitIdParam || !userIdParam || !userNameParam) return

      try {
        await upsertDraft(
          {
            visit_id: visitIdParam,
            classification: data.classification,
            license_owner: data.licenseOwner,
            inspector_1_name: data.inspector1,
            inspector_2_name: data.inspector2,
            inspector_3_name: data.inspector3,
            contact_person: data.contactPerson
          },
          userIdParam,
          userNameParam
        )
        console.log('✅ Synced main data to database')
      } catch (error) {
        console.error('❌ Error syncing to database:', error)
      }
    }, 3000)
  ).current

  // Trigger debounced sync when data changes
  useEffect(() => {
    if (!isDataLoaded || !visit || !userId || !userName) return

    const data = {
      classification,
      licenseOwner,
      inspector1,
      inspector2,
      inspector3,
      committeeHead,
      contactPerson
    }

    debouncedDatabaseSync(data, visit.id, userId, userName)
  }, [
    isDataLoaded,
    visit,
    userId,
    userName,
    classification,
    licenseOwner,
    inspector1,
    inspector2,
    inspector3,
    contactPerson,
    debouncedDatabaseSync
  ])

  // Restore scroll position when page loads or when returning from a section
  useEffect(() => {
    // Disable automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const savedScrollPosition = sessionStorage.getItem('inspectionScrollPosition')
    console.log('Saved scroll position:', savedScrollPosition)

    if (savedScrollPosition && !isLoading) {
      const scrollPos = parseInt(savedScrollPosition)
      console.log('Restoring to position:', scrollPos)

      const restoreScroll = () => {
        const container = document.querySelector(`.${styles.container}`) as HTMLElement
        if (container && container.scrollHeight > scrollPos) {
          container.scrollTop = scrollPos
          console.log('Set scroll to:', scrollPos, 'Current:', container.scrollTop, 'Height:', container.scrollHeight)
          return true
        }
        console.log('Container not ready. Height:', container?.scrollHeight)
        return false
      }

      // Try immediately
      if (restoreScroll()) {
        sessionStorage.removeItem('inspectionScrollPosition')
        return
      }

      // Multiple attempts with increasing delays to ensure scroll is restored
      let attempts = 0
      const maxAttempts = 20
      const interval = setInterval(() => {
        attempts++
        if (restoreScroll() || attempts >= maxAttempts) {
          clearInterval(interval)
          sessionStorage.removeItem('inspectionScrollPosition')
          console.log('Scroll restoration completed after', attempts, 'attempts')
        }
      }, 50)
    }

    return () => {
      // Restore default behavior on cleanup
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto'
      }
    }
  }, [pathname, isLoading])

  // Real-time Collaboration: Presence + Subscriptions + Broadcast
  useEffect(() => {
    if (!visit || !userId || !userName || isLoading) return

    // 1. Setup Presence Manager
    const presenceManager = new PresenceManager(visit.id, userId, userName)
    presenceManagerRef.current = presenceManager

    // Join as active user and start heartbeat
    presenceManager.join((users) => {
      setActiveUsers(users)
    })

    // Setup beforeunload cleanup
    presenceManager.setupBeforeUnload()

    // 2. Subscribe to draft updates (Real-time sync)
    const draftChannel = subscribeToDraft(visit.id, (payload) => {
      if (payload.type === 'UPDATE' && payload.new.last_updated_by !== userId) {
        // Another user updated the draft - update our local state
        console.log(`📥 Update from ${payload.new.last_updated_by_name}`)

        // Update form fields if changed
        if (payload.new.classification !== undefined) setClassification(payload.new.classification || '')
        if (payload.new.license_owner !== undefined) setLicenseOwner(payload.new.license_owner || '')
        if (payload.new.inspector_1_name !== undefined) setInspector1(payload.new.inspector_1_name || '')
        if (payload.new.inspector_2_name !== undefined) setInspector2(payload.new.inspector_2_name || '')
        if (payload.new.inspector_3_name !== undefined) setInspector3(payload.new.inspector_3_name || '')
        if (payload.new.contact_person !== undefined) setContactPerson(payload.new.contact_person || '')
      }
    })

    // 3. Subscribe to broadcast events (Inspection submitted)
    const broadcastChannel = subscribeToBroadcastEvents(visit.id, (event) => {
      if (event.submittedBy !== userId) {
        // Another user submitted the inspection
        console.log(`📤 Inspection submitted by ${event.submittedByName}`)
        setSubmittedByName(event.submittedByName)
        setShowSubmittedModal(true)
      }
    })

    // Cleanup on unmount
    return () => {
      presenceManager.leave()
      draftChannel.unsubscribe()
      broadcastChannel.unsubscribe()
    }
  }, [visit, userId, userName, isLoading])

  const handleSectionClick = (sectionName: string) => {
    // Save current scroll position before navigating
    const container = document.querySelector(`.${styles.container}`) as HTMLElement
    if (container) {
      const currentScroll = container.scrollTop
      console.log('Saving scroll position:', currentScroll)
      sessionStorage.setItem('inspectionScrollPosition', currentScroll.toString())
    }
    router.push(`/admin/facilities/clinics/${clinicId}/inspection/${sectionName}`)
  }

  const handleSaveAndSend = async () => {
    if (!visit) {
      alert('حدث خطأ: لا توجد بيانات للحفظ')
      return
    }

    // Check if user is authenticated
    if (!userId || !userName) {
      alert('يجب تسجيل الدخول لإرسال التفتيش')
      return
    }

    // Show confirmation dialog
    if (window.confirm("هل أنت متأكد من إرسال التفتيش؟ لن تتمكن من التعديل بعد الإرسال.")) {
      try {
        // 1. Collect all data from sessionStorage
        const mainData = JSON.parse(sessionStorage.getItem('inspection_main_data') || '{}')
        const clinicData = JSON.parse(sessionStorage.getItem('clinic_section_data') || '{}')
        const sterilizationData = JSON.parse(sessionStorage.getItem('sterilization_section_data') || '{}')
        const xrayData = JSON.parse(sessionStorage.getItem('xray_section_data') || '{}')
        const labData = JSON.parse(sessionStorage.getItem('lab_section_data') || '{}')
        const notesData = JSON.parse(sessionStorage.getItem('notes_section_data') || '{}')
        const staffData = JSON.parse(sessionStorage.getItem('staff_section_data') || '{}')
        const filesData = JSON.parse(sessionStorage.getItem('files_section_data') || '{}')
        const violationsData = JSON.parse(sessionStorage.getItem('violations_section_data') || '{}')
        const attachmentsData = JSON.parse(sessionStorage.getItem('attachments_section_data') || '{}')
        const signaturesData = JSON.parse(sessionStorage.getItem('signatures_section_data') || '{}')

        // 2. Update visit data
        const visitUpdateData: any = {}
        if (visitNumber) {
          visitUpdateData.visit_number = parseInt(visitNumber)
        }
        if (day) {
          visitUpdateData.visit_day = day
        }
        if (date) {
          visitUpdateData.visit_date = date
        }

        if (Object.keys(visitUpdateData).length > 0) {
          await updateVisit(visit.id, visitUpdateData)
        }

        // 3. Prepare complete inspection data
        const completeInspectionData = {
          // Main inspection data
          classification,
          license_owner: licenseOwner,
          inspector_1_name: inspector1,
          inspector_2_name: inspector2,
          inspector_3_name: inspector3,
          committee_head_name: committeeHead,
          contact_person: contactPerson,

          // Clinic section
          clinic_environment_hygiene: clinicData.envHygiene,
          clinic_washing_facilities: clinicData.washingFacilities,
          clinic_drying_facilities: clinicData.dryingFacilities,
          clinic_disinfectant: clinicData.disinfectant,
          clinic_sterile_gloves: clinicData.sterileGloves,
          clinic_non_sterile_gloves: clinicData.nonSterileGloves,
          clinic_masks: clinicData.masks,
          clinic_coat_gown: clinicData.coatGown,
          clinic_glasses_face_shield: clinicData.glassesFaceShield,
          clinic_hve: clinicData.hve,
          clinic_saliva_ejectors: clinicData.salivaEjectors,
          clinic_disposable_covers: clinicData.disposableCovers,
          clinic_cups: clinicData.cups,
          clinic_bib: clinicData.bib,
          clinic_disposable_mirrors: clinicData.disposableMirrors,
          clinic_disposable_trays: clinicData.disposableTrays,
          clinic_air_water_syringe: clinicData.airWaterSyringe,
          clinic_surfaces_disinfection: clinicData.surfacesDisinfection,
          clinic_impression_disinfection: clinicData.impressionDisinfection,
          clinic_disinfection_container: clinicData.disinfectionContainer,
          clinic_disposable_bags: clinicData.disposableBags,

          // Sterilization section
          sterilization_manual_wash: sterilizationData.manualWash,
          sterilization_ultrasonic_machine: sterilizationData.ultrasonicMachine,
          sterilization_washer_disinfector: sterilizationData.washerDisinfector,
          sterilization_lint_free_towels: sterilizationData.lintFreeTowels,
          sterilization_dryer: sterilizationData.dryer,
          sterilization_room_number: sterilizationData.sterilizationRoomNumber,
          sterilization_autoclaves_count: sterilizationData.numberOfAutoclaves,
          sterilization_biological_test: sterilizationData.biologicalTest,
          sterilization_bd_test: sterilizationData.bdTest,
          sterilization_leak_test: sterilizationData.leakTest,
          sterilization_periodic_report: sterilizationData.periodicReport,
          sterilization_infectious_non_sharp: sterilizationData.infectiousWasteNonSharp,
          sterilization_infectious_sharp: sterilizationData.infectiousWasteSharp,
          sterilization_non_infectious: sterilizationData.nonInfectiousWaste,

          // X-ray section
          xray_environment_hygiene: xrayData.envHygiene,
          xray_protective_barriers: xrayData.protectiveBarriers,
          xray_surfaces_disinfection: xrayData.surfacesDisinfection,
          xray_gloves: xrayData.gloves,
          xray_trash_basket: xrayData.trashBasket,
          xray_lead_apron: xrayData.leadApron,
          xray_pa_type: xrayData.paType,
          xray_pa_available: xrayData.paAvailable,
          xray_pa_number: xrayData.paNumber,
          xray_opg_available: xrayData.opgAvailable,
          xray_opg_number: xrayData.opgNumber,
          xray_cephalometric_available: xrayData.cephalometricAvailable,
          xray_cephalometric_number: xrayData.cephalometricNumber,
          xray_cbct_available: xrayData.cbctAvailable,
          xray_cbct_number: xrayData.cbctNumber,
          xray_rpd_license: xrayData.rpdLicense,

          // Lab section
          lab_environment_hygiene: labData.envHygiene,
          lab_surfaces_disinfection: labData.surfacesDisinfection,
          lab_main_dental_lab: labData.mainDentalLab,
          lab_mini_dental_lab: labData.miniDentalLab,
          lab_contract: labData.contract,
          lab_in_other_branch: labData.inOtherBranch,
          lab_appliances: labData.appliances,
          lab_disinfection_container: labData.disinfectionContainer,
          lab_disposable_bags: labData.disposableBags,

          // Notes section
          notes_clinic: notesData.clinicNotes,
          notes_sterilization: notesData.sterilizationNotes,
          notes_xray: notesData.xrayNotes,
          notes_lab: notesData.labNotes,
          notes_files: notesData.filesNotes,
          notes_staff: notesData.staffNotes,
          notes_additional: notesData.additionalNotes,

          // Staff section
          staff_doctors_count: staffData.doctorsCount,
          staff_visiting_doctors_count: staffData.visitingDoctorsCount,
          staff_nursing_staff_count: staffData.nursingStaffCount,
          staff_technicians_count: staffData.techniciansCount,
          staff_clinics_count: staffData.clinicsCount,
          staff_implant_status: staffData.implantStatus === "يقوم" ? "has-implant" : staffData.implantStatus === "لا يقوم" ? "no-implant" : staffData.implantStatus,
          staff_implant_has_washer: staffData.hasImplantWasher === "نعم" ? "yes" : staffData.hasImplantWasher === "لا" ? "no" : staffData.hasImplantWasher,
          staff_implant_doctors: staffData.implantDoctors,

          // Files section
          files_patient_results: filesData.patientResults,
          files_medical_diagnosis: filesData.medicalDiagnosis,
          files_treatment: filesData.treatment,
          files_price_list: filesData.priceList,
          files_receipts: filesData.receipts,
          files_prescription_copies: filesData.prescriptionCopies,
          files_visitors_record: filesData.visitorsRecord,
          files_medicine_record: filesData.medicineRecord,
          files_safety_tests: filesData.safetyTests,
          files_monthly_statistics: filesData.monthlyStatistics,
          files_evidence_guides: filesData.evidenceGuides,
          files_license_matching: filesData.licenseMatching,
          files_waste_contract: filesData.wasteContract,

          // Violations section
          violations_inspector1_name: violationsData.inspector1Name,
          violations_inspector2_name: violationsData.inspector2Name,
          violations_inspector3_name: violationsData.inspector3Name,
          violations_date: violationsData.inspectionDate || null,
          violations_day: violationsData.inspectionDay,
          violations_time: violationsData.inspectionTime || null,
          violations_facility_name: violationsData.facilityName,
          violations_area: violationsData.area,
          violations_block: violationsData.block,
          violations_street: violationsData.street,
          violations_plot_number: violationsData.plotNumber,
          violations_floor: violationsData.floor,
          violations_list: violationsData.violations1,
          violations_confronted_person: violationsData.confrontedPerson,
          violations_person_title: violationsData.personTitle,
          violations_statement: violationsData.statement1,
          violations_violator_signature: signaturesData.violatorSignature,

          // Attachments section
          attachments: attachmentsData.attachments,

          // Signatures section
          signature_inspector1_signature: signaturesData.inspector1Signature,
          signature_inspector1_stamp: signaturesData.inspector1Stamp,
          signature_inspector2_signature: signaturesData.inspector2Signature,
          signature_inspector2_stamp: signaturesData.inspector2Stamp,
          signature_inspector3_signature: signaturesData.inspector3Signature,
          signature_inspector3_stamp: signaturesData.inspector3Stamp,
          signature_doctor_signature: signaturesData.doctorSignature,
          signature_doctor_stamp: signaturesData.doctorStamp,
          signature_clinic_stamp: signaturesData.clinicStamp,
          signature_committee_head_signature: signaturesData.committeeHeadSignature,
          signature_committee_head_stamp: signaturesData.committeeHeadStamp,
        }

        // 4. First update the draft with all data
        await upsertDraft(
          { visit_id: visit.id, ...completeInspectionData },
          userId,
          userName
        )

        // 5. Archive and submit (moves to submitted_inspections)
        await archiveAndSubmitInspection(visit.id, userId, userName)

        // 5.5. Save all violation reports to violation_reports table
        if (violationsData) {
          console.log('💾 Saving violation reports to database...')
          console.log('💾 Violations data:', JSON.stringify(violationsData, null, 2))

          // Save all reports (first + additional)
          const reportsToSave = []

          // First report - ALWAYS save
          reportsToSave.push({
            visit_id: visit.id,
            report_number: 1,
            inspector1_name: violationsData.inspector1Name || '',
            inspector2_name: violationsData.inspector2Name || '',
            inspector3_name: violationsData.inspector3Name || '',
            inspection_date: violationsData.inspectionDate || '',
            inspection_day: violationsData.inspectionDay || '',
            inspection_time: violationsData.inspectionTime || '',
            facility_name: violationsData.facilityName || '',
            area: violationsData.area || '',
            block: violationsData.block || '',
            street: violationsData.street || '',
            plot_number: violationsData.plotNumber || '',
            floor: violationsData.floor || '',
            violations_list: violationsData.violations1 || [],
            confronted_person: violationsData.confrontedPerson || '',
            person_title: violationsData.personTitle || '',
            statement: violationsData.statement1 || '',
            violator_signature: signaturesData.violatorSignature || ''
          })

          // Additional reports - save ALL additional reports
          if (violationsData.additionalReports && Array.isArray(violationsData.additionalReports)) {
            console.log('💾 Found', violationsData.additionalReports.length, 'additional reports to save')
            violationsData.additionalReports.forEach((additionalReport: any) => {
              console.log('💾 Adding report #', additionalReport.reportNumber, 'with', additionalReport.violations?.length || 0, 'violations')
              reportsToSave.push({
                visit_id: visit.id,
                report_number: additionalReport.reportNumber,
                inspector1_name: violationsData.inspector1Name || '',
                inspector2_name: violationsData.inspector2Name || '',
                inspector3_name: violationsData.inspector3Name || '',
                inspection_date: violationsData.inspectionDate || '',
                inspection_day: violationsData.inspectionDay || '',
                inspection_time: violationsData.inspectionTime || '',
                facility_name: violationsData.facilityName || '',
                area: violationsData.area || '',
                block: violationsData.block || '',
                street: violationsData.street || '',
                plot_number: violationsData.plotNumber || '',
                floor: violationsData.floor || '',
                violations_list: additionalReport.violations || [],
                confronted_person: violationsData.confrontedPerson || '',
                person_title: violationsData.personTitle || '',
                statement: additionalReport.statement || '',
                violator_signature: signaturesData.violatorSignature || ''
              })
            })
          }

          console.log('💾 Total reports to save:', reportsToSave.length)

          // Save each report
          for (const report of reportsToSave) {
            console.log('💾 Saving violation report #', report.report_number, 'with', report.violations_list?.length || 0, 'violations')
            try {
              const result = await createViolationReport(report)
              if (result) {
                console.log('✅ Successfully saved report #', report.report_number)
              } else {
                console.error('❌ Failed to save report #', report.report_number)
              }
            } catch (err) {
              console.error('❌ Error saving report #', report.report_number, err)
            }
          }

          console.log('✅ Finished saving', reportsToSave.length, 'violation reports to database')
        }

        // 6. Broadcast to all users that inspection was submitted
        await broadcastInspectionSubmitted(visit.id, userId, userName)

        // 7. Leave presence (stop heartbeat)
        if (presenceManagerRef.current) {
          await presenceManagerRef.current.leave()
        }

        // 8. Update visit status to submitted
        await updateVisit(visit.id, {
          status: 'submitted'
        })

        // 9. Clear all sessionStorage
        sessionStorage.removeItem('inspection_main_data')
        sessionStorage.removeItem('clinic_section_data')
        sessionStorage.removeItem('sterilization_section_data')
        sessionStorage.removeItem('xray_section_data')
        sessionStorage.removeItem('lab_section_data')
        sessionStorage.removeItem('notes_section_data')
        sessionStorage.removeItem('staff_section_data')
        sessionStorage.removeItem('files_section_data')
        sessionStorage.removeItem('violations_section_data')
        sessionStorage.removeItem('attachments_section_data')
        sessionStorage.removeItem('signatures_section_data')
        sessionStorage.removeItem('current_visit_id')
        sessionStorage.removeItem('current_inspection_draft_id')
        sessionStorage.removeItem('current_inspection_task_id') // Backward compatibility
        sessionStorage.removeItem('inspectionScrollPosition')

        alert("تم إرسال التفتيش بنجاح!")
        router.replace(`/admin/facilities/clinics/${clinicId}`)
      } catch (error) {
        console.error('Error submitting inspection:', error)
        alert('حدث خطأ في إرسال التفتيش')
      }
    }
  }


  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <button className={styles.backBtn} onClick={() => router.back()}>
              &gt;
            </button>
            <h1 className={styles.pageTitle}>صفحة التفتيش</h1>
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.formCard}>
            <p>جاري تحميل بيانات التفتيش...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Real-time Collaboration Components */}
      <ActiveUsers activeUsers={activeUsers} currentUserId={userId} />
      <InspectionSubmittedModal
        isOpen={showSubmittedModal}
        submittedBy={submittedByName}
        onClose={() => setShowSubmittedModal(false)}
      />

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>صفحة التفتيش</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        {/* Inspection Form Card */}
        <div className={styles.formCard}>
          {/* Classification Select */}
          <div className={styles.formGroup}>
            <label className={styles.label}>التصنيف</label>
            <select
              className={styles.select}
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
            >
              <option value="">اختر التصنيف</option>
              {classifications.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* License Owner */}
          <div className={styles.formGroup}>
            <label className={styles.label}>صاحب ترخيص المؤسسة العلاجية</label>
            <input
              type="text"
              className={styles.input}
              value={licenseOwner}
              onChange={(e) => setLicenseOwner(e.target.value)}
              placeholder="أدخل اسم صاحب الترخيص"
            />
          </div>

          {/* Visit Number & Day - Row */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>رقم الزيارة لهذه السنة</label>
              <input
                type="text"
                className={styles.input}
                value={visitNumber}
                onChange={(e) => setVisitNumber(e.target.value)}
                placeholder="رقم الزيارة"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>اليوم</label>
              <input
                type="text"
                className={styles.input}
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="اليوم"
              />
            </div>
          </div>

          {/* Date */}
          <div className={styles.formGroup}>
            <label className={styles.label}>التاريخ</label>
            <input
              type="date"
              className={styles.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Inspection Committee Members */}
          <div className={styles.sectionTitle}>أعضاء لجنة التفتيش</div>

          <div className={styles.formGroup}>
            <label className={styles.label}>الاسم الأول</label>
            <input
              type="text"
              className={styles.input}
              value={inspector1}
              onChange={(e) => setInspector1(e.target.value)}
              placeholder="اسم العضو الأول"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>الاسم الثاني</label>
            <input
              type="text"
              className={styles.input}
              value={inspector2}
              onChange={(e) => setInspector2(e.target.value)}
              placeholder="اسم العضو الثاني"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>الاسم الثالث</label>
            <input
              type="text"
              className={styles.input}
              value={inspector3}
              onChange={(e) => setInspector3(e.target.value)}
              placeholder="اسم العضو الثالث"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>رئيس اللجنة</label>
            <input
              type="text"
              className={styles.input}
              value={committeeHead}
              onChange={(e) => setCommitteeHead(e.target.value)}
              placeholder="اسم رئيس اللجنة"
            />
          </div>

          {/* Contact Person */}
          <div className={styles.formGroup}>
            <label className={styles.label}>اسم المخاطب عند التفتيش</label>
            <input
              type="text"
              className={styles.input}
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="اسم المخاطب"
            />
          </div>
        </div>

        {/* Sections Grid */}
        <div className={styles.sectionsGrid}>
          <button
            className={styles.sectionCard}
            onClick={() => handleSectionClick("clinic")}
          >
            <h3 className={styles.sectionCardTitle}>العيادة</h3>
          </button>

          <button
            className={styles.sectionCard}
            onClick={() => handleSectionClick("sterilization")}
          >
            <h3 className={styles.sectionCardTitle}>غرفة التعقيم</h3>
          </button>

          <button
            className={styles.sectionCard}
            onClick={() => handleSectionClick("xray")}
          >
            <h3 className={styles.sectionCardTitle}>غرفة الأشعة</h3>
          </button>

          <button
            className={styles.sectionCard}
            onClick={() => handleSectionClick("lab")}
          >
            <h3 className={styles.sectionCardTitle}>المختبر</h3>
          </button>

          <button
            className={styles.sectionCard}
            onClick={() => handleSectionClick("notes")}
          >
            <h3 className={styles.sectionCardTitle}>الملاحظات</h3>
          </button>

          <button
            className={styles.sectionCard}
            onClick={() => handleSectionClick("staff")}
          >
            <h3 className={styles.sectionCardTitle}>العاملين</h3>
          </button>

          <button
            className={styles.sectionCard}
            onClick={() => handleSectionClick("files")}
          >
            <h3 className={styles.sectionCardTitle}>الملفات</h3>
          </button>

          <button
            className={styles.sectionCard}
            onClick={() => handleSectionClick("violations")}
          >
            <h3 className={styles.sectionCardTitle}>المخالفات</h3>
          </button>

          <button
            className={styles.sectionCard}
            onClick={() => handleSectionClick("attachments")}
          >
            <h3 className={styles.sectionCardTitle}>المرفقات</h3>
          </button>

          <button
            className={styles.sectionCard}
            onClick={() => handleSectionClick("signatures")}
          >
            <h3 className={styles.sectionCardTitle}>التواقيع والأختام</h3>
          </button>
        </div>

        {/* Action Button */}
        <div className={styles.actionsContainer}>
          <button className={styles.submitBtn} onClick={handleSaveAndSend}>
            حفظ وإرسال
          </button>
        </div>
      </div>
    </div>
  )
}
