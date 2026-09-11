# WebGoat

| | |
| --- | --- |
| Language | Java |
| Dataset | `../../datasets/webgoat/` |
| Published in | `../../results/2026-04-22/` — cognium-dev 3.19.4 (then `circle-ir`) |
| Page section | `https://cognium.dev/benchmark` |

## What it measures

Detection on OWASP WebGoat lesson code (SQLi, XXE, path traversal, SSRF, XSS, insecure deserialization, …).

## Case selection

Deliberately vulnerable open-source application scanned file by file. Cases are the labelled file/category pairs in the dataset's `expectedresults.csv`; files not listed there are not scored.

## Scoring

Per labelled file + category: a reported flow of the expected sink type in that file = detected. Score follows the runner (TPR where only positives are labelled).

## Published result (2026-04-22)

| Tests | TP | TN | FP | FN | TPR | FPR | Score |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 29 | 26 | n/a | n/a | 3 | 89.7% | n/a | 89.3% |

`n/a` means the dataset has no scored negatives for that row, not zero.

## Evidence

- `../../results/2026-04-22/results.json` (row `benchmark: "WebGoat"`)
- `../../results/2026-04-22/summary.md`
- `../../raw/2026-04-22/`
