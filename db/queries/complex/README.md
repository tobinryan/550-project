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

Genre + year filter; `avg_rating` / `num_raters` from TMDB (`vote_average` / `vote_count`) on `movies`

- **Parameters:** `$1` (genre_name), `$2` (start_year), `$3` (end_year)

---

## 02_movies_for_actor_with_financials.sql

Filmography + finances; scores from `movies.vote_average`.

- **Parameters:** `$1` (actor_id)

---

## 03_top_actors_by_avg_gross.sql

Return the top *N* actors who have appeared in the highest-grossing movies on average, considering only actors with at least 5 **acting** credits (`people_movies.job = 'Actor'`) and movies with non-null revenue.

- **Parameters:** `$1` (integer, result limit, e.g. `10`)

---

## 04_actor_pairs_by_shared_movies.sql

Co-stars with ≥3 shared acting credits; `avg_shared_rating` from TMDB `vote_average` on shared titles
