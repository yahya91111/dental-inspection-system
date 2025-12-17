"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import styles from "./styles.module.css"

export default function SterilizationPage() {
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

  // Cleaning of Instruments
  const [manualWash, setManualWash] = useState<"available" | "not-available" | null>(null)
  const [ultrasonicMachine, setUltrasonicMachine] = useState<"available" | "not-available" | null>(null)
  const [washerDisinfector, setWasherDisinfector] = useState<"available" | "not-available" | null>(null)

  // Drying of Instruments
  const [lintFreeTowels, setLintFreeTowels] = useState<"available" | "not-available" | null>(null)
  const [dryer, setDryer] = useState<"available" | "not-available" | null>(null)

  // Sterilization Room Number
  const [sterilizationRoomNumber, setSterilizationRoomNumber] = useState("")

  // Numbers of Autoclaves
  const [numberOfAutoclaves, setNumberOfAutoclaves] = useState("")

  // Types of Tests
  const [biologicalTest, setBiologicalTest] = useState<"available" | "not-available" | null>(null)
  const [bdTest, setBdTest] = useState<"available" | "not-available" | null>(null)
  const [leakTest, setLeakTest] = useState<"available" | "not-available" | null>(null)
  const [periodicReport, setPeriodicReport] = useState<"available" | "not-available" | null>(null)

  // Waste Disposal
  const [infectiousWasteNonSharp, setInfectiousWasteNonSharp] = useState<"available" | "not-available" | null>(null)
  const [infectiousWasteSharp, setInfectiousWasteSharp] = useState<"available" | "not-available" | null>(null)
  const [nonInfectiousWaste, setNonInfectiousWaste] = useState<"available" | "not-available" | null>(null)

  // Load inspection data from sessionStorage or database
  const loadInspectionData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Check sessionStorage first
      const savedData = sessionStorage.getItem('sterilization_section_data')
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          setManualWash(data.manualWash || null)
          setUltrasonicMachine(data.ultrasonicMachine || null)
          setWasherDisinfector(data.washerDisinfector || null)
          setLintFreeTowels(data.lintFreeTowels || null)
          setDryer(data.dryer || null)
          setSterilizationRoomNumber(data.sterilizationRoomNumber || "")
          setNumberOfAutoclaves(data.numberOfAutoclaves || "")
          setBiologicalTest(data.biologicalTest || null)
          setBdTest(data.bdTest || null)
          setLeakTest(data.leakTest || null)
          setPeriodicReport(data.periodicReport || null)
          setInfectiousWasteNonSharp(data.infectiousWasteNonSharp || null)
          setInfectiousWasteSharp(data.infectiousWasteSharp || null)
          setNonInfectiousWaste(data.nonInfectiousWaste || null)
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
      manualWash,
      ultrasonicMachine,
      washerDisinfector,
      lintFreeTowels,
      dryer,
      sterilizationRoomNumber,
      numberOfAutoclaves,
      biologicalTest,
      bdTest,
      leakTest,
      periodicReport,
      infectiousWasteNonSharp,
      infectiousWasteSharp,
      nonInfectiousWaste
    }
    sessionStorage.setItem('sterilization_section_data', JSON.stringify(data))
  }, [
    isDataLoaded,
    manualWash,
    ultrasonicMachine,
    washerDisinfector,
    lintFreeTowels,
    dryer,
    sterilizationRoomNumber,
    numberOfAutoclaves,
    biologicalTest,
    bdTest,
    leakTest,
    periodicReport,
    infectiousWasteNonSharp,
    infectiousWasteSharp,
    nonInfectiousWaste
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
          <h1 className={styles.pageTitle}>Sterilization Room</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.formCard}>

          {/* Cleaning of Instruments Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Cleaning of Instruments</h2>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Manual Wash</label>
              <ToggleButton
                value={manualWash}
                onChange={setManualWash}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Ultrasonic Machine</label>
              <ToggleButton
                value={ultrasonicMachine}
                onChange={setUltrasonicMachine}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Washer Disinfector</label>
              <ToggleButton
                value={washerDisinfector}
                onChange={setWasherDisinfector}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>
          </div>

          {/* Drying of Instruments Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Drying of Instruments</h2>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Lint Free Towels</label>
              <ToggleButton
                value={lintFreeTowels}
                onChange={setLintFreeTowels}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Dryer</label>
              <ToggleButton
                value={dryer}
                onChange={setDryer}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>
          </div>

          {/* Sterilization Room Number Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Sterilization Room Number</h2>
            <input
              type="text"
              className={styles.numberInput}
              value={sterilizationRoomNumber}
              onChange={(e) => setSterilizationRoomNumber(e.target.value)}
              placeholder="Enter sterilization room number"
            />
          </div>

          {/* Numbers of Autoclaves Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Numbers of Autoclaves</h2>
            <input
              type="text"
              className={styles.numberInput}
              value={numberOfAutoclaves}
              onChange={(e) => setNumberOfAutoclaves(e.target.value)}
              placeholder="Enter number of autoclaves"
            />
          </div>

          {/* Types of Tests Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Types of Tests</h2>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Biological Test</label>
              <ToggleButton
                value={biologicalTest}
                onChange={setBiologicalTest}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>B & D Test</label>
              <ToggleButton
                value={bdTest}
                onChange={setBdTest}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Leak Test</label>
              <ToggleButton
                value={leakTest}
                onChange={setLeakTest}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Periodically Report Maintenance of Autoclaves</label>
              <ToggleButton
                value={periodicReport}
                onChange={setPeriodicReport}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>
          </div>

          {/* Waste Disposal Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Waste Disposal</h2>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                1- Infectious Waste (Non Sharp) - Yellow Labeled Bags
              </label>
              <ToggleButton
                value={infectiousWasteNonSharp}
                onChange={setInfectiousWasteNonSharp}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                2- Infectious Waste (Sharp) - Sharp Container
              </label>
              <ToggleButton
                value={infectiousWasteSharp}
                onChange={setInfectiousWasteSharp}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                3- Non Infectious and Non-Hazardous Waste - Color Coded Plastic Bags
              </label>
              <ToggleButton
                value={nonInfectiousWaste}
                onChange={setNonInfectiousWaste}
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
