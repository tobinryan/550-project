-- $1 = movie imdb_id.

SELECT
    mg.genre
FROM movie_genres AS mg
WHERE mg.movie_id = $1
ORDER BY mg.genre;
