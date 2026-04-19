-- $1 actor_id — uses movies.vote_average for scores (not ratings).
WITH actor_info AS (
	SELECT p.id AS actor_id, p.name AS actor_name
	FROM people p
	WHERE p.id = $1
),
actor_movies AS (
	SELECT
		m.imdb_id,
		COALESCE(
			NULLIF(TRIM(m.primary_title), ''),
			NULLIF(TRIM(BOTH FROM m.original_title), ''),
			m.imdb_id
		) AS primary_title,
		COALESCE(
			m.start_year,
			CASE
				WHEN m.release_date ~ '^[0-9]{4}'
				THEN SUBSTRING(m.release_date FROM 1 FOR 4)::integer
				ELSE NULL
			END
		) AS start_year,
		m.budget,
		m.revenue,
		m.vote_average,
		m.vote_count,
		pm.job AS role,
		am.actor_id
	FROM movies m
	JOIN people_movies pm ON m.imdb_id = pm.movie_id AND pm.job = 'Actor'
	JOIN actor_info am ON pm.people_id = am.actor_id
),
actor_career_avg AS (
	SELECT AVG(vote_average)::double precision AS actor_avg_rating
	FROM actor_movies
	WHERE vote_average IS NOT NULL
),
movie_companies AS (
	SELECT DISTINCT ON (m.imdb_id)
		m.imdb_id,
		pc.name AS production_company
	FROM movies m
	LEFT JOIN movies_production_companies mpc ON m.imdb_id = mpc.movie_id
	LEFT JOIN production_companies pc ON mpc.production_company = pc.id
	WHERE m.imdb_id IN (SELECT imdb_id FROM actor_movies)
	ORDER BY m.imdb_id, pc.name NULLS LAST
)
SELECT
	am.imdb_id,
	ai.actor_name,
	am.primary_title,
	am.start_year,
	am.role,
	am.budget,
	am.revenue,
	mc.production_company,
	am.vote_average AS avg_movie_rating,
	aca.actor_avg_rating,
	CASE
		WHEN am.vote_average IS NULL OR aca.actor_avg_rating IS NULL THEN 'At Career Avg'
		WHEN am.vote_average > aca.actor_avg_rating THEN 'Above Career Avg'
		WHEN am.vote_average < aca.actor_avg_rating THEN 'Below Career Avg'
		ELSE 'At Career Avg'
	END AS rating_vs_career
FROM actor_movies am
JOIN actor_info ai ON am.actor_id = ai.actor_id
LEFT JOIN movie_companies mc ON am.imdb_id = mc.imdb_id
CROSS JOIN actor_career_avg aca
ORDER BY am.start_year DESC, am.vote_average DESC NULLS LAST;
