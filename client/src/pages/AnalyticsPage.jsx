import { useState } from "react";
import GenreYearTab from "./analytics/GenreYearTab";
import TopActorsTab from "./analytics/TopActorsTab";
import ActorPairsTab from "./analytics/ActorPairsTab";
import styles from "./AnalyticsPage.module.css";

const TABS = [
  { id: "genre-year", label: "Movies by Genre & Year" },
  { id: "top-actors", label: "Top Actors by Gross" },
  { id: "actor-pairs", label: "Actor Pairs" },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("genre-year");

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Analytics</h1>
        <p>Explore trends across genres, actors, and box-office performance.</p>
      </header>

      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === "genre-year" && <GenreYearTab />}
        {activeTab === "top-actors" && <TopActorsTab />}
        {activeTab === "actor-pairs" && <ActorPairsTab />}
      </div>
    </div>
  );
}
