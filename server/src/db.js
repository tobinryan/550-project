const path = require("path");
const { Pool } = require("pg");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

function sslOption() {
  if (process.env.DATABASE_SSL !== "true") {
    return undefined;
  }
  return { rejectUnauthorized: false };
}

const statementTimeoutMs = (() => {
  const n = Number.parseInt(process.env.STATEMENT_TIMEOUT_MS || "120000", 10);
  return Number.isFinite(n)
    ? Math.min(600_000, Math.max(1_000, Math.floor(n)))
    : 120_000;
})();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslOption(),
  // Avoid hanging forever when RDS is unreachable 
  connectionTimeoutMillis: Number.parseInt(
    process.env.PG_CONNECTION_TIMEOUT_MS || "15000",
    10,
  ),
  options: `-c statement_timeout=${statementTimeoutMs}`,
});

module.exports = { pool };
