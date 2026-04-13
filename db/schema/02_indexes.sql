-- Run after  load 

CREATE INDEX IF NOT EXISTS idx_movie_genres_genre ON movie_genres (genre);
CREATE INDEX IF NOT EXISTS idx_movie_genres_movie ON movie_genres (movie_id);
CREATE INDEX IF NOT EXISTS idx_mpc_movie ON movies_production_companies (movie_id);
CREATE INDEX IF NOT EXISTS idx_mpc_company ON movies_production_companies (production_company);
CREATE INDEX IF NOT EXISTS idx_people_movies_person ON people_movies (people_id);
CREATE INDEX IF NOT EXISTS idx_people_movies_movie ON people_movies (movie_id);
CREATE INDEX IF NOT EXISTS idx_ratings_movie ON ratings (movie_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings (user_id);
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies (start_year);
CREATE INDEX IF NOT EXISTS idx_movies_popularity ON movies (popularity);
