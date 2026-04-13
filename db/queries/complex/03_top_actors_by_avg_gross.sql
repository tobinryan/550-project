SELECT a.actor_id, a.name, COUNT(m.movie_id) AS num_movies,
       AVG(m.revenue) AS avg_gross
FROM actors a
JOIN movie_cast mc ON a.actor_id = mc.actor_id
JOIN movies m ON mc.movie_id = m.movie_id
WHERE m.revenue IS NOT NULL
GROUP BY a.actor_id, a.name
HAVING COUNT(m.movie_id) >= 5
ORDER BY avg_gross DESC
LIMIT 10;
