"""Put IDs together: IMDb uses tt..., TMDB and MovieLens use their own ints.

``links.csv`` lives next to ``ratings.csv`` in *The Movies Dataset* download.
"""

import sys
from pathlib import Path

import pandas as pd

_PIPELINE_DIR = Path(__file__).resolve().parent
if str(_PIPELINE_DIR) not in sys.path:
    sys.path.insert(0, str(_PIPELINE_DIR))

from paths import MOVIES_DATASET_DIR


def _coerce_int(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce").astype("Int64")


def build_id_mapping(links_path: Path | None = None) -> pd.DataFrame:
    """Read links.csv into ml_movie_id, imdb_id (tt...), tmdb_id."""
    if links_path is None:
        links_path = MOVIES_DATASET_DIR / "links.csv"

    df = pd.read_csv(links_path)
    df.rename(
        columns={
            "movieId": "ml_movie_id",
            "imdbId": "imdb_id_num",
            "tmdbId": "tmdb_id",
        },
        inplace=True,
    )

    df["imdb_id"] = df["imdb_id_num"].apply(
        lambda x: f"tt{int(x):07d}" if pd.notna(x) else None
    )
    df["tmdb_id"] = _coerce_int(df["tmdb_id"])

    return df[["ml_movie_id", "imdb_id", "tmdb_id"]].copy()


def get_tmdb_to_imdb_map(links_path: Path | None = None) -> pd.DataFrame:
    """For credits.csv: map tmdb movie id to tt... (deduped on tmdb)."""
    mapping = build_id_mapping(links_path)
    result = mapping.dropna(subset=["tmdb_id", "imdb_id"])[["tmdb_id", "imdb_id"]].copy()
    result["tmdb_id"] = result["tmdb_id"].astype(int)
    result.drop_duplicates(subset="tmdb_id", keep="first", inplace=True)
    return result.reset_index(drop=True)


def get_ml_to_imdb_map(links_path: Path | None = None) -> pd.DataFrame:
    """Just MovieLens id to imdb if that's all you need."""
    mapping = build_id_mapping(links_path)
    result = mapping.dropna(subset=["imdb_id"])[["ml_movie_id", "imdb_id"]].copy()
    result.drop_duplicates(subset="ml_movie_id", keep="first", inplace=True)
    return result.reset_index(drop=True)


def enrich_with_all_ids(
    df: pd.DataFrame,
    id_col: str,
    links_path: Path | None = None,
) -> pd.DataFrame:
    """Merge in the other two ids; id_col must be imdb_id, tmdb_id, or ml_movie_id."""
    mapping = build_id_mapping(links_path)

    if id_col not in ("imdb_id", "tmdb_id", "ml_movie_id"):
        raise ValueError(f"id_col must be imdb_id, tmdb_id, or ml_movie_id; got {id_col}")

    return df.merge(mapping, on=id_col, how="left")


