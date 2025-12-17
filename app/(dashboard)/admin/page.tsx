"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import styles from "./styles.module.css"

export default function AdminDashboard() {
  const router = useRouter()
  const [adminName, setAdminName] = useState("Team Leader")

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const userData = JSON.parse(user)
      setAdminName(userData.full_name || "Team Leader")
    }
  }, [])

  const handleFacilitiesClick = () => {
    router.push("/admin/facilities")
  }

  const handleMembersClick = () => {
    router.push("/admin/members")
  }

  const handleTasksClick = () => {
    router.push("/admin/tasks")
  }

  const handleStatisticsClick = () => {
    router.push("/admin/statistics")
  }

  return (
    <div className={styles.dashboard}>
      {/* Header - Extended to status bar */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.adminName}>{adminName}</h1>
          <button className={styles.profileBtn}>
            <span className={styles.profileIcon}>👤</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.cardsGrid}>
          {/* Health Facilities Card */}
          <div className={styles.facilityCard} onClick={handleFacilitiesClick}>
            <h2 className={styles.cardTitle}>Health Facilities</h2>
          </div>

          {/* Members Card */}
          <div className={styles.membersCard} onClick={handleMembersClick}>
            <h2 className={styles.cardTitle}>Members</h2>
          </div>

          {/* Tasks Card */}
          <div className={styles.tasksCard} onClick={handleTasksClick}>
            <h2 className={styles.cardTitle}>Tasks</h2>
          </div>

          {/* Statistics Card */}
          <div className={styles.statisticsCard} onClick={handleStatisticsClick}>
            <h2 className={styles.cardTitle}>Statistics</h2>
          </div>
        </div>
      </div>
    </div>
  )
}
