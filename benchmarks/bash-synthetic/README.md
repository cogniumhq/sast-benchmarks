# Bash Synthetic

| | |
| --- | --- |
| Language | Bash |
| Dataset | `../../datasets/bash-synthetic/` |
| Published in | `../../results/2026-04-22/` — cognium-dev 3.19.4 (then `circle-ir`) |
| Page section | `https://cognium.dev/benchmark` |

## What it measures

Shell-script taint detection on 31 authored cases (command injection via unquoted/eval'd input, path traversal, unsafe `curl | sh`, …).

## Case selection

Synthetic case set authored for this benchmark; every case is one self-contained file. All cases are scored (none excluded).

## Scoring

Detected = an unsanitized taint flow of the expected sink type, or a matching source and sink with no sanitizer in the file. Vulnerable + detected = TP, safe + not detected = TN. Score = TPR − FPR.

## Published result (2026-04-22)

| Tests | TP | TN | FP | FN | TPR | FPR | Score |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 31 | 31 | n/a | n/a | 0 | 100% | n/a | 100% |

`n/a` means the dataset has no scored negatives for that row, not zero.

## Evidence

- `../../results/2026-04-22/results.json` (row `benchmark: "Bash Synthetic"`)
- `../../results/2026-04-22/summary.md`
- `../../raw/2026-04-22/`
