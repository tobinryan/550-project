import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { getMoviesByGenreYear } from "../../api/analytics";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import RatingBadge from "../../components/RatingBadge";
import styles from "./TabShared.module.css";

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Family", "Fantasy", "History", "Horror", "Music", "Mystery",
  "Romance", "Science Fiction", "Thriller", "War", "Western",
];

const CHART_COLORS = ["#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7"];

export default function GenreYearTab() {
  const [genre, setGenre] = useState("Drama");
  const [startYear, setStartYear] = useState("2000");
  const [endYear, setEndYear] = useState("2015");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await getMoviesByGenreYear(genre, Number(startYear), Number(endYear));
      setResults(data.movies);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const top10 = results ? results.slice(0, 10) : [];

  return (
    <div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          <span>Genre</span>
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className={styles.select}>
            {GENRES.map((g) => <option key={g}>{g}</option>)}
          </select>
        </label>
        <label className={styles.field}>
          <span>From</span>
          <input type="number" value={startYear} min="1900" max="2030"
            onChange={(e) => setStartYear(e.target.value)} className={styles.numInput} />
        </label>
        <label className={styles.field}>
          <span>To</span>
          <input type="number" value={endYear} min="1900" max="2030"
            onChange={(e) => setEndYear(e.target.value)} className={styles.numInput} />
        </label>
        <button type="submit" className={styles.btn} disabled={loading}>Run</button>
      </form>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}

      {results && !loading && (
        <>
          {top10.length > 0 && (
            <div className={styles.chartWrap}>
              <h3 className={styles.chartTitle}>Top 10 by Avg Rating</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top10} layout="vertical" margin={{ left: 20, right: 30 }}>
                  <XAxis type="number" domain={[0, 5]} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis type="category" dataKey="primaryTitle" width={180}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(v) => v.length > 24 ? v.slice(0, 22) + "…" : v}
                  />
                  <Tooltip
                    formatter={(v) => [Number(v).toFixed(2), "Avg Rating"]}
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0" }}
                  />
                  <Bar dataKey="avgRating" radius={[0, 4, 4, 0]}>
                    {top10.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Title</th>
                  <th>Year</th>
                  <th>Avg Rating</th>
                  <th>Raters</th>
                  <th>Top Company</th>
                  <th>Language</th>
                </tr>
              </thead>
              <tbody>
                {results.map((m) => (
                  <tr key={`${m.primaryTitle}-${m.startYear}`}>
                    <td className={styles.rank}>#{m.genreRank}</td>
                    <td>{m.primaryTitle}</td>
                    <td>{m.startYear}</td>
                    <td><RatingBadge value={m.avgRating} /></td>
                    <td>{Number(m.numRaters).toLocaleString()}</td>
                    <td className={styles.company}>{m.topCompany ?? "—"}</td>
                    <td className={styles.lang}>{m.originalLanguage ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
