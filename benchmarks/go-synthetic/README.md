# Go Synthetic

| | |
| --- | --- |
| Language | Go |
| Dataset | `../../datasets/go-synthetic/` |
| Published in | `../../results/2026-09-11/` — cognium-dev 4.9.13 |
| Page section | `https://cognium.dev/benchmark` |

## What it measures

Go taint detection on 29 authored cases (`net/http`, Gorilla mux, Gin: SQLi, command injection, path traversal, XSS, SSRF) with safe controls.

## Case selection

Synthetic case set authored for this benchmark; every case is one self-contained file. All cases are scored (none excluded).

## Scoring

Detected = an unsanitized taint flow of the expected sink type, or a matching source and sink with no sanitizer in the file. Vulnerable + detected = TP, safe + not detected = TN. Score = TPR − FPR.

## Published result (2026-09-11)

| Tests | TP | TN | FP | FN | TPR | FPR | Score |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 29 | 15 | 10 | 0 | 4 | 78.9% | 0.0% | 78.9% |

`n/a` means the dataset has no scored negatives for that row, not zero.

## Known gaps

`fmt.Fprintf` / `io.WriteString` XSS, `os.OpenFile` with a `PostForm` path and `os.Stdin` → `sh -c` are not detected (4 FN).

## Evidence

- `../../results/2026-09-11/results.json` (row `benchmark: "Go Synthetic"`)
- `../../results/2026-09-11/summary.md`
- `../../raw/2026-09-11/`
