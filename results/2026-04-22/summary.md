# circle-ir SAST Benchmark Results: 2026-04-22

Source: `https://cognium.dev/benchmark/`

Imported into this repository on 2026-05-03 from the live `cognium.dev`
benchmark page. The live page reports `circle-ir 3.19.4` and benchmark date
`April 22, 2026`.

## Scope

- Tool: circle-ir
- Version: 3.19.4
- Mode: static analysis only
- LLM verification: not used
- Benchmarks: 16
- Languages: 6
- Reproduction command:

```sh
git clone https://github.com/cogniumhq/circle-ir
cd circle-ir/benchmarks
npm install
npm run benchmark
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
| Total | 8 | 13 | 16 |

## CWE-Bench-Java Breakdown

| CWE | Category | Detected | Missed | Rate |
| --- | --- | ---: | ---: | ---: |
| CWE-022 | Path Traversal | 37 / 55 | 18 | 67.3% |
| CWE-078 | Command Injection | 6 / 13 | 7 | 46.2% |
| CWE-079 | XSS | 13 / 31 | 18 | 41.9% |
| CWE-094 | Code Injection | 5 / 21 | 16 | 23.8% |

## Known Gaps From Source Page

- SSTI is not currently in circle-ir's CWE coverage, causing the PyGoat false negative.
- Firing Range has 2 false positives in the `escape/` category and 3 false negatives in `cors/`.
- CWE-Bench-Java uses per-project detection rather than per-CVE counts.
- These results test static analysis only; the full SAST plus LLM verification pipeline is separate.

## Raw Evidence

- Live HTML snapshot: `../../raw/2026-04-22/cognium-dev-benchmark.html`
- Structured JSON: `results.json`
- CSV: `results.csv`
