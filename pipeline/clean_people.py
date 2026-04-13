"""Cast and crew from TMDB credits, optionally glued to IMDb names for birth and death years.

credits.csv has nested JSON for cast and crew per tmdb movie id. name.basics
has IMDb person ids; we only match on exact name (first hit wins), which is
brittle but cheap. Pass tmdb_to_imdb_map from entity_resolution if you want
movie_id as imdb_id instead of raw TMDB ids.
"""

import ast
from pathlib import Path

import pandas as pd

RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"


def _safe_parse_json_col(val):
    """Same deal as clean_movies: list columns stored as strings."""
    if pd.isna(val):
        return []
    try:
        parsed = ast.literal_eval(val)
        return parsed if isinstance(parsed, list) else []
    except (ValueError, SyntaxError):
        return []


def _coerce_int(series: pd.Series) -> pd.Series:
    return pd.to_numeric(series, errors="coerce").astype("Int64")


GENDER_MAP = {0: None, 1: "Female", 2: "Male", 3: "Non-binary"}


# TMDB credits

def load_tmdb_credits(path: Path | None = None) -> pd.DataFrame:
    """Flatten cast + crew to one row per (movie, person, job)."""
    if path is None:
        path = RAW_DIR / "tmdb" / "credits.csv"

    df = pd.read_csv(path, dtype={"id": int})

    rows = []

    for _, record in df.iterrows():
        tmdb_movie_id = int(record["id"])

        # cast maps to job Actor
        for person in _safe_parse_json_col(record.get("cast")):
            if not isinstance(person, dict):
                continue
            rows.append({
                "tmdb_movie_id": tmdb_movie_id,
                "tmdb_person_id": int(person.get("id", 0)),
                "name": str(person.get("name", "")).strip(),
                "gender": GENDER_MAP.get(person.get("gender", 0)),
                "job": "Actor",
            })

        # crew: actual job title from JSON
        for person in _safe_parse_json_col(record.get("crew")):
            if not isinstance(person, dict):
                continue
            rows.append({
                "tmdb_movie_id": tmdb_movie_id,
                "tmdb_person_id": int(person.get("id", 0)),
                "name": str(person.get("name", "")).strip(),
                "gender": GENDER_MAP.get(person.get("gender", 0)),
                "job": str(person.get("job", "")).strip(),
            })

    return pd.DataFrame(rows)


# IMDb names

def load_imdb_people(path: Path | None = None) -> pd.DataFrame:
    """name.basics: mostly here for birth and death years."""
    if path is None:
        path = RAW_DIR / "name.basics.tsv"

    df = pd.read_csv(path, sep="\t", low_memory=False, na_values="\\N")

    df.rename(
        columns={
            "nconst": "imdb_person_id",
            "primaryName": "name",
            "birthYear": "birth_year",
            "deathYear": "death_year",
        },
        inplace=True,
    )

    df["birth_year"] = _coerce_int(df["birth_year"])
    df["death_year"] = _coerce_int(df["death_year"])
    df["name"] = df["name"].str.strip()

    return df[["imdb_person_id", "name", "birth_year", "death_year"]]


# merge

def clean_people(
    tmdb_credits_path: Path | None = None,
    imdb_people_path: Path | None = None,
    tmdb_to_imdb_map: pd.DataFrame | None = None,
) -> dict[str, pd.DataFrame]:
    """people + people_movies. Without tmdb_to_imdb_map, movie_id stays TMDB."""
    tmdb_credits = load_tmdb_credits(tmdb_credits_path)
    imdb_people = load_imdb_people(imdb_people_path)

    # one row per TMDB person id
    people_tmdb = (
        tmdb_credits[["tmdb_person_id", "name", "gender"]]
        .drop_duplicates(subset="tmdb_person_id", keep="first")
        .rename(columns={"tmdb_person_id": "id"})
    )

    # slap on years from IMDb where names match exactly
    imdb_name_lookup = (
        imdb_people.drop_duplicates(subset="name", keep="first")
        .set_index("name")[["birth_year", "death_year"]]
    )
    people_tmdb = people_tmdb.merge(
        imdb_name_lookup, left_on="name", right_index=True, how="left"
    )

    people = people_tmdb[["id", "name", "birth_year", "death_year", "gender"]].copy()
    people.reset_index(drop=True, inplace=True)

    # who worked on what
    people_movies = tmdb_credits[["tmdb_movie_id", "tmdb_person_id", "job"]].copy()
    people_movies.rename(
        columns={"tmdb_person_id": "people_id"},
        inplace=True,
    )

    # optional: swap TMDB movie id for imdb tt... id
    if tmdb_to_imdb_map is not None:
        people_movies = people_movies.merge(
            tmdb_to_imdb_map.rename(columns={"tmdb_id": "tmdb_movie_id"}),
            on="tmdb_movie_id",
            how="inner",
        )
        people_movies.rename(columns={"imdb_id": "movie_id"}, inplace=True)
        people_movies = people_movies[["movie_id", "people_id", "job"]]
    else:
        people_movies.rename(
            columns={"tmdb_movie_id": "movie_id"}, inplace=True
        )
        people_movies = people_movies[["movie_id", "people_id", "job"]]

    people_movies.drop_duplicates(
        subset=["movie_id", "people_id"], keep="first", inplace=True
    )
    people_movies.reset_index(drop=True, inplace=True)

    return {
        "people": people,
        "people_movies": people_movies,
    }


if __name__ == "__main__":
    result = clean_people()
    for name, df in result.items():
        print(f"{name}: {df.shape[0]} rows, {df.shape[1]} cols")
        print(df.head(3))
        print()
