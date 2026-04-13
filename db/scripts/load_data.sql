-- Bulk load from CSVs. Run from project root: psql "$DATABASE_URL" -f db/scripts/load_data.sql
-- Requires: python -m pipeline.export_processed (or cd pipeline && python export_processed.py)

\set ON_ERROR_STOP on

BEGIN;

TRUNCATE TABLE
    ratings,
    people_movies,
    movie_genres,
    movies_production_companies,
    movies,
    people,
    production_companies,
    genres
CASCADE;

COMMIT;

\copy genres (genre) FROM 'data/processed/genres.csv' WITH (FORMAT csv, HEADER true, NULL '\N')
\copy production_companies (id, name) FROM 'data/processed/production_companies.csv' WITH (FORMAT csv, HEADER true, NULL '\N')
\copy movies (imdb_id, movies_dataset_id, budget, original_title, primary_title, is_adult, homepage, original_language, overview, start_year, end_year, runtime_minutes, revenue, popularity, release_date, status, tagline, vote_average, vote_count) FROM 'data/processed/movies.csv' WITH (FORMAT csv, HEADER true, NULL '\N')
\copy movie_genres (movie_id, genre) FROM 'data/processed/movie_genres.csv' WITH (FORMAT csv, HEADER true, NULL '\N')
\copy movies_production_companies (movie_id, production_company) FROM 'data/processed/movies_production_companies.csv' WITH (FORMAT csv, HEADER true, NULL '\N')
\copy people (id, name, birth_year, death_year, gender) FROM 'data/processed/people.csv' WITH (FORMAT csv, HEADER true, NULL '\N')
\copy people_movies (movie_id, people_id, job) FROM 'data/processed/people_movies.csv' WITH (FORMAT csv, HEADER true, NULL '\N')
\copy ratings (movie_id, user_id, rating, timestamp) FROM 'data/processed/ratings.csv' WITH (FORMAT csv, HEADER true, NULL '\N')

\ir ../schema/02_indexes.sql
