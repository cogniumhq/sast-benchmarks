# cognium-dev SAST Benchmark Results: 2026-04-22

Source: `https://cognium.dev/benchmark/`

Imported into this repository on 2026-05-03 from the live `cognium.dev`
benchmark page. The engine was published at the time under its former package
name `circle-ir`; the project has since been renamed `cognium-dev`
(`https://github.com/cogniumhq/cognium-dev`). The version is unchanged:
`3.19.4`, benchmark date `April 22, 2026`.

## Scope

- Tool: cognium-dev (published at the time as `circle-ir`)
- Version: 3.19.4
- Mode: static analysis only
- LLM verification: not used
- Benchmarks: 16
- Language groups: 6 (Java, Node.js / TypeScript, Python, Rust, Bash, HTML/JS)
  plus Firing Range, which the source page lists under "Other"
- Reproduction: **not currently reproducible with a single published
  command.** The one-command harness that produced this snapshot is not present
  in the public `cognium-dev` source tree. The result set is auditable from the
  artifacts in this folder and the raw page snapshot; see
  `docs/run-new-benchmarks.md` for the rerun status.

Audit the published snapshot:

```sh
git clone https://github.com/cogniumhq/sast-benchmarks
cd sast-benchmarks/results/2026-04-22
ls summary.md results.csv results.json cwe-bench-java-breakdown.csv
```

## Results by Benchmark

| Language | Benchmark | Tests | TP | TN | FP | FN | TPR | FPR | Score |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Java | OWASP Benchmark | 1,415 | 708 | 707 | 0 | 0 | 100% | 0% | 100% |
| Java | Juliet Test Suite | 243 | 122 | 121 | 0 | 0 | 100% | 0% | 100% |
| Java | SecuriBench Micro | 123 | 60 | 60 | 1 | 2 | 96.8% | 1.6% | 97.7% |
| Java | CWE-Bench-Java | 120 | 61 | n/a | n/a | 59 | 50.8% | n/a | 50.8% |
| Java | WebGoat | 29 | 26 | n/a | n/a | 3 | 89.7% | n/a | 89.3% |
| Java | DVJA | 7 | 7 | n/a | n/a | 0 | 100% | n/a | 100% |
| Node.js / TypeScript | NodeGoat | 14 | 14 | n/a | n/a | 0 | 100% | n/a | 100% |
| Node.js / TypeScript | Juice Shop | 14 | 14 | n/a | n/a | 0 | 100% | n/a | 100% |
| Node.js / TypeScript | NodeJS Synthetic | 25 | 23 | n/a | n/a | 2 | 92.0% | n/a | 92.9% |
| Python | PyGoat | 26 | 23 | n/a | n/a | 3 | 88.5% | n/a | 90.0% |
| Python | DVPWA | 6 | 6 | n/a | n/a | 0 | 100% | n/a | 100% |
| Rust | Rust Synthetic | 50 | 46 | n/a | n/a | 4 | 92.0% | n/a | 92.3% |
| Rust | CWE-Bench-Rust | 30 | 28 | n/a | n/a | 2 | 93.3% | n/a | 94.4% |
| Bash | Bash Synthetic | 31 | 31 | n/a | n/a | 0 | 100% | n/a | 100% |
| HTML/JS | HTML/JS Synthetic | 30 | 30 | n/a | n/a | 0 | 100% | n/a | 100% |
| Other | Firing Range | 40 | 35 | n/a | 2 | 3 | 92.1% | n/a | 92.1% |

## Language Summary

| Language | Perfect 100% | 90%+ | Total Benchmarks |
| --- | ---: | ---: | ---: |
| Java | 3 | 4 | 6 |
| Node.js / TypeScript | 2 | 3 | 3 |
| Python | 1 | 2 | 2 |
| Rust | 0 | 2 | 2 |
| Bash | 1 | 1 | 1 |
| HTML/JS | 1 | 1 | 1 |
| Other (Firing Range) | 0 | 1 | 1 |
| Total | 8 | 14 | 16 |

Note: the source page's summary table omitted the Firing Range row, so its
per-language rows summed to 15 benchmarks and 13 at 90%+ while the total row
said 16. Firing Range (92.1%) is counted here so the rows reconcile with the
16 published benchmark results above.

## CWE-Bench-Java Breakdown

| CWE | Category | Detected | Missed | Rate |
| --- | --- | ---: | ---: | ---: |
| CWE-022 | Path Traversal | 37 / 55 | 18 | 67.3% |
| CWE-078 | Command Injection | 6 / 13 | 7 | 46.2% |
| CWE-079 | XSS | 13 / 31 | 18 | 41.9% |
| CWE-094 | Code Injection | 5 / 21 | 16 | 23.8% |

## Methodology (as published)

- cognium-dev is a semantic static analyzer with inter-procedural taint
  tracking.
- All results are from static analysis only — no LLM involvement in detection
  or verification.
- Each benchmark's dataset is recorded under `datasets/` (index in
  `datasets/README.md`): OWASP Benchmark, NIST Juliet Test Suite,
  CWE-Bench-Java (`https://github.com/iris-sast/cwe-bench-java`), and the rest.
- CWE-Bench-Java uses per-project binary detection: each project contains one
  CVE, scored as detected or not.
- Score column, "perfect" and "near-perfect" definitions:
  `benchmarks/static-analysis-suite/README.md`.

## Known Gaps From Source Page

- SSTI is not currently in cognium-dev's CWE coverage, causing the PyGoat false negative.
- Firing Range has 2 false positives in the `escape/` category and 3 false negatives in `cors/`.
- CWE-Bench-Java uses per-project detection rather than per-CVE counts.
- These results test static analysis only; the full SAST plus LLM verification pipeline is separate.
- The historical one-command benchmark harness is not present in the current public source tree, so this dated result set is auditable but not currently reproducible with a single published command.

## Languages Not Covered By This Snapshot

cognium-dev also supports Go and C#/.NET. Neither was scored in this snapshot.
First scored results for both are published in `results/2026-09-11/` on a
newer engine version; they are a separate dated result set, not part of the
April 22 numbers above.

## Raw Evidence

- Live HTML snapshot: `../../raw/2026-04-22/cognium-dev-benchmark.html`
- Structured JSON: `results.json`
- CSV: `results.csv`
- CWE-Bench-Java breakdown CSV: `cwe-bench-java-breakdown.csv`
