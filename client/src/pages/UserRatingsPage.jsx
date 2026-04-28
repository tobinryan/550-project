import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getUserRatings } from "../api/ratings";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import styles from "./UserRatingsPage.module.css";

function fmtDate(ts) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}

function StarRating({ value }) {
  const filled = Math.round(value * 2) / 2;
  return <span className={styles.stars} title={value}>{filled}/5</span>;
}

export default function UserRatingsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getUserRatings(userId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <LoadingSpinner message="Loading ratings…" />;
  if (error) return <div className={styles.page}><ErrorMessage message={error} /></div>;
  if (!data) return null;

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}>← Back</Link>

      <header className={styles.header}>
        <h1>User {data.userId}</h1>
        <p className={styles.sub}>{data.ratings.length} most recent ratings</p>
      </header>

      {data.ratings.length === 0 ? (
        <p className={styles.empty}>No ratings found for this user.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Movie ID</th>
              <th>Rating</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.ratings.map((r) => (
              <tr key={r.movieId} className={styles.row}
                onClick={() => navigate(`/movies/${r.movieId}`)}>
                <td className={styles.movieId}>{r.movieId}</td>
                <td><StarRating value={r.rating} /></td>
                <td>{fmtDate(r.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
