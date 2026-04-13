"""Write cleaned tables to data/processed/*.csv for PostgreSQL COPY."""

import sys
from pathlib import Path

import pandas as pd

_PIPELINE_DIR = Path(__file__).resolve().parent
if str(_PIPELINE_DIR) not in sys.path:
    sys.path.insert(0, str(_PIPELINE_DIR))

from clean_movies import clean_movies
from clean_people import clean_people
from clean_ratings import clean_ratings
from entity_resolution import get_tmdb_to_imdb_map

PROJECT_ROOT = Path(__file__).resolve().parent.parent
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

MOVIE_COLS = [
    "imdb_id",
    "movies_dataset_id",
    "budget",
    "original_title",
    "primary_title",
    "is_adult",
    "homepage",
    "original_language",
    "overview",
    "start_year",
    "end_year",
    "runtime_minutes",
    "revenue",
    "popularity",
    "release_date",
    "status",
    "tagline",
    "vote_average",
    "vote_count",
]


def _bool_for_csv(s: pd.Series) -> pd.Series:
    def cell(v):
        if pd.isna(v):
            return "\\N"
        return "true" if bool(v) else "false"

    return s.map(cell)


def export_all(
    out_dir: Path | None = None,
    *,
    tmdb_to_imdb_map: pd.DataFrame | None = None,
) -> dict[str, Path]:
    out_dir = out_dir or PROCESSED_DIR
    out_dir.mkdir(parents=True, exist_ok=True)

    if tmdb_to_imdb_map is None:
        tmdb_to_imdb_map = get_tmdb_to_imdb_map()

    movie_pack = clean_movies()
    movies = movie_pack["movies"].copy()
    for c in MOVIE_COLS:
        if c not in movies.columns:
            movies[c] = pd.NA
    movies = movies[MOVIE_COLS]
    movies["is_adult"] = _bool_for_csv(movies["is_adult"])

    imdb_set = set(movies["imdb_id"].astype(str))

    movie_genres = movie_pack["movie_genres"].copy()
    movie_genres = movie_genres[movie_genres["movie_id"].astype(str).isin(imdb_set)]

    mpc = movie_pack["movies_production_companies"].copy()
    mpc = mpc[mpc["movie_id"].astype(str).isin(imdb_set)]

    people_pack = clean_people(tmdb_to_imdb_map=tmdb_to_imdb_map)
    people_movies = people_pack["people_movies"].copy()
    people_movies = people_movies[
        people_movies["movie_id"].astype(str).isin(imdb_set)
    ]

    ratings = clean_ratings()["ratings"].copy()
    ratings = ratings[ratings["movie_id"].astype(str).isin(imdb_set)]

    paths = {}
    csv_kw = dict(index=False, na_rep="\\N", encoding="utf-8")

    def write(name: str, df: pd.DataFrame, columns: list[str]):
        p = out_dir / f"{name}.csv"
        df[columns].to_csv(p, **csv_kw)
        paths[name] = p

    write("movies", movies, MOVIE_COLS)
    write("genres", movie_pack["genres"], ["genre"])
    write("movie_genres", movie_genres, ["movie_id", "genre"])
    write(
        "production_companies",
        movie_pack["production_companies"],
        ["id", "name"],
    )
    write(
        "movies_production_companies",
        mpc,
        ["movie_id", "production_company"],
    )
    write("people", people_pack["people"], ["id", "name", "birth_year", "death_year", "gender"])
    write("people_movies", people_movies, ["movie_id", "people_id", "job"])
    write("ratings", ratings, ["movie_id", "user_id", "rating", "timestamp"])

    return paths


if __name__ == "__main__":
    out = export_all()
    for k, p in out.items():
        print(k, p)
