# Movie Insights

A web application for exploring movies, actors, and ratings built on integrated movie datasets (TMDB, IMDb, MovieLens).

## Team

- Ryan Tobin
- Zachary Harpaz
- Aaron Meslin
- Maximilian Chuang

**Course:** CIS 5500 — University of Pennsylvania

## Tech Stack

- **Database:** PostgreSQL (AWS RDS)
- **Backend:** Node.js / Express
- **Frontend:** React
- **Data Pipeline:** Python (pandas, psycopg2)

## Directory Layout

| Directory    | Description                                                  |
|--------------|--------------------------------------------------------------|
| `docs/`      | Schema normalization proofs, data source documentation       |
| `data/`      | Raw and processed dataset files (not committed to git)       |
| `db/`        | SQL schema, queries, loading scripts, connection info        |
| `pipeline/`  | Python scripts for cleaning and integrating datasets         |
| `server/`    | Node/Express API server                                      |
| `client/`    | React frontend application                                   |

## Milestone Status

- **M1** ✅ Project proposal
- **M2** ✅ ER diagram & initial design
- **M3** 🔄 In progress — schema, data cleaning, complex queries
- **M4** ⏳ Pending — backend API implementation
- **M5** ⏳ Pending — frontend & final demo
