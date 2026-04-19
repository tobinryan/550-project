const fs = require("fs");
const express = require("express");
const { pool } = require("../db");
const { queryPath } = require("../paths");
const { sendPgError } = require("../pgHttp");

const router = express.Router();

const sqlGenreYear = fs.readFileSync(
  queryPath("complex", "01_movies_by_genre_and_year.sql"),
  "utf8",
);
const sqlTopGross = fs.readFileSync(
  queryPath("complex", "03_top_actors_by_avg_gross.sql"),
  "utf8",
);
const sqlPairs = fs.readFileSync(
  queryPath("complex", "04_actor_pairs_by_shared_movies.sql"),
  "utf8",
);

router.get("/movies-by-genre-year", async (req, res) => {
  const genre = String(req.query.genre ?? "").trim();
  const startYear = Number.parseInt(req.query.startYear ?? "", 10);
  const endYear = Number.parseInt(req.query.endYear ?? "", 10);
  if (!genre) {
    return res.status(400).json({ error: "query genre is required" });
  }
  if (!Number.isInteger(startYear) || !Number.isInteger(endYear)) {
    return res.status(400).json({ error: "startYear and endYear must be integers" });
  }
  if (startYear > endYear) {
    return res.status(400).json({ error: "startYear must be <= endYear" });
  }
  try {
    const { rows } = await pool.query(sqlGenreYear, [genre, startYear, endYear]);
    return res.json({
      genre,
      startYear,
      endYear,
      movies: rows.map((r) => ({
        primaryTitle: r.primary_title,
        startYear: r.start_year,
        originalLanguage: r.original_language,
        genre: r.genre,
        topCompany: r.top_company,
        avgRating: r.avg_rating,
        numRaters: r.num_raters,
        genreRank: r.genre_rank,
      })),
    });
  } catch (err) {
    return sendPgError(res, err, "analytics");
  }
});

router.get("/top-actors-by-avg-gross", async (req, res) => {
  let limit = Number.parseInt(req.query.limit ?? "10", 10);
  if (!Number.isInteger(limit) || limit < 1) {
    limit = 10;
  }
  limit = Math.min(100, limit);
  try {
    const { rows } = await pool.query(sqlTopGross, [limit]);
    return res.json({
      limit,
      actors: rows.map((r) => ({
        actorId: r.actor_id,
        name: r.name,
        numMovies: r.num_movies,
        avgGross: r.avg_gross,
      })),
    });
  } catch (err) {
    return sendPgError(res, err, "analytics");
  }
});

router.get("/actor-pairs-by-shared-movies", async (req, res) => {
  try {
    const raw = req.query.limit;
    const parsed =
      raw === undefined || raw === ""
        ? 500
        : Number.parseInt(String(raw), 10);
    const limit = Number.isInteger(parsed)
      ? Math.min(Math.max(parsed, 1), 5000)
      : 500;
    const { rows } = await pool.query(sqlPairs, [limit]);
    return res.json({
      pairs: rows.map((r) => ({
        actor1Id: r.actor1_id,
        actor2Id: r.actor2_id,
        actor1Name: r.actor1_name,
        actor2Name: r.actor2_name,
        sharedMovies: r.shared_movies,
        avgSharedRating: r.avg_shared_rating,
      })),
    });
  } catch (err) {
    return sendPgError(res, err, "analytics");
  }
});

module.exports = router;
