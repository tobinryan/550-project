"""Download CIS 5500 raw data from Kaggle (matches the project proposal).

Dataset 1 — The Movies Dataset (MovieLens + TMDB):
  https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset
Dataset 2 — IMDb Actors and Movies:
  https://www.kaggle.com/datasets/rishabjadhav/imdb-actors-and-movies

Uses `kagglehub`when available; falls back to the `kaggle` Python API. Copy extracted files into `data/raw/` so the
cleaning pipeline does not depend on the kagglehub cache path.

Auth: place API credentials in ``~/.kaggle/kaggle.json`` (Kaggle account → API).
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

_PIPELINE_DIR = Path(__file__).resolve().parent
if str(_PIPELINE_DIR) not in sys.path:
    sys.path.insert(0, str(_PIPELINE_DIR))

from paths import IMDB_KAGGLE_DIR, MOVIES_DATASET_DIR, RAW_DIR

# Slugs must match the proposal / notebook
KAGGLE_MOVIES_DATASET = "rounakbanik/the-movies-dataset"
KAGGLE_IMDB_ACTORS_DATASET = "rishabjadhav/imdb-actors-and-movies"

# Minimum files the pipeline expects after fetch
MOVIES_EXPECTED = (
    "movies_metadata.csv",
    "credits.csv",
    "ratings.csv",
    "links.csv",
)
IMDB_EXPECTED = ("titles.csv", "names.csv", "combined.csv")


def _copy_dataset_files(src_dir: Path, dest_dir: Path) -> None:
    """Copy every file from an extracted Kaggle folder into dest_dir."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    for item in src_dir.iterdir():
        if item.is_file():
            shutil.copy2(item, dest_dir / item.name)


def _have_files(dir_path: Path, names: tuple[str, ...]) -> bool:
    return all((dir_path / n).is_file() for n in names)


def _download_via_kagglehub(slug: str) -> Path | None:
    try:
        import kagglehub
    except ImportError:
        return None
    print(f"  Using kagglehub to download {slug} ...")
    return Path(kagglehub.dataset_download(slug))


def _download_via_kaggle_api(slug: str, dest_dir: Path) -> bool:
    try:
        from kaggle.api.kaggle_api_extended import KaggleApi
    except ImportError:
        print("  [error] Install kaggle: pip install kaggle")
        return False
    try:
        api = KaggleApi()
        api.authenticate()
        print(f"  Using Kaggle API to download {slug} ...")
        dest_dir.mkdir(parents=True, exist_ok=True)
        api.dataset_download_files(slug, path=dest_dir, unzip=True)
        return True
    except Exception as e:
        print(f"  [error] Kaggle API download failed: {e}")
        return False


def fetch_movies_dataset(dest: Path = MOVIES_DATASET_DIR) -> Path:
    """Dataset 1: TMDB metadata, credits, MovieLens ratings + links (same folder)."""
    if _have_files(dest, MOVIES_EXPECTED):
        print(f"  [skip] The Movies Dataset files already in {dest}")
        return dest

    src = _download_via_kagglehub(KAGGLE_MOVIES_DATASET)
    if src is not None and src.is_dir():
        _copy_dataset_files(src, dest)
    elif not _download_via_kaggle_api(KAGGLE_MOVIES_DATASET, dest):
        print(
            "  Manual download:\n"
            f"    https://www.kaggle.com/datasets/{KAGGLE_MOVIES_DATASET}\n"
            f"  Unzip CSVs into: {dest}"
        )

    if not _have_files(dest, MOVIES_EXPECTED):
        print(
            f"  [warn] Expected files not all present under {dest}. "
            "See MOVIES_EXPECTED in fetch_data.py."
        )
    return dest


def fetch_imdb_actors_movies(dest: Path = IMDB_KAGGLE_DIR) -> Path:
    """Dataset 2: titles.csv, names.csv, combined.csv (IMDb-style actor/movie tables)."""
    if _have_files(dest, IMDB_EXPECTED):
        print(f"  [skip] IMDb Kaggle files already in {dest}")
        return dest

    src = _download_via_kagglehub(KAGGLE_IMDB_ACTORS_DATASET)
    if src is not None and src.is_dir():
        _copy_dataset_files(src, dest)
    elif not _download_via_kaggle_api(KAGGLE_IMDB_ACTORS_DATASET, dest):
        print(
            "  Manual download:\n"
            f"    https://www.kaggle.com/datasets/{KAGGLE_IMDB_ACTORS_DATASET}\n"
            f"  Unzip CSVs into: {dest}"
        )

    if not _have_files(dest, IMDB_EXPECTED):
        print(
            f"  [warn] Expected files not all present under {dest}. "
            "See IMDB_EXPECTED in fetch_data.py."
        )
    return dest


def fetch_all(raw_dir: Path = RAW_DIR) -> dict[str, Path]:
    """Download both proposal datasets into data/raw/."""
    print("=== Dataset 1: The Movies Dataset (Kaggle) ===")
    movies_path = fetch_movies_dataset(raw_dir / "the-movies-dataset")

    print("\n=== Dataset 2: IMDb Actors and Movies (Kaggle) ===")
    imdb_path = fetch_imdb_actors_movies(raw_dir / "imdb-actors-movies")

    return {
        "the_movies_dataset": movies_path,
        "imdb_actors_movies": imdb_path,
    }


if __name__ == "__main__":
    out = fetch_all()
    print("\nDone. Raw data directories:")
    for key, p in out.items():
        print(f"  {key}: {p}")
