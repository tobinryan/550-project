const fs = require("fs");
const express = require("express");
const { pool } = require("../db");
const { queryPath } = require("../paths");
const { sendPgError } = require("../pgHttp");

const router = express.Router();

const sqlMoviesForActor = fs.readFileSync(
  queryPath("complex", "02_movies_for_actor_with_financials.sql"),
  "utf8",
);

function mapMovieRow(row) {
  return {
    imdbId: row.imdb_id,
    primaryTitle: row.primary_title,
    startYear: row.start_year,
    role: row.role,
    budget: row.budget,
    revenue: row.revenue,
    productionCompany: row.production_company,
    avgMovieRating: row.avg_movie_rating,
    actorAvgRating: row.actor_avg_rating,
    ratingVsCareer: row.rating_vs_career,
  };
}

router.get("/:actorId/movies-with-financials", async (req, res) => {
  const actorId = Number.parseInt(req.params.actorId, 10);
  if (!Number.isInteger(actorId) || actorId < 1) {
    return res.status(400).json({ error: "actorId must be a positive integer" });
  }
  try {
    const who = await pool.query(
      "SELECT id, name FROM people WHERE id = $1",
      [actorId],
    );
    if (who.rowCount === 0) {
      return res.status(404).json({ error: "Actor not found" });
    }
    const actorName = who.rows[0].name;
    const { rows } = await pool.query(sqlMoviesForActor, [actorId]);
    return res.json({
      actorId,
      actorName,
      movies: rows.map(mapMovieRow),
    });
  } catch (err) {
    return sendPgError(res, err, "actors");
  }
});

module.exports = router;
