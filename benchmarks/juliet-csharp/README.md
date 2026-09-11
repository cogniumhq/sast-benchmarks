# Juliet C# (NIST, baseline _01)

| | |
| --- | --- |
| Language | C#/.NET |
| Dataset | `../../datasets/juliet-csharp/` |
| Published in | `../../results/2026-09-11/` — cognium-dev 4.9.13 |
| Page section | `https://cognium.dev/benchmark` |

## What it measures

Recall on NIST Juliet C# 1.3 `Bad()` methods across the 10 CWE directories the engine models for C# (CWE-23, 36, 78, 80, 81, 83, 89, 90, 94, 643).

## Case selection

Baseline `_01` variant only (123 files). Other variants, other CWE directories and the `Good*()` controls are out of scope for this result set.

## Scoring

A file counts as detected only on an unsanitized taint flow of the expected sink type. Recall only — every scored file is a positive, so TN/FP/FPR are not measurable. The runner supplies the corpus' own source/sink signatures so misses reflect propagation gaps.

## Published result (2026-09-11)

| Tests | TP | TN | FP | FN | TPR | FPR | Score |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 123 | 17 | n/a | n/a | 106 | 13.8% | n/a | 13.8% |

`n/a` means the dataset has no scored negatives for that row, not zero.

## Known gaps

0% on path traversal, command injection, XSS and code injection; 29.6% SQLi, 20% LDAP, 70% XPath. C#/.NET is preview.

## Evidence

- `../../results/2026-09-11/results.json` (row `benchmark: "Juliet C# (NIST, baseline _01)"`)
- `../../results/2026-09-11/summary.md`
- `../../raw/2026-09-11/`
