"""MovieLens per user ratings, joined through links.csv so movie_id is IMDb.

Aggregate IMDb and TMDB scores live on the movies table from clean_movies; this is
just the 0.5 to 5 stars from the ml latest export. Output: movie_id (tt...), user_id,
rating, timestamp.
"""

from pathlib import Path

import pandas as pd

RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"


def _coerce_int(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce").astype("Int64")


def load_movielens_ratings(
    ratings_path: Path | None = None,
) -> pd.DataFrame:
    """Raw ratings: internal ml movie id, user, stars, unix time."""
    if ratings_path is None:
        ratings_path = RAW_DIR / "ml-latest" / "ratings.csv"

    df = pd.read_csv(ratings_path)
    df.rename(
        columns={
            "movieId": "ml_movie_id",
            "userId": "user_id",
        },
        inplace=True,
    )
    df["rating"] = pd.to_numeric(df["rating"], errors="coerce")
    df["timestamp"] = _coerce_int(df["timestamp"])

    return df[["ml_movie_id", "user_id", "rating", "timestamp"]]


def load_movielens_links(
    links_path: Path | None = None,
) -> pd.DataFrame:
    """Bridge file: MovieLens id to numeric IMDb id we turn into tt... strings."""
    if links_path is None:
        links_path = RAW_DIR / "ml-latest" / "links.csv"

    df = pd.read_csv(links_path)
    df.rename(
        columns={
            "movieId": "ml_movie_id",
            "imdbId": "imdb_id_num",
            "tmdbId": "tmdb_id",
        },
        inplace=True,
    )

    # links give bare integers; rest of the pipeline wants tt + 7 digits
    df["imdb_id"] = df["imdb_id_num"].apply(
        lambda x: f"tt{int(x):07d}" if pd.notna(x) else None
    )
    df["tmdb_id"] = _coerce_int(df["tmdb_id"])

    return df[["ml_movie_id", "imdb_id", "tmdb_id"]]


def clean_ratings(
    ratings_path: Path | None = None,
    links_path: Path | None = None,
) -> dict[str, pd.DataFrame]:
    """Inner join ratings to links, drop unresolved rows, dedupe user and movie."""
    ratings = load_movielens_ratings(ratings_path)
    links = load_movielens_links(links_path)

    # attach tt id
    merged = ratings.merge(links[["ml_movie_id", "imdb_id"]], on="ml_movie_id", how="inner")

    # inner join already dropped most junk; belt and suspenders
    merged = merged.dropna(subset=["imdb_id"]).copy()

    result = merged[["imdb_id", "user_id", "rating", "timestamp"]].copy()
    result.rename(columns={"imdb_id": "movie_id"}, inplace=True)

    # one row per user per movie (keep last if they rated twice)
    result.drop_duplicates(
        subset=["movie_id", "user_id"], keep="last", inplace=True
    )
    result.reset_index(drop=True, inplace=True)

    print(f"  Ratings: {len(ratings)} raw to {len(result)} after linking and dedup")

    return {"ratings": result}


if __name__ == "__main__":
    result = clean_ratings()
    for name, df in result.items():
        print(f"{name}: {df.shape[0]} rows, {df.shape[1]} cols")
        print(df.head(3))
        print()
