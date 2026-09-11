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

## Score Definitions Used on `cognium.dev/benchmark`

- `TPR = TP / (TP + FN)`; `FPR = FP / (FP + TN)`.
- `Score` is defined per benchmark kind and is stated in
  `benchmarks/static-analysis-suite/README.md`; it is `TPR − FPR` wherever
  negatives are scored and `TPR` (recall) where a dataset has only positives.
- A row is **perfect** at a 100% score and **near-perfect** at ≥ 90%.
- CWE-Bench-Java is scored per project with the IRIS-paper strict rule (sink of
  the expected CWE inside the documented fix method), so it is comparable with
  the CodeQL and IRIS numbers it is quoted against.
- `—` / `n/a` / `null` means "not measurable on this dataset", never zero.

## Publication Principles

- Publish the exact tool version.
- Publish the exact command line.
- Publish raw output artifacts.
- Publish known limitations beside the headline score.
- Link every public result to a GitHub Discussion or issue for challenge.
