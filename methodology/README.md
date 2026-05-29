# Methodology

Benchmark results must be reproducible, reviewable, and conservative.

## Scoring Principles

- Count a detection only when the finding maps to the vulnerable file and
  security-relevant sink/source path described by the benchmark metadata.
- Record near misses separately instead of inflating true positives.
- Preserve false positives in raw output even when the summary focuses on true
  positives and false negatives.
- Treat tool crashes, unsupported builds, and missing dependencies as
  `inconclusive` unless the failure itself is the measured outcome.

## Publication Principles

- Publish the exact tool version.
- Publish the exact command line.
- Publish raw output artifacts.
- Publish known limitations beside the headline score.
- Link every public result to a GitHub Discussion or issue for challenge.
