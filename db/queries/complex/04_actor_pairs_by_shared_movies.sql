-- Pairwise acting credits with >=3 shared movies; avg score from movies.vote_average (not ratings).
-- Actors with <3 total Actor credits cannot participate in any 4+ shared-movie pair; dropping them
-- cuts the self-join size without changing the result set.
WITH prolific AS (
	SELECT people_id
	FROM people_movies
	WHERE job = 'Actor'
	GROUP BY people_id
	HAVING COUNT(*) >= 3
),
	act AS NOT MATERIALIZED (
		SELECT pm.movie_id, pm.people_id
		FROM people_movies pm
		INNER JOIN prolific ON pm.people_id = prolific.people_id
		WHERE pm.job = 'Actor'
	),
	pair_rows AS NOT MATERIALIZED (
		SELECT
			LEAST(pm1.people_id, pm2.people_id) AS actor1_id,
			GREATEST(pm1.people_id, pm2.people_id) AS actor2_id,
			pm1.movie_id
		FROM act pm1
		INNER JOIN act pm2
			ON pm1.movie_id = pm2.movie_id
			AND pm1.people_id < pm2.people_id
	),
	pair_stats AS (
		SELECT
			pr.actor1_id,
			pr.actor2_id,
			COUNT(*)::bigint AS shared_movies,
			AVG(m.vote_average)::double precision AS avg_shared_rating
		FROM pair_rows pr
		INNER JOIN movies m ON pr.movie_id = m.imdb_id
		GROUP BY pr.actor1_id, pr.actor2_id
		HAVING COUNT(*) >= 3
	)
SELECT
	ps.actor1_id,
	ps.actor2_id,
	p1.name AS actor1_name,
	p2.name AS actor2_name,
	ps.shared_movies,
	ps.avg_shared_rating
FROM pair_stats ps
INNER JOIN people p1 ON ps.actor1_id = p1.id
INNER JOIN people p2 ON ps.actor2_id = p2.id
ORDER BY ps.avg_shared_rating DESC NULLS LAST, ps.shared_movies DESC
LIMIT COALESCE(NULLIF($1::int, 0), 500);
