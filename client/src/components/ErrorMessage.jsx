import styles from "./ErrorMessage.module.css";

export default function ErrorMessage({ message }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.icon}>!</span>
      <p>{message}</p>
    </div>
  );
}
