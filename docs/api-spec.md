# Movie Insights — API Specification

Base URL: `http://localhost:3001`

All successful responses return `Content-Type: application/json`.  
All error responses return `{ "error": "<message>" }`.

---

## Health

### `GET /health`

Returns server liveness status.

**Request params:** none

**Response** `200`

| Field | Type    | Description           |
|-------|---------|-----------------------|
| `ok`  | boolean | Always `true`         |

---

## Movies

### `GET /api/movies/search`

Case-insensitive substring search for movies by title. Returns up to 30 results sorted by rating descending.

**Query params**

| Name    | Type   | Required | Description                          |
|---------|--------|----------|--------------------------------------|
| `title` | string | Yes      | Substring to search within movie titles |

**Response** `200`

| Field                  | Type     | Description                      |
|------------------------|----------|----------------------------------|
| `query`                | string   | The search term used             |
| `movies`               | array    | List of matching movies          |
| `movies[].imdbId`      | string   | IMDb identifier                  |
| `movies[].primaryTitle`| string   | Movie title                      |
| `movies[].startYear`   | integer  | Release year                     |
| `movies[].voteAverage` | number   | Average rating (0–10)            |

**Errors:** `400` if `title` is missing or empty.

---

### `GET /api/movies/by-year`

Returns up to 50 movies released in a given year range, ordered by average rating descending.

**Query params**

| Name        | Type    | Required | Description             |
|-------------|---------|----------|-------------------------|
| `startYear` | integer | Yes      | First year (inclusive)  |
| `endYear`   | integer | Yes      | Last year (inclusive)   |

**Response** `200`

| Field                  | Type    | Description              |
|------------------------|---------|--------------------------|
| `startYear`            | integer | Requested start year     |
| `endYear`              | integer | Requested end year       |
| `movies`               | array   | List of movies           |
| `movies[].imdbId`      | string  | IMDb identifier          |
| `movies[].primaryTitle`| string  | Movie title              |
| `movies[].startYear`   | integer | Release year             |
| `movies[].voteAverage` | number  | Average rating (0–10)    |

**Errors:** `400` if params are non-integer or `startYear > endYear`.

---

### `GET /api/movies/:imdbId`

Fetch full metadata for a single movie by its IMDb ID.

**Path params**

| Name      | Type   | Required | Description        |
|-----------|--------|----------|--------------------|
| `imdbId`  | string | Yes      | IMDb movie ID (e.g. `tt0111161`) |

**Response** `200`

| Field            | Type    | Description                  |
|------------------|---------|------------------------------|
| `imdbId`         | string  | IMDb identifier              |
| `primaryTitle`   | string  | Primary movie title          |
| `originalTitle`  | string  | Original-language title      |
| `startYear`      | integer | Release year                 |
| `runtimeMinutes` | integer | Runtime in minutes           |
| `voteAverage`    | number  | Average rating (0–10)        |
| `voteCount`      | integer | Number of ratings            |
| `revenue`        | number  | Box-office revenue (USD)     |

**Errors:** `404` if no movie matches the given `imdbId`.

---

### `GET /api/movies/:imdbId/genres`

Returns the list of genres associated with a movie.

**Path params**

| Name     | Type   | Required | Description              |
|----------|--------|----------|--------------------------|
| `imdbId` | string | Yes      | IMDb movie ID            |

**Response** `200`

| Field    | Type            | Description                  |
|----------|-----------------|------------------------------|
| `imdbId` | string          | IMDb identifier echoed back  |
| `genres` | array\<string\> | Alphabetically sorted genres |

---

### `GET /api/movies/:imdbId/cast`

Returns the full cast and crew for a movie.

**Path params**

| Name     | Type   | Required | Description   |
|----------|--------|----------|---------------|
| `imdbId` | string | Yes      | IMDb movie ID |

**Response** `200`

| Field          | Type   | Description                          |
|----------------|--------|--------------------------------------|
| `imdbId`       | string | IMDb identifier echoed back          |
| `cast`         | array  | List of cast/crew members            |
| `cast[].name`  | string | Person's name                        |
| `cast[].job`   | string | Role/job (e.g. "Actor", "Director")  |

---

## Ratings

### `GET /api/ratings/user/:userId`

Returns the 100 most recent MovieLens ratings submitted by a user.

**Path params**

| Name     | Type    | Required | Description              |
|----------|---------|----------|--------------------------|
| `userId` | integer | Yes      | MovieLens user ID        |

**Response** `200`

| Field               | Type    | Description                          |
|---------------------|---------|--------------------------------------|
| `userId`            | integer | MovieLens user ID echoed back        |
| `ratings`           | array   | List of ratings                      |
| `ratings[].movieId` | string  | IMDb movie ID                        |
| `ratings[].rating`  | number  | Rating value (0.5–5.0)               |
| `ratings[].timestamp` | integer | Unix timestamp of when rated       |

**Errors:** `400` if `userId` is not a positive integer.

---

## Actors

### `GET /api/actors/:actorId/movies-with-financials`

**(Complex query)** Returns an actor's full filmography with per-movie financials and a comparison of each movie's rating against the actor's career average.

**Path params**

| Name      | Type    | Required | Description              |
|-----------|---------|----------|--------------------------|
| `actorId` | integer | Yes      | Internal people table ID |

**Response** `200`

| Field                        | Type    | Description                                      |
|------------------------------|---------|--------------------------------------------------|
| `actorId`                    | integer | Actor ID echoed back                             |
| `actorName`                  | string  | Actor's name                                     |
| `movies`                     | array   | Filmography entries                              |
| `movies[].imdbId`            | string  | IMDb movie ID                                    |
| `movies[].primaryTitle`      | string  | Movie title                                      |
| `movies[].startYear`         | integer | Release year                                     |
| `movies[].role`              | string  | Actor's role/job in this film                    |
| `movies[].budget`            | number  | Production budget (USD)                          |
| `movies[].revenue`           | number  | Box-office revenue (USD)                         |
| `movies[].productionCompany` | string  | Primary production company                       |
| `movies[].avgMovieRating`    | number  | Average rating for this movie                    |
| `movies[].actorAvgRating`    | number  | Actor's career-wide average rating               |
| `movies[].ratingVsCareer`    | string  | `"above"`, `"below"`, or `"average"` vs. career |

**Errors:** `400` if `actorId` is not a positive integer; `404` if actor not found.

---

## Analytics

### `GET /api/analytics/movies-by-genre-year`

**(Complex query)** Returns movies in a genre and year range, ranked by average MovieLens rating within the genre, with each movie's top production company.

**Query params**

| Name        | Type    | Required | Description                    |
|-------------|---------|----------|--------------------------------|
| `genre`     | string  | Yes      | Genre name (e.g. `"Drama"`)    |
| `startYear` | integer | Yes      | First year (inclusive)         |
| `endYear`   | integer | Yes      | Last year (inclusive)          |

**Response** `200`

| Field                    | Type    | Description                          |
|--------------------------|---------|--------------------------------------|
| `genre`                  | string  | Requested genre                      |
| `startYear`              | integer | Requested start year                 |
| `endYear`                | integer | Requested end year                   |
| `movies`                 | array   | Ranked movie list                    |
| `movies[].primaryTitle`  | string  | Movie title                          |
| `movies[].startYear`     | integer | Release year                         |
| `movies[].originalLanguage` | string | Original language code            |
| `movies[].genre`         | string  | Genre echoed back                    |
| `movies[].topCompany`    | string  | Top-credited production company      |
| `movies[].avgRating`     | number  | Average MovieLens rating             |
| `movies[].numRaters`     | integer | Number of MovieLens raters           |
| `movies[].genreRank`     | integer | Rank within genre+year window        |

**Errors:** `400` if `genre` is missing or years are invalid.

---

### `GET /api/analytics/top-actors-by-avg-gross`

**(Complex query)** Returns the top N actors ranked by average box-office gross across movies with at least 5 acting credits.

**Query params**

| Name    | Type    | Required | Description                          |
|---------|---------|----------|--------------------------------------|
| `limit` | integer | No       | Number of actors to return (default 10, max 100) |

**Response** `200`

| Field               | Type    | Description                       |
|---------------------|---------|-----------------------------------|
| `limit`             | integer | Effective limit used              |
| `actors`            | array   | Ranked actor list                 |
| `actors[].actorId`  | integer | Internal people table ID          |
| `actors[].name`     | string  | Actor's name                      |
| `actors[].numMovies`| integer | Number of movies with revenue data|
| `actors[].avgGross` | number  | Average box-office gross (USD)    |

---

### `GET /api/analytics/actor-pairs-by-shared-movies`

**(Complex query)** Returns pairs of actors who appeared together in 3 or more movies, ranked by average shared-movie rating.

**Query params**

| Name    | Type    | Required | Description                                |
|---------|---------|----------|--------------------------------------------|
| `limit` | integer | No       | Max pairs to return (default 500, max 5000)|

**Response** `200`

| Field                       | Type    | Description                          |
|-----------------------------|---------|--------------------------------------|
| `pairs`                     | array   | List of actor pairs                  |
| `pairs[].actor1Id`          | integer | First actor's internal ID            |
| `pairs[].actor2Id`          | integer | Second actor's internal ID           |
| `pairs[].actor1Name`        | string  | First actor's name                   |
| `pairs[].actor2Name`        | string  | Second actor's name                  |
| `pairs[].sharedMovies`      | integer | Number of movies they both appeared in |
| `pairs[].avgSharedRating`   | number  | Average rating across shared movies  |

---

## Error Reference

| Status | Meaning                                          |
|--------|--------------------------------------------------|
| 200    | Success                                          |
| 400    | Bad request — missing or invalid parameter       |
| 404    | Resource not found                               |
| 500    | Database error (details included outside production) |
