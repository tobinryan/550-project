# Complex queries

Queries use **`$1`, `$2`, …** (PostgreSQL positional parameters). See each `.sql` file for the exact signature.

## Natural language queries (proposal ↔ implementation)

| # | Proposal (natural language) | SQL file | Status |
|---|------------------------------|----------|--------|
| 1 | Find all movies in a given genre released between two specified years, sorted by average user rating. | [01_movies_by_genre_and_year.sql](01_movies_by_genre_and_year.sql) | Implemented |
| 2 | For a given actor, return all movies they appeared in along with each movie's budget, revenue, and average user rating. | [02_movies_for_actor_with_financials.sql](02_movies_for_actor_with_financials.sql) | Implemented |
| 3 | Return the top 10 actors who have appeared in the highest-grossing movies on average, considering only actors with at least 5 movies. | [03_top_actors_by_avg_gross.sql](03_top_actors_by_avg_gross.sql) | Implemented |
| 4 | For each decade, find the genre with the highest average user rating and the genre with the highest average revenue. | — | Not yet in repo |
| 5 | Find pairs of actors who have appeared together in at least 3 movies, and rank those pairs by the average rating of their shared movies. | [04_actor_pairs_by_shared_movies.sql](04_actor_pairs_by_shared_movies.sql) | Implemented |
| 6 | Return movies where the lead actor's career average rating is above the platform average, but that specific movie is rated below average. | — | Not yet in repo |
| 7 | For a given movie, show its cast along with each actor's total number of movies and their highest-rated other movie. | — | Not yet in repo (see simple [06_cast_names_for_movie.sql](../simple/06_cast_names_for_movie.sql) for cast listing) |

---

## 01_movies_by_genre_and_year.sql

Find all movies in a given genre released between two specified years, showing each movie's original language, top production company, average user rating, and number of unique raters. Movies are ranked by average rating within the genre and year range.

- **Parameters:** `$1` (genre_name), `$2` (start_year), `$3` (end_year)

---

## 02_movies_for_actor_with_financials.sql

For a given actor, return all movies they appeared in along with each movie's budget, revenue, average user rating, their role in the movie, the top production company, and a comparison of each movie's rating to the actor's career average.

- **Parameters:** `$1` (actor_id)

---

## 03_top_actors_by_avg_gross.sql

Return the top 10 actors who have appeared in the highest-grossing movies on average, considering only actors with at least 5 movies.

---

## 04_actor_pairs_by_shared_movies.sql

Find pairs of actors who have appeared together in at least 3 movies, and rank those pairs by the average rating of their shared movies.
