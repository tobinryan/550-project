# Server (Express API)

## Setup

```bash
cd server
npm install
```

Create a `.env` at the **repository root** with `DATABASE_URL`.

## Run

```bash
cd server
npm run dev
```


## Routes

| Method | Path | SQL |
|--------|------|-----|
| `GET` | `/health` | — |
| `GET` | `/api/actors/:actorId/movies-with-financials` | `02_movies_for_actor_with_financials.sql` |
| `GET` | `/api/analytics/movies-by-genre-year?genre=&startYear=&endYear=` | `01_movies_by_genre_and_year.sql` |
| `GET` | `/api/analytics/top-actors-by-avg-gross?limit=10` | `03_top_actors_by_avg_gross.sql` |
| `GET` | `/api/analytics/actor-pairs-by-shared-movies?limit=500` (optional; default **500**, max **5000**) | `04_actor_pairs_by_shared_movies.sql` |

Examples:

```bash
curl -sS "http://localhost:3001/api/analytics/movies-by-genre-year?genre=Drama&startYear=2000&endYear=2010"
curl -sS "http://localhost:3001/api/analytics/top-actors-by-avg-gross?limit=10"
curl -sS "http://localhost:3001/api/analytics/actor-pairs-by-shared-movies?limit=100"
```

