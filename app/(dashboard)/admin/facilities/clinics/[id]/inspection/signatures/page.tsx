"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import styles from "./styles.module.css"

export default function SignaturesPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cropCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [showSignatureModal, setShowSignatureModal] = useState(false)
  const [currentSignatureField, setCurrentSignatureField] = useState<string>("")

  // Database state
  const [isLoading, setIsLoading] = useState(true)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

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

  // Compress image to reduce size for sessionStorage
  const compressImage = (dataUrl: string, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions while maintaining aspect ratio
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

  // توقيع وختم المفتشين
  const [inspector1Signature, setInspector1Signature] = useState("")
  const [inspector1Stamp, setInspector1Stamp] = useState("")
  const [inspector2Signature, setInspector2Signature] = useState("")
  const [inspector2Stamp, setInspector2Stamp] = useState("")
  const [inspector3Signature, setInspector3Signature] = useState("")
  const [inspector3Stamp, setInspector3Stamp] = useState("")

  // توقيع وختم الطبيب المخاطب
  const [doctorSignature, setDoctorSignature] = useState("")
  const [doctorStamp, setDoctorStamp] = useState("")

  // ختم العيادة
  const [clinicStamp, setClinicStamp] = useState("")

  // توقيع وختم رئيس اللجنة
  const [committeeHeadSignature, setCommitteeHeadSignature] = useState("")
  const [committeeHeadStamp, setCommitteeHeadStamp] = useState("")

  // توقيع المخالف
  const [violatorSignature, setViolatorSignature] = useState("")

  // Refs for stamp file inputs
  const stampInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Handle stamp image selection - Open crop modal
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

  // Remove stamp
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
      case 'doctorStamp':
        setDoctorStamp("")
        break
      case 'clinicStamp':
        setClinicStamp("")
        break
      case 'committeeHeadStamp':
        setCommitteeHeadStamp("")
        break
    }
  }

  // Handle stamp click to trigger file input
  const handleStampClick = (fieldName: string) => {
    stampInputRefs.current[fieldName]?.click()
  }

  // Open signature drawing modal
  const openSignatureModal = (fieldName: string) => {
    setCurrentSignatureField(fieldName)
    setShowSignatureModal(true)
  }

  // Initialize canvas when modal opens
  useEffect(() => {
    if (showSignatureModal && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Set white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Set drawing style
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // Load existing signature if available
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
          case 'doctorSignature':
            existingSignature = doctorSignature
            break
          case 'committeeHeadSignature':
            existingSignature = committeeHeadSignature
            break
          case 'violatorSignature':
            existingSignature = violatorSignature
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

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showSignatureModal, currentSignatureField, inspector1Signature, inspector2Signature, inspector3Signature, doctorSignature, committeeHeadSignature, violatorSignature])

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)

    // Calculate scale factors
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

    // Calculate scale factors
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

    // Clear and set white background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveSignature = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const signatureDataUrl = canvas.toDataURL('image/png')

    // Compress the signature
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
      case 'doctorSignature':
        setDoctorSignature(compressedSignature)
        break
      case 'committeeHeadSignature':
        setCommitteeHeadSignature(compressedSignature)
        break
      case 'violatorSignature':
        setViolatorSignature(compressedSignature)
        break
    }

    setShowSignatureModal(false)
    clearCanvas()
  }

  const closeModal = () => {
    setShowSignatureModal(false)
    clearCanvas()
  }

  // Initialize crop canvas when crop modal opens
  useEffect(() => {
    if (showCropModal && cropCanvasRef.current && tempImageUrl) {
      const canvas = cropCanvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const img = new Image()
        img.onload = () => {
          // Set canvas size to image size
          canvas.width = img.width
          canvas.height = img.height

          // Draw image
          ctx.drawImage(img, 0, 0)

          // Initialize crop area to center
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

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [showCropModal, tempImageUrl])

  // Draw crop overlay
  const drawCropOverlay = () => {
    if (!cropCanvasRef.current || !tempImageUrl) return

    const canvas = cropCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Redraw original image
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      // Draw dark overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Clear crop area
      ctx.clearRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)

      // Redraw image in crop area
      ctx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height
      )

      // Draw crop border
      ctx.strokeStyle = '#059669'
      ctx.lineWidth = 3
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)

      // Draw corner handles
      const handleSize = 20
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = '#059669'
      ctx.lineWidth = 2

      // Top-left
      ctx.fillRect(cropArea.x - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize)
      ctx.strokeRect(cropArea.x - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize)

      // Top-right
      ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize)
      ctx.strokeRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize)

      // Bottom-left
      ctx.fillRect(cropArea.x - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize)
      ctx.strokeRect(cropArea.x - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize)

      // Bottom-right
      ctx.fillRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize)
      ctx.strokeRect(cropArea.x + cropArea.width - handleSize/2, cropArea.y + cropArea.height - handleSize/2, handleSize, handleSize)
    }
    img.src = tempImageUrl
  }

  // Update overlay when crop area changes
  useEffect(() => {
    if (showCropModal) {
      drawCropOverlay()
    }
  }, [cropArea, showCropModal])

  // Check if click is on a corner handle
  const getCornerAtPosition = (x: number, y: number): string => {
    const handleSize = 20
    const threshold = handleSize

    // Top-left
    if (Math.abs(x - cropArea.x) < threshold && Math.abs(y - cropArea.y) < threshold) {
      return 'top-left'
    }
    // Top-right
    if (Math.abs(x - (cropArea.x + cropArea.width)) < threshold && Math.abs(y - cropArea.y) < threshold) {
      return 'top-right'
    }
    // Bottom-left
    if (Math.abs(x - cropArea.x) < threshold && Math.abs(y - (cropArea.y + cropArea.height)) < threshold) {
      return 'bottom-left'
    }
    // Bottom-right
    if (Math.abs(x - (cropArea.x + cropArea.width)) < threshold && Math.abs(y - (cropArea.y + cropArea.height)) < threshold) {
      return 'bottom-right'
    }
    // Left edge
    if (Math.abs(x - cropArea.x) < threshold && y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      return 'left'
    }
    // Right edge
    if (Math.abs(x - (cropArea.x + cropArea.width)) < threshold && y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      return 'right'
    }
    // Top edge
    if (Math.abs(y - cropArea.y) < threshold && x >= cropArea.x && x <= cropArea.x + cropArea.width) {
      return 'top'
    }
    // Bottom edge
    if (Math.abs(y - (cropArea.y + cropArea.height)) < threshold && x >= cropArea.x && x <= cropArea.x + cropArea.width) {
      return 'bottom'
    }

    return ''
  }

  // Handle crop area dragging and resizing
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

    // Check if clicking on a corner or edge for resizing
    const corner = getCornerAtPosition(x, y)

    if (corner) {
      setIsResizing(true)
      setResizeCorner(corner)
      setDragStart({ x, y })
      setInitialCropArea({ ...cropArea })
    } else if (x >= cropArea.x && x <= cropArea.x + cropArea.width &&
               y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      // Click inside crop area for dragging
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
      // Dragging the crop area
      let newX = x - dragStart.x
      let newY = y - dragStart.y

      // Keep crop area within canvas bounds
      newX = Math.max(0, Math.min(newX, canvas.width - cropArea.width))
      newY = Math.max(0, Math.min(newY, canvas.height - cropArea.height))

      setCropArea(prev => ({ ...prev, x: newX, y: newY }))
    } else if (isResizing) {
      // Resizing the crop area
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

  // Save cropped image
  const saveCroppedImage = () => {
    if (!cropCanvasRef.current || !tempImageUrl) return

    const sourceCanvas = cropCanvasRef.current
    const sourceCtx = sourceCanvas.getContext('2d')
    if (!sourceCtx) return

    // Create a new canvas for the cropped image
    const croppedCanvas = document.createElement('canvas')
    croppedCanvas.width = cropArea.width
    croppedCanvas.height = cropArea.height
    const croppedCtx = croppedCanvas.getContext('2d')
    if (!croppedCtx) return

    // Draw the cropped portion
    const img = new Image()
    img.onload = async () => {
      croppedCtx.drawImage(
        img,
        cropArea.x, cropArea.y, cropArea.width, cropArea.height,
        0, 0, cropArea.width, cropArea.height
      )

      const croppedImageUrl = croppedCanvas.toDataURL('image/png')

      // Compress the stamp image
      const compressedStamp = await compressImage(croppedImageUrl, 400, 0.8)

      // Save to appropriate field
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
        case 'doctorStamp':
          setDoctorStamp(compressedStamp)
          break
        case 'clinicStamp':
          setClinicStamp(compressedStamp)
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

  // Load inspection data from sessionStorage or database
  const loadInspectionData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Check sessionStorage first
      const savedData = sessionStorage.getItem('signatures_section_data')
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          setInspector1Signature(data.inspector1Signature || "")
          setInspector1Stamp(data.inspector1Stamp || "")
          setInspector2Signature(data.inspector2Signature || "")
          setInspector2Stamp(data.inspector2Stamp || "")
          setInspector3Signature(data.inspector3Signature || "")
          setInspector3Stamp(data.inspector3Stamp || "")
          setDoctorSignature(data.doctorSignature || "")
          setDoctorStamp(data.doctorStamp || "")
          setClinicStamp(data.clinicStamp || "")
          setCommitteeHeadSignature(data.committeeHeadSignature || "")
          setCommitteeHeadStamp(data.committeeHeadStamp || "")
          setViolatorSignature(data.violatorSignature || "")
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

  // Auto-save to sessionStorage whenever data changes (with error handling for quota exceeded)
  useEffect(() => {
    if (!isDataLoaded) return

    const data = {
      inspector1Signature,
      inspector1Stamp,
      inspector2Signature,
      inspector2Stamp,
      inspector3Signature,
      inspector3Stamp,
      doctorSignature,
      doctorStamp,
      clinicStamp,
      committeeHeadSignature,
      committeeHeadStamp,
      violatorSignature
    }

    try {
      sessionStorage.setItem('signatures_section_data', JSON.stringify(data))
    } catch (error) {
      // Ignore quota exceeded errors - data will be saved to database on submit
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.log('SessionStorage quota exceeded - signatures will be saved to database on submit')
      } else {
        console.error('Error saving to sessionStorage:', error)
      }
    }
  }, [
    isDataLoaded,
    inspector1Signature,
    inspector1Stamp,
    inspector2Signature,
    inspector2Stamp,
    inspector3Signature,
    inspector3Stamp,
    doctorSignature,
    doctorStamp,
    clinicStamp,
    committeeHeadSignature,
    committeeHeadStamp,
    violatorSignature
  ])

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={handleBack}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>التواقيع والأختام</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.formCard}>

          {/* المفتش الأول */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>توقيع المفتش رقم 1</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>التوقيع</label>
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

              <div className={styles.formGroup}>
                <label className={styles.label}>الختم</label>
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

          {/* المفتش الثاني */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>توقيع المفتش رقم 2</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>التوقيع</label>
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

              <div className={styles.formGroup}>
                <label className={styles.label}>الختم</label>
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

          {/* المفتش الثالث */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>توقيع المفتش رقم 3</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>التوقيع</label>
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

              <div className={styles.formGroup}>
                <label className={styles.label}>الختم</label>
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

          {/* الطبيب المخاطب */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>توقيع الطبيب المخاطب عند التفتيش</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>التوقيع</label>
                <div
                  className={styles.signatureBox}
                  onClick={() => openSignatureModal('doctorSignature')}
                >
                  {doctorSignature ? (
                    <img src={doctorSignature} alt="توقيع الطبيب" className={styles.signatureImage} />
                  ) : (
                    <span className={styles.signaturePlaceholder}>اضغط للتوقيع</span>
                  )}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>الختم</label>
                <div className={styles.stampContainer}>
                  <div
                    className={styles.stampBox}
                    onClick={() => handleStampClick('doctorStamp')}
                  >
                    {doctorStamp ? (
                      <img src={doctorStamp} alt="ختم الطبيب" className={styles.stampImage} />
                    ) : (
                      <span className={styles.stampPlaceholder}>اضغط لاختيار ختم</span>
                    )}
                  </div>
                  {doctorStamp && (
                    <button
                      className={styles.removeStampBtn}
                      onClick={(e) => {
                        e.stopPropagation()
                        removeStamp('doctorStamp')
                      }}
                      title="حذف الختم"
                    >
                      ×
                    </button>
                  )}
                </div>
                <input
                  ref={(el) => { stampInputRefs.current['doctorStamp'] = el }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleStampImageSelect('doctorStamp', file)
                  }}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* ختم العيادة */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>ختم العيادة</h2>

            <div className={styles.formGroup}>
              <label className={styles.label}>الختم</label>
              <div className={styles.stampContainer}>
                <div
                  className={styles.stampBox}
                  onClick={() => handleStampClick('clinicStamp')}
                >
                  {clinicStamp ? (
                    <img src={clinicStamp} alt="ختم العيادة" className={styles.stampImage} />
                  ) : (
                    <span className={styles.stampPlaceholder}>اضغط لاختيار ختم</span>
                  )}
                </div>
                {clinicStamp && (
                  <button
                    className={styles.removeStampBtn}
                    onClick={(e) => {
                      e.stopPropagation()
                      removeStamp('clinicStamp')
                    }}
                    title="حذف الختم"
                  >
                    ×
                  </button>
                )}
              </div>
              <input
                ref={(el) => { stampInputRefs.current['clinicStamp'] = el }}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleStampImageSelect('clinicStamp', file)
                }}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* رئيس اللجنة */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>توقيع وختم رئيس اللجنة</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>التوقيع</label>
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

              <div className={styles.formGroup}>
                <label className={styles.label}>الختم</label>
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

          {/* توقيع المخالف */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>توقيع المخالف</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>التوقيع</label>
                <div
                  className={styles.signatureBox}
                  onClick={() => openSignatureModal('violatorSignature')}
                >
                  {violatorSignature ? (
                    <img src={violatorSignature} alt="توقيع المخالف" className={styles.signatureImage} />
                  ) : (
                    <span className={styles.signaturePlaceholder}>اضغط للتوقيع</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Signature Drawing Modal */}
      {showSignatureModal && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <button className={styles.closeBtn} onClick={closeModal}>×</button>
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
