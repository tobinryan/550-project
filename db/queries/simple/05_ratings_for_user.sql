-- $1 = MovieLens user_id.

SELECT
    movie_id,
    rating,
    timestamp
FROM ratings
WHERE user_id = $1
ORDER BY timestamp DESC
LIMIT 100;
