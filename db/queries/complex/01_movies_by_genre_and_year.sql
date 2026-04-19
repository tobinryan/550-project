-- $1 genre, $2 start_year, $3 end_year — TMDB vote_average / vote_count (not ratings).
WITH base AS (
	SELECT
		m.imdb_id,
		COALESCE(NULLIF(TRIM(m.primary_title), ''), NULLIF(TRIM(BOTH FROM m.original_title), ''), m.imdb_id) AS primary_title,
		m.start_year,
		m.original_language,
		g.genre,
		m.vote_average AS avg_rating,
		m.vote_count::bigint AS num_raters
	FROM movies m
	JOIN movie_genres g ON m.imdb_id = g.movie_id
	WHERE g.genre = $1
		AND m.start_year BETWEEN $2 AND $3
),
movie_top_company AS (
	SELECT DISTINCT ON (m.imdb_id)
		m.imdb_id,
		pc.name AS top_company
	FROM movies m
	LEFT JOIN movies_production_companies mpc ON m.imdb_id = mpc.movie_id
	LEFT JOIN production_companies pc ON mpc.production_company = pc.id
	WHERE m.imdb_id IN (SELECT imdb_id FROM base)
	ORDER BY m.imdb_id, pc.name NULLS LAST
)
SELECT
	b.primary_title,
	b.start_year,
	b.original_language,
	b.genre,
	mtc.top_company,
	b.avg_rating,
	b.num_raters,
	RANK() OVER (ORDER BY b.avg_rating DESC NULLS LAST, b.num_raters DESC) AS genre_rank
FROM base b
LEFT JOIN movie_top_company mtc ON b.imdb_id = mtc.imdb_id
ORDER BY genre_rank, b.start_year DESC NULLS LAST;
