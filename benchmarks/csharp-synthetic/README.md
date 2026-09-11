# C# Synthetic

| | |
| --- | --- |
| Language | C#/.NET |
| Dataset | `../../datasets/csharp-synthetic/` |
| Published in | `../../results/2026-09-11/` — cognium-dev 4.9.13 |
| Page section | `https://cognium.dev/benchmark` |

## What it measures

C#/.NET taint detection on 15 curated ASP.NET Core / ADO.NET / EF Core cases across 10 CWE families, with parameterized-query / encoder controls.

## Case selection

Synthetic case set authored for this benchmark; every case is one self-contained file. All cases are scored (none excluded).

## Scoring

Detected = an unsanitized taint flow of the expected sink type, or a matching source and sink with no sanitizer in the file. Vulnerable + detected = TP, safe + not detected = TN. Score = TPR − FPR. Flow-aware: a parameterized query, `AddWithValue` or encoder counts as a sanitizer.

## Published result (2026-09-11)

| Tests | TP | TN | FP | FN | TPR | FPR | Score |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 15 | 10 | 3 | 1 | 1 | 90.9% | 25.0% | 65.9% |

`n/a` means the dataset has no scored negatives for that row, not zero.

## Known gaps

FP on a parameterized `SqlCommand` (source + sink co-occurrence); FN on `Response.Write` XSS.

## Evidence

- `../../results/2026-09-11/results.json` (row `benchmark: "C# Synthetic"`)
- `../../results/2026-09-11/summary.md`
- `../../raw/2026-09-11/`
