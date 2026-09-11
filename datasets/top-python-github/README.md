# Top Python GitHub Projects

GitHub Search API snapshot of the top 10 non-archived Python repositories by
stars, used as the target corpus for the cognium-ai (SAST + LLM) Python top-10
runs in `results/2026-05-27/`.

- `projects.json`: selection query, generation timestamp, and the resolved
  repository list.
- Selection: `language:Python stars:>5000 archived:false`, sorted by stars,
  descending, `per_page=10`.
- Revision: the `generated_at` field inside `projects.json`. Repositories are
  scanned at their default branch head at run time; each result set must record
  the commit it scanned.

Not part of the static-analysis snapshots shown on `cognium.dev/benchmark`.
