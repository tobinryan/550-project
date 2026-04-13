"""Load data/processed/*.csv into PostgreSQL (same order as load_data.sql)."""

import os
import sys
from pathlib import Path

import psycopg2

PROJECT_ROOT = Path(__file__).resolve().parents[2]
PROCESSED = PROJECT_ROOT / "data" / "processed"
SCHEMA = PROJECT_ROOT / "db" / "schema"


def _connect():
    url = os.environ.get("DATABASE_URL")
    if url:
        return psycopg2.connect(url)
    return psycopg2.connect(
        host=os.environ.get("PGHOST", "localhost"),
        port=os.environ.get("PGPORT", "5432"),
        dbname=os.environ.get("PGDATABASE", "postgres"),
        user=os.environ.get("PGUSER", os.environ.get("USER")),
        password=os.environ.get("PGPASSWORD", ""),
    )


def _run_sql_file(conn, path: Path):
    raw = path.read_text(encoding="utf-8")
    lines = [ln for ln in raw.splitlines() if not ln.strip().startswith("--")]
    text = "\n".join(lines)
    with conn.cursor() as cur:
        for stmt in text.split(";"):
            stmt = stmt.strip()
            if stmt:
                cur.execute(stmt)
    conn.commit()


def _truncate(conn):
    with conn.cursor() as cur:
        cur.execute(
            """
            TRUNCATE TABLE
                ratings,
                people_movies,
                movie_genres,
                movies_production_companies,
                movies,
                people,
                production_companies,
                genres
            CASCADE;
            """
        )
    conn.commit()


def _copy_table(conn, table: str, columns: tuple[str, ...], csv_name: str):
    path = PROCESSED / csv_name
    if not path.exists():
        raise FileNotFoundError(path)
    cols = ", ".join(columns)
    sql = (
        f"COPY {table} ({cols}) FROM STDIN "
        "WITH (FORMAT csv, HEADER true, NULL '\\N')"
    )
    with conn.cursor() as cur:
        with path.open("r", encoding="utf-8") as f:
            cur.copy_expert(sql, f)
    conn.commit()


def load(
    *,
    init_schema: bool = False,
    skip_indexes: bool = False,
) -> None:
    try:
        from dotenv import load_dotenv

        load_dotenv(PROJECT_ROOT / ".env")
    except ImportError:
        pass

    conn = _connect()

    if init_schema:
        _run_sql_file(conn, SCHEMA / "01_create_tables.sql")

    _truncate(conn)

    copies: list[tuple[str, tuple[str, ...], str]] = [
        ("genres", ("genre",), "genres.csv"),
        ("production_companies", ("id", "name"), "production_companies.csv"),
        (
            "movies",
            (
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
            ),
            "movies.csv",
        ),
        ("movie_genres", ("movie_id", "genre"), "movie_genres.csv"),
        (
            "movies_production_companies",
            ("movie_id", "production_company"),
            "movies_production_companies.csv",
        ),
        ("people", ("id", "name", "birth_year", "death_year", "gender"), "people.csv"),
        ("people_movies", ("movie_id", "people_id", "job"), "people_movies.csv"),
        ("ratings", ("movie_id", "user_id", "rating", "timestamp"), "ratings.csv"),
    ]

    for table, cols, fname in copies:
        _copy_table(conn, table, cols, fname)

    if not skip_indexes:
        _run_sql_file(conn, SCHEMA / "02_indexes.sql")

    conn.close()


def main(argv: list[str]) -> None:
    init_schema = "--init-schema" in argv
    skip_indexes = "--skip-indexes" in argv
    load(init_schema=init_schema, skip_indexes=skip_indexes)


if __name__ == "__main__":
    main(sys.argv[1:])
