# cognium-dev SAST Benchmark Results: 2026-11-20

Detection-quality sweep on cognium-dev 4.23.0 (commit `4fbbfb4`). 17 corpora, 4065 cases plus 40547 recall-only juliet-java cases reported separately. Static analysis only, default taint configuration, no LLM.

## Scope

- Tool: cognium-dev 4.23.0
- Engine commit: `4fbbfb4c9d04da971d90058011c7c1a9e39c52e5`
- Mode: static analysis, default taint configuration, no LLM
- Command: `node scripts/publish-run.mjs --run results/2026-11-20-detection-quality/run-summary.json --date 2026-11-20`
- Runtime: GitHub Actions, node:22-bookworm
- Run: `2026-11-20T03:16:58.471Z`
- Scorecards: `results/2026-11-20-detection-quality/`
- Raw scan JSON (gzip): `raw/2026-11-20/`

A case is flagged when a finding lands in its file with exactly the expected CWE. Score = TPR − FPR where the corpus has safe cases.

## Results by benchmark

| Language | Benchmark | Tests | TP | TN | FP | FN | TPR | FPR | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Java | OWASP Benchmark | 2740 | 1375 | 1259 | 66 | 40 | 97.2% | 5.0% | 92.2% |
| Java | SecuriBench Micro | 122 | 99 | 8 | 2 | 13 | 88.4% | 20.0% | 68.4% |
| Java | WebGoat | 29 | 16 | 8 | 0 | 5 | 76.2% | 0.0% | 76.2% |
| Java | DVJA | 7 | 1 | 4 | 0 | 2 | 33.3% | 0.0% | 33.3% |
| Node.js / TypeScript | NodeGoat | 13 | 1 | 9 | 0 | 3 | 25.0% | 0.0% | 25.0% |
| Node.js / TypeScript | Juice Shop | 14 | 6 | 4 | 0 | 4 | 60.0% | 0.0% | 60.0% |
| Node.js / TypeScript | NodeJS Synthetic | 25 | 16 | 9 | 0 | 0 | 100.0% | 0.0% | 100.0% |
| Python | PyGoat | 26 | 0 | 11 | 0 | 15 | 0.0% | 0.0% | 0.0% |
| Rust | Rust Synthetic | 50 | 33 | 12 | 1 | 4 | 89.2% | 7.7% | 81.5% |
| Rust | CWE-Bench-Rust | 30 | 12 | 12 | 0 | 6 | 66.7% | 0.0% | 66.7% |
| Bash | Bash Synthetic | 31 | 18 | 9 | 0 | 4 | 81.8% | 0.0% | 81.8% |
| HTML/JS | HTML/JS Synthetic | 30 | 12 | 11 | 0 | 7 | 63.2% | 0.0% | 63.2% |
| Go | Go Synthetic | 29 | 17 | 10 | 0 | 2 | 89.5% | 0.0% | 89.5% |
| Go | Vulnerability-goapp | 10 | 0 | 6 | 0 | 4 | 0.0% | 0.0% | 0.0% |
| C#/.NET | C# Synthetic | 15 | 11 | 4 | 0 | 0 | 100.0% | 0.0% | 100.0% |
| C#/.NET | Juliet C# (NIST, default config) | 894 | 21 | n/a | n/a | 873 | 2.3% | n/a | 2.3% |
| Java | Juliet Java (NIST, default config) | 40547 | 1260 | n/a | n/a | 39287 | 3.1% | n/a | 3.1% |

Together (excluding juliet-java): TP 1638, FN 982, FP 69, TN 1376 (TPR 62.5%, FPR 4.8%).
Not in that total, recall only: juliet-java, 40547 cases, TP 1260, FN 39287 (TPR 3.1%).

## Language summary

| Language | Perfect 100% | 90%+ | Total benchmarks |
| --- | --- | --- | --- |
| Java | 0 | 1 | 5 |
| Node.js / TypeScript | 1 | 1 | 3 |
| Python | 0 | 0 | 1 |
| Rust | 0 | 0 | 2 |
| Bash | 0 | 0 | 1 |
| HTML/JS | 0 | 0 | 1 |
| Go | 0 | 0 | 2 |
| C#/.NET | 1 | 1 | 2 |
| Total | 2 | 3 | 17 |

## Known limits

- Static analysis only, default taint configuration, no LLM in detection or verification.
- A case counts as flagged when at least one finding lands in its file with exactly the expected CWE. Findings without a CWE are dropped.
- The frozen regression baseline (baseline/detection-quality.json) is not updated by this publish.
- Juliet C# is the full src/testcases tree under the default taint config, recall only. The 2026-09-11 Juliet row is the _01 variant with the corpus source and sink signatures loaded.
- Aggregate TPR and FPR add every corpus together, including recall-only Juliet C#, except juliet-java: reported in its own row and in summary.excluded_from_overall, not in the aggregate. Quote a per-benchmark row for a rate that belongs to one dataset.
