"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import styles from "./styles.module.css"

interface AdditionalNote {
  id: string
  title: string
  content: string
}

export default function NotesPage() {
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

  // ملاحظات مجمعة من الصفحات الأخرى
  const [clinicNotes, setClinicNotes] = useState("")
  const [sterilizationNotes, setSterilizationNotes] = useState("")
  const [xrayNotes, setXrayNotes] = useState("")
  const [labNotes, setLabNotes] = useState("")
  const [filesNotes, setFilesNotes] = useState("")
  const [staffNotes, setStaffNotes] = useState("")

  // ملاحظات إضافية ديناميكية
  const [additionalNotes, setAdditionalNotes] = useState<AdditionalNote[]>([])

  const addNote = () => {
    const newNote: AdditionalNote = {
      id: Date.now().toString(),
      title: '',
      content: ''
    }
    setAdditionalNotes([...additionalNotes, newNote])
  }

  const removeNote = (id: string) => {
    setAdditionalNotes(additionalNotes.filter(n => n.id !== id))
  }

  const updateNoteTitle = (id: string, title: string) => {
    setAdditionalNotes(additionalNotes.map(n =>
      n.id === id ? { ...n, title } : n
    ))
  }

  const updateNoteContent = (id: string, content: string) => {
    setAdditionalNotes(additionalNotes.map(n =>
      n.id === id ? { ...n, content } : n
    ))
  }

  // Load inspection data from sessionStorage or database
  const loadInspectionData = useCallback(async () => {
    try {
      setIsLoading(true)

      // Check sessionStorage first
      const savedData = sessionStorage.getItem('notes_section_data')
      if (savedData) {
        try {
          const data = JSON.parse(savedData)
          setClinicNotes(data.clinicNotes || "")
          setSterilizationNotes(data.sterilizationNotes || "")
          setXrayNotes(data.xrayNotes || "")
          setLabNotes(data.labNotes || "")
          setFilesNotes(data.filesNotes || "")
          setStaffNotes(data.staffNotes || "")
          setAdditionalNotes(data.additionalNotes || [])
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
      clinicNotes,
      sterilizationNotes,
      xrayNotes,
      labNotes,
      filesNotes,
      staffNotes,
      additionalNotes
    }
    sessionStorage.setItem('notes_section_data', JSON.stringify(data))
  }, [
    isDataLoaded,
    clinicNotes,
    sterilizationNotes,
    xrayNotes,
    labNotes,
    filesNotes,
    staffNotes,
    additionalNotes
  ])

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={handleBack}>
            &gt;
          </button>
          <h1 className={styles.pageTitle}>الملاحظات المجمعة</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        <div className={styles.formCard}>

          {/* ملاحظات العيادة */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>ملاحظات العيادة</h2>
            <textarea
              className={styles.notesTextarea}
              value={clinicNotes}
              onChange={(e) => setClinicNotes(e.target.value)}
              placeholder="ملاحظات من صفحة العيادة..."
              rows={4}
            />
          </div>

          {/* ملاحظات غرفة التعقيم */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>ملاحظات غرفة التعقيم</h2>
            <textarea
              className={styles.notesTextarea}
              value={sterilizationNotes}
              onChange={(e) => setSterilizationNotes(e.target.value)}
              placeholder="ملاحظات من صفحة غرفة التعقيم..."
              rows={4}
            />
          </div>

          {/* ملاحظات غرفة الأشعة */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>ملاحظات غرفة الأشعة</h2>
            <textarea
              className={styles.notesTextarea}
              value={xrayNotes}
              onChange={(e) => setXrayNotes(e.target.value)}
              placeholder="ملاحظات من صفحة غرفة الأشعة..."
              rows={4}
            />
          </div>

          {/* ملاحظات المختبر */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>ملاحظات المختبر</h2>
            <textarea
              className={styles.notesTextarea}
              value={labNotes}
              onChange={(e) => setLabNotes(e.target.value)}
              placeholder="ملاحظات من صفحة المختبر..."
              rows={4}
            />
          </div>

          {/* ملاحظات الملفات */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>ملاحظات الملفات</h2>
            <textarea
              className={styles.notesTextarea}
              value={filesNotes}
              onChange={(e) => setFilesNotes(e.target.value)}
              placeholder="ملاحظات من صفحة الملفات..."
              rows={4}
            />
          </div>

          {/* ملاحظات العاملين */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>ملاحظات العاملين</h2>
            <textarea
              className={styles.notesTextarea}
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              placeholder="ملاحظات من صفحة العاملين..."
              rows={4}
            />
          </div>

          {/* ملاحظات إضافية */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>ملاحظات إضافية</h2>

            {additionalNotes.length > 0 && (
              <div className={styles.additionalNotesList}>
                {additionalNotes.map((note) => (
                  <div key={note.id} className={styles.noteCard}>
                    <div className={styles.noteHeader}>
                      <input
                        type="text"
                        className={styles.noteTitle}
                        value={note.title}
                        onChange={(e) => updateNoteTitle(note.id, e.target.value)}
                        placeholder="عنوان الملاحظة"
                      />
                      <button
                        className={styles.removeNoteBtn}
                        onClick={() => removeNote(note.id)}
                      >
                        ×
                      </button>
                    </div>
                    <textarea
                      className={styles.noteContent}
                      value={note.content}
                      onChange={(e) => updateNoteContent(note.id, e.target.value)}
                      placeholder="محتوى الملاحظة..."
                      rows={3}
                    />
                  </div>
                ))}
              </div>
            )}

            <button className={styles.addNoteBtn} onClick={addNote}>
              + إضافة ملاحظة جديدة
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
