# Simple queries (6)

Queries use **`$1`, `$2`, …** (PostgreSQL positional params). The API binds them from request input. To try in `psql`: `PREPARE q AS` + paste the `SELECT`, then `EXECUTE q('tt0114709');` (adjust types/arity per query).

These support the CIS 5500 proposal flows (movie search, user ratings, cast lists) alongside the [complex queries](../complex/README.md).

| File | Purpose |
|------|---------|
| [01_movie_by_imdb.sql](01_movie_by_imdb.sql) | Fetch one movie by `imdb_id`. |
| [02_movies_by_year_range.sql](02_movies_by_year_range.sql) | List movies in a year range, sorted by score. |
| [03_genres_for_movie.sql](03_genres_for_movie.sql) | Genres for one movie. |
| [04_search_movies_by_title.sql](04_search_movies_by_title.sql) | Title substring search. |
| [05_ratings_for_user.sql](05_ratings_for_user.sql) | Ratings for one MovieLens user. |
| [06_cast_names_for_movie.sql](06_cast_names_for_movie.sql) | Names + jobs for one movie’s cast/crew. |
