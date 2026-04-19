function exposePgDebug() {
  return (
    process.env.API_DEBUG_ERRORS === "true" ||
    (process.env.API_DEBUG_ERRORS !== "false" &&
      process.env.NODE_ENV !== "production")
  );
}

function sendPgError(res, err, logLabel) {
  console.error(`[${logLabel}]`, err.code, err.message);
  const debug = exposePgDebug()
    ? { code: err.code, message: err.message }
    : {};
  return res.status(500).json({ error: "Database error", ...debug });
}

module.exports = { exposePgDebug, sendPgError };
