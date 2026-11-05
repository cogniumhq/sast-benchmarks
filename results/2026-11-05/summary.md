# cognium-dev SAST Benchmark Results: 2026-11-05

Detection-quality sweep on cognium-dev 4.17.0 (commit `c45d2e4`). 16 corpora, 4065 cases. Static analysis only, default taint configuration, no LLM.

## Scope

- Tool: cognium-dev 4.17.0
- Engine commit: `c45d2e43ef07b78bf9cd29d3bf53a396dd036108`
- Mode: static analysis, default taint configuration, no LLM
- Command: `node scripts/publish-run.mjs --run results/2026-11-05-detection-quality/run-summary.json --date 2026-11-05`
- Runtime: GitHub Actions, node:22-bookworm
- Run: `2026-11-05T02:58:10.083Z`
- Scorecards: `results/2026-11-05-detection-quality/`
- Raw scan JSON (gzip): `raw/2026-11-05/`

A case is flagged when a finding lands in its file with exactly the expected CWE. Score = TPR − FPR where the corpus has safe cases.

## Results by benchmark

| Language | Benchmark | Tests | TP | TN | FP | FN | TPR | FPR | Score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Java | OWASP Benchmark | 2740 | 1289 | 1256 | 69 | 126 | 91.1% | 5.2% | 85.9% |
| Java | SecuriBench Micro | 122 | 90 | 9 | 1 | 22 | 80.4% | 10.0% | 70.4% |
| Java | WebGoat | 29 | 16 | 8 | 0 | 5 | 76.2% | 0.0% | 76.2% |
| Java | DVJA | 7 | 1 | 4 | 0 | 2 | 33.3% | 0.0% | 33.3% |
| Node.js / TypeScript | NodeGoat | 13 | 1 | 9 | 0 | 3 | 25.0% | 0.0% | 25.0% |
| Node.js / TypeScript | Juice Shop | 14 | 5 | 4 | 0 | 5 | 50.0% | 0.0% | 50.0% |
| Node.js / TypeScript | NodeJS Synthetic | 25 | 16 | 8 | 1 | 0 | 100.0% | 11.1% | 88.9% |
| Python | PyGoat | 26 | 0 | 11 | 0 | 15 | 0.0% | 0.0% | 0.0% |
| Rust | Rust Synthetic | 50 | 30 | 12 | 1 | 7 | 81.1% | 7.7% | 73.4% |
| Rust | CWE-Bench-Rust | 30 | 12 | 11 | 1 | 6 | 66.7% | 8.3% | 58.3% |
| Bash | Bash Synthetic | 31 | 18 | 9 | 0 | 4 | 81.8% | 0.0% | 81.8% |
| HTML/JS | HTML/JS Synthetic | 30 | 12 | 11 | 0 | 7 | 63.2% | 0.0% | 63.2% |
| Go | Go Synthetic | 29 | 17 | 10 | 0 | 2 | 89.5% | 0.0% | 89.5% |
| Go | Vulnerability-goapp | 10 | 0 | 6 | 0 | 4 | 0.0% | 0.0% | 0.0% |
| C#/.NET | C# Synthetic | 15 | 11 | 4 | 0 | 0 | 100.0% | 0.0% | 100.0% |
| C#/.NET | Juliet C# (NIST, default config) | 894 | 21 | n/a | n/a | 873 | 2.3% | n/a | 2.3% |

Together: TP 1539, FN 1081, FP 73, TN 1372 (TPR 58.7%, FPR 5.1%).

## Language summary

| Language | Perfect 100% | 90%+ | Total benchmarks |
| --- | --- | --- | --- |
| Java | 0 | 0 | 4 |
| Node.js / TypeScript | 0 | 0 | 3 |
| Python | 0 | 0 | 1 |
| Rust | 0 | 0 | 2 |
| Bash | 0 | 0 | 1 |
| HTML/JS | 0 | 0 | 1 |
| Go | 0 | 0 | 2 |
| C#/.NET | 1 | 1 | 2 |
| Total | 1 | 1 | 16 |

## Known limits

- Static analysis only, default taint configuration, no LLM in detection or verification.
- A case counts as flagged when at least one finding lands in its file with exactly the expected CWE. Findings without a CWE are dropped.
- The frozen regression baseline (baseline/detection-quality.json) is not updated by this publish.
- Juliet C# is the full src/testcases tree under the default taint config, recall only. The 2026-09-11 Juliet row is the _01 variant with the corpus source and sink signatures loaded.
- Aggregate TPR and FPR add every corpus together, including recall-only Juliet. Quote a per-benchmark row for a rate that belongs to one dataset.
