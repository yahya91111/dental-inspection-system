"use client"

import { useState, useEffect } from "react"
import styles from "./ClinicModal.module.css"

interface ClinicModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (clinicData: ClinicData) => void
  initialData?: ClinicData
  mode: "add" | "edit"
}

export interface ClinicData {
  name: string
  address: string
  phone: string
}

export default function ClinicModal({ isOpen, onClose, onSave, initialData, mode }: ClinicModalProps) {
  const [formData, setFormData] = useState<ClinicData>({
    name: "",
    address: "",
    phone: ""
  })

  // Reset form when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({ name: "", address: "", phone: "" })
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation - only clinic name is required
    if (!formData.name.trim()) {
      alert("الرجاء إدخال اسم العيادة")
      return
    }

    onSave(formData)
    onClose()
  }

  const handleCancel = () => {
    setFormData({ name: "", address: "", phone: "" })
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={handleCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {mode === "add" ? "إضافة عيادة جديدة" : "تعديل معلومات العيادة"}
          </h2>
          <button className={styles.closeBtn} onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Clinic Name */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              اسم العيادة <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أدخل اسم العيادة..."
              autoFocus
              required
            />
          </div>

          {/* Address */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              العنوان <span className={styles.optional}>(اختياري)</span>
            </label>
            <input
              type="text"
              className={styles.input}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="أدخل عنوان العيادة..."
            />
          </div>

          {/* Phone */}
          <div className={styles.formGroup}>
            <label className={styles.label}>
              الهاتف <span className={styles.optional}>(اختياري)</span>
            </label>
            <input
              type="tel"
              className={styles.input}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="أدخل رقم الهاتف..."
              dir="ltr"
            />
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
              إلغاء
            </button>
            <button type="submit" className={styles.saveBtn}>
              {mode === "add" ? "إضافة" : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
