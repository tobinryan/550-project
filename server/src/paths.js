const path = require("path");

/** Repo root (two levels up from `server/src`). */
const projectRoot = path.join(__dirname, "..", "..");

module.exports = {
  projectRoot,
  queryPath: (...segments) => path.join(projectRoot, "db", "queries", ...segments),
};
