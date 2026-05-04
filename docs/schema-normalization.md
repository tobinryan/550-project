# Schema Normalization

This document proves that the project schema is in BCNF. Since every BCNF
relation is also in 3NF, this also proves 3NF.

Schema source: `db/schema/01_create_tables.sql`.

## Normalization Criteria

A relation is in **3NF** if, for every non-trivial functional dependency
`X -> A`, at least one of the following is true:

- `X` is a superkey.
- `A` is a prime attribute, meaning it is part of some candidate key.

A relation is in **BCNF** if, for every non-trivial functional dependency
`X -> Y`, `X` is a superkey.

BCNF is stricter than 3NF, so proving BCNF is sufficient.

## Assumptions

The proof uses the functional dependencies represented by the SQL primary keys,
unique constraints, and foreign keys.

- `movies.imdb_id` uniquely identifies one movie.
- `movies.movies_dataset_id` is unique when present and also identifies one
  movie from the source movies dataset.
- `genres.genre` uniquely identifies one genre.
- `production_companies.id` uniquely identifies one production company.
- `people.id` uniquely identifies one person.
- Junction tables use composite primary keys to represent many-to-many
  relationships.
- `ratings` has no separate physical `users` table. A MovieLens user is
  represented by the scalar identifier `ratings.user_id`.
- The schema intentionally stores only one `job` value for a given
  `(movie_id, people_id)` pair because `people_movies` has primary key
  `(movie_id, people_id)`.

## Relation Proofs

### `genres`

Relation:

`genres(genre)`

Candidate key:

- `genre`

Functional dependencies:

- `genre -> genre`

There are no non-key attributes. Every non-trivial dependency has a determinant
that is a key, so `genres` is in BCNF.

### `production_companies`

Relation:

`production_companies(id, name)`

Candidate key:

- `id`

Functional dependencies:

- `id -> name`

The determinant `id` is the primary key, so it is a superkey. Therefore every
non-trivial dependency has a superkey determinant, and `production_companies` is
in BCNF.

### `movies`

Relation:

`movies(imdb_id, movies_dataset_id, budget, original_title, primary_title,
is_adult, homepage, original_language, overview, start_year, end_year,
runtime_minutes, revenue, popularity, release_date, status, tagline,
vote_average, vote_count)`

Candidate keys:

- `imdb_id`
- `movies_dataset_id`, because the schema declares it `UNIQUE`

Functional dependencies:

- `imdb_id -> movies_dataset_id, budget, original_title, primary_title,
  is_adult, homepage, original_language, overview, start_year, end_year,
  runtime_minutes, revenue, popularity, release_date, status, tagline,
  vote_average, vote_count`
- `movies_dataset_id -> imdb_id, budget, original_title, primary_title,
  is_adult, homepage, original_language, overview, start_year, end_year,
  runtime_minutes, revenue, popularity, release_date, status, tagline,
  vote_average, vote_count`

Both determinants, `imdb_id` and `movies_dataset_id`, are candidate keys. The
movie attributes describe the movie identified by either key and are not stored
as separate repeated entities in this relation. Therefore every non-trivial
dependency has a superkey determinant, and `movies` is in BCNF.

### `movie_genres`

Relation:

`movie_genres(movie_id, genre)`

Primary key:

- `(movie_id, genre)`

Foreign keys:

- `movie_id -> movies.imdb_id`
- `genre -> genres.genre`

Functional dependencies:

- `(movie_id, genre) -> movie_id, genre`

This is a pure junction table between `movies` and `genres`. It has no
non-key attributes, so there are no partial or transitive dependencies on
non-key attributes. The only dependency is determined by the full composite
key. Therefore `movie_genres` is in BCNF.

### `movies_production_companies`

Relation:

`movies_production_companies(movie_id, production_company)`

Primary key:

- `(movie_id, production_company)`

Foreign keys:

- `movie_id -> movies.imdb_id`
- `production_company -> production_companies.id`

Functional dependencies:

- `(movie_id, production_company) -> movie_id, production_company`

This is a pure junction table between `movies` and `production_companies`.
It has no non-key attributes. Therefore the only dependency is determined by
the full composite key, and `movies_production_companies` is in BCNF.

### `people`

Relation:

`people(id, name, birth_year, death_year, gender)`

Candidate key:

- `id`

Functional dependencies:

- `id -> name, birth_year, death_year, gender`

The determinant `id` is the primary key, so it is a superkey. Names are not
treated as unique because multiple people can share the same name. Therefore
every non-trivial dependency has a superkey determinant, and `people` is in
BCNF.

### `people_movies`

Relation:

`people_movies(movie_id, people_id, job)`

Primary key:

- `(movie_id, people_id)`

Foreign keys:

- `movie_id -> movies.imdb_id`
- `people_id -> people.id`

Functional dependencies:

- `(movie_id, people_id) -> job`

The determinant `(movie_id, people_id)` is the primary key, so it is a
superkey. The relation stores the job performed by a person for a movie. Movie
details are kept in `movies`, and person details are kept in `people`, so there
are no transitive dependencies such as `people_id -> name` inside this table.
Therefore `people_movies` is in BCNF.

Note: this design intentionally allows only one stored job for a given person
and movie pair. If the application needed to store multiple jobs for the same
person in the same movie, the key would need to become
`(movie_id, people_id, job)`.

### `ratings`

Relation:

`ratings(movie_id, user_id, rating, timestamp)`

Primary key:

- `(movie_id, user_id)`

Foreign keys:

- `movie_id -> movies.imdb_id`

Functional dependencies:

- `(movie_id, user_id) -> rating, timestamp`

The determinant `(movie_id, user_id)` is the primary key, so it is a superkey.
Movie attributes are stored in `movies`, not repeated in `ratings`. User
profile attributes are not stored in this schema. Therefore there are no
partial dependencies such as `movie_id -> primary_title` inside `ratings`, and
there are no transitive dependencies through `user_id`. Every non-trivial
dependency has a superkey determinant, so `ratings` is in BCNF.

## Overall Conclusion

All relations in the schema are in BCNF because every non-trivial functional
dependency has a determinant that is a superkey. Since BCNF implies 3NF, the
schema is also in 3NF.

The schema avoids update, insertion, and deletion anomalies by separating:

- movie metadata into `movies`;
- genre names into `genres`;
- production company names into `production_companies`;
- person metadata into `people`;
- many-to-many relationships into `movie_genres`,
  `movies_production_companies`, and `people_movies`;
- user rating events into `ratings`.
