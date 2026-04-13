"""Stable locations for CIS 5500 raw datasets (Kaggle downloads)."""

from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = PROJECT_ROOT / "data" / "raw"

# Dataset 1: The Movies Dataset (MovieLens + TMDB) — rounakbanik/the-movies-dataset
MOVIES_DATASET_DIR = RAW_DIR / "the-movies-dataset"

# Dataset 2: IMDb Actors and Movies — rishabjadhav/imdb-actors-and-movies
IMDB_KAGGLE_DIR = RAW_DIR / "imdb-actors-movies"
