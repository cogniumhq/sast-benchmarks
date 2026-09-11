# Workflows

GitHub Actions workflows will live here.

Active:

- `validate-results.yml`: on every push to `main` and every pull request, runs
  `scripts/validate-results.mjs` — schema required fields, row sums vs. summary,
  language-summary totals, perfect / near-perfect counts, artifact paths, and a
  `benchmarks/` + `datasets/` folder for every published row.

Planned:

- generate `summary.md` tables from structured data
- optionally publish benchmark pages to `cognium.dev`
