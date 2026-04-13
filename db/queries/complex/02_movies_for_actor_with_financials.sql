-- $1 - The ID of the actor to filter movies by
WITH actor_info AS (
	SELECT p.id AS actor_id, p.name AS actor_name
	FROM people p
	WHERE p.id = $1
),
actor_movies AS (
	SELECT
		m.imdb_id,
		m.primary_title,
		m.start_year,
		m.budget,
		m.revenue,
		pm.job AS role,
		am.actor_id
	FROM movies m
	JOIN people_movies pm ON m.imdb_id = pm.movie_id
	JOIN actor_info am ON pm.people_id = am.actor_id
),
movie_companies AS (
	SELECT
		m.imdb_id,
		pc.name AS production_company
	FROM movies m
	LEFT JOIN movies_production_companies mpc ON m.imdb_id = mpc.movie_id
	LEFT JOIN production_companies pc ON mpc.production_company = pc.id
	WHERE m.imdb_id IN (SELECT imdb_id FROM actor_movies)
	QUALIFY ROW_NUMBER() OVER (PARTITION BY m.imdb_id ORDER BY pc.name) = 1
),
movie_ratings AS (
	SELECT
		m.imdb_id,
		AVG(r.rating) AS avg_movie_rating
	FROM movies m
	LEFT JOIN ratings r ON m.imdb_id = r.movie_id
	WHERE m.imdb_id IN (SELECT imdb_id FROM actor_movies)
	GROUP BY m.imdb_id
),
actor_career_avg AS (
	SELECT
		AVG(r.rating) AS actor_avg_rating
	FROM ratings r
	JOIN people_movies pm ON r.movie_id = pm.movie_id
	WHERE pm.people_id = $1
)
SELECT
	ai.actor_name,
	am.primary_title,
	am.start_year,
	am.role,
	am.budget,
	am.revenue,
	mc.production_company,
	mr.avg_movie_rating,
	aca.actor_avg_rating,
	CASE
		WHEN mr.avg_movie_rating > aca.actor_avg_rating THEN 'Above Career Avg'
		WHEN mr.avg_movie_rating < aca.actor_avg_rating THEN 'Below Career Avg'
		ELSE 'At Career Avg'
	END AS rating_vs_career
FROM actor_movies am
JOIN actor_info ai ON am.actor_id = ai.actor_id
LEFT JOIN movie_companies mc ON am.imdb_id = mc.imdb_id
LEFT JOIN movie_ratings mr ON am.imdb_id = mr.imdb_id
CROSS JOIN actor_career_avg aca
ORDER BY am.start_year DESC, mr.avg_movie_rating DESC NULLS LAST;
