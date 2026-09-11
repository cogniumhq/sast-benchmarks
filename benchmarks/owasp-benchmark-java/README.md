# OWASP Benchmark

| | |
| --- | --- |
| Language | Java |
| Dataset | `../../datasets/owasp-benchmark-java/` |
| Published in | `../../results/2026-04-22/` — cognium-dev 3.19.4 (then `circle-ir`) |
| Page section | `https://cognium.dev/benchmark` |

## What it measures

Detection and false-positive rate on the OWASP Benchmark v1.2 Java test cases (SQLi, command injection, path traversal, XSS, LDAP/XPath injection, weak crypto/hash/random, trust boundary, secure cookie, …).

## Case selection

The published run scored the v1.2 categories the engine models (1,415 of 2,740 cases); the exact category list was not recorded at publication and must be recorded on the next rerun.

## Scoring

Per test case against the upstream `expectedresults-1.2.csv`: vulnerable + flagged with the expected CWE = TP, safe + not flagged = TN. Score = TPR − FPR.

## Published result (2026-04-22)

| Tests | TP | TN | FP | FN | TPR | FPR | Score |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1415 | 708 | 707 | 0 | 0 | 100% | 0% | 100% |

`n/a` means the dataset has no scored negatives for that row, not zero.

## Evidence

- `../../results/2026-04-22/results.json` (row `benchmark: "OWASP Benchmark"`)
- `../../results/2026-04-22/summary.md`
- `../../raw/2026-04-22/`
