import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { getTopActorsByGross } from "../../api/analytics";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import styles from "./TabShared.module.css";

const CHART_COLORS = [
  "#f59e0b", "#fbbf24", "#fcd34d", "#fde68a", "#fef3c7",
  "#d97706", "#b45309", "#92400e", "#78350f", "#451a03",
];

function fmtM(num) {
  if (num == null) return "—";
  return "$" + (Number(num) / 1_000_000).toFixed(1) + "M";
}

export default function TopActorsTab() {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(15);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await getTopActorsByGross(limit);
      setResults(data.actors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          <span>Top N actors</span>
          <input type="number" value={limit} min="1" max="100"
            onChange={(e) => setLimit(Number(e.target.value))} className={styles.numInput} />
        </label>
        <button type="submit" className={styles.btn} disabled={loading}>Run</button>
      </form>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}

      {results && !loading && (
        <>
          <div className={styles.chartWrap}>
            <h3 className={styles.chartTitle}>Average Box-Office Gross per Actor</h3>
            <ResponsiveContainer width="100%" height={Math.max(300, results.length * 32)}>
              <BarChart data={results} layout="vertical" margin={{ left: 20, right: 60 }}>
                <XAxis type="number" tickFormatter={(v) => "$" + (v / 1e6).toFixed(0) + "M"}
                  tick={{ fill: "#64748b", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={160}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  tickFormatter={(v) => v.length > 20 ? v.slice(0, 18) + "…" : v}
                />
                <Tooltip
                  formatter={(v) => [fmtM(v), "Avg Gross"]}
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0" }}
                />
                <Bar dataKey="avgGross" radius={[0, 4, 4, 0]}>
                  {results.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Name</th>
                  <th>Movies</th>
                  <th>Avg Gross</th>
                </tr>
              </thead>
              <tbody>
                {results.map((a, i) => (
                  <tr key={a.actorId} className={styles.clickRow}
                    onClick={() => navigate(`/actors/${a.actorId}`)}>
                    <td className={styles.rank}>#{i + 1}</td>
                    <td className={styles.name}>{a.name}</td>
                    <td>{a.numMovies}</td>
                    <td>{fmtM(a.avgGross)}</td>
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
