-- $1 = imdb_id  
SELECT
    imdb_id,
    primary_title,
    original_title,
    start_year,
    runtime_minutes,
    vote_average,
    vote_count,
    revenue
FROM movies
WHERE imdb_id = $1;
