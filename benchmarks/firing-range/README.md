# Firing Range

| | |
| --- | --- |
| Language | Other |
| Dataset | `../../datasets/firing-range/` |
| Published in | `../../results/2026-04-22/` — cognium-dev 3.19.4 (then `circle-ir`) |
| Page section | `https://cognium.dev/benchmark` |

## What it measures

Detection on Google Firing Range test servlets (reflected/DOM XSS, open redirect, CORS misconfiguration, clickjacking); `escape/` cases are the safe controls.

## Case selection

40 test servlets in the categories the engine models; the category map (vulnerable vs. safe) is recorded in the dataset README.

## Scoring

Per servlet: a reported flow of the category's sink type = detected. Score = TPR.

## Published result (2026-04-22)

| Tests | TP | TN | FP | FN | TPR | FPR | Score |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 40 | 35 | n/a | 2 | 3 | 92.1% | n/a | 92.1% |

`n/a` means the dataset has no scored negatives for that row, not zero.

## Known gaps

2 false positives in `escape/` (escaped output flagged), 3 false negatives in `cors/` (CORS misconfigurations not detected).

## Evidence

- `../../results/2026-04-22/results.json` (row `benchmark: "Firing Range"`)
- `../../results/2026-04-22/summary.md`
- `../../raw/2026-04-22/`
