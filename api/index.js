const express = require("express");
const cors = require("cors");

const { pool } = require("../server/src/db");
const actorsRouter = require("../server/src/routes/actors");
const analyticsRouter = require("../server/src/routes/analytics");
const moviesRouter = require("../server/src/routes/movies");
const ratingsRouter = require("../server/src/routes/ratings");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/actors", actorsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/movies", moviesRouter);
app.use("/api/ratings", ratingsRouter);

module.exports = app;
