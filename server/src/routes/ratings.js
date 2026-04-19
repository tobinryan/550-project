const fs = require("fs");
const express = require("express");
const { pool } = require("../db");
const { queryPath } = require("../paths");
const { sendPgError } = require("../pgHttp");

const router = express.Router();

const sqlRatingsForUser = fs.readFileSync(
  queryPath("simple", "05_ratings_for_user.sql"),
  "utf8",
);

// GET /api/ratings/user/:userId
router.get("/user/:userId", async (req, res) => {
  const userId = Number.parseInt(req.params.userId, 10);
  if (!Number.isInteger(userId) || userId < 1) {
    return res.status(400).json({ error: "userId must be a positive integer" });
  }
  try {
    const { rows } = await pool.query(sqlRatingsForUser, [userId]);
    return res.json({
      userId,
      ratings: rows.map((r) => ({
        movieId: r.movie_id,
        rating: r.rating,
        timestamp: r.timestamp,
      })),
    });
  } catch (err) {
    return sendPgError(res, err, "ratings");
  }
});

module.exports = router;
