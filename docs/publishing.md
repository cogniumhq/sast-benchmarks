# Publishing Workflow

1. Pin dataset and tool versions.
2. Run each tool with recorded commands.
3. Save raw output under `raw/YYYY-MM-DD/`.
4. Generate `results/YYYY-MM-DD/results.json`.
5. Generate `results/YYYY-MM-DD/summary.md`.
6. Open or update a GitHub Discussion for review.
7. Mirror the human-readable summary to `cognium.dev/benchmark`.
8. Publish a short commercial summary on `cognium.net` only for meaningful
   milestones.

The detection-quality workflow does steps 2–5 on a schedule. At 04:00 UTC on
the 1st, and when the workflow is dispatched with `publish` set, it commits
`results/<date>/`, the scorecards, and gzipped raw scans. The 03:00 UTC
nightly scores the same sweep and does not commit. Neither run moves
`baseline/detection-quality.json`.

## Forum Policy

GitHub Discussions should be the primary forum. `cognium.dev` should link to the
discussion thread for each result so external readers can challenge methodology
without losing the source artifacts.
