-- Movie Insights: tables (FKs inline). Run before load. --

CREATE TABLE genres (
    genre VARCHAR(256) PRIMARY KEY
);

CREATE TABLE production_companies (
    id INTEGER PRIMARY KEY,
    name VARCHAR(512) NOT NULL
);

CREATE TABLE movies (
    imdb_id VARCHAR(16) PRIMARY KEY,
    movies_dataset_id INTEGER UNIQUE,
    budget BIGINT,
    original_title TEXT,
    primary_title TEXT,
    is_adult BOOLEAN,
    homepage TEXT,
    original_language VARCHAR(32),
    overview TEXT,
    start_year INTEGER,
    end_year INTEGER,
    runtime_minutes INTEGER,
    revenue BIGINT,
    popularity DOUBLE PRECISION,
    release_date VARCHAR(64),
    status VARCHAR(64),
    tagline TEXT,
    vote_average DOUBLE PRECISION,
    vote_count BIGINT
);

CREATE TABLE movie_genres (
    movie_id VARCHAR(16) NOT NULL REFERENCES movies (imdb_id) ON DELETE CASCADE,
    genre VARCHAR(256) NOT NULL REFERENCES genres (genre) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, genre)
);

CREATE TABLE movies_production_companies (
    movie_id VARCHAR(16) NOT NULL REFERENCES movies (imdb_id) ON DELETE CASCADE,
    production_company INTEGER NOT NULL REFERENCES production_companies (id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, production_company)
);

CREATE TABLE people (
    id INTEGER PRIMARY KEY,
    name VARCHAR(512) NOT NULL,
    birth_year INTEGER,
    death_year INTEGER,
    gender VARCHAR(32)
);

CREATE TABLE people_movies (
    movie_id VARCHAR(16) NOT NULL REFERENCES movies (imdb_id) ON DELETE CASCADE,
    people_id INTEGER NOT NULL REFERENCES people (id) ON DELETE CASCADE,
    job VARCHAR(256) NOT NULL,
    PRIMARY KEY (movie_id, people_id)
);

CREATE TABLE ratings (
    movie_id VARCHAR(16) NOT NULL REFERENCES movies (imdb_id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL,
    rating REAL NOT NULL,
    timestamp BIGINT NOT NULL,
    PRIMARY KEY (movie_id, user_id)
);
