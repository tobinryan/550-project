const BASE = "/api";

export async function getMoviesByGenreYear(genre, startYear, endYear) {
  const params = new URLSearchParams({ genre, startYear, endYear });
  const res = await fetch(`${BASE}/analytics/movies-by-genre-year?${params}`);
  if (!res.ok) throw new Error((await res.json()).error ?? "Fetch failed");
  return res.json();
}

export async function getTopActorsByGross(limit = 10) {
  const res = await fetch(`${BASE}/analytics/top-actors-by-avg-gross?limit=${limit}`);
  if (!res.ok) throw new Error((await res.json()).error ?? "Fetch failed");
  return res.json();
}

export async function getActorPairs(limit = 100) {
  const res = await fetch(`${BASE}/analytics/actor-pairs-by-shared-movies?limit=${limit}`);
  if (!res.ok) throw new Error((await res.json()).error ?? "Fetch failed");
  return res.json();
}
