import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchMovies, getMoviesByYear } from "../api/movies";
import MovieTable from "../components/MovieTable";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const navigate = useNavigate();

  const [titleQuery, setTitleQuery] = useState("");
  const [titleResults, setTitleResults] = useState(null);
  const [titleLoading, setTitleLoading] = useState(false);
  const [titleError, setTitleError] = useState(null);

  const [startYear, setStartYear] = useState("2000");
  const [endYear, setEndYear] = useState("2010");
  const [yearResults, setYearResults] = useState(null);
  const [yearLoading, setYearLoading] = useState(false);
  const [yearError, setYearError] = useState(null);

  const [userIdInput, setUserIdInput] = useState("");

  async function handleTitleSearch(e) {
    e.preventDefault();
    if (!titleQuery.trim()) return;
    setTitleLoading(true);
    setTitleError(null);
    try {
      const data = await searchMovies(titleQuery.trim());
      setTitleResults(data.movies);
    } catch (err) {
      setTitleError(err.message);
    } finally {
      setTitleLoading(false);
    }
  }

  async function handleYearSearch(e) {
    e.preventDefault();
    setYearLoading(true);
    setYearError(null);
    try {
      const data = await getMoviesByYear(Number(startYear), Number(endYear));
      setYearResults(data.movies);
    } catch (err) {
      setYearError(err.message);
    } finally {
      setYearLoading(false);
    }
  }

  function handleUserLookup(e) {
    e.preventDefault();
    const id = userIdInput.trim();
    if (id) navigate(`/users/${id}`);
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1>Movie Insights</h1>
        <p>Search movies, explore actor profiles, and dive into analytics.</p>
      </header>

      <div className={styles.sections}>
        {/* Title search */}
        <section className={styles.card}>
          <h2>Search by Title</h2>
          <form onSubmit={handleTitleSearch} className={styles.row}>
            <input
              type="text"
              placeholder="e.g. Inception"
              value={titleQuery}
              onChange={(e) => setTitleQuery(e.target.value)}
              className={styles.input}
            />
            <button type="submit" className={styles.btn} disabled={titleLoading}>
              Search
            </button>
          </form>
          {titleLoading && <LoadingSpinner />}
          {titleError && <ErrorMessage message={titleError} />}
          {titleResults && <MovieTable movies={titleResults} />}
        </section>

        {/* Year range browse */}
        <section className={styles.card}>
          <h2>Browse by Year Range</h2>
          <form onSubmit={handleYearSearch} className={styles.row}>
            <input
              type="number"
              placeholder="From"
              value={startYear}
              min="1900"
              max="2030"
              onChange={(e) => setStartYear(e.target.value)}
              className={styles.inputSm}
            />
            <span className={styles.to}>to</span>
            <input
              type="number"
              placeholder="To"
              value={endYear}
              min="1900"
              max="2030"
              onChange={(e) => setEndYear(e.target.value)}
              className={styles.inputSm}
            />
            <button type="submit" className={styles.btn} disabled={yearLoading}>
              Browse
            </button>
          </form>
          {yearLoading && <LoadingSpinner />}
          {yearError && <ErrorMessage message={yearError} />}
          {yearResults && <MovieTable movies={yearResults} />}
        </section>

        {/* User ratings lookup */}
        <section className={styles.card}>
          <h2>User Ratings</h2>
          <p className={styles.hint}>Enter a MovieLens user ID to see their recent ratings.</p>
          <form onSubmit={handleUserLookup} className={styles.row}>
            <input
              type="number"
              placeholder="User ID"
              value={userIdInput}
              min="1"
              onChange={(e) => setUserIdInput(e.target.value)}
              className={styles.inputSm}
            />
            <button type="submit" className={styles.btn}>
              View Ratings
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
