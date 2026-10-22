# Detection-quality sweep — 2026-10-22

Machine output of `scripts/run-corpus.mjs --all-corpora` for the published
set in [`../2026-10-22/`](../2026-10-22/summary.md). cognium-dev 4.17.0,
commit `d95544f`.

This folder keeps `run-summary.json` and one scorecard per corpus. It has no
`results.json` of its own; `scripts/validate-results.mjs` validates
`results/2026-10-22/results.json`.

Raw scan JSON is gzipped under `raw/2026-10-22/<corpus>.scan.json.gz`. Each
scorecard's `scan_report` field names the uncompressed file the runner wrote
before that gzip.

The frozen gate is still `baseline/detection-quality.json` (2026-09-21,
cognium-dev 4.9.20, seven vendored corpora). This folder does not replace it.
