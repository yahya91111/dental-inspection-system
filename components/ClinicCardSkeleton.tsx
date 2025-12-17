import styles from './ClinicCardSkeleton.module.css'

export default function ClinicCardSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div className={styles.shimmer}></div>
    </div>
  )
}
