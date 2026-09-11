# NodeJS Synthetic

| | |
| --- | --- |
| Language | Node.js / TypeScript |
| Dataset | `../../datasets/nodejs-synthetic/` |
| Published in | `../../results/2026-04-22/` — cognium-dev 3.19.4 (then `circle-ir`) |
| Page section | `https://cognium.dev/benchmark` |

## What it measures

Node.js taint detection on 25 authored cases (Express handlers → SQL, command, path, eval, response sinks).

## Case selection

Synthetic case set authored for this benchmark; every case is one self-contained file. All cases are scored (none excluded).

## Scoring

Detected = an unsanitized taint flow of the expected sink type, or a matching source and sink with no sanitizer in the file. Vulnerable + detected = TP, safe + not detected = TN. Score = TPR − FPR.

## Published result (2026-04-22)

| Tests | TP | TN | FP | FN | TPR | FPR | Score |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 25 | 23 | n/a | n/a | 2 | 92.0% | n/a | 92.9% |

`n/a` means the dataset has no scored negatives for that row, not zero.

## Evidence

- `../../results/2026-04-22/results.json` (row `benchmark: "NodeJS Synthetic"`)
- `../../results/2026-04-22/summary.md`
- `../../raw/2026-04-22/`
