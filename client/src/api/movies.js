const BASE = "/api";

export async function searchMovies(title) {
  const res = await fetch(`${BASE}/movies/search?title=${encodeURIComponent(title)}`);
  if (!res.ok) throw new Error((await res.json()).error ?? "Search failed");
  return res.json();
}

export async function getMoviesByYear(startYear, endYear) {
  const res = await fetch(`${BASE}/movies/by-year?startYear=${startYear}&endYear=${endYear}`);
  if (!res.ok) throw new Error((await res.json()).error ?? "Fetch failed");
  return res.json();
}

export async function getMovie(imdbId) {
  const res = await fetch(`${BASE}/movies/${imdbId}`);
  if (!res.ok) throw new Error((await res.json()).error ?? "Movie not found");
  return res.json();
}

export async function getMovieGenres(imdbId) {
  const res = await fetch(`${BASE}/movies/${imdbId}/genres`);
  if (!res.ok) throw new Error((await res.json()).error ?? "Fetch failed");
  return res.json();
}

export async function getMovieCast(imdbId) {
  const res = await fetch(`${BASE}/movies/${imdbId}/cast`);
  if (!res.ok) throw new Error((await res.json()).error ?? "Fetch failed");
  return res.json();
}
