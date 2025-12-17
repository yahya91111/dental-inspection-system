"use client"

import { useRouter } from "next/navigation"
import styles from "./styles.module.css"

export default function DesignPreview() {
  const router = useRouter()

  return (
    <div className={styles.previewPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            ← العودة
          </button>
          <h1 className={styles.pageTitle}>معاينة التصاميم</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        {/* Section 1: Current Glow Design */}
        <section className={styles.designSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>1. Current Glow Design (التصميم الحالي)</h2>
            <p className={styles.sectionDesc}>
              تصميم عصري مع تأثيرات توهج (Glow) وظلال متعددة الطبقات - يعطي إحساس بالعمق والحيوية
            </p>
          </div>
          <div className={styles.cardsGrid}>
            <div className={styles.glowCard}>
              <h3 className={styles.cardTitle}>Health Facilities</h3>
            </div>
            <div className={styles.glowCard}>
              <h3 className={styles.cardTitle}>Members</h3>
            </div>
            <div className={styles.glowCard}>
              <h3 className={styles.cardTitle}>Tasks</h3>
            </div>
            <div className={styles.glowCard}>
              <h3 className={styles.cardTitle}>Statistics</h3>
            </div>
          </div>
        </section>

        {/* Section 2: Glass Morphism */}
        <section className={styles.designSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>2. Glass Morphism (التأثير الزجاجي)</h2>
            <p className={styles.sectionDesc}>
              تصميم عصري بتأثير زجاجي شفاف مع Blur - يعطي إحساس بالأناقة والحداثة
            </p>
          </div>
          <div className={`${styles.cardsGrid} ${styles.glassBackground}`}>
            <div className={styles.glassCard}>
              <h3 className={styles.cardTitle}>Health Facilities</h3>
            </div>
            <div className={styles.glassCard}>
              <h3 className={styles.cardTitle}>Members</h3>
            </div>
            <div className={styles.glassCard}>
              <h3 className={styles.cardTitle}>Tasks</h3>
            </div>
            <div className={styles.glassCard}>
              <h3 className={styles.cardTitle}>Statistics</h3>
            </div>
          </div>
        </section>

        {/* Section 3: Neumorphism */}
        <section className={styles.designSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>3. Neumorphism (التصميم الناعم 3D)</h2>
            <p className={styles.sectionDesc}>
              تصميم بارز بظلال داخلية وخارجية - يعطي إحساس بالفخامة والرقي
            </p>
          </div>
          <div className={`${styles.cardsGrid} ${styles.neuBackground}`}>
            <div className={styles.neuCard}>
              <h3 className={styles.neuCardTitle}>Health Facilities</h3>
            </div>
            <div className={styles.neuCard}>
              <h3 className={styles.neuCardTitle}>Members</h3>
            </div>
            <div className={styles.neuCard}>
              <h3 className={styles.neuCardTitle}>Tasks</h3>
            </div>
            <div className={styles.neuCard}>
              <h3 className={styles.neuCardTitle}>Statistics</h3>
            </div>
          </div>
        </section>

        {/* Section 4: Minimal Clean */}
        <section className={styles.designSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>4. Minimal Clean (التصميم النظيف البسيط)</h2>
            <p className={styles.sectionDesc}>
              تصميم نظيف بدون تأثيرات زائدة - يعطي إحساس بالوضوح والاحترافية
            </p>
          </div>
          <div className={styles.cardsGrid}>
            <div className={styles.minimalCard}>
              <h3 className={styles.minimalCardTitle}>Health Facilities</h3>
            </div>
            <div className={styles.minimalCard}>
              <h3 className={styles.minimalCardTitle}>Members</h3>
            </div>
            <div className={styles.minimalCard}>
              <h3 className={styles.minimalCardTitle}>Tasks</h3>
            </div>
            <div className={styles.minimalCard}>
              <h3 className={styles.minimalCardTitle}>Statistics</h3>
            </div>
          </div>
        </section>

        {/* Final Note */}
        <div className={styles.finalNote}>
          <p>💡 جرب التمرير فوق الكروت لرؤية التأثيرات التفاعلية!</p>
          <button className={styles.selectBtn} onClick={() => router.back()}>
            اختر التصميم المفضل
          </button>
        </div>
      </div>
    </div>
  )
}
