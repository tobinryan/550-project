import { Link, NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.brand}>
        Movie Insights
      </Link>
      <div className={styles.links}>
        <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : undefined}>
          Search
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => isActive ? styles.active : undefined}>
          Analytics
        </NavLink>
      </div>
    </nav>
  );
}
