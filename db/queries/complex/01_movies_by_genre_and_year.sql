-- $1 - The genre to filter movies by 
-- $2 - The start of the year range
-- $3 - The end of the year range

WITH movie_ratings AS (
  SELECT
    m.imdb_id,
    m.primary_title,
    m.start_year,
    m.original_language,
    g.genre,
    AVG(r.rating) AS avg_rating,
    COUNT(DISTINCT r.user_id) AS num_raters
  FROM movies m
  JOIN movie_genres g ON m.imdb_id = g.movie_id
  LEFT JOIN ratings r ON m.imdb_id = r.movie_id
  WHERE g.genre = $1
    AND m.start_year BETWEEN $2 AND $3
  GROUP BY m.imdb_id, m.primary_title, m.start_year, m.original_language, g.genre
),
movie_top_company AS (
  SELECT
    m.imdb_id,
    pc.name AS top_company
  FROM movies m
  LEFT JOIN movies_production_companies mpc ON m.imdb_id = mpc.movie_id
  LEFT JOIN production_companies pc ON mpc.production_company = pc.id
  WHERE m.imdb_id IN (SELECT imdb_id FROM movie_ratings)
  -- Pick the first company alphabetically for each movie (if multiple)
  QUALIFY ROW_NUMBER() OVER (PARTITION BY m.imdb_id ORDER BY pc.name) = 1
)
SELECT
  mr.primary_title,
  mr.start_year,
  mr.original_language,
  mr.genre,
  mtc.top_company,
  mr.avg_rating,
  mr.num_raters,
  RANK() OVER (ORDER BY mr.avg_rating DESC NULLS LAST, mr.num_raters DESC) AS genre_rank
FROM movie_ratings mr
LEFT JOIN movie_top_company mtc ON mr.imdb_id = mtc.imdb_id
ORDER BY genre_rank, mr.start_year DESC;
