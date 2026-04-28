import { useState } from "react";
import { getActorPairs } from "../../api/analytics";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorMessage from "../../components/ErrorMessage";
import RatingBadge from "../../components/RatingBadge";
import styles from "./TabShared.module.css";

export default function ActorPairsTab() {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(100);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await getActorPairs(limit);
      setResults(data.pairs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className={styles.hint}>
        Actor pairs who appeared together in 3+ movies, ranked by average shared-movie rating.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.field}>
          <span>Max pairs</span>
          <input type="number" value={limit} min="1" max="500"
            onChange={(e) => setLimit(Number(e.target.value))} className={styles.numInput} />
        </label>
        <button type="submit" className={styles.btn} disabled={loading}>Run</button>
      </form>

      {loading && <LoadingSpinner />}
      {error && <ErrorMessage message={error} />}

      {results && !loading && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Actor 1</th>
                <th>Actor 2</th>
                <th>Shared Films</th>
                <th>Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {results.map((p, i) => (
                <tr key={`${p.actor1Id}-${p.actor2Id}`}>
                  <td className={styles.rank}>#{i + 1}</td>
                  <td>
                    <button className={styles.actorLink}
                      onClick={() => navigate(`/actors/${p.actor1Id}`)}>
                      {p.actor1Name}
                    </button>
                  </td>
                  <td>
                    <button className={styles.actorLink}
                      onClick={() => navigate(`/actors/${p.actor2Id}`)}>
                      {p.actor2Name}
                    </button>
                  </td>
                  <td>{p.sharedMovies}</td>
                  <td><RatingBadge value={p.avgSharedRating} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
