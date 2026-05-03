# Complex queries

Queries use **`$1`, `$2`, …** (PostgreSQL positional parameters). See each `.sql` file for the exact signature.



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
