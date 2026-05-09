import { describe, expect, it, vi } from "vitest";
import {
  getMovie,
  getMovieCast,
  getMovieGenres,
  getMoviesByYear,
  searchMovies,
} from "./movies";
import { getActorFilmography } from "./actors";
import {
  getActorPairs,
  getMoviesByGenreYear,
  getTopActorsByGross,
} from "./analytics";
import { getUserRatings } from "./ratings";

function mockFetch({ ok = true, body = { ok: true } } = {}) {
  const fetchMock = vi.fn(async () => ({
    ok,
    json: async () => body,
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("API wrappers", () => {
  it("builds movie endpoints and returns JSON", async () => {
    const fetchMock = mockFetch({ body: { movies: [] } });
    await expect(searchMovies("Star Wars")).resolves.toEqual({ movies: [] });
    expect(fetchMock).toHaveBeenLastCalledWith("/api/movies/search?title=Star%20Wars");

    await getMoviesByYear(1990, 2000);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/movies/by-year?startYear=1990&endYear=2000");

    await getMovie("tt1");
    expect(fetchMock).toHaveBeenLastCalledWith("/api/movies/tt1");

    await getMovieGenres("tt1");
    expect(fetchMock).toHaveBeenLastCalledWith("/api/movies/tt1/genres");

    await getMovieCast("tt1");
    expect(fetchMock).toHaveBeenLastCalledWith("/api/movies/tt1/cast");
  });

  it("builds actor, ratings, and analytics endpoints", async () => {
    const fetchMock = mockFetch();
    await getActorFilmography(7);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/actors/7/movies-with-financials");

    await getUserRatings(42);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/ratings/user/42");

    await getMoviesByGenreYear("Science Fiction", 2001, 2010);
    expect(fetchMock.mock.calls.at(-1)[0]).toBe(
      "/api/analytics/movies-by-genre-year?genre=Science+Fiction&startYear=2001&endYear=2010",
    );

    await getTopActorsByGross();
    expect(fetchMock).toHaveBeenLastCalledWith("/api/analytics/top-actors-by-avg-gross?limit=10");

    await getActorPairs();
    expect(fetchMock).toHaveBeenLastCalledWith("/api/analytics/actor-pairs-by-shared-movies?limit=100");
  });

  it("throws API error messages with fallbacks", async () => {
    mockFetch({ ok: false, body: { error: "Nope" } });
    await expect(searchMovies("x")).rejects.toThrow("Nope");
    await expect(getActorFilmography(1)).rejects.toThrow("Nope");
    await expect(getMoviesByGenreYear("Drama", 2000, 2001)).rejects.toThrow("Nope");
    await expect(getUserRatings(1)).rejects.toThrow("Nope");

    mockFetch({ ok: false, body: {} });
    await expect(getMovie("missing")).rejects.toThrow("Movie not found");
    await expect(getMovieCast("tt1")).rejects.toThrow("Fetch failed");
  });
});
