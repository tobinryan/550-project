const express = require("express");
const cors = require("cors");

const { pool } = require("./db");
const actorsRouter = require("./routes/actors");
const analyticsRouter = require("./routes/analytics");
const moviesRouter = require("./routes/movies");
const ratingsRouter = require("./routes/ratings");

const app = express();
const port = Number.parseInt(process.env.PORT || "3001", 10);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/actors", actorsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/movies", moviesRouter);
app.use("/api/ratings", ratingsRouter);

app.listen(port, async () => {
  console.log(`API listening on http://localhost:${port}`);
  try {
    await pool.query("SELECT 1 AS ok");
    console.log("PostgreSQL: connected");
  } catch (e) {
    console.error("PostgreSQL:", e.code, e.message);
  }
});
