"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./styles.module.css"

export default function HospitalsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  // Sample hospitals data - will be replaced with real data from Supabase
  const hospitals = [
    { id: 1, name: "Royal Medical Hospital" },
    { id: 2, name: "Green Valley Hospital" },
    { id: 3, name: "Prime Healthcare Hospital" },
    { id: 4, name: "City General Hospital" },
    { id: 5, name: "Modern Care Hospital" },
    { id: 6, name: "Elite Medical Center Hospital" },
  ]

  const filteredHospitals = hospitals.filter((hospital) =>
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddClick = () => {
    // TODO: Open modal or navigate to add hospital page
    console.log("Add new hospital")
  }

  const handleHospitalClick = (hospitalId: number) => {
    router.push(`/admin/facilities/hospitals/${hospitalId}`)
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>Private Hospitals</h1>
          <button className={styles.addBtn} onClick={handleAddClick}>
            +
          </button>
        </div>

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for a hospital..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.hospitalsGrid}>
          {filteredHospitals.map((hospital) => (
            <div
              key={hospital.id}
              className={styles.hospitalCard}
              onClick={() => handleHospitalClick(hospital.id)}
            >
              <h3 className={styles.hospitalName}>{hospital.name}</h3>
            </div>
          ))}
        </div>

        {filteredHospitals.length === 0 && (
          <div className={styles.noResults}>
            <p>No hospitals found</p>
          </div>
        )}
      </div>
    </div>
  )
}
