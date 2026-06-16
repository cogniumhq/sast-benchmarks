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

- `import-tier1-java-targets.mjs`: refreshes `datasets/top-java-github/` from the curated tier-1 target list (`tier1-targets.csv`). Pass `--enrich` with `GITHUB_TOKEN` to backfill GitHub metadata.
- `select-top-java-projects.mjs`: legacy GitHub Search API selector (star-ranked). Prefer `import-tier1-java-targets.mjs` for security scan benchmarks.
- `run-cognium-ai-java-corpus.mjs`: clones selected repositories, runs `cognium-ai`, keeps raw output private, and writes sanitized public summaries.
