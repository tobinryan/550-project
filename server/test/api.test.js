const assert = require("node:assert/strict");
const { afterEach, beforeEach, describe, it, mock } = require("node:test");
const { app } = require("../src/index");
const { pool } = require("../src/db");
const { exposePgDebug, sendPgError } = require("../src/pgHttp");
const { projectRoot, queryPath } = require("../src/paths");

function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

async function request(path) {
  const { server, baseUrl } = await listen();
  try {
    const res = await fetch(`${baseUrl}${path}`);
    const body = await res.json();
    return { status: res.status, body };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function mockQueries(results) {
  const queue = [...results];
  return mock.method(pool, "query", async (...args) => {
    const next = queue.shift();
    if (next instanceof Error) throw next;
    if (typeof next === "function") return next(...args);
    return next;
  });
}

describe("API", () => {
  beforeEach(() => {
    mock.method(console, "error", () => {});
  });

  afterEach(() => {
    mock.restoreAll();
    delete process.env.API_DEBUG_ERRORS;
    process.env.NODE_ENV = "test";
  });

  it("serves health", async () => {
    const res = await request("/health");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { ok: true });
  });

  it("validates movie search and maps rows", async () => {
    let res = await request("/api/movies/search?title=%20");
    assert.equal(res.status, 400);
    assert.match(res.body.error, /title/);

    const db = mockQueries([
      {
        rows: [
          {
            imdb_id: "tt1375666",
            primary_title: "Inception",
            start_year: 2010,
            vote_average: "8.8",
          },
        ],
      },
    ]);

    res = await request("/api/movies/search?title=Inception");
    assert.equal(res.status, 200);
    assert.equal(db.mock.calls[0].arguments[1][0], "%Inception%");
    assert.deepEqual(res.body.movies[0], {
      imdbId: "tt1375666",
      primaryTitle: "Inception",
      startYear: 2010,
      voteAverage: "8.8",
    });
  });

  it("validates year ranges and returns year results", async () => {
    assert.equal((await request("/api/movies/by-year?startYear=x&endYear=2010")).status, 400);
    assert.equal((await request("/api/movies/by-year?startYear=2020&endYear=2010")).status, 400);

    mockQueries([{ rows: [{ imdb_id: "tt1", primary_title: "A", start_year: 2001, vote_average: 4.5 }] }]);
    const res = await request("/api/movies/by-year?startYear=2000&endYear=2002");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      startYear: 2000,
      endYear: 2002,
      movies: [{ imdbId: "tt1", primaryTitle: "A", startYear: 2001, voteAverage: 4.5 }],
    });
  });

  it("returns movie detail, 404s missing movies, genres, and cast", async () => {
    assert.equal((await request("/api/movies/%20")).status, 400);

    mockQueries([{ rows: [] }]);
    assert.equal((await request("/api/movies/tt-missing")).status, 404);

    mockQueries([
      {
        rows: [{
          imdb_id: "tt2",
          primary_title: "Movie",
          original_title: "Movie Original",
          start_year: 1999,
          runtime_minutes: 120,
          vote_average: 7.1,
          vote_count: 1234,
          revenue: 5000,
        }],
      },
      { rows: [{ genre: "Drama" }, { genre: "Comedy" }] },
      { rows: [{ name: "Jane", job: "Actor" }, { name: "Pat", job: "Director" }] },
    ]);

    let res = await request("/api/movies/tt2");
    assert.equal(res.status, 200);
    assert.equal(res.body.primaryTitle, "Movie");
    assert.equal(res.body.revenue, 5000);

    res = await request("/api/movies/tt2/genres");
    assert.deepEqual(res.body, { imdbId: "tt2", genres: ["Drama", "Comedy"] });

    res = await request("/api/movies/tt2/cast");
    assert.deepEqual(res.body.cast, [
      { name: "Jane", job: "Actor" },
      { name: "Pat", job: "Director" },
    ]);
  });

  it("validates actor ids and maps actor filmography", async () => {
    assert.equal((await request("/api/actors/0/movies-with-financials")).status, 400);

    mockQueries([{ rowCount: 0, rows: [] }]);
    assert.equal((await request("/api/actors/9/movies-with-financials")).status, 404);

    mockQueries([
      { rowCount: 1, rows: [{ id: 7, name: "Actor Name" }] },
      {
        rows: [{
          imdb_id: "tt3",
          primary_title: "Film",
          start_year: 2003,
          role: "Lead",
          budget: 10,
          revenue: 20,
          production_company: "Studio",
          avg_movie_rating: 6.2,
          actor_avg_rating: 6,
          rating_vs_career: "above",
        }],
      },
    ]);
    const res = await request("/api/actors/7/movies-with-financials");
    assert.equal(res.body.actorName, "Actor Name");
    assert.equal(res.body.movies[0].ratingVsCareer, "above");
  });

  it("validates ratings users and maps ratings", async () => {
    assert.equal((await request("/api/ratings/user/nope")).status, 400);

    mockQueries([{ rows: [{ movie_id: "tt4", rating: 4.5, timestamp: 1700000000 }] }]);
    const res = await request("/api/ratings/user/42");
    assert.deepEqual(res.body, {
      userId: 42,
      ratings: [{ movieId: "tt4", rating: 4.5, timestamp: 1700000000 }],
    });
  });

  it("validates analytics inputs and maps analytics results", async () => {
    assert.equal((await request("/api/analytics/movies-by-genre-year?startYear=2000&endYear=2001")).status, 400);
    assert.equal((await request("/api/analytics/movies-by-genre-year?genre=Drama&startYear=x&endYear=2001")).status, 400);
    assert.equal((await request("/api/analytics/movies-by-genre-year?genre=Drama&startYear=2020&endYear=2001")).status, 400);

    mockQueries([
      {
        rows: [{
          primary_title: "Drama Movie",
          start_year: 2010,
          original_language: "en",
          genre: "Drama",
          top_company: "Studio",
          avg_rating: 4.2,
          num_raters: 15,
          genre_rank: 1,
        }],
      },
      { rows: [{ actor_id: 1, name: "Star", num_movies: 5, avg_gross: 1000000 }] },
      {
        rows: [{
          actor1_id: 1,
          actor2_id: 2,
          actor1_name: "A",
          actor2_name: "B",
          shared_movies: 3,
          avg_shared_rating: 4.4,
        }],
      },
    ]);

    let res = await request("/api/analytics/movies-by-genre-year?genre=Drama&startYear=2000&endYear=2010");
    assert.equal(res.body.movies[0].genreRank, 1);

    res = await request("/api/analytics/top-actors-by-avg-gross?limit=bad");
    assert.equal(res.body.limit, 10);
    assert.equal(res.body.actors[0].actorId, 1);

    res = await request("/api/analytics/actor-pairs-by-shared-movies?limit=99999");
    assert.equal(res.body.pairs[0].actor2Name, "B");
  });

  it("handles analytics limit defaults and clamps", async () => {
    const calls = [];
    mock.method(pool, "query", async (_sql, params) => {
      calls.push(params[0]);
      return { rows: [] };
    });

    let res = await request("/api/analytics/top-actors-by-avg-gross?limit=999");
    assert.equal(res.body.limit, 100);

    await request("/api/analytics/actor-pairs-by-shared-movies");
    await request("/api/analytics/actor-pairs-by-shared-movies?limit=");
    await request("/api/analytics/actor-pairs-by-shared-movies?limit=nope");
    await request("/api/analytics/actor-pairs-by-shared-movies?limit=-3");
    assert.deepEqual(calls, [100, 500, 500, 500, 1]);
  });

  it("returns database errors with debug details outside production", async () => {
    const err = new Error("boom");
    err.code = "XX";
    mockQueries([err]);

    const res = await request("/api/movies/search?title=bad");
    assert.equal(res.status, 500);
    assert.equal(res.body.error, "Database error");
    assert.equal(res.body.code, "XX");
    assert.equal(res.body.message, "boom");
  });

  it("returns database errors from every route catch path", async () => {
    const err = new Error("db down");
    err.code = "DB";
    mock.method(pool, "query", async () => {
      throw err;
    });

    const paths = [
      "/api/movies/by-year?startYear=2000&endYear=2001",
      "/api/movies/tt1",
      "/api/movies/tt1/genres",
      "/api/movies/tt1/cast",
      "/api/actors/1/movies-with-financials",
      "/api/ratings/user/1",
      "/api/analytics/movies-by-genre-year?genre=Drama&startYear=2000&endYear=2001",
      "/api/analytics/top-actors-by-avg-gross?limit=5",
      "/api/analytics/actor-pairs-by-shared-movies?limit=5",
    ];

    for (const path of paths) {
      const res = await request(path);
      assert.equal(res.status, 500, path);
      assert.equal(res.body.error, "Database error");
    }
  });

  it("hides database debug details in production and exposes helper paths", () => {
    process.env.NODE_ENV = "production";
    process.env.API_DEBUG_ERRORS = "false";
    assert.equal(exposePgDebug(), false);
    assert.ok(queryPath("simple", "x.sql").startsWith(projectRoot));

    const res = {
      statusCode: 0,
      payload: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        this.payload = payload;
        return payload;
      },
    };
    sendPgError(res, new Error("hidden"), "test");
    assert.deepEqual(res.payload, { error: "Database error" });
  });
});
