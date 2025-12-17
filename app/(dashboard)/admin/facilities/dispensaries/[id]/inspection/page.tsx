"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import styles from "./styles.module.css"

export default function InspectionPage() {
  const router = useRouter()
  const params = useParams()
  const dispensaryId = params.id

  // Form state
  const [classification, setClassification] = useState("")
  const [licenseOwner, setLicenseOwner] = useState("")
  const [visitNumber, setVisitNumber] = useState("")
  const [day, setDay] = useState("")
  const [date, setDate] = useState("")
  const [inspector1, setInspector1] = useState("")
  const [inspector2, setInspector2] = useState("")
  const [inspector3, setInspector3] = useState("")
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

  // Restore scroll position when page loads
  useEffect(() => {
    // Disable automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const savedScrollPosition = sessionStorage.getItem('inspectionScrollPosition')
    console.log('Saved scroll position:', savedScrollPosition)

    if (savedScrollPosition) {
      const scrollPos = parseInt(savedScrollPosition)
      console.log('Restoring to position:', scrollPos)

      // Find the container element
      const container = document.querySelector(`.${styles.container}`) as HTMLElement
      if (container) {
        // Multiple attempts to ensure scroll is restored
        setTimeout(() => {
          container.scrollTop = scrollPos
        }, 0)

        setTimeout(() => {
          container.scrollTop = scrollPos
        }, 100)

        setTimeout(() => {
          container.scrollTop = scrollPos
          sessionStorage.removeItem('inspectionScrollPosition')
          console.log('Scroll restored to:', container.scrollTop)
        }, 200)
      }
    }

    return () => {
      // Restore default behavior on cleanup
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto'
      }
    }
  }, [])

  const handleSectionClick = (sectionName: string) => {
    // Save current scroll position before navigating
    const container = document.querySelector(`.${styles.container}`) as HTMLElement
    if (container) {
      const currentScroll = container.scrollTop
      console.log('Saving scroll position:', currentScroll)
      sessionStorage.setItem('inspectionScrollPosition', currentScroll.toString())
    }
    router.push(`/admin/facilities/dispensaries/${dispensaryId}/inspection/${sectionName}`)
  }

  return (
    <div className={styles.page}>
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
        </div>
      </div>
    </div>
  )
}
