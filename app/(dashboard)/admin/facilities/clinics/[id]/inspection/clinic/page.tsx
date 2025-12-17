"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import styles from "./styles.module.css"
import { getInspectionClinicSection, type InspectionTask } from "@/lib/api/inspections"

export default function ClinicPage() {
  const router = useRouter()

  // Database state
  const [inspectionTaskId, setInspectionTaskId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDataLoaded, setIsDataLoaded] = useState(false)

  // Environment Section
  const [envHygiene, setEnvHygiene] = useState<"good" | "not-good" | null>(null)

  // Hand Washing Section
  const [washingFacilities, setWashingFacilities] = useState<"available" | "not-available" | null>(null)
  const [dryingFacilities, setDryingFacilities] = useState<"available" | "not-available" | null>(null)
  const [disinfectant, setDisinfectant] = useState<"available" | "not-available" | null>(null)

  // Protective Barriers
  const [sterileGloves, setSterileGloves] = useState<"available" | "not-available" | null>(null)
  const [nonSterileGloves, setNonSterileGloves] = useState<"available" | "not-available" | null>(null)
  const [masks, setMasks] = useState<"available" | "not-available" | null>(null)
  const [coatGown, setCoatGown] = useState<"available" | "not-available" | null>(null)
  const [glassesFaceShield, setGlassesFaceShield] = useState<"available" | "not-available" | null>(null)

  // Use of Disposable
  const [hve, setHve] = useState<"available" | "not-available" | null>(null)
  const [salivaEjectors, setSalivaEjectors] = useState<"available" | "not-available" | null>(null)
  const [disposableCovers, setDisposableCovers] = useState<"available" | "not-available" | null>(null)
  const [cups, setCups] = useState<"available" | "not-available" | null>(null)
  const [bib, setBib] = useState<"available" | "not-available" | null>(null)
  const [disposableMirrors, setDisposableMirrors] = useState<"available" | "not-available" | null>(null)
  const [disposableTrays, setDisposableTrays] = useState<"available" | "not-available" | null>(null)
  const [airWaterSyringe, setAirWaterSyringe] = useState<"available" | "not-available" | null>(null)

  // Disinfection
  const [surfacesDisinfection, setSurfacesDisinfection] = useState<"available" | "not-available" | null>(null)
  const [impressionDisinfection, setImpressionDisinfection] = useState<"available" | "not-available" | null>(null)
  const [disinfectionContainer, setDisinfectionContainer] = useState<"available" | "not-available" | null>(null)
  const [disposableBags, setDisposableBags] = useState<"available" | "not-available" | null>(null)

  // Load inspection data from database
  const loadInspectionData = useCallback(async () => {
    try {
      setIsLoading(true)
      console.log('🏥 Clinic page loading...')

      // Check if we have unsaved data in sessionStorage first
      const savedData = sessionStorage.getItem('clinic_section_data')
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          setEnvHygiene(data.envHygiene)
          setWashingFacilities(data.washingFacilities)
          setDryingFacilities(data.dryingFacilities)
          setDisinfectant(data.disinfectant)
          setSterileGloves(data.sterileGloves)
          setNonSterileGloves(data.nonSterileGloves)
          setMasks(data.masks)
          setCoatGown(data.coatGown)
          setGlassesFaceShield(data.glassesFaceShield)
          setHve(data.hve)
          setSalivaEjectors(data.salivaEjectors)
          setDisposableCovers(data.disposableCovers)
          setCups(data.cups)
          setBib(data.bib)
          setDisposableMirrors(data.disposableMirrors)
          setDisposableTrays(data.disposableTrays)
          setAirWaterSyringe(data.airWaterSyringe)
          setSurfacesDisinfection(data.surfacesDisinfection)
          setImpressionDisinfection(data.impressionDisinfection)
          setDisinfectionContainer(data.disinfectionContainer)
          setDisposableBags(data.disposableBags)
          setIsLoading(false)
          setIsDataLoaded(true)
          return // Use sessionStorage data instead of database
        } catch (error) {
          console.error('Error loading from sessionStorage:', error)
        }
      }

      // If no sessionStorage data, try to load from database
      const taskId = sessionStorage.getItem('current_inspection_task_id')
      if (taskId) {
        console.log('📥 Loading from database with task ID:', taskId)
        setInspectionTaskId(taskId)

        const inspectionData = await getInspectionClinicSection(taskId)

        if (inspectionData) {
          console.log('✅ Loaded clinic data from database')
          // Load clinic section data
          setEnvHygiene(inspectionData.clinic_environment_hygiene as any)
          setWashingFacilities(inspectionData.clinic_washing_facilities as any)
          setDryingFacilities(inspectionData.clinic_drying_facilities as any)
          setDisinfectant(inspectionData.clinic_disinfectant as any)
          setSterileGloves(inspectionData.clinic_sterile_gloves as any)
          setNonSterileGloves(inspectionData.clinic_non_sterile_gloves as any)
          setMasks(inspectionData.clinic_masks as any)
          setCoatGown(inspectionData.clinic_coat_gown as any)
          setGlassesFaceShield(inspectionData.clinic_glasses_face_shield as any)
          setHve(inspectionData.clinic_hve as any)
          setSalivaEjectors(inspectionData.clinic_saliva_ejectors as any)
          setDisposableCovers(inspectionData.clinic_disposable_covers as any)
          setCups(inspectionData.clinic_cups as any)
          setBib(inspectionData.clinic_bib as any)
          setDisposableMirrors(inspectionData.clinic_disposable_mirrors as any)
          setDisposableTrays(inspectionData.clinic_disposable_trays as any)
          setAirWaterSyringe(inspectionData.clinic_air_water_syringe as any)
          setSurfacesDisinfection(inspectionData.clinic_surfaces_disinfection as any)
          setImpressionDisinfection(inspectionData.clinic_impression_disinfection as any)
          setDisinfectionContainer(inspectionData.clinic_disinfection_container as any)
          setDisposableBags(inspectionData.clinic_disposable_bags as any)
        } else {
          console.log('ℹ️ No clinic data found in database, starting fresh')
        }
      } else {
        console.log('ℹ️ No task ID in sessionStorage, starting with empty form')
      }

      setIsDataLoaded(true)
    } catch (error) {
      console.error('Error loading inspection data:', error)
      alert('حدث خطأ في تحميل البيانات')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Load data on mount
  useEffect(() => {
    loadInspectionData()
  }, [loadInspectionData])

  // Auto-save to sessionStorage whenever data changes (only after initial load)
  useEffect(() => {
    // Don't save until data is loaded for the first time
    if (!isDataLoaded) return

    const data = {
      envHygiene,
      washingFacilities,
      dryingFacilities,
      disinfectant,
      sterileGloves,
      nonSterileGloves,
      masks,
      coatGown,
      glassesFaceShield,
      hve,
      salivaEjectors,
      disposableCovers,
      cups,
      bib,
      disposableMirrors,
      disposableTrays,
      airWaterSyringe,
      surfacesDisinfection,
      impressionDisinfection,
      disinfectionContainer,
      disposableBags
    }
    sessionStorage.setItem('clinic_section_data', JSON.stringify(data))
  }, [
    isDataLoaded,
    envHygiene,
    washingFacilities,
    dryingFacilities,
    disinfectant,
    sterileGloves,
    nonSterileGloves,
    masks,
    coatGown,
    glassesFaceShield,
    hve,
    salivaEjectors,
    disposableCovers,
    cups,
    bib,
    disposableMirrors,
    disposableTrays,
    airWaterSyringe,
    surfacesDisinfection,
    impressionDisinfection,
    disinfectionContainer,
    disposableBags
  ])

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

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <button className={styles.backBtn} onClick={handleBack}>
              &gt;
            </button>
            <h1 className={styles.pageTitle}>Clinic</h1>
          </div>
        </div>
        <div className={styles.container}>
          <div className={styles.formCard}>
            <p>جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={handleBack}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>Clinic</h1>
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

          {/* Hand Washing Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Hand Washing</h2>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Washing Facilities</label>
              <ToggleButton
                value={washingFacilities}
                onChange={setWashingFacilities}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Drying Facilities</label>
              <ToggleButton
                value={dryingFacilities}
                onChange={setDryingFacilities}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Disinfectant (Hand Rub)</label>
              <ToggleButton
                value={disinfectant}
                onChange={setDisinfectant}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>
          </div>

          {/* Protective Barriers Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Protective Barriers</h2>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Sterile Gloves</label>
              <ToggleButton
                value={sterileGloves}
                onChange={setSterileGloves}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Non-Sterile Gloves</label>
              <ToggleButton
                value={nonSterileGloves}
                onChange={setNonSterileGloves}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Masks</label>
              <ToggleButton
                value={masks}
                onChange={setMasks}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Coat or Gown</label>
              <ToggleButton
                value={coatGown}
                onChange={setCoatGown}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Glasses or Face Shield</label>
              <ToggleButton
                value={glassesFaceShield}
                onChange={setGlassesFaceShield}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>
          </div>

          {/* Use of Disposable Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Use of Disposable</h2>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>H.V.E</label>
              <ToggleButton
                value={hve}
                onChange={setHve}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Saliva Ejectors</label>
              <ToggleButton
                value={salivaEjectors}
                onChange={setSalivaEjectors}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Disposable Covers</label>
              <ToggleButton
                value={disposableCovers}
                onChange={setDisposableCovers}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Cups</label>
              <ToggleButton
                value={cups}
                onChange={setCups}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Bib</label>
              <ToggleButton
                value={bib}
                onChange={setBib}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Disposable Mirrors</label>
              <ToggleButton
                value={disposableMirrors}
                onChange={setDisposableMirrors}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Disposable Imp. Trays</label>
              <ToggleButton
                value={disposableTrays}
                onChange={setDisposableTrays}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
                ]}
              />
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Air / Water Syringe Nozzles</label>
              <ToggleButton
                value={airWaterSyringe}
                onChange={setAirWaterSyringe}
                options={[
                  { value: "available", label: "Available", color: "#059669" },
                  { value: "not-available", label: "Not Available", color: "#9ca3af" }
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

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>Impression Disinfection</label>
              <ToggleButton
                value={impressionDisinfection}
                onChange={setImpressionDisinfection}
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
