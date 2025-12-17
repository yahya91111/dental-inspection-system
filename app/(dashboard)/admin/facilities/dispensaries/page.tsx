"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./styles.module.css"

export default function DispensariesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")

  // Sample dispensaries data - will be replaced with real data from Supabase
  const dispensaries = [
    { id: 1, name: "Green Health Dispensary" },
    { id: 2, name: "City Medical Dispensary" },
    { id: 3, name: "Prime Care Dispensary" },
    { id: 4, name: "Family Health Dispensary" },
    { id: 5, name: "Modern Medical Dispensary" },
    { id: 6, name: "Elite Healthcare Dispensary" },
  ]

  const filteredDispensaries = dispensaries.filter((dispensary) =>
    dispensary.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAddClick = () => {
    // TODO: Open modal or navigate to add dispensary page
    console.log("Add new dispensary")
  }

  const handleDispensaryClick = (dispensaryId: number) => {
    router.push(`/admin/facilities/dispensaries/${dispensaryId}`)
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>Private Dispensaries</h1>
          <button className={styles.addBtn} onClick={handleAddClick}>
            +
          </button>
        </div>

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search for a dispensary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.dispensariesGrid}>
          {filteredDispensaries.map((dispensary) => (
            <div
              key={dispensary.id}
              className={styles.dispensaryCard}
              onClick={() => handleDispensaryClick(dispensary.id)}
            >
              <h3 className={styles.dispensaryName}>{dispensary.name}</h3>
            </div>
          ))}
        </div>

        {filteredDispensaries.length === 0 && (
          <div className={styles.noResults}>
            <p>No dispensaries found</p>
          </div>
        )}
      </div>
    </div>
  )
}
