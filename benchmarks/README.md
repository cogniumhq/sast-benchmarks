# Benchmarks

Benchmark-specific definitions, scope notes, and run instructions live here.

Each benchmark folder should explain:

- what the benchmark measures
- where the dataset or test cases come from
- how cases are selected or excluded
- how findings are scored
- which result folders currently publish data for it

## Static-analysis suite (`cognium.dev/benchmark`)

`static-analysis-suite/` is the track overview: scoring rules, Score column
definitions, and the dataset folder for every row. One folder per published
row follows; each records what it measures, case selection, scoring, the
published numbers (generated from `results/*/results.json`) and known gaps.

Java:

- `owasp-benchmark-java/`: OWASP Benchmark v1.2 — `results/2026-04-22/`
- `juliet-java/`: NIST Juliet Test Suite — `results/2026-04-22/`
- `securibench-micro/`: SecuriBench Micro — `results/2026-04-22/`
- `cwe-bench-java/`: CWE-Bench-Java, 120 real CVEs — `results/2026-04-22/`
- `webgoat/`: OWASP WebGoat — `results/2026-04-22/`
- `dvja/`: DVJA — `results/2026-04-22/`

Node.js / TypeScript:

- `nodegoat/`: OWASP NodeGoat — `results/2026-04-22/`
- `juice-shop/`: OWASP Juice Shop — `results/2026-04-22/`
- `nodejs-synthetic/`: NodeJS Synthetic — `results/2026-04-22/`

Python:

- `pygoat/`: PyGoat — `results/2026-04-22/`
- `dvpwa/`: DVPWA — `results/2026-04-22/`

Rust:

- `rust-synthetic/`: Rust Synthetic — `results/2026-04-22/`
- `cwe-bench-rust/`: CWE-Bench-Rust — `results/2026-04-22/`

Bash, HTML/JS, other:

- `bash-synthetic/`: Bash Synthetic — `results/2026-04-22/`
- `html-js-synthetic/`: HTML/JS Synthetic — `results/2026-04-22/`
- `firing-range/`: Google Firing Range — `results/2026-04-22/`

Go:

- `go-synthetic/`: Go Synthetic — `results/2026-09-11/`
- `vulnerability-goapp/`: Vulnerability-goapp — `results/2026-09-11/`

C#/.NET (preview):

- `csharp-synthetic/`: C# Synthetic — `results/2026-09-11/`
- `juliet-csharp/`: NIST Juliet C#, `_01` baseline — `results/2026-09-11/`

## cognium-ai (SAST + LLM) tracks

Published separately from the static suite and never mixed into it:

- `top-java-github/`: 100 curated tier-1 Java libraries and infrastructure components for security-focused cognium-ai analysis.
