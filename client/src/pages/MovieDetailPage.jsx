import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getMovie, getMovieGenres, getMovieCast } from "../api/movies";
import RatingBadge from "../components/RatingBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import styles from "./MovieDetailPage.module.css";

function fmt(num) {
  if (num == null || num === 0) return "—";
  return "$" + Number(num).toLocaleString();
}

export default function MovieDetailPage() {
  const { imdbId } = useParams();

  const [movie, setMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getMovie(imdbId),
      getMovieGenres(imdbId),
      getMovieCast(imdbId),
    ])
      .then(([m, g, c]) => {
        setMovie(m);
        setGenres(g.genres);
        setCast(c.cast);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [imdbId]);

  if (loading) return <LoadingSpinner message="Loading movie…" />;
  if (error) return <div className={styles.page}><ErrorMessage message={error} /></div>;
  if (!movie) return null;

  const actors = cast.filter((c) => c.job === "Actor" || c.job === "actress");
  const crew = cast.filter((c) => c.job !== "Actor" && c.job !== "actress");

  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}>← Back to Search</Link>

      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h1>{movie.primaryTitle}</h1>
          {movie.originalTitle !== movie.primaryTitle && (
            <p className={styles.original}>Original: {movie.originalTitle}</p>
          )}
          <div className={styles.tags}>
            {genres.map((g) => (
              <span key={g} className={styles.genre}>{g}</span>
            ))}
          </div>
        </div>
        <RatingBadge value={movie.voteAverage} />
      </div>

      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.label}>Year</span>
          <span>{movie.startYear ?? "—"}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.label}>Runtime</span>
          <span>{movie.runtimeMinutes ? `${movie.runtimeMinutes} min` : "—"}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.label}>Votes</span>
          <span>{movie.voteCount ? Number(movie.voteCount).toLocaleString() : "—"}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.label}>Revenue</span>
          <span>{fmt(movie.revenue)}</span>
        </div>
      </div>

      <div className={styles.body}>
        <section className={styles.section}>
          <h2>Cast</h2>
          {actors.length === 0 ? (
            <p className={styles.empty}>No cast data.</p>
          ) : (
            <div className={styles.castGrid}>
              {actors.map((p, i) => (
                <span key={i} className={styles.person}>{p.name}</span>
              ))}
            </div>
          )}
        </section>

        {crew.length > 0 && (
          <section className={styles.section}>
            <h2>Crew</h2>
            <table className={styles.crewTable}>
              <tbody>
                {crew.map((p, i) => (
                  <tr key={i}>
                    <td className={styles.crewName}>{p.name}</td>
                    <td className={styles.crewJob}>{p.job}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    </div>
  );
}
