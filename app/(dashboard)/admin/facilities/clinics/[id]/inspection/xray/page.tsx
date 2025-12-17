"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import styles from "./styles.module.css"

export default function XRayPage() {
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

  // X-RAY Room Section
  const [envHygiene, setEnvHygiene] = useState<"good" | "not-good" | null>(null)
  const [protectiveBarriers, setProtectiveBarriers] = useState<"available" | "not-available" | null>(null)
  const [surfacesDisinfection, setSurfacesDisinfection] = useState<"available" | "not-available" | null>(null)
  const [gloves, setGloves] = useState<"available" | "not-available" | null>(null)
  const [trashBasket, setTrashBasket] = useState<"available" | "not-available" | null>(null)
  const [leadApron, setLeadApron] = useState<"available" | "not-available" | null>(null)

  // X-RAY Types Section
  const [paType, setPaType] = useState<"fixed" | "mobile" | null>(null)
  const [paAvailable, setPaAvailable] = useState<"available" | "not-available" | null>(null)
  const [paNumber, setPaNumber] = useState("")

  const [opgAvailable, setOpgAvailable] = useState<"available" | "not-available" | null>(null)
  const [opgNumber, setOpgNumber] = useState("")

  const [cephalometricAvailable, setCephalometricAvailable] = useState<"available" | "not-available" | null>(null)
  const [cephalometricNumber, setCephalometricNumber] = useState("")

  const [cbctAvailable, setCbctAvailable] = useState<"available" | "not-available" | null>(null)
  const [cbctNumber, setCbctNumber] = useState("")

  const [rpdLicense, setRpdLicense] = useState<"available" | "not-available" | null>(null)

  // Load inspection data from sessionStorage or database
  const loadInspectionData = useCallback(async () => {
    try {
      setIsLoading(true)

      const savedData = sessionStorage.getItem('xray_section_data')
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          setEnvHygiene(data.envHygiene || null)
          setProtectiveBarriers(data.protectiveBarriers || null)
          setSurfacesDisinfection(data.surfacesDisinfection || null)
          setGloves(data.gloves || null)
          setTrashBasket(data.trashBasket || null)
          setLeadApron(data.leadApron || null)
          setPaType(data.paType || null)
          setPaAvailable(data.paAvailable || null)
          setPaNumber(data.paNumber || "")
          setOpgAvailable(data.opgAvailable || null)
          setOpgNumber(data.opgNumber || "")
          setCephalometricAvailable(data.cephalometricAvailable || null)
          setCephalometricNumber(data.cephalometricNumber || "")
          setCbctAvailable(data.cbctAvailable || null)
          setCbctNumber(data.cbctNumber || "")
          setRpdLicense(data.rpdLicense || null)
          setIsLoading(false)
          setIsDataLoaded(true)
          return
        } catch (error) {
          console.error('Error loading from sessionStorage:', error)
        }
      }

      setIsDataLoaded(true)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInspectionData()
  }, [loadInspectionData])

  // Auto-save to sessionStorage
  useEffect(() => {
    if (!isDataLoaded) return

    const data = {
      envHygiene,
      protectiveBarriers,
      surfacesDisinfection,
      gloves,
      trashBasket,
      leadApron,
      paType,
      paAvailable,
      paNumber,
      opgAvailable,
      opgNumber,
      cephalometricAvailable,
      cephalometricNumber,
      cbctAvailable,
      cbctNumber,
      rpdLicense
    }
    sessionStorage.setItem('xray_section_data', JSON.stringify(data))
  }, [
    isDataLoaded, envHygiene, protectiveBarriers, surfacesDisinfection, gloves, trashBasket, leadApron,
    paType, paAvailable, paNumber, opgAvailable, opgNumber, cephalometricAvailable, cephalometricNumber,
    cbctAvailable, cbctNumber, rpdLicense
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
          <h1 className={styles.pageTitle}>X-RAY Room</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.formCard}>

          {/* X-RAY Room Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>X-RAY Room</h2>

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

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Protective Barriers</label>
              <ToggleButton
                value={protectiveBarriers}
                onChange={setProtectiveBarriers}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

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

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Gloves</label>
              <ToggleButton
                value={gloves}
                onChange={setGloves}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Trash Basket</label>
              <ToggleButton
                value={trashBasket}
                onChange={setTrashBasket}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Lead Apron</label>
              <ToggleButton
                value={leadApron}
                onChange={setLeadApron}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>
          </div>

          {/* X-RAY Types Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>X-RAY Types</h2>

            {/* P.A (Peri-Apical) */}
            <div className={styles.typeCard}>
              <h3 className={styles.typeTitle}>P.A (Peri-Apical)</h3>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>Type</label>
                <ToggleButton
                  value={paType}
                  onChange={setPaType}
                  options={[
                    { value: "fixed", label: "Fixed", color: "#059669" },
                    { value: "mobile", label: "Mobile", color: "#0891b2" }
                  ]}
                />
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>Available</label>
                <ToggleButton
                  value={paAvailable}
                  onChange={setPaAvailable}
                  options={[
                    { value: "yes", label: "Yes", color: "#059669" }
                  ]}
                />
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>Number</label>
                <input
                  type="text"
                  className={styles.numberInput}
                  value={paNumber}
                  onChange={(e) => setPaNumber(e.target.value)}
                  placeholder="Enter number"
                />
              </div>
            </div>

            {/* O.P.G. (Panoramic) */}
            <div className={styles.typeCard}>
              <h3 className={styles.typeTitle}>O.P.G. (Panoramic)</h3>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>Available</label>
                <ToggleButton
                  value={opgAvailable}
                  onChange={setOpgAvailable}
                  options={[
                    { value: "yes", label: "Yes", color: "#059669" }
                  ]}
                />
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>Number</label>
                <input
                  type="text"
                  className={styles.numberInput}
                  value={opgNumber}
                  onChange={(e) => setOpgNumber(e.target.value)}
                  placeholder="Enter number"
                />
              </div>
            </div>

            {/* Cephalometric */}
            <div className={styles.typeCard}>
              <h3 className={styles.typeTitle}>Cephalometric</h3>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>Available</label>
                <ToggleButton
                  value={cephalometricAvailable}
                  onChange={setCephalometricAvailable}
                  options={[
                    { value: "yes", label: "Yes", color: "#059669" }
                  ]}
                />
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>Number</label>
                <input
                  type="text"
                  className={styles.numberInput}
                  value={cephalometricNumber}
                  onChange={(e) => setCephalometricNumber(e.target.value)}
                  placeholder="Enter number"
                />
              </div>
            </div>

            {/* CBCT */}
            <div className={styles.typeCard}>
              <h3 className={styles.typeTitle}>CBCT (Cone Beam CT)</h3>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>Available</label>
                <ToggleButton
                  value={cbctAvailable}
                  onChange={setCbctAvailable}
                  options={[
                    { value: "yes", label: "Yes", color: "#059669" }
                  ]}
                />
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.checkboxLabel}>Number</label>
                <input
                  type="text"
                  className={styles.numberInput}
                  value={cbctNumber}
                  onChange={(e) => setCbctNumber(e.target.value)}
                  placeholder="Enter number"
                />
              </div>
            </div>

            {/* RPD License */}
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>RPD License (Radiation Protection Device)</label>
              <ToggleButton
                value={rpdLicense}
                onChange={setRpdLicense}
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
