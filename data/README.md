# Data layout

Raw files are **not** committed. Populate them with the CIS 5500 Kaggle sources (see `docs/data-sources.md`).

After installing pipeline dependencies (`pip install -r pipeline/requirements.txt`) and configuring `~/.kaggle/kaggle.json`:

```bash
cd pipeline
python fetch_data.py
```

This downloads and copies artifacts into:

| Path | Source |
|------|--------|
| `data/raw/the-movies-dataset/` | [The Movies Dataset](https://www.kaggle.com/datasets/rounakbanik/the-movies-dataset) — `movies_metadata.csv`, `credits.csv`, `ratings.csv`, `links.csv`, etc. |
| `data/raw/imdb-actors-movies/` | [IMDb Actors and Movies](https://www.kaggle.com/datasets/rishabjadhav/imdb-actors-and-movies) — `titles.csv`, `names.csv`, `combined.csv` |

The cleaning scripts read from those folders. Processed CSVs for loading into Postgres are written to `data/processed/` (see `pipeline/export_processed.py`).
