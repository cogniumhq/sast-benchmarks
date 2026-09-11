# CWE-Bench-Rust

| | |
| --- | --- |
| Language | Rust |
| Dataset | `../../datasets/cwe-bench-rust/` |
| Published in | `../../results/2026-04-22/` — cognium-dev 3.19.4 (then `circle-ir`) |
| Page section | `https://cognium.dev/benchmark` |

## What it measures

Rust detection on 30 authored CWE-labelled cases (path traversal, command injection, SQLi, SSRF, …). Despite the name this is a curated set, not an external dataset.

## Case selection

Synthetic case set authored for this benchmark; every case is one self-contained file. All cases are scored (none excluded).

## Scoring

Detected = an unsanitized taint flow of the expected sink type, or a matching source and sink with no sanitizer in the file. Vulnerable + detected = TP, safe + not detected = TN. Score = TPR − FPR.

## Published result (2026-04-22)

| Tests | TP | TN | FP | FN | TPR | FPR | Score |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 30 | 28 | n/a | n/a | 2 | 93.3% | n/a | 94.4% |

`n/a` means the dataset has no scored negatives for that row, not zero.

## Evidence

- `../../results/2026-04-22/results.json` (row `benchmark: "CWE-Bench-Rust"`)
- `../../results/2026-04-22/summary.md`
- `../../raw/2026-04-22/`
