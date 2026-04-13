-- $1 = start year, $2 = end year 

SELECT
    imdb_id,
    primary_title,
    start_year,
    vote_average
FROM movies
WHERE start_year BETWEEN $1 AND $2
ORDER BY vote_average DESC NULLS LAST
LIMIT 50;
