"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import styles from "./styles.module.css"

export default function LabPage() {
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

  // Environment Section
  const [envHygiene, setEnvHygiene] = useState<"good" | "not-good" | null>(null)

  // Disinfection
  const [surfacesDisinfection, setSurfacesDisinfection] = useState<"available" | "not-available" | null>(null)

  // Types
  const [mainDentalLab, setMainDentalLab] = useState<"available" | "not-available" | null>(null)
  const [miniDentalLab, setMiniDentalLab] = useState<"available" | "not-available" | null>(null)
  const [contract, setContract] = useState<"available" | "not-available" | null>(null)
  const [inOtherBranch, setInOtherBranch] = useState<"available" | "not-available" | null>(null)

  // Impression
  const [appliances, setAppliances] = useState<"available" | "not-available" | null>(null)
  const [disinfectionContainer, setDisinfectionContainer] = useState<"available" | "not-available" | null>(null)
  const [disposableBags, setDisposableBags] = useState<"available" | "not-available" | null>(null)

  // Load inspection data from sessionStorage or database
  const loadInspectionData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Check sessionStorage first
      const savedData = sessionStorage.getItem('lab_section_data')
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          setEnvHygiene(data.envHygiene || null)
          setSurfacesDisinfection(data.surfacesDisinfection || null)
          setMainDentalLab(data.mainDentalLab || null)
          setMiniDentalLab(data.miniDentalLab || null)
          setContract(data.contract || null)
          setInOtherBranch(data.inOtherBranch || null)
          setAppliances(data.appliances || null)
          setDisinfectionContainer(data.disinfectionContainer || null)
          setDisposableBags(data.disposableBags || null)
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
      envHygiene,
      surfacesDisinfection,
      mainDentalLab,
      miniDentalLab,
      contract,
      inOtherBranch,
      appliances,
      disinfectionContainer,
      disposableBags
    }
    sessionStorage.setItem('lab_section_data', JSON.stringify(data))
  }, [
    isDataLoaded,
    envHygiene,
    surfacesDisinfection,
    mainDentalLab,
    miniDentalLab,
    contract,
    inOtherBranch,
    appliances,
    disinfectionContainer,
    disposableBags
  ])

  const ToggleButton = ({
    value,
    onChange,
    options
  }: {
    value: string | null,
    onChange: (val: any) => void,
    options: { value: string, label: string, color: string }[]
  }) => (
    <div className={styles.toggleGroup}>
      {options.map((option) => (
        <button
          key={option.value}
          className={`${styles.toggleBtn} ${value === option.value ? styles.toggleBtnActive : ''}`}
          onClick={() => onChange(value === option.value ? null : option.value)}
          style={value === option.value ? {
            background: option.color,
            boxShadow: `inset 3px 3px 6px rgba(0,0,0,0.2), inset -2px -2px 6px rgba(255,255,255,0.1)`
          } : {}}
        >
          {option.label}
        </button>
      ))}
    </div>
  )

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={handleBack}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>Dental Lab</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.formCard}>

          {/* Environment Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Environment</h2>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Environment Hygiene Inspection</label>
              <ToggleButton
                value={envHygiene}
                onChange={setEnvHygiene}
                options={[
                  { value: "good", label: "Good", color: "#10b981" },
                  { value: "not-good", label: "Not Good", color: "#ef4444" }
                ]}
              />
            </div>
          </div>

          {/* Disinfection Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Disinfection</h2>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Surfaces Disinfection</label>
              <ToggleButton
                value={surfacesDisinfection}
                onChange={setSurfacesDisinfection}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>
          </div>

          {/* Types Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Types</h2>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Main Dental Lab</label>
              <ToggleButton
                value={mainDentalLab}
                onChange={setMainDentalLab}
                options={[
                  { value: "available", label: "Available", color: "#059669" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Mini Dental Lab</label>
              <ToggleButton
                value={miniDentalLab}
                onChange={setMiniDentalLab}
                options={[
                  { value: "available", label: "Available", color: "#059669" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Contract</label>
              <ToggleButton
                value={contract}
                onChange={setContract}
                options={[
                  { value: "available", label: "Available", color: "#059669" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>IN Other Branch</label>
              <ToggleButton
                value={inOtherBranch}
                onChange={setInOtherBranch}
                options={[
                  { value: "available", label: "Available", color: "#059669" }
                ]}
              />
            </div>
          </div>

          {/* Impression Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Impression</h2>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Appliances</label>
              <ToggleButton
                value={appliances}
                onChange={setAppliances}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Disinfection Container</label>
              <ToggleButton
                value={disinfectionContainer}
                onChange={setDisinfectionContainer}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Disposable Bags</label>
              <ToggleButton
                value={disposableBags}
                onChange={setDisposableBags}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
