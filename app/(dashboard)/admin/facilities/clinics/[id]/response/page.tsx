"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { debounce } from "lodash"
import styles from "./styles.module.css"
import { getVisitsByClinicId, createVisit, getDraftVisit, updateVisit, type Visit } from "@/lib/api/visits"
import { getDraftByVisitId, upsertDraft, type ResponseDraft } from "@/lib/api/response-drafts"
import { archiveAndSubmitResponse } from "@/lib/api/submitted-responses"
import { getSubmittedInspectionByVisitId, type SubmittedInspection } from "@/lib/api/submitted-inspections"

export default function ResponsePage() {
  const router = useRouter()
  const params = useParams()
  const clinicId = params.id as string

  // Database state
  const [visit, setVisit] = useState<Visit | null>(null)
  const [responseDraft, setResponseDraft] = useState<ResponseDraft | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // Get user info from localStorage
  const [userId, setUserId] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [userInfoLoaded, setUserInfoLoaded] = useState(false)

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cropCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [currentSignatureField, setCurrentSignatureField] = useState<string>("")

  // Image cropping states
  const [showCropModal, setShowCropModal] = useState(false)
  const [currentStampField, setCurrentStampField] = useState<string>("")
  const [tempImageUrl, setTempImageUrl] = useState<string>("")
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeCorner, setResizeCorner] = useState<string>("")
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [initialCropArea, setInitialCropArea] = useState({ x: 0, y: 0, width: 200, height: 200 })

  // Refs for stamp file inputs
  const stampInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inspections, setInspections] = useState<Visit[]>([])
  const [selectedInspection, setSelectedInspection] = useState<Visit | null>(null)
  const [inspectionObservations, setInspectionObservations] = useState<string>("")

  // Form state
  const [responseDate, setResponseDate] = useState("")
  const [responseDay, setResponseDay] = useState("")
  const [observationsStatus, setObservationsStatus] = useState<'resolved' | 'not_resolved'>('resolved')
  const [unresolvedObservations, setUnresolvedObservations] = useState("")

  // Inspectors state
  const [inspector1Name, setInspector1Name] = useState("")
  const [inspector1Signature, setInspector1Signature] = useState("")
  const [inspector1Stamp, setInspector1Stamp] = useState("")

  const [inspector2Name, setInspector2Name] = useState("")
  const [inspector2Signature, setInspector2Signature] = useState("")
  const [inspector2Stamp, setInspector2Stamp] = useState("")

  const [inspector3Name, setInspector3Name] = useState("")
  const [inspector3Signature, setInspector3Signature] = useState("")
  const [inspector3Stamp, setInspector3Stamp] = useState("")

  // Committee head state
  const [committeeHeadName, setCommitteeHeadName] = useState("")
  const [committeeHeadSignature, setCommitteeHeadSignature] = useState("")
  const [committeeHeadStamp, setCommitteeHeadStamp] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load user info from localStorage
  useEffect(() => {
    const getUserInfo = () => {
      try {
        console.log('🔍 Loading user info from localStorage...')

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

  // Load or create response draft
  const loadOrCreateResponse = async () => {
    console.log('📋 loadOrCreateResponse called')
    console.log('  - clinicId:', clinicId)
    console.log('  - userId:', userId)
    console.log('  - userName:', userName)

    try {
      setIsLoading(true)
      console.log('  - Loading started...')

      // Check if we have unsaved data in sessionStorage first
      const savedData = sessionStorage.getItem(`response_form_data_${clinicId}`)
      if (savedData) {
        console.log('  - Found sessionStorage data')
        try {
          const data = JSON.parse(savedData)

          // Load all form data
          if (data.responseDate) setResponseDate(data.responseDate)
          if (data.responseDay) setResponseDay(data.responseDay)
          if (data.observationsStatus) setObservationsStatus(data.observationsStatus)
          if (data.unresolvedObservations) setUnresolvedObservations(data.unresolvedObservations)
          if (data.inspector1Name) setInspector1Name(data.inspector1Name)
          if (data.inspector1Signature) setInspector1Signature(data.inspector1Signature)
          if (data.inspector1Stamp) setInspector1Stamp(data.inspector1Stamp)
          if (data.inspector2Name) setInspector2Name(data.inspector2Name)
          if (data.inspector2Signature) setInspector2Signature(data.inspector2Signature)
          if (data.inspector2Stamp) setInspector2Stamp(data.inspector2Stamp)
          if (data.inspector3Name) setInspector3Name(data.inspector3Name)
          if (data.inspector3Signature) setInspector3Signature(data.inspector3Signature)
          if (data.inspector3Stamp) setInspector3Stamp(data.inspector3Stamp)
          if (data.committeeHeadName) setCommitteeHeadName(data.committeeHeadName)
          if (data.committeeHeadSignature) setCommitteeHeadSignature(data.committeeHeadSignature)
          if (data.committeeHeadStamp) setCommitteeHeadStamp(data.committeeHeadStamp)
          if (data.selectedInspection) setSelectedInspection(data.selectedInspection)

          // Still need to load visit and draft IDs from database
          console.log('  - Loading visit from database...')
          let currentVisit = await getDraftVisit(clinicId, 'response')
          let currentResponseDraft: ResponseDraft | null = null

          if (!currentVisit) {
            console.log('  - No visit found, creating new visit...')
            currentVisit = await createVisit({
              clinic_id: clinicId,
              visit_type: 'response',
              status: 'draft'
            })
            console.log('  - Visit created:', currentVisit?.id)
          } else {
            console.log('  - Visit found:', currentVisit.id)
          }

          if (currentVisit) {
            console.log('  - Loading response draft...')
            currentResponseDraft = await getDraftByVisitId(currentVisit.id)

            if (!currentResponseDraft && userId && userName) {
              console.log('  - No draft found, creating new draft...')
              currentResponseDraft = await upsertDraft({
                visit_id: currentVisit.id
              }, userId, userName)
              console.log('  - Draft created:', currentResponseDraft?.id)
            } else if (!currentResponseDraft) {
              console.log('  - No draft found, but user not authenticated - skipping creation')
            } else {
              console.log('  - Draft found:', currentResponseDraft.id)
            }
          }

          setVisit(currentVisit)
          setResponseDraft(currentResponseDraft)

          if (currentVisit) {
            sessionStorage.setItem(`current_visit_id_${clinicId}`, currentVisit.id)
          }
          if (currentResponseDraft) {
            sessionStorage.setItem(`current_response_draft_id_${clinicId}`, currentResponseDraft.id)
          }

          setIsLoading(false)
          setIsDataLoaded(true)
          console.log('✅ Loading completed (from sessionStorage)')
          return
        } catch (error) {
          console.error('❌ Error loading from sessionStorage:', error)
        }
      }

      // If no sessionStorage data, load from database
      console.log('  - No sessionStorage data, loading from database...')
      let currentVisit = await getDraftVisit(clinicId, 'response')
      let currentResponseDraft: ResponseDraft | null = null

      if (!currentVisit) {
        console.log('  - No visit found, creating new visit...')
        currentVisit = await createVisit({
          clinic_id: clinicId,
          visit_type: 'response',
          status: 'draft'
        })
        console.log('  - Visit created:', currentVisit?.id)
      } else {
        console.log('  - Visit found:', currentVisit.id)
      }

      if (currentVisit) {
        console.log('  - Loading response draft...')
        currentResponseDraft = await getDraftByVisitId(currentVisit.id)

        if (!currentResponseDraft && userId && userName) {
          console.log('  - No draft found, creating new draft...')
          currentResponseDraft = await upsertDraft({
            visit_id: currentVisit.id
          }, userId, userName)
          console.log('  - Draft created:', currentResponseDraft?.id)
        } else if (!currentResponseDraft) {
          console.log('  - No draft found, but user not authenticated - skipping creation')
        } else {
          console.log('  - Draft found:', currentResponseDraft.id)
        }
      }

      setVisit(currentVisit)
      setResponseDraft(currentResponseDraft)

      if (currentVisit) {
        sessionStorage.setItem(`current_visit_id_${clinicId}`, currentVisit.id)
      }
      if (currentResponseDraft) {
        sessionStorage.setItem(`current_response_draft_id_${clinicId}`, currentResponseDraft.id)
      }

      // Load data into form fields from database
      if (currentResponseDraft) {
        setResponseDate(currentResponseDraft.response_date || "")
        setResponseDay(currentResponseDraft.response_day || "")
        setObservationsStatus(currentResponseDraft.observations_status || 'resolved')
        setUnresolvedObservations(currentResponseDraft.unresolved_observations || "")
        setInspector1Name(currentResponseDraft.inspector1_name || "")
        setInspector1Signature(currentResponseDraft.inspector1_signature || "")
        setInspector1Stamp(currentResponseDraft.inspector1_stamp || "")
        setInspector2Name(currentResponseDraft.inspector2_name || "")
        setInspector2Signature(currentResponseDraft.inspector2_signature || "")
        setInspector2Stamp(currentResponseDraft.inspector2_stamp || "")
        setInspector3Name(currentResponseDraft.inspector3_name || "")
        setInspector3Signature(currentResponseDraft.inspector3_signature || "")
        setInspector3Stamp(currentResponseDraft.inspector3_stamp || "")
        setCommitteeHeadName(currentResponseDraft.committee_head_name || "")
        setCommitteeHeadSignature(currentResponseDraft.committee_head_signature || "")
        setCommitteeHeadStamp(currentResponseDraft.committee_head_stamp || "")

        // Load selected inspection if available
        if (currentResponseDraft.original_inspection_visit_id) {
          try {
            const allVisits = await getVisitsByClinicId(clinicId)
            const originalInspection = allVisits.find(v => v.id === currentResponseDraft.original_inspection_visit_id)
            if (originalInspection) {
              setSelectedInspection(originalInspection)
            }
          } catch (error) {
            console.error('Error loading original inspection:', error)
          }
        }
      }

      setIsLoading(false)
      setIsDataLoaded(true)
      console.log('✅ Loading completed (from database)')
    } catch (error) {
      console.error('❌ Error in loadOrCreateResponse:', error)
      setIsLoading(false)
      setIsDataLoaded(true)
    }
  }

  useEffect(() => {
    if (userInfoLoaded) {
      loadOrCreateResponse()
    }
  }, [userInfoLoaded, clinicId])

  // Auto-save to sessionStorage
  useEffect(() => {
    if (!isDataLoaded) return

    const data = {
      responseDate,
      responseDay,
      observationsStatus,
      unresolvedObservations,
      inspector1Name,
      inspector1Signature,
      inspector1Stamp,
      inspector2Name,
      inspector2Signature,
      inspector2Stamp,
      inspector3Name,
      inspector3Signature,
      inspector3Stamp,
      committeeHeadName,
      committeeHeadSignature,
      committeeHeadStamp,
      selectedInspection
    }

    try {
      sessionStorage.setItem(`response_form_data_${clinicId}`, JSON.stringify(data))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.log('SessionStorage quota exceeded - data will be saved to database on submit')
      } else {
        console.error('Error saving to sessionStorage:', error)
      }
    }
  }, [
    isDataLoaded,
    responseDate,
    responseDay,
    observationsStatus,
    unresolvedObservations,
    inspector1Name,
    inspector1Signature,
    inspector1Stamp,
    inspector2Name,
    inspector2Signature,
    inspector2Stamp,
    inspector3Name,
    inspector3Signature,
    inspector3Stamp,
    committeeHeadName,
    committeeHeadSignature,
    committeeHeadStamp,
    selectedInspection
  ])

  // Debounced database sync
  const debouncedDatabaseSync = useRef(
    debounce(async (data: any, visitIdParam: string, userIdParam: string, userNameParam: string) => {
      if (!visitIdParam || !userIdParam || !userNameParam) return

      try {
        await upsertDraft(
          {
            visit_id: visitIdParam,
            original_inspection_visit_id: data.selectedInspection?.id,
            response_date: data.responseDate,
            response_day: data.responseDay,
            observations_status: data.observationsStatus,
            unresolved_observations: data.unresolvedObservations,
            inspector1_name: data.inspector1Name,
            inspector1_signature: data.inspector1Signature,
            inspector1_stamp: data.inspector1Stamp,
            inspector2_name: data.inspector2Name,
            inspector2_signature: data.inspector2Signature,
            inspector2_stamp: data.inspector2Stamp,
            inspector3_name: data.inspector3Name,
            inspector3_signature: data.inspector3Signature,
            inspector3_stamp: data.inspector3Stamp,
            committee_head_name: data.committeeHeadName,
            committee_head_signature: data.committeeHeadSignature,
            committee_head_stamp: data.committeeHeadStamp,
          },
          userIdParam,
          userNameParam
        )
        console.log('✅ Draft saved to database')
      } catch (error) {
        console.error('❌ Error saving draft to database:', error)
      }
    }, 1000)
  ).current

  // Trigger debounced database sync when data changes
  useEffect(() => {
    if (!isDataLoaded || !visit || !userId || !userName) return

    const data = {
      responseDate,
      responseDay,
      observationsStatus,
      unresolvedObservations,
      inspector1Name,
      inspector1Signature,
      inspector1Stamp,
      inspector2Name,
      inspector2Signature,
      inspector2Stamp,
      inspector3Name,
      inspector3Signature,
      inspector3Stamp,
      committeeHeadName,
      committeeHeadSignature,
      committeeHeadStamp,
      selectedInspection
    }

    debouncedDatabaseSync(data, visit.id, userId, userName)
  }, [
    isDataLoaded,
    visit,
    userId,
    userName,
    responseDate,
    responseDay,
    observationsStatus,
    unresolvedObservations,
    inspector1Name,
    inspector1Signature,
    inspector1Stamp,
    inspector2Name,
    inspector2Signature,
    inspector2Stamp,
    inspector3Name,
    inspector3Signature,
    inspector3Stamp,
    committeeHeadName,
    committeeHeadSignature,
    committeeHeadStamp,
    selectedInspection
  ])

  // Load inspections when modal opens
  useEffect(() => {
    if (isModalOpen) {
      loadInspections()
    }
  }, [isModalOpen])

  const loadInspections = async () => {
    try {
      const allVisits = await getVisitsByClinicId(clinicId)
      const inspectionVisits = allVisits.filter(
        v => v.visit_type === 'inspection' && v.status === 'submitted'
      )
      setInspections(inspectionVisits)
    } catch (error) {
      console.error('Error loading inspections:', error)
      alert('حدث خطأ في تحميل المحاضر')
    }
  }

  const handleSelectInspection = async (inspection: Visit) => {
    setSelectedInspection(inspection)
    setIsModalOpen(false)

    // Clear the unresolved observations input field
    // (observations will only be displayed in the read-only section)
    setUnresolvedObservations("")

    // Load the submitted inspection data to get observations
    try {
      const submittedInspection = await getSubmittedInspectionByVisitId(inspection.id)

      if (submittedInspection) {
        // Collect all observations from different sections
        const observations: string[] = []

        if (submittedInspection.notes_clinic) {
          observations.push(`ملاحظات العيادة:\n${submittedInspection.notes_clinic}`)
        }

        if (submittedInspection.notes_sterilization) {
          observations.push(`ملاحظات التعقيم:\n${submittedInspection.notes_sterilization}`)
        }

        if (submittedInspection.notes_xray) {
          observations.push(`ملاحظات الأشعة:\n${submittedInspection.notes_xray}`)
        }

        if (submittedInspection.notes_lab) {
          observations.push(`ملاحظات المختبر:\n${submittedInspection.notes_lab}`)
        }

        if (submittedInspection.notes_files) {
          observations.push(`ملاحظات الملفات:\n${submittedInspection.notes_files}`)
        }

        if (submittedInspection.notes_staff) {
          observations.push(`ملاحظات العاملين:\n${submittedInspection.notes_staff}`)
        }

        // Join all observations with double line breaks
        const allObservations = observations.join('\n\n')

        if (allObservations) {
          setInspectionObservations(allObservations)
        } else {
          setInspectionObservations("")
        }
      } else {
        setInspectionObservations("")
      }
    } catch (error) {
      console.error('Error loading inspection observations:', error)
      setInspectionObservations("")
    }
  }

  // Compress image
  const compressImage = (dataUrl: string, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, width, height)
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        } else {
          resolve(dataUrl)
        }
      }
      img.src = dataUrl
    })
  }

  const handleStampImageSelect = (fieldName: string, file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const imageDataUrl = reader.result as string
      setTempImageUrl(imageDataUrl)
      setCurrentStampField(fieldName)
      setShowCropModal(true)
    }
    reader.readAsDataURL(file)
  }

  const removeStamp = (fieldName: string) => {
    switch (fieldName) {
      case 'inspector1Stamp':
        setInspector1Stamp("")
        break
      case 'inspector2Stamp':
        setInspector2Stamp("")
        break
      case 'inspector3Stamp':
        setInspector3Stamp("")
        break
      case 'committeeHeadStamp':
        setCommitteeHeadStamp("")
        break
    }
  }

  const handleStampClick = (fieldName: string) => {
    stampInputRefs.current[fieldName]?.click()
  }

  const openSignatureModal = (fieldName: string) => {
    setCurrentSignatureField(fieldName)
    setShowSignatureModal(true)
  }

  useEffect(() => {
    if (showSignatureModal && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        let existingSignature = ''
        switch (currentSignatureField) {
          case 'inspector1Signature':
            existingSignature = inspector1Signature
            break
          case 'inspector2Signature':
            existingSignature = inspector2Signature
            break
          case 'inspector3Signature':
            existingSignature = inspector3Signature
            break
          case 'committeeHeadSignature':
            existingSignature = committeeHeadSignature
            break
        }

        if (existingSignature) {
          const img = new Image()
          img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          }
          img.src = existingSignature
        }
      }

      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showSignatureModal, currentSignatureField, inspector1Signature, inspector2Signature, inspector3Signature, committeeHeadSignature])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)

    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let clientX, clientY
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault()
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveSignature = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const signatureDataUrl = canvas.toDataURL('image/png')
    const compressedSignature = await compressImage(signatureDataUrl, 600, 0.8)

    switch (currentSignatureField) {
      case 'inspector1Signature':
        setInspector1Signature(compressedSignature)
        break
      case 'inspector2Signature':
        setInspector2Signature(compressedSignature)
        break
      case 'inspector3Signature':
        setInspector3Signature(compressedSignature)
        break
      case 'committeeHeadSignature':
        setCommitteeHeadSignature(compressedSignature)
        break
    }

    setShowSignatureModal(false)
    clearCanvas()
  }

  const closeSignatureModal = () => {
    setShowSignatureModal(false)
    clearCanvas()
  }

  useEffect(() => {
    if (showCropModal && cropCanvasRef.current && tempImageUrl) {
      const canvas = cropCanvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const img = new Image()
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          const initialSize = Math.min(img.width, img.height) * 0.6
          setCropArea({
            x: (img.width - initialSize) / 2,
            y: (img.height - initialSize) / 2,
            width: initialSize,
            height: initialSize
          })
        }
        img.src = tempImageUrl
      }

      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showCropModal, tempImageUrl])

  const drawCropOverlay = () => {
    if (!cropCanvasRef.current || !tempImageUrl) return

    const canvas = cropCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)

      ctx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height
      )

      ctx.strokeStyle = '#059669'
      ctx.lineWidth = 3
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)

      const handleSize = 20
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#059669'
      ctx.lineWidth = 2

      ctx.fillRect(cropArea.x - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize)
      ctx.strokeRect(cropArea.x - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize)

      ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize)
      ctx.strokeRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize)

      ctx.fillRect(cropArea.x - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize)
      ctx.strokeRect(cropArea.x - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize)

      ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize)
      ctx.strokeRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize)
    }
    img.src = tempImageUrl
  }

  useEffect(() => {
    if (showCropModal) {
      drawCropOverlay()
    }
  }, [cropArea, showCropModal])

  const getCornerAtPosition = (x: number, y: number): string => {
    const handleSize = 20
    const threshold = handleSize

    if (Math.abs(x - cropArea.x) < threshold && Math.abs(y - cropArea.y) < threshold) {
      return 'top-left'
    }
    if (Math.abs(x - (cropArea.x + cropArea.width)) < threshold && Math.abs(y - cropArea.y) < threshold) {
      return 'top-right'
    }
    if (Math.abs(x - cropArea.x) < threshold && Math.abs(y - (cropArea.y + cropArea.height)) < threshold) {
      return 'bottom-left'
    }
    if (Math.abs(x - (cropArea.x + cropArea.width)) < threshold && Math.abs(y - (cropArea.y + cropArea.height)) < threshold) {
      return 'bottom-right'
    }
    if (Math.abs(x - cropArea.x) < threshold && y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      return 'left'
    }
    if (Math.abs(x - (cropArea.x + cropArea.width)) < threshold && y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      return 'right'
    }
    if (Math.abs(y - cropArea.y) < threshold && x >= cropArea.x && x <= cropArea.x + cropArea.width) {
      return 'top'
    }
    if (Math.abs(y - (cropArea.y + cropArea.height)) < threshold && x >= cropArea.x && x <= cropArea.x + cropArea.width) {
      return 'bottom'
    }

    return ''
  }

  const startCropDrag = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = cropCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    const corner = getCornerAtPosition(x, y)

    if (corner) {
      setIsResizing(true)
      setResizeCorner(corner)
      setDragStart({ x, y })
      setInitialCropArea({ ...cropArea })
    } else if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
               y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      setIsDragging(true)
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y })
    }
  }

  const doCropDrag = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDragging && !isResizing) return

    const canvas = cropCanvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    if (isDragging) {
      let newX = x - dragStart.x
      let newY = y - dragStart.y

      newX = Math.max(0, Math.min(newX, canvas.width - cropArea.width))
      newY = Math.max(0, Math.min(newY, canvas.height - cropArea.height))

      setCropArea(prev => ({ ...prev, x: newX, y: newY }))
    } else if (isResizing) {
      const dx = x - dragStart.x
      const dy = y - dragStart.y

      let newCropArea = { ...cropArea }
      const minSize = 50

      switch (resizeCorner) {
        case 'top-left':
          newCropArea.x = Math.max(0, Math.min(initialCropArea.x + dx, initialCropArea.x + initialCropArea.width - minSize))
          newCropArea.y = Math.max(0, Math.min(initialCropArea.y + dy, initialCropArea.y + initialCropArea.height - minSize))
          newCropArea.width = initialCropArea.width - (newCropArea.x - initialCropArea.x)
          newCropArea.height = initialCropArea.height - (newCropArea.y - initialCropArea.y)
          break

        case 'top-right':
          newCropArea.y = Math.max(0, Math.min(initialCropArea.y + dy, initialCropArea.y + initialCropArea.height - minSize))
          newCropArea.width = Math.max(minSize, Math.min(initialCropArea.width + dx, canvas.width - initialCropArea.x))
          newCropArea.height = initialCropArea.height - (newCropArea.y - initialCropArea.y)
          break

        case 'bottom-left':
          newCropArea.x = Math.max(0, Math.min(initialCropArea.x + dx, initialCropArea.x + initialCropArea.width - minSize))
          newCropArea.width = initialCropArea.width - (newCropArea.x - initialCropArea.x)
          newCropArea.height = Math.max(minSize, Math.min(initialCropArea.height + dy, canvas.height - initialCropArea.y))
          break

        case 'bottom-right':
          newCropArea.width = Math.max(minSize, Math.min(initialCropArea.width + dx, canvas.width - initialCropArea.x))
          newCropArea.height = Math.max(minSize, Math.min(initialCropArea.height + dy, canvas.height - initialCropArea.y))
          break

        case 'left':
          newCropArea.x = Math.max(0, Math.min(initialCropArea.x + dx, initialCropArea.x + initialCropArea.width - minSize))
          newCropArea.width = initialCropArea.width - (newCropArea.x - initialCropArea.x)
          break

        case 'right':
          newCropArea.width = Math.max(minSize, Math.min(initialCropArea.width + dx, canvas.width - initialCropArea.x))
          break

        case 'top':
          newCropArea.y = Math.max(0, Math.min(initialCropArea.y + dy, initialCropArea.y + initialCropArea.height - minSize))
          newCropArea.height = initialCropArea.height - (newCropArea.y - initialCropArea.y)
          break

        case 'bottom':
          newCropArea.height = Math.max(minSize, Math.min(initialCropArea.height + dy, canvas.height - initialCropArea.y))
          break
      }

      setCropArea(newCropArea)
    }
  }

  const stopCropDrag = () => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeCorner("")
  }

  const saveCroppedImage = () => {
    if (!cropCanvasRef.current || !tempImageUrl) return

    const sourceCanvas = cropCanvasRef.current
    const sourceCtx = sourceCanvas.getContext('2d')
    if (!sourceCtx) return

    const croppedCanvas = document.createElement('canvas')
    croppedCanvas.width = cropArea.width
    croppedCanvas.height = cropArea.height
    const croppedCtx = croppedCanvas.getContext('2d')
    if (!croppedCtx) return

    const img = new Image()
    img.onload = async () => {
      croppedCtx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, cropArea.width, cropArea.height
      )

      const croppedImageUrl = croppedCanvas.toDataURL('image/png')
      const compressedStamp = await compressImage(croppedImageUrl, 400, 0.8)

      switch (currentStampField) {
        case 'inspector1Stamp':
          setInspector1Stamp(compressedStamp)
          break
        case 'inspector2Stamp':
          setInspector2Stamp(compressedStamp)
          break
        case 'inspector3Stamp':
          setInspector3Stamp(compressedStamp)
          break
        case 'committeeHeadStamp':
          setCommitteeHeadStamp(compressedStamp)
          break
      }

      closeCropModal()
    }
    img.src = tempImageUrl
  }

  const closeCropModal = () => {
    setShowCropModal(false)
    setTempImageUrl("")
    setCurrentStampField("")
    setCropArea({ x: 0, y: 0, width: 200, height: 200 })
    setIsDragging(false)
    setIsResizing(false)
    setResizeCorner("")
  }

  const handleSubmit = async () => {
    // Basic system validation only
    if (!userId || !userName) {
      alert('الرجاء تسجيل الدخول أولاً')
      return
    }

    if (!visit || !responseDraft) {
      alert('خطأ في تحميل البيانات')
      return
    }

    // Validate required fields
    if (!selectedInspection || !selectedInspection.id) {
      alert('الرجاء اختيار محضر التفتيش الأصلي أولاً')
      return
    }

    if (!responseDate || !responseDay) {
      alert('الرجاء إدخال تاريخ ويوم الزيارة')
      return
    }

    if (!inspector1Name) {
      alert('الرجاء إدخال اسم المفتش الأول على الأقل')
      return
    }

    if (!committeeHeadName) {
      alert('الرجاء إدخال اسم رئيس اللجنة')
      return
    }

    try {
      setIsSubmitting(true)

      // First, ensure the draft has the original_inspection_visit_id before submitting
      await upsertDraft(
        {
          visit_id: visit.id,
          original_inspection_visit_id: selectedInspection.id,
          response_date: responseDate,
          response_day: responseDay,
          observations_status: observationsStatus,
          unresolved_observations: unresolvedObservations,
          inspector1_name: inspector1Name,
          inspector1_signature: inspector1Signature,
          inspector1_stamp: inspector1Stamp,
          inspector2_name: inspector2Name,
          inspector2_signature: inspector2Signature,
          inspector2_stamp: inspector2Stamp,
          inspector3_name: inspector3Name,
          inspector3_signature: inspector3Signature,
          inspector3_stamp: inspector3Stamp,
          committee_head_name: committeeHeadName,
          committee_head_signature: committeeHeadSignature,
          committee_head_stamp: committeeHeadStamp,
        },
        userId,
        userName
      )

      // Update visit status only (date already set when visit was created)
      await updateVisit(visit.id, {
        status: 'submitted'
      })

      // Reload the draft to get the updated version with all required fields
      const updatedDraft = await getDraftByVisitId(visit.id)
      if (!updatedDraft) {
        throw new Error('Failed to load updated draft')
      }

      // Archive and submit response
      const result = await archiveAndSubmitResponse(updatedDraft, userId, userName)

      if (result) {
        // Clear sessionStorage
        sessionStorage.removeItem(`response_form_data_${clinicId}`)
        sessionStorage.removeItem(`current_visit_id_${clinicId}`)
        sessionStorage.removeItem(`current_response_draft_id_${clinicId}`)

        alert('تم حفظ محضر الرد بنجاح!')
        router.push(`/admin/facilities/clinics/${clinicId}`)
      } else {
        throw new Error('Failed to submit response')
      }
    } catch (error) {
      console.error('Error submitting response:', error)
      alert('حدث خطأ في حفظ محضر الرد')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>محضر الرد على محضر التفتيش</h1>
          </div>
        </div>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>جاري تحميل البيانات...</p>
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
          <button className={styles.backBtn} onClick={() => router.back()}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>محضر الرد على محضر التفتيش</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.formCard}>
          {/* Select Original Inspection */}
          <h2 className={styles.sectionTitle}>اختيار محضر التفتيش الأصلي</h2>
          <button
            className={styles.selectInspectionBtn}
            onClick={() => setIsModalOpen(true)}
          >
            {selectedInspection ? 'تغيير المحضر' : 'اختر محضر التفتيش'}
          </button>

          {selectedInspection && (
            <div className={styles.selectedInspectionInfo}>
              <div className={styles.selectedInspectionLabel}>المحضر المختار:</div>
              <div className={styles.selectedInspectionValue}>
                تفتيش - {selectedInspection.visit_date} ({selectedInspection.visit_day})
              </div>
            </div>
          )}

          {/* Date and Day */}
          <h2 className={styles.sectionTitle}>معلومات زيارة المتابعة</h2>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>التاريخ</label>
              <input
                type="date"
                className={styles.input}
                value={responseDate}
                onChange={(e) => setResponseDate(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>اليوم</label>
              <input
                type="text"
                className={styles.input}
                value={responseDay}
                onChange={(e) => setResponseDay(e.target.value)}
              />
            </div>
          </div>

          {/* Original Inspection Observations - Read Only Display */}
          {inspectionObservations && (
            <div className={styles.observationsDisplaySection}>
              <h2 className={styles.sectionTitle}>ملاحظات محضر التفتيش الأصلي</h2>
              <div className={styles.observationsDisplayBox}>
                {inspectionObservations}
              </div>
            </div>
          )}

          {/* Observations Status */}
          <h2 className={styles.sectionTitle}>حالة الملاحظات</h2>
          <div className={styles.radioGroup}>
            <div className={styles.radioOptions}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="observations_status"
                  value="resolved"
                  checked={observationsStatus === 'resolved'}
                  onChange={() => setObservationsStatus('resolved')}
                />
                <span className={styles.radioLabel}>تم تلافي الملاحظات</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="observations_status"
                  value="not_resolved"
                  checked={observationsStatus === 'not_resolved'}
                  onChange={() => setObservationsStatus('not_resolved')}
                />
                <span className={styles.radioLabel}>لم يتم تلافي الملاحظات</span>
              </label>
            </div>
          </div>

          {observationsStatus === 'not_resolved' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>ما هي الملاحظات التي لم يتم تلافيها؟</label>
              <textarea
                className={styles.textarea}
                value={unresolvedObservations}
                onChange={(e) => setUnresolvedObservations(e.target.value)}
                placeholder="اكتب الملاحظات التي لم يتم تلافيها..."
              />
            </div>
          )}

          {/* Inspectors */}
          <h2 className={styles.sectionTitle}>المفتشون</h2>

          {/* Inspector 1 */}
          <div className={styles.inspectorCard}>
            <div className={styles.inspectorTitle}>المفتش الأول *</div>
            <div className={styles.formGroup}>
              <label className={styles.label}>الاسم</label>
              <input
                type="text"
                className={styles.input}
                value={inspector1Name}
                onChange={(e) => setInspector1Name(e.target.value)}
                placeholder="اسم المفتش الأول"
              />
            </div>
            <div className={styles.signatureUploadGroup}>
              <div className={styles.uploadSection}>
                <label className={styles.uploadLabel}>التوقيع</label>
                <div
                  className={styles.signatureBox}
                  onClick={() => openSignatureModal('inspector1Signature')}
                >
                  {inspector1Signature ? (
                    <img src={inspector1Signature} alt="توقيع المفتش 1" className={styles.signatureImage} />
                  ) : (
                    <span className={styles.signaturePlaceholder}>اضغط للتوقيع</span>
                  )}
                </div>
              </div>
              <div className={styles.uploadSection}>
                <label className={styles.uploadLabel}>الختم</label>
                <div className={styles.stampContainer}>
                  <div
                    className={styles.stampBox}
                    onClick={() => handleStampClick('inspector1Stamp')}
                  >
                    {inspector1Stamp ? (
                      <img src={inspector1Stamp} alt="ختم المفتش 1" className={styles.stampImage} />
                    ) : (
                      <span className={styles.stampPlaceholder}>اضغط لاختيار ختم</span>
                    )}
                  </div>
                  {inspector1Stamp && (
                    <button
                      className={styles.removeStampBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        removeStamp('inspector1Stamp')
                      }}
                      title="حذف الختم"
                    >
                      ×
                    </button>
                  )}
                </div>
                <input
                  ref={(el) => { stampInputRefs.current['inspector1Stamp'] = el }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleStampImageSelect('inspector1Stamp', file)
                  }}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Inspector 2 */}
          <div className={styles.inspectorCard}>
            <div className={styles.inspectorTitle}>المفتش الثاني</div>
            <div className={styles.formGroup}>
              <label className={styles.label}>الاسم</label>
              <input
                type="text"
                className={styles.input}
                value={inspector2Name}
                onChange={(e) => setInspector2Name(e.target.value)}
                placeholder="اسم المفتش الثاني (اختياري)"
              />
            </div>
            <div className={styles.signatureUploadGroup}>
              <div className={styles.uploadSection}>
                <label className={styles.uploadLabel}>التوقيع</label>
                <div
                  className={styles.signatureBox}
                  onClick={() => openSignatureModal('inspector2Signature')}
                >
                  {inspector2Signature ? (
                    <img src={inspector2Signature} alt="توقيع المفتش 2" className={styles.signatureImage} />
                  ) : (
                    <span className={styles.signaturePlaceholder}>اضغط للتوقيع</span>
                  )}
                </div>
              </div>
              <div className={styles.uploadSection}>
                <label className={styles.uploadLabel}>الختم</label>
                <div className={styles.stampContainer}>
                  <div
                    className={styles.stampBox}
                    onClick={() => handleStampClick('inspector2Stamp')}
                  >
                    {inspector2Stamp ? (
                      <img src={inspector2Stamp} alt="ختم المفتش 2" className={styles.stampImage} />
                    ) : (
                      <span className={styles.stampPlaceholder}>اضغط لاختيار ختم</span>
                    )}
                  </div>
                  {inspector2Stamp && (
                    <button
                      className={styles.removeStampBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        removeStamp('inspector2Stamp')
                      }}
                      title="حذف الختم"
                    >
                      ×
                    </button>
                  )}
                </div>
                <input
                  ref={(el) => { stampInputRefs.current['inspector2Stamp'] = el }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleStampImageSelect('inspector2Stamp', file)
                  }}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Inspector 3 */}
          <div className={styles.inspectorCard}>
            <div className={styles.inspectorTitle}>المفتش الثالث</div>
            <div className={styles.formGroup}>
              <label className={styles.label}>الاسم</label>
              <input
                type="text"
                className={styles.input}
                value={inspector3Name}
                onChange={(e) => setInspector3Name(e.target.value)}
                placeholder="اسم المفتش الثالث (اختياري)"
              />
            </div>
            <div className={styles.signatureUploadGroup}>
              <div className={styles.uploadSection}>
                <label className={styles.uploadLabel}>التوقيع</label>
                <div
                  className={styles.signatureBox}
                  onClick={() => openSignatureModal('inspector3Signature')}
                >
                  {inspector3Signature ? (
                    <img src={inspector3Signature} alt="توقيع المفتش 3" className={styles.signatureImage} />
                  ) : (
                    <span className={styles.signaturePlaceholder}>اضغط للتوقيع</span>
                  )}
                </div>
              </div>
              <div className={styles.uploadSection}>
                <label className={styles.uploadLabel}>الختم</label>
                <div className={styles.stampContainer}>
                  <div
                    className={styles.stampBox}
                    onClick={() => handleStampClick('inspector3Stamp')}
                  >
                    {inspector3Stamp ? (
                      <img src={inspector3Stamp} alt="ختم المفتش 3" className={styles.stampImage} />
                    ) : (
                      <span className={styles.stampPlaceholder}>اضغط لاختيار ختم</span>
                    )}
                  </div>
                  {inspector3Stamp && (
                    <button
                      className={styles.removeStampBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        removeStamp('inspector3Stamp')
                      }}
                      title="حذف الختم"
                    >
                      ×
                    </button>
                  )}
                </div>
                <input
                  ref={(el) => { stampInputRefs.current['inspector3Stamp'] = el }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleStampImageSelect('inspector3Stamp', file)
                  }}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Committee Head */}
          <h2 className={styles.sectionTitle}>رئيس اللجنة</h2>
          <div className={styles.inspectorCard}>
            <div className={styles.formGroup}>
              <label className={styles.label}>الاسم *</label>
              <input
                type="text"
                className={styles.input}
                value={committeeHeadName}
                onChange={(e) => setCommitteeHeadName(e.target.value)}
                placeholder="اسم رئيس اللجنة"
              />
            </div>
            <div className={styles.signatureUploadGroup}>
              <div className={styles.uploadSection}>
                <label className={styles.uploadLabel}>التوقيع</label>
                <div
                  className={styles.signatureBox}
                  onClick={() => openSignatureModal('committeeHeadSignature')}
                >
                  {committeeHeadSignature ? (
                    <img src={committeeHeadSignature} alt="توقيع رئيس اللجنة" className={styles.signatureImage} />
                  ) : (
                    <span className={styles.signaturePlaceholder}>اضغط للتوقيع</span>
                  )}
                </div>
              </div>
              <div className={styles.uploadSection}>
                <label className={styles.uploadLabel}>الختم</label>
                <div className={styles.stampContainer}>
                  <div
                    className={styles.stampBox}
                    onClick={() => handleStampClick('committeeHeadStamp')}
                  >
                    {committeeHeadStamp ? (
                      <img src={committeeHeadStamp} alt="ختم رئيس اللجنة" className={styles.stampImage} />
                    ) : (
                      <span className={styles.stampPlaceholder}>اضغط لاختيار ختم</span>
                    )}
                  </div>
                  {committeeHeadStamp && (
                    <button
                      className={styles.removeStampBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        removeStamp('committeeHeadStamp')
                      }}
                      title="حذف الختم"
                    >
                      ×
                    </button>
                  )}
                </div>
                <input
                  ref={(el) => { stampInputRefs.current['committeeHeadStamp'] = el }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleStampImageSelect('committeeHeadStamp', file)
                  }}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className={styles.submitButtonsContainer}>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ وإرسال'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal for selecting inspection */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>اختر محضر التفتيش</h2>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>
            <div className={styles.inspectionsList}>
              {inspections.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280' }}>
                  لا توجد محاضر تفتيش محفوظة
                </p>
              ) : (
                inspections.map((inspection) => (
                  <div
                    key={inspection.id}
                    className={styles.inspectionItem}
                    onClick={() => handleSelectInspection(inspection)}
                  >
                    <div className={styles.inspectionDate}>
                      {inspection.visit_date} ({inspection.visit_day})
                    </div>
                    <div className={styles.inspectionType}>
                      محضر تفتيش - رقم الزيارة: {inspection.visit_number || 'غير محدد'}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Signature Drawing Modal */}
      {showSignatureModal && (
        <div className={styles.modalOverlay} onClick={closeSignatureModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <button className={styles.closeBtn} onClick={closeSignatureModal}>×</button>
              <h2 className={styles.modalTitle}>التوقيع</h2>
            </div>

            <div className={styles.canvasContainer}>
              <canvas
                ref={canvasRef}
                width={800}
                height={400}
                className={styles.canvas}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.clearBtn} onClick={clearCanvas}>
                مسح
              </button>
              <button className={styles.saveSignatureBtn} onClick={saveSignature}>
                حفظ التوقيع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      {showCropModal && (
        <div className={styles.modalOverlay} onClick={closeCropModal}>
          <div className={styles.cropModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <button className={styles.closeBtn} onClick={closeCropModal}>×</button>
              <h2 className={styles.modalTitle}>قص الصورة</h2>
            </div>

            <div className={styles.cropInstructions}>
              <div>• اسحب المربع الأخضر لتحريك منطقة القص</div>
              <div>• اسحب الزوايا أو الحواف لتغيير حجم منطقة القص</div>
            </div>

            <div className={styles.cropCanvasContainer}>
              <canvas
                ref={cropCanvasRef}
                className={styles.cropCanvas}
                onMouseDown={startCropDrag}
                onMouseMove={doCropDrag}
                onMouseUp={stopCropDrag}
                onMouseLeave={stopCropDrag}
                onTouchStart={startCropDrag}
                onTouchMove={doCropDrag}
                onTouchEnd={stopCropDrag}
              />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.clearBtn} onClick={closeCropModal}>
                إلغاء
              </button>
              <button className={styles.saveSignatureBtn} onClick={saveCroppedImage}>
                حفظ الختم
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
