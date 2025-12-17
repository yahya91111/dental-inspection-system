"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import styles from "./styles.module.css"

export default function InspectorDashboard() {
  const router = useRouter()
  const [inspectorName, setInspectorName] = useState("المفتش")

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const userData = JSON.parse(user)
      setInspectorName(userData.full_name || "المفتش")
    }
  }, [])

  return (
    <div className={styles.dashboard}>
      {/* Header - Extended to status bar */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.inspectorName}>{inspectorName}</h1>
          <button className={styles.profileBtn}>
            <span className={styles.profileIcon}>👤</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        {/* Health Facilities Card */}
        <div className={styles.facilityCard}>
          <h2 className={styles.cardTitle}>المنشآت الصحية</h2>
        </div>
      </div>
    </div>
  )
}
