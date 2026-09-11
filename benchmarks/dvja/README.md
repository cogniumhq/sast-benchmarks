# DVJA

| | |
| --- | --- |
| Language | Java |
| Dataset | `../../datasets/dvja/` |
| Published in | `../../results/2026-04-22/` — cognium-dev 3.19.4 (then `circle-ir`) |
| Page section | `https://cognium.dev/benchmark` |

## What it measures

Detection on the Damn Vulnerable Java Application (SQLi, command injection, IDOR).

## Case selection

Deliberately vulnerable open-source application scanned file by file. Cases are the labelled file/category pairs in the dataset's `expectedresults.csv`; files not listed there are not scored.

## Scoring

Per labelled file + category: a reported flow of the expected sink type in that file = detected. Score follows the runner (TPR where only positives are labelled).

## Published result (2026-04-22)

| Tests | TP | TN | FP | FN | TPR | FPR | Score |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 7 | 7 | n/a | n/a | 0 | 100% | n/a | 100% |

`n/a` means the dataset has no scored negatives for that row, not zero.

## Evidence

- `../../results/2026-04-22/results.json` (row `benchmark: "DVJA"`)
- `../../results/2026-04-22/summary.md`
- `../../raw/2026-04-22/`
