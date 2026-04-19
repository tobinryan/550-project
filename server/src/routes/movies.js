const fs = require("fs");
const express = require("express");
const { pool } = require("../db");
const { queryPath } = require("../paths");
const { sendPgError } = require("../pgHttp");

const router = express.Router();

const sqlMovieById = fs.readFileSync(
  queryPath("simple", "01_movie_by_imdb.sql"),
  "utf8",
);
const sqlMoviesByYear = fs.readFileSync(
  queryPath("simple", "02_movies_by_year_range.sql"),
  "utf8",
);
const sqlGenresForMovie = fs.readFileSync(
  queryPath("simple", "03_genres_for_movie.sql"),
  "utf8",
);
const sqlSearchByTitle = fs.readFileSync(
  queryPath("simple", "04_search_movies_by_title.sql"),
  "utf8",
);
const sqlCastForMovie = fs.readFileSync(
  queryPath("simple", "06_cast_names_for_movie.sql"),
  "utf8",
);

// GET /api/movies/search?title=<string>
router.get("/search", async (req, res) => {
  const title = String(req.query.title ?? "").trim();
  if (!title) {
    return res.status(400).json({ error: "query param 'title' is required" });
  }
  try {
    const { rows } = await pool.query(sqlSearchByTitle, [`%${title}%`]);
    return res.json({
      query: title,
      movies: rows.map((r) => ({
        imdbId: r.imdb_id,
        primaryTitle: r.primary_title,
        startYear: r.start_year,
        voteAverage: r.vote_average,
      })),
    });
  } catch (err) {
    return sendPgError(res, err, "movies");
  }
});

// GET /api/movies/by-year?startYear=<int>&endYear=<int>
router.get("/by-year", async (req, res) => {
  const startYear = Number.parseInt(req.query.startYear ?? "", 10);
  const endYear = Number.parseInt(req.query.endYear ?? "", 10);
  if (!Number.isInteger(startYear) || !Number.isInteger(endYear)) {
    return res.status(400).json({ error: "startYear and endYear must be integers" });
  }
  if (startYear > endYear) {
    return res.status(400).json({ error: "startYear must be <= endYear" });
  }
  try {
    const { rows } = await pool.query(sqlMoviesByYear, [startYear, endYear]);
    return res.json({
      startYear,
      endYear,
      movies: rows.map((r) => ({
        imdbId: r.imdb_id,
        primaryTitle: r.primary_title,
        startYear: r.start_year,
        voteAverage: r.vote_average,
      })),
    });
  } catch (err) {
    return sendPgError(res, err, "movies");
  }
});

// GET /api/movies/:imdbId
router.get("/:imdbId", async (req, res) => {
  const imdbId = req.params.imdbId.trim();
  if (!imdbId) {
    return res.status(400).json({ error: "imdbId path param is required" });
  }
  try {
    const { rows } = await pool.query(sqlMovieById, [imdbId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }
    const r = rows[0];
    return res.json({
      imdbId: r.imdb_id,
      primaryTitle: r.primary_title,
      originalTitle: r.original_title,
      startYear: r.start_year,
      runtimeMinutes: r.runtime_minutes,
      voteAverage: r.vote_average,
      voteCount: r.vote_count,
      revenue: r.revenue,
    });
  } catch (err) {
    return sendPgError(res, err, "movies");
  }
});

// GET /api/movies/:imdbId/genres
router.get("/:imdbId/genres", async (req, res) => {
  const imdbId = req.params.imdbId.trim();
  try {
    const { rows } = await pool.query(sqlGenresForMovie, [imdbId]);
    return res.json({
      imdbId,
      genres: rows.map((r) => r.genre),
    });
  } catch (err) {
    return sendPgError(res, err, "movies");
  }
});

// GET /api/movies/:imdbId/cast
router.get("/:imdbId/cast", async (req, res) => {
  const imdbId = req.params.imdbId.trim();
  try {
    const { rows } = await pool.query(sqlCastForMovie, [imdbId]);
    return res.json({
      imdbId,
      cast: rows.map((r) => ({
        name: r.name,
        job: r.job,
      })),
    });
  } catch (err) {
    return sendPgError(res, err, "movies");
  }
});

module.exports = router;
