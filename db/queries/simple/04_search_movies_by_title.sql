-- $1 = ILIKE pattern, include % wildcards

SELECT
    imdb_id,
    primary_title,
    start_year,
    vote_average
FROM movies
WHERE primary_title ILIKE $1
ORDER BY vote_average DESC NULLS LAST
LIMIT 30;
