# Movie analytics & discovery (CIS 5500)

A movie analytics and discovery platform for exploring relationships between movies, actors, and audience ratings. The app integrates metadata and user ratings from **The Movies Dataset** and **IMDb Actors and Movies** datasets so users can search movies and actors, inspect cast and financials, and use analytics dashboards for trends over time.

**Course:** CIS 5500 — University of Pennsylvania

## Team

| Name            | Email                     | GitHub       |
|-----------------|---------------------------|--------------|
| Ryan Tobin      | tobinry@seas.upenn.edu    | tobinryan    |
| Zachary Harpaz  | zharpaz@seas.upenn.edu    | zachharpaz   |
| Maximilian Chuang | mchuang1@seas.upenn.edu | mxchng       |
| Aaron Meslin    | aameslin@seas.upenn.edu   | AaronMeslin  |

## Planned experience

- Movie search and detail (cast, release, budget, revenue, ratings).
- Actor profile pages.
- Analytics dashboards (genres, profitability, ratings over time).

**Data discovery notebook:** [Google Colab](https://colab.research.google.com/drive/1XyEJrp5QuiuXzByjibBRxAT0h4qPq8bI?usp=sharing)

## Tech stack

- **Database:** PostgreSQL (AWS RDS)
- **Backend:** Node.js / Express
- **Frontend:** React
- **Data pipeline:** Python (pandas, psycopg2); raw data from Kaggle (`kagglehub` or Kaggle API)

## Directory layout

| Directory   | Description                                            |
|-------------|--------------------------------------------------------|
| `docs/`     | Schema notes, data source documentation              |
| `data/`     | Raw and processed files (not committed)                |
| `db/`       | SQL schema, queries, load scripts                       |
| `pipeline/` | Fetch, clean, export scripts                            |
| `server/`   | Node/Express API                                        |
| `client/`   | React app                                               |

