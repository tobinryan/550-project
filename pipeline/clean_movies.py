"""Merge TMDB movie metadata with IMDb title basics (+ optional IMDb ratings).

Pulls from ``data/raw/the-movies-dataset`` (Kaggle *The Movies Dataset*) and
``data/raw/imdb-actors-movies`` (Kaggle *IMDb Actors and Movies*: ``titles.csv``).
Optional ``title.ratings.tsv`` in the IMDb folder is merged when present; the
Kaggle IMDb bundle does not ship aggregate ratings, so TMDB scores are primary.

Spits out movies (imdb_id as key), genre + company lookup tables, and junctions.
"""

import ast
import sys
from pathlib import Path

import pandas as pd

_PIPELINE_DIR = Path(__file__).resolve().parent
if str(_PIPELINE_DIR) not in sys.path:
    sys.path.insert(0, str(_PIPELINE_DIR))

from paths import IMDB_KAGGLE_DIR, MOVIES_DATASET_DIR


# helpers

def _safe_parse_json_col(val):
    """TMDB embeds lists as JSON like strings in CSV cells."""
    if pd.isna(val):
        return []
    try:
        parsed = ast.literal_eval(val)
        if isinstance(parsed, list):
            return parsed
        return []
    except (ValueError, SyntaxError):
        return []


def _coerce_int(series: pd.Series) -> pd.Series:
    """Int64 with NA for garbage values."""
    return pd.to_numeric(series, errors="coerce").astype("Int64")


# TMDB

def load_tmdb_metadata(path: Path | None = None) -> pd.DataFrame:
    """movies_metadata.csv: tmdb_id, imdb_id, money fields, genres/companies as parsed lists."""
    if path is None:
        path = MOVIES_DATASET_DIR / "movies_metadata.csv"

    # ``adult`` has malformed values in the public dump; keep as string until merge.
    df = pd.read_csv(
        path,
        low_memory=False,
        dtype={"imdb_id": str, "adult": str},
    )

    # id is supposed to be numeric; sometimes it isn't; drop those rows
    df = df[pd.to_numeric(df["id"], errors="coerce").notna()].copy()
    df["tmdb_id"] = df["id"].astype(int)

    # need a real IMDb key
    df = df[df["imdb_id"].str.startswith("tt", na=False)].copy()

    df["budget"] = _coerce_int(df["budget"])
    df["revenue"] = _coerce_int(df["revenue"])
    df["popularity"] = pd.to_numeric(df["popularity"], errors="coerce")
    df["vote_average"] = pd.to_numeric(df["vote_average"], errors="coerce")
    df["vote_count"] = _coerce_int(df["vote_count"])

    df["genres_raw"] = df["genres"].apply(_safe_parse_json_col)
    df["production_companies_raw"] = df["production_companies"].apply(
        _safe_parse_json_col
    )

    keep = [
        "tmdb_id", "imdb_id", "budget", "revenue",
        "original_title", "homepage", "original_language",
        "overview", "popularity", "release_date", "status",
        "tagline", "vote_average", "vote_count",
        "genres_raw", "production_companies_raw",
    ]
    return df[keep].reset_index(drop=True)


# IMDb

def load_imdb_basics(path: Path | None = None) -> pd.DataFrame:
    """IMDb title basics (``titles.csv`` from Dataset 2 or legacy ``title.basics.tsv``)."""
    if path is None:
        path = IMDB_KAGGLE_DIR / "titles.csv"

    if path.suffix.lower() == ".tsv":
        df = pd.read_csv(path, sep="\t", low_memory=False, na_values="\\N")
    else:
        df = pd.read_csv(path, low_memory=False, na_values="\\N")

    # movies + made for TV movies; drop shorts, etc.
    df = df[df["titleType"].isin(["movie", "tvMovie"])].copy()

    df.rename(
        columns={
            "tconst": "imdb_id",
            "primaryTitle": "primary_title",
            "originalTitle": "original_title_imdb",
            "isAdult": "is_adult",
            "startYear": "start_year",
            "endYear": "end_year",
            "runtimeMinutes": "runtime_minutes",
        },
        inplace=True,
    )

    # Kaggle CSV uses 0/1; TSV uses boolean-ish
    if df["is_adult"].dtype != "boolean":
        df["is_adult"] = df["is_adult"].map(
            lambda x: True
            if x is True or x == 1 or x == "1"
            else False
            if x is False or x == 0 or x == "0"
            else pd.NA
        ).astype("boolean")
    else:
        df["is_adult"] = df["is_adult"].astype("boolean")
    df["start_year"] = _coerce_int(df["start_year"])
    df["end_year"] = _coerce_int(df["end_year"])
    df["runtime_minutes"] = _coerce_int(df["runtime_minutes"])

    # IMDb genres are one string; we'll merge with TMDB later
    df["imdb_genres"] = df["genres"].apply(
        lambda x: [g.strip() for g in x.split(",")] if pd.notna(x) else []
    )

    keep = [
        "imdb_id", "primary_title", "original_title_imdb", "is_adult",
        "start_year", "end_year", "runtime_minutes", "imdb_genres",
    ]
    return df[keep].reset_index(drop=True)


def load_imdb_ratings(path: Path | None = None) -> pd.DataFrame:
    """title.ratings: aggregate score + vote count per title (optional)."""
    if path is None:
        path = IMDB_KAGGLE_DIR / "title.ratings.tsv"

    if not path.is_file():
        return pd.DataFrame(
            columns=["imdb_id", "imdb_avg_rating", "imdb_num_votes"]
        )

    df = pd.read_csv(path, sep="\t", na_values="\\N")
    df.rename(
        columns={
            "tconst": "imdb_id",
            "averageRating": "imdb_avg_rating",
            "numVotes": "imdb_num_votes",
        },
        inplace=True,
    )
    return df


# merge everything

def clean_movies(
    tmdb_path: Path | None = None,
    imdb_basics_path: Path | None = None,
    imdb_ratings_path: Path | None = None,
) -> dict[str, pd.DataFrame]:
    """movies, genres, movie_genres, production_companies, movies_production_companies."""
    # load
    tmdb = load_tmdb_metadata(tmdb_path)
    imdb = load_imdb_basics(imdb_basics_path)
    imdb_ratings = load_imdb_ratings(imdb_ratings_path)

    # TMDB drives the row set; IMDb fills in what we don't have from TMDB
    merged = tmdb.merge(imdb, on="imdb_id", how="left")
    merged = merged.merge(imdb_ratings, on="imdb_id", how="left")

    # core movie row
    movies = pd.DataFrame()
    movies["imdb_id"] = merged["imdb_id"]
    movies["movies_dataset_id"] = merged["tmdb_id"]
    movies["budget"] = merged["budget"]
    movies["original_title"] = merged["original_title"].fillna(
        merged["original_title_imdb"]
    )
    movies["primary_title"] = merged["primary_title"]
    movies["is_adult"] = merged["is_adult"]
    movies["homepage"] = merged["homepage"]
    movies["original_language"] = merged["original_language"]
    movies["overview"] = merged["overview"]
    movies["start_year"] = merged["start_year"]
    movies["end_year"] = merged["end_year"]
    movies["runtime_minutes"] = merged["runtime_minutes"]
    movies["revenue"] = merged["revenue"]
    movies["popularity"] = merged["popularity"]
    movies["release_date"] = merged["release_date"]
    movies["status"] = merged["status"]
    movies["tagline"] = merged["tagline"]

    # votes: TMDB first, then IMDb aggregate if missing
    movies["vote_average"] = merged["vote_average"].fillna(
        merged["imdb_avg_rating"]
    )
    movies["vote_count"] = merged["vote_count"].fillna(
        merged["imdb_num_votes"]
    )

    # shouldn't happen often but be safe
    movies.drop_duplicates(subset="imdb_id", keep="first", inplace=True)
    movies.reset_index(drop=True, inplace=True)

    # trim str columns
    for col in movies.select_dtypes(include="object").columns:
        movies[col] = movies[col].where(movies[col].isna(), movies[col].astype(str).str.strip())

    # genres: union TMDB dicts + IMDb string list
    genre_rows = []
    for _, row in merged.iterrows():
        # TMDB: [{"name": "..."}]; IMDb: ["Action", "Drama", ...]
        genre_names = set()
        genres_raw = row.get("genres_raw", [])
        imdb_genres = row.get("imdb_genres", [])
        for g in (genres_raw if isinstance(genres_raw, list) else []):
            if isinstance(g, dict) and "name" in g:
                genre_names.add(g["name"].strip())
        for g in (imdb_genres if isinstance(imdb_genres, list) else []):
            if g and g != "\\N":
                genre_names.add(g.strip())

        for name in genre_names:
            genre_rows.append({"movie_id": row["imdb_id"], "genre": name})

    movie_genres = pd.DataFrame(genre_rows).drop_duplicates()
    genres = pd.DataFrame({"genre": movie_genres["genre"].unique()})

    # companies from TMDB JSON
    company_rows = []
    for _, row in merged.iterrows():
        for c in row.get("production_companies_raw", []):
            if isinstance(c, dict) and "id" in c and "name" in c:
                company_rows.append({
                    "movie_id": row["imdb_id"],
                    "company_id": int(c["id"]),
                    "company_name": c["name"].strip(),
                })

    if company_rows:
        pc_df = pd.DataFrame(company_rows)
        production_companies = (
            pc_df[["company_id", "company_name"]]
            .drop_duplicates(subset="company_id")
            .rename(columns={"company_id": "id", "company_name": "name"})
        )
        movies_production_companies = (
            pc_df[["movie_id", "company_id"]]
            .drop_duplicates()
            .rename(columns={"company_id": "production_company"})
        )
    else:
        production_companies = pd.DataFrame(columns=["id", "name"])
        movies_production_companies = pd.DataFrame(
            columns=["movie_id", "production_company"]
        )

    return {
        "movies": movies,
        "genres": genres,
        "movie_genres": movie_genres,
        "production_companies": production_companies,
        "movies_production_companies": movies_production_companies,
    }


if __name__ == "__main__":
    result = clean_movies()
    for name, df in result.items():
        print(f"{name}: {df.shape[0]} rows, {df.shape[1]} cols")
        print(df.head(3))
        print()
