"use client"

import { useRouter } from "next/navigation"
import styles from "./styles.module.css"

export default function FacilitiesPage() {
  const router = useRouter()

  const handleClinicsClick = () => {
    // TODO: Navigate to private clinics list
    router.push("/admin/facilities/clinics")
  }

  const handleDispensariesClick = () => {
    // TODO: Navigate to private dispensaries list
    router.push("/admin/facilities/dispensaries")
  }

  const handleHospitalsClick = () => {
    // TODO: Navigate to private hospitals list
    router.push("/admin/facilities/hospitals")
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>Health Facilities</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.cardsGrid}>
          {/* Private Clinics Card */}
          <div className={styles.card} onClick={handleClinicsClick}>
            <div className={styles.cardIcon}>🏥</div>
            <h2 className={styles.cardTitle}>Private Clinics</h2>
            <p className={styles.cardDesc}>Manage and monitor private medical clinics</p>
          </div>

          {/* Private Dispensaries Card */}
          <div className={styles.card} onClick={handleDispensariesClick}>
            <div className={styles.cardIcon}>🏪</div>
            <h2 className={styles.cardTitle}>Private Dispensaries</h2>
            <p className={styles.cardDesc}>Manage and monitor private health dispensaries</p>
          </div>

          {/* Private Hospitals Card */}
          <div className={styles.card} onClick={handleHospitalsClick}>
            <div className={styles.cardIcon}>🏨</div>
            <h2 className={styles.cardTitle}>Private Hospitals</h2>
            <p className={styles.cardDesc}>Manage and monitor private hospitals</p>
          </div>
        </div>
      </div>
    </div>
  )
}
