# Rust Synthetic

| | |
| --- | --- |
| Language | Rust |
| Dataset | `../../datasets/rust-synthetic/` |
| Published in | `../../results/2026-04-22/` — cognium-dev 3.19.4 (then `circle-ir`) |
| Page section | `https://cognium.dev/benchmark` |

## What it measures

Rust taint detection on 50 authored cases (command, path, SQL, SSRF, unsafe/FFI shapes) with safe controls.

## Case selection

Synthetic case set authored for this benchmark; every case is one self-contained file. All cases are scored (none excluded).

## Scoring

Detected = an unsanitized taint flow of the expected sink type, or a matching source and sink with no sanitizer in the file. Vulnerable + detected = TP, safe + not detected = TN. Score = TPR − FPR.

## Published result (2026-04-22)

| Tests | TP | TN | FP | FN | TPR | FPR | Score |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 50 | 46 | n/a | n/a | 4 | 92.0% | n/a | 92.3% |

`n/a` means the dataset has no scored negatives for that row, not zero.

## Evidence

- `../../results/2026-04-22/results.json` (row `benchmark: "Rust Synthetic"`)
- `../../results/2026-04-22/summary.md`
- `../../raw/2026-04-22/`
