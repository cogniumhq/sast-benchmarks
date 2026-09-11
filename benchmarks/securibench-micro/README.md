# SecuriBench Micro

| | |
| --- | --- |
| Language | Java |
| Dataset | `../../datasets/securibench-micro/` |
| Published in | `../../results/2026-04-22/` — cognium-dev 3.19.4 (then `circle-ir`) |
| Page section | `https://cognium.dev/benchmark` |

## What it measures

Detection precision on Stanford SecuriBench Micro: small Java servlet programs with a documented vulnerability count each, covering aliasing, arrays, collections, data structures, factories, inter-procedural flow, predicates, reflection, sanitizers, sessions and strong updates.

## Case selection

All test classes whose annotation declares an expected vulnerability count.

## Scoring

Per class: reported flows vs. the annotated expected count. Score = TPR − FPR.

## Published result (2026-04-22)

| Tests | TP | TN | FP | FN | TPR | FPR | Score |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 123 | 60 | 60 | 1 | 2 | 96.8% | 1.6% | 97.7% |

`n/a` means the dataset has no scored negatives for that row, not zero.

## Known gaps

Known false negatives in aliasing (`Aliasing2`) and collections (`Collections7`, `Collections8`).

## Evidence

- `../../results/2026-04-22/results.json` (row `benchmark: "SecuriBench Micro"`)
- `../../results/2026-04-22/summary.md`
- `../../raw/2026-04-22/`
