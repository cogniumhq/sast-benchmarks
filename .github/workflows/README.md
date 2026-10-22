# Workflows

GitHub Actions workflows will live here.

Active:

- `validate-results.yml`: on every push to `main` and every pull request, runs
  `scripts/validate-results.mjs` — schema required fields, row sums vs. summary,
  language-summary totals, perfect / near-perfect counts, artifact paths, and a
  `benchmarks/` + `datasets/` folder for every published row. It also checks
  that `scripts/publish-run.mjs` still reproduces `results/2026-10-22/`.
- `detection-quality.yml`: nightly at 03:00 UTC scores cognium-dev and files a
  defect on regression. Monthly at 04:00 UTC on the 1st, and a dispatch with
  `publish` set, commits the dated result set. The nightly does not commit.

Planned:

- generate `summary.md` tables from structured data
- optionally publish benchmark pages to `cognium.dev`
