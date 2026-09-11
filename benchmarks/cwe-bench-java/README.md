# CWE-Bench-Java

Benchmark track for Java vulnerabilities from CWE-Bench-Java.

## Purpose

Evaluate whether SAST tools detect known real-world Java vulnerabilities in a
reproducible setup.

## Required Result Fields

- dataset source and version
- vulnerable project revision
- fixed project revision or patch reference
- CWE and CVE identifiers
- expected vulnerable location
- tool finding location
- verdict: true positive, false negative, false positive, or inconclusive

## Published Result (`results/2026-04-22/`, cognium-dev 3.19.4, static only)

| Projects | Detected | Missed | TPR |
| ---: | ---: | ---: | ---: |
| 120 | 61 | 59 | 50.8% |

| CWE | Detected | Rate |
| --- | ---: | ---: |
| CWE-022 Path Traversal | 37 / 55 | 67.3% |
| CWE-078 Command Injection | 6 / 13 | 46.2% |
| CWE-079 XSS | 13 / 31 | 41.9% |
| CWE-094 Code Injection | 5 / 21 | 23.8% |

Scoring: per-project binary detection with the IRIS-paper strict rule — a
project counts as detected only when a sink of the expected CWE type is
reported inside the documented fix method's line range, so the number is
comparable with the published CodeQL (22.5%) and IRIS + GPT-4 (45.8%)
baselines. A single missed sink in a complex project is a full miss.

Dataset: `../../datasets/cwe-bench-java/`. Breakdown:
`../../results/2026-04-22/cwe-bench-java-breakdown.csv`.

## Initial Scope

Start with cognium-dev, CodeQL, and Semgrep. Add other tools only after
the baseline run and scoring rules are stable.
