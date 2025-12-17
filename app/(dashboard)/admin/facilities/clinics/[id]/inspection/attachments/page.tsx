"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import styles from "./styles.module.css"

interface Attachment {
  id: string
  imageUrl: string | null
  imageFile: File | null
  description: string
  showOptions: boolean
}

export default function AttachmentsPage() {
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

  const [attachments, setAttachments] = useState<Attachment[]>([])

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  const addAttachment = () => {
    const newAttachment: Attachment = {
      id: Date.now().toString(),
      imageUrl: null,
      imageFile: null,
      description: '',
      showOptions: true
    }
    setAttachments([...attachments, newAttachment])
  }

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id))
    // Clean up refs
    delete fileInputRefs.current[id]
  }

  const handleImageSelect = (id: string, file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setAttachments(attachments.map(a =>
        a.id === id ? { ...a, imageUrl: reader.result as string, imageFile: file, showOptions: false } : a
      ))
    }
    reader.readAsDataURL(file)
  }

  const handleFileClick = (id: string) => {
    fileInputRefs.current[id]?.click()
  }

  const updateDescription = (id: string, description: string) => {
    setAttachments(attachments.map(a =>
      a.id === id ? { ...a, description } : a
    ))
  }

  // Load inspection data from sessionStorage or database
  const loadInspectionData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Check sessionStorage first
      const savedData = sessionStorage.getItem('attachments_section_data')
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          setAttachments(data.attachments || [])
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
      attachments
    }
    sessionStorage.setItem('attachments_section_data', JSON.stringify(data))
  }, [isDataLoaded, attachments])

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={handleBack}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>المرفقات</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.formCard}>

          {/* Attachments List */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>المرفقات والصور</h2>

            {attachments.length > 0 && (
              <div className={styles.attachmentsList}>
                {attachments.map((attachment, index) => (
                  <div key={attachment.id} className={styles.attachmentCard}>

                    {/* Attachment Header */}
                    <div className={styles.attachmentHeader}>
                      <h3 className={styles.attachmentNumber}>مرفق رقم {index + 1}</h3>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeAttachment(attachment.id)}
                        title="حذف المرفق"
                      >
                        ×
                      </button>
                    </div>

                    {/* Show Options or Image */}
                    {attachment.showOptions && !attachment.imageUrl ? (
                      <div className={styles.uploadOptions}>
                        {/* File Selection Button */}
                        <button
                          className={styles.optionBtn}
                          onClick={() => handleFileClick(attachment.id)}
                        >
                          <svg className={styles.btnIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          اختيار ملف
                        </button>
                        <input
                          ref={el => fileInputRefs.current[attachment.id] = el}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageSelect(attachment.id, file)
                          }}
                          style={{ display: 'none' }}
                        />
                      </div>
                    ) : attachment.imageUrl ? (
                      <>
                        {/* Image Preview */}
                        <div className={styles.imagePreview}>
                          <img
                            src={attachment.imageUrl}
                            alt={`مرفق ${index + 1}`}
                            className={styles.previewImage}
                          />
                        </div>

                        {/* Description */}
                        <div className={styles.descriptionGroup}>
                          <label className={styles.descriptionLabel}>وصف المرفق (اختياري)</label>
                          <textarea
                            className={styles.descriptionTextarea}
                            value={attachment.description}
                            onChange={(e) => updateDescription(attachment.id, e.target.value)}
                            placeholder="أضف وصف للصورة..."
                            rows={2}
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            )}

            {/* Add Attachment Button */}
            <button className={styles.addAttachmentBtn} onClick={addAttachment}>
              + إضافة مرفق
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
