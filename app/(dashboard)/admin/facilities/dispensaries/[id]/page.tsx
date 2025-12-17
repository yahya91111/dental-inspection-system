"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import styles from "./styles.module.css"

export default function DispensaryDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const dispensaryId = params.id
  const [isReasonsOpen, setIsReasonsOpen] = useState(false)
  const accordionRef = useRef<HTMLDivElement>(null)

  // Sample dispensary data - will be replaced with real data from Supabase
  const dispensary = {
    id: dispensaryId,
    name: "Green Health Dispensary",
    address: "789 Prince Sultan Road, Riyadh, Saudi Arabia",
    phone: "+966 11 555 1234",
    date: "2024-11-10",
  }

  const handleInspectionClick = () => {
    router.push(`/admin/facilities/dispensaries/${dispensaryId}/inspection`)
  }

  const handleNotInspectedClick = () => {
    router.push(`/admin/facilities/dispensaries/${dispensaryId}/not-inspected`)
  }

  const handleResponseClick = () => {
    router.push(`/admin/facilities/dispensaries/${dispensaryId}/response`)
  }

  const handleCloseClick = () => {
    router.push(`/admin/facilities/dispensaries/${dispensaryId}/close`)
  }

  const handleExaminationClick = () => {
    router.push(`/admin/facilities/dispensaries/${dispensaryId}/examination`)
  }

  const handlePreviousVisitsClick = () => {
    router.push(`/admin/facilities/dispensaries/${dispensaryId}/previous-visits`)
  }

  const handlePrintClick = () => {
    router.push(`/admin/facilities/dispensaries/${dispensaryId}/print`)
  }

  // Auto scroll when accordion opens
  useEffect(() => {
    if (isReasonsOpen && accordionRef.current) {
      setTimeout(() => {
        accordionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        })
      }, 100)
    }
  }, [isReasonsOpen])

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>{dispensary.name}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        {/* Dispensary Information Card */}
        <div className={styles.infoCard}>
          <h2 className={styles.infoTitle}>معلومات المستوصف</h2>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>العنوان:</span>
            <span className={styles.infoValue}>{dispensary.address}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>الهاتف:</span>
            <span className={styles.infoValue}>{dispensary.phone}</span>
          </div>

          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>تاريخ التسجيل:</span>
            <span className={styles.infoValue}>{dispensary.date}</span>
          </div>
        </div>

        {/* Visit Reasons / Tasks - Accordion */}
        <div className={styles.tasksSection} ref={accordionRef}>
          <button
            className={styles.accordionHeader}
            onClick={() => setIsReasonsOpen(!isReasonsOpen)}
          >
            <h2 className={styles.accordionTitle}>أسباب الزيارة</h2>
            <span className={styles.accordionIcon}>{isReasonsOpen ? '−' : '+'}</span>
          </button>

          <div className={`${styles.accordionContent} ${isReasonsOpen ? styles.accordionContentOpen : ''}`}>
            <div className={styles.tasksGrid}>
              {/* Inspection Button */}
              <button className={styles.taskBtn} onClick={handleInspectionClick}>
                <h3 className={styles.taskTitle}>تفتيش</h3>
              </button>

              {/* Not Inspected Button */}
              <button className={styles.taskBtn} onClick={handleNotInspectedClick}>
                <h3 className={styles.taskTitle}>لم يتم التفتيش</h3>
              </button>

              {/* Response to Inspection Report Button */}
              <button className={styles.taskBtn} onClick={handleResponseClick}>
                <h3 className={styles.taskTitle}>الرد على تقرير التفتيش</h3>
              </button>

              {/* Close Dispensary Button */}
              <button className={styles.taskBtn} onClick={handleCloseClick}>
                <h3 className={styles.taskTitle}>إغلاق مستوصف</h3>
              </button>

              {/* Examination Button */}
              <button className={styles.taskBtn} onClick={handleExaminationClick}>
                <h3 className={styles.taskTitle}>معاينة</h3>
              </button>
            </div>
          </div>
        </div>

        {/* Previous Visits Card */}
        <div className={styles.extraCardsSection}>
          <button
            className={styles.extraCard}
            onClick={handlePreviousVisitsClick}
          >
            <h3 className={styles.extraCardTitle}>الزيارات السابقة</h3>
          </button>

          {/* Print Card */}
          <button
            className={styles.extraCard}
            onClick={handlePrintClick}
          >
            <h3 className={styles.extraCardTitle}>طباعة</h3>
          </button>
        </div>
      </div>
    </div>
  )
}
