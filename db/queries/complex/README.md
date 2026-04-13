# Complex Queries 

## 01_movies_by_genre_and_year.sql
**Description:**
Find all movies in a given genre released between two specified years, showing each movie's original language, top production company, average user rating, and number of unique raters. Movies are ranked by average rating within the genre and year range.
- **Parameters:** `$1` (genre_name), `$2` (start_year), `$3` (end_year)

---

## 02_movies_for_actor_with_financials.sql
**Description:**
For a given actor, return all movies they appeared in along with each movie's budget, revenue, average user rating, their role in the movie, the top production company, and a comparison of each movie's rating to the actor's career average.
- **Parameters:** `$1` (actor_id)

---

## 03_top_actors_by_avg_gross.sql
**Description:**
Return the top 10 actors who have appeared in the highest-grossing movies on average, considering only actors with at least 5 movies.

---

## 04_actor_pairs_by_shared_movies.sql
**Description:**
Find pairs of actors who have appeared together in at least 3 movies, and rank those pairs by the average rating of their shared movies.