"""Pull down raw files for the pipeline: IMDb dumps, MovieLens zip, TMDB off Kaggle.

IMDb and MovieLens are straight HTTP. TMDB needs the kaggle CLI + API key in
~/.kaggle/kaggle.json
"""

import gzip
import io
import os
import shutil
import zipfile
from pathlib import Path
from urllib.request import urlretrieve, urlopen

RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"

# IMDb: gzipped TSVs, we gunzip next to the download

IMDB_BASE_URL = "https://datasets.imdbws.com"
IMDB_FILES = [
    "title.basics.tsv.gz",
    "title.ratings.tsv.gz",
    "name.basics.tsv.gz",
]


def fetch_imdb(dest_dir: Path = RAW_DIR) -> list[Path]:
    """Grab the three TSVs we care about; skip if the .tsv already exists."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    downloaded = []

    for filename in IMDB_FILES:
        gz_path = dest_dir / filename
        tsv_path = dest_dir / filename.replace(".gz", "")

        if tsv_path.exists():
            print(f"  [skip] {tsv_path.name} already exists")
            downloaded.append(tsv_path)
            continue

        print(f"  Downloading {filename} ...")
        url = f"{IMDB_BASE_URL}/{filename}"
        urlretrieve(url, gz_path)

        print(f"  Decompressing to {tsv_path.name} ...")
        with gzip.open(gz_path, "rb") as f_in, open(tsv_path, "wb") as f_out:
            shutil.copyfileobj(f_in, f_out)
        gz_path.unlink()

        downloaded.append(tsv_path)

    return downloaded


# MovieLens (folder is ml latest on disk)

MOVIELENS_URL = "https://files.grouplens.org/datasets/movielens/ml-latest.zip"


def fetch_movielens(dest_dir: Path = RAW_DIR) -> Path:
    """Unzip into the ml latest folder under data/raw; noop if that folder is already there."""
    dest_dir.mkdir(parents=True, exist_ok=True)
    extracted_dir = dest_dir / "ml-latest"

    if extracted_dir.exists():
        print(f"  [skip] {extracted_dir} already exists")
        return extracted_dir

    zip_path = dest_dir / "ml-latest.zip"
    print("  Downloading ml-latest.zip ...")
    urlretrieve(MOVIELENS_URL, zip_path)

    print("  Extracting ...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(dest_dir)
    zip_path.unlink()

    return extracted_dir


# TMDB via Kaggle ("The Movies Dataset")

KAGGLE_DATASET = "rounakbanik/the-movies-dataset"
TMDB_EXPECTED_FILES = [
    "movies_metadata.csv",
    "credits.csv",
    "keywords.csv",
]


def fetch_tmdb_kaggle(dest_dir: Path = RAW_DIR) -> Path:
    """kaggle API writes under data/raw/tmdb. Prints hints if import or auth fails."""
    tmdb_dir = dest_dir / "tmdb"
    tmdb_dir.mkdir(parents=True, exist_ok=True)

    already_have = [f for f in TMDB_EXPECTED_FILES if (tmdb_dir / f).exists()]
    if len(already_have) == len(TMDB_EXPECTED_FILES):
        print(f"  [skip] All TMDB files already in {tmdb_dir}")
        return tmdb_dir

    try:
        from kaggle.api.kaggle_api_extended import KaggleApi

        api = KaggleApi()
        api.authenticate()
        print(f"  Downloading Kaggle dataset: {KAGGLE_DATASET} ...")
        api.dataset_download_files(KAGGLE_DATASET, path=tmdb_dir, unzip=True)
    except ImportError:
        print(
            "  [error] kaggle package not installed. Run: pip install kaggle\n"
            "  Alternatively, download manually from:\n"
            "    https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset\n"
            f"  and place the CSV files in {tmdb_dir}"
        )
    except Exception as e:
        print(f"  [error] Kaggle download failed: {e}")
        print(
            f"  Download manually and place CSV files in {tmdb_dir}"
        )

    return tmdb_dir


def fetch_all(dest_dir: Path = RAW_DIR) -> dict[str, Path | list[Path]]:
    """IMDb + MovieLens + TMDB in one go."""
    print("=== Fetching IMDb datasets ===")
    imdb_paths = fetch_imdb(dest_dir)

    print("\n=== Fetching MovieLens dataset ===")
    ml_path = fetch_movielens(dest_dir)

    print("\n=== Fetching TMDB (Kaggle) dataset ===")
    tmdb_path = fetch_tmdb_kaggle(dest_dir)

    return {
        "imdb": imdb_paths,
        "movielens": ml_path,
        "tmdb": tmdb_path,
    }


if __name__ == "__main__":
    paths = fetch_all()
    print("\nDone. Downloaded to:")
    for source, p in paths.items():
        print(f"  {source}: {p}")
