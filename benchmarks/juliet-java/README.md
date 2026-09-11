# Juliet Test Suite

| | |
| --- | --- |
| Language | Java |
| Dataset | `../../datasets/juliet-java/` |
| Published in | `../../results/2026-04-22/` — cognium-dev 3.19.4 (then `circle-ir`) |
| Page section | `https://cognium.dev/benchmark` |

## What it measures

Detection and false-positive rate on NIST Juliet Java 1.3 `bad()` / `good*()` pairs across the 14 CWE families the engine models.

## Case selection

Baseline `_01` variants of the 14 supported CWE directories (243 scored cases: 122 bad, 121 good).

## Scoring

`bad()` flagged with the expected sink type = TP; `good*()` not flagged = TN. Score = TPR − FPR.

## Published result (2026-04-22)

| Tests | TP | TN | FP | FN | TPR | FPR | Score |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 243 | 122 | 121 | 0 | 0 | 100% | 0% | 100% |

`n/a` means the dataset has no scored negatives for that row, not zero.

## Evidence

- `../../results/2026-04-22/results.json` (row `benchmark: "Juliet Test Suite"`)
- `../../results/2026-04-22/summary.md`
- `../../raw/2026-04-22/`
