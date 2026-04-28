import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getActorFilmography } from "../api/actors";
import RatingBadge from "../components/RatingBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import styles from "./ActorPage.module.css";

function fmt(num) {
  if (num == null || num === 0) return "—";
  return "$" + Number(num).toLocaleString();
}

const CAREER_LABELS = { above: "Above avg", below: "Below avg", average: "Avg" };
const CAREER_CLASSES = { above: "above", below: "below", average: "avg" };

export default function ActorPage() {
  const { actorId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getActorFilmography(actorId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [actorId]);

  if (loading) return <LoadingSpinner message="Loading filmography…" />;
  if (error) return <div className={styles.page}><ErrorMessage message={error} /></div>;
  if (!data) return null;

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}>← Back to Search</Link>

      <header className={styles.header}>
        <h1>{data.actorName}</h1>
        <p className={styles.sub}>{data.movies.length} film{data.movies.length !== 1 ? "s" : ""} with financial data</p>
      </header>

      {data.movies.length === 0 ? (
        <p className={styles.empty}>No filmography data found.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Year</th>
                <th>Role</th>
                <th>Budget</th>
                <th>Revenue</th>
                <th>Avg Rating</th>
                <th>vs Career</th>
                <th>Company</th>
              </tr>
            </thead>
            <tbody>
              {data.movies.map((m) => (
                <tr
                  key={m.imdbId}
                  className={styles.row}
                  onClick={() => navigate(`/movies/${m.imdbId}`)}
                >
                  <td className={styles.title}>{m.primaryTitle}</td>
                  <td>{m.startYear ?? "—"}</td>
                  <td className={styles.role}>{m.role}</td>
                  <td>{fmt(m.budget)}</td>
                  <td>{fmt(m.revenue)}</td>
                  <td><RatingBadge value={m.avgMovieRating} /></td>
                  <td>
                    <span className={`${styles.career} ${styles[CAREER_CLASSES[m.ratingVsCareer]] ?? ""}`}>
                      {CAREER_LABELS[m.ratingVsCareer] ?? m.ratingVsCareer}
                    </span>
                  </td>
                  <td className={styles.company}>{m.productionCompany ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
