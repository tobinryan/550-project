WITH actor_agg AS (
    SELECT
        pm.people_id,
        COUNT(*)::bigint AS num_movies,
        AVG(m.revenue)::double precision AS avg_gross
    FROM people_movies pm
    INNER JOIN movies m ON m.imdb_id = pm.movie_id AND m.revenue IS NOT NULL
    WHERE pm.job = 'Actor'
    GROUP BY pm.people_id
    HAVING COUNT(*) >= 5
)
SELECT
    p.id AS actor_id,
    p.name,
    aa.num_movies,
    aa.avg_gross
FROM actor_agg aa
JOIN people p ON p.id = aa.people_id
ORDER BY aa.avg_gross DESC NULLS LAST
LIMIT $1;
