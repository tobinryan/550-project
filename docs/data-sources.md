# Data sources (CIS 5500 proposal)

## Dataset 1 — The Movies Dataset (MovieLens + TMDB)

- **Description:** ~45,000 movies with budgets, revenues, release dates, languages, companies, cast/crew, keywords; plus MovieLens ratings (~26M ratings, ~270k users).
- **Link:** [Kaggle: rounakbanik/the-movies-dataset](https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset/data)
- **Scale (proposal):** ~900 MB total; on the order of 26M+ rows across files; dozens of attributes in `movies_metadata.csv` alone.
- **Notes:** `movies_metadata.csv` can contain malformed values in the `adult` column; the pipeline reads it with `adult` as string to avoid dtype errors. Ratings use half-star steps from 0.5–5 (MovieLens).

**Local layout:** `data/raw/the-movies-dataset/` (files including `movies_metadata.csv`, `credits.csv`, `ratings.csv`, `links.csv`).

## Dataset 2 — IMDb Actors and Movies

- **Description:** IMDb-derived tables for actor names, birth/death years, professions, and titles; cleaned/merged for analysis.
- **Link:** [Kaggle: rishabjadhav/imdb-actors-and-movies](https://www.kaggle.com/datasets/rishabjadhav/imdb-actors-and-movies/data)
- **Scale (proposal):** ~1.7 GB; 3 main tables; on the order of 24M+ rows combined; ~20 attributes across files.
- **Files used by our pipeline:** `titles.csv` (title basics, joinable to TMDB via `imdb_id`), `names.csv` (person attributes for enriching credits). `combined.csv` is part of the bundle for exploration; core ETL uses TMDB credits + `names.csv` for years.

**Local layout:** `data/raw/imdb-actors-movies/`.

## Fetching

Use `pipeline/fetch_data.py` (prefers `kagglehub`, same idea as the Colab data-discovery notebook; falls back to the official `kaggle` Python client). See `data/README.md`.

## Optional IMDb aggregate ratings

The Kaggle IMDb bundle does not include `title.ratings.tsv`. If you place IMDb’s aggregate title ratings TSV (from [IMDb datasets](https://datasets.imdbws.com/title.ratings.tsv.gz)) as `data/raw/imdb-actors-movies/title.ratings.tsv`, `clean_movies.py` will merge it; otherwise TMDB/MovieLens scores drive `vote_average` / `vote_count`.
