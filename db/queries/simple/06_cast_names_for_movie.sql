-- $1 = movie imdb_id.

SELECT
    p.name,
    pm.job
FROM people_movies AS pm
JOIN people AS p ON p.id = pm.people_id
WHERE pm.movie_id = $1
ORDER BY pm.job, p.name;
