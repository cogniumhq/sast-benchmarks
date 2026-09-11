# PyGoat

| | |
| --- | --- |
| Language | Python |
| Dataset | `../../datasets/pygoat/` |
| Published in | `../../results/2026-04-22/` — cognium-dev 3.19.4 (then `circle-ir`) |
| Page section | `https://cognium.dev/benchmark` |

## What it measures

Detection on PyGoat (Django) lesson views (SQLi, command injection, path traversal, XSS, SSRF, SSTI, …).

## Case selection

Deliberately vulnerable open-source application scanned file by file. Cases are the labelled file/category pairs in the dataset's `expectedresults.csv`; files not listed there are not scored.

## Scoring

Per labelled file + category: a reported flow of the expected sink type in that file = detected. Score follows the runner (TPR where only positives are labelled).

## Published result (2026-04-22)

| Tests | TP | TN | FP | FN | TPR | FPR | Score |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 26 | 23 | n/a | n/a | 3 | 88.5% | n/a | 90.0% |

`n/a` means the dataset has no scored negatives for that row, not zero.

## Known gaps

SSTI is not in the engine's CWE coverage — one known false negative.

## Evidence

- `../../results/2026-04-22/results.json` (row `benchmark: "PyGoat"`)
- `../../results/2026-04-22/summary.md`
- `../../raw/2026-04-22/`
