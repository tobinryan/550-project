import { useNavigate } from "react-router-dom";
import RatingBadge from "./RatingBadge";
import styles from "./MovieTable.module.css";

export default function MovieTable({ movies }) {
  const navigate = useNavigate();
  if (!movies?.length) return <p className={styles.empty}>No movies found.</p>;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Title</th>
          <th>Year</th>
          <th>Rating</th>
        </tr>
      </thead>
      <tbody>
        {movies.map((m) => (
          <tr key={m.imdbId} onClick={() => navigate(`/movies/${m.imdbId}`)} className={styles.row}>
            <td>{m.primaryTitle}</td>
            <td>{m.startYear ?? "—"}</td>
            <td><RatingBadge value={m.voteAverage} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
