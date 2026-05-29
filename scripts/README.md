# Scripts

Reproducibility and publication helper scripts live here.

Expected future scripts:

- fetch or pin benchmark datasets
- run tool lanes with recorded commands
- normalize raw outputs into JSON and CSV
- validate `results.json` against `schemas/result.schema.json`
- generate `summary.md` from structured results

Keep scripts deterministic and avoid hiding benchmark-specific decisions inside
ad hoc transformations. Scoring rules belong in `methodology/` and benchmark
folders.

Current scripts:

- `select-top-java-projects.mjs`: refreshes `datasets/top-java-github/` from the GitHub Search API.
- `run-cognium-ai-java-corpus.mjs`: clones selected repositories, runs `cognium-ai`, keeps raw output private, and writes sanitized public summaries.
