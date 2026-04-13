SELECT
    LEAST(mc1.actor_id, mc2.actor_id) AS actor1_id,
    GREATEST(mc1.actor_id, mc2.actor_id) AS actor2_id,
    a1.name AS actor1_name,
    a2.name AS actor2_name,
    COUNT(DISTINCT mc1.movie_id) AS shared_movies,
    AVG(r.rating) AS avg_shared_rating
FROM movie_cast mc1
JOIN movie_cast mc2
    ON mc1.movie_id = mc2.movie_id
    AND mc1.actor_id < mc2.actor_id
JOIN actors a1 ON mc1.actor_id = a1.actor_id
JOIN actors a2 ON mc2.actor_id = a2.actor_id
JOIN ratings r ON mc1.movie_id = r.movie_id
GROUP BY actor1_id, actor2_id, a1.name, a2.name
HAVING COUNT(DISTINCT mc1.movie_id) >= 3
ORDER BY avg_shared_rating DESC NULLS LAST, shared_movies DESC;
