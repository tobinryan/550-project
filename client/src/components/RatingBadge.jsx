import styles from "./RatingBadge.module.css";

export default function RatingBadge({ value }) {
  if (value == null) return <span className={styles.na}>N/A</span>;
  const num = Number(value).toFixed(1);
  const cls = value >= 7 ? styles.high : value >= 5 ? styles.mid : styles.low;
  return <span className={`${styles.badge} ${cls}`}>{num}</span>;
}
