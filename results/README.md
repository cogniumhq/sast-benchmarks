# Results

Dated benchmark summaries live here.

Recommended layout:

```text
results/YYYY-MM-DD/summary.md
results/YYYY-MM-DD/results.json
results/YYYY-MM-DD/results.csv
raw/YYYY-MM-DD/
```

Use one folder per publication date. If multiple benchmark tracks run on the
same date, keep benchmark names inside the summary and result files.

## Published Results

Static-analysis snapshots (mirrored by `https://cognium.dev/benchmark`):

- `2026-04-22`: cognium-dev 3.19.4 (published then as `circle-ir`)
  static-analysis results imported from `https://cognium.dev/benchmark/`.
  16 benchmarks, 6 language groups.
- `2026-09-11`: cognium-dev 4.9.13 first scored Go and C#/.NET results
  (4 benchmarks). Extends language coverage; does not re-score the April set.

cognium-ai (SAST + LLM) runs:

- `2026-05-03`: top 100 GitHub Java projects selected and queued for batched
  cognium-ai LLM analysis (plan plus one sample run).
- `2026-05-05`: JavaScript top-10 static baseline results.
- `2026-05-27`: Java / JavaScript / Python top-10 LLM-enriched runs.
