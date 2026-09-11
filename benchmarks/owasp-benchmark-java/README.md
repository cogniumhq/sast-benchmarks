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

## Full-suite result and tool comparison (`results/2026-09-11-owasp-java-comparison/`)

The row above scores a 1,415-case selection made by the historical harness.
For comparison with other tools the benchmark is scored on **all 2,740 cases**
with the official OWASP scorecard rule (file match + exact CWE) by
`scripts/score-owasp-benchmark.mjs`:

| Tool | Version | TP | FP | FN | TN | TPR | FPR | Precision | Youden |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| cognium-dev | 4.9.13 | 1,287 | 231 | 128 | 1,094 | 91.0% | 17.4% | 84.8% | 73.5% |

Weak spots: XSS FPR 91.9% (encoders not credited), cmdi FPR 31.2%. Competitor
rows (CodeQL, Semgrep, SonarQube Community, SpotBugs + Find-Sec-Bugs) are
added to that result set as they are run on the same dataset revision.

## Evidence

- `../../results/2026-04-22/results.json` (row `benchmark: "OWASP Benchmark"`)
- `../../results/2026-04-22/summary.md`
- `../../raw/2026-04-22/`
