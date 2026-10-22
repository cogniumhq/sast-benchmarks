# cognium-dev SAST Benchmark Results: 2026-10-22

Full detection-quality sweep on cognium-dev 4.17.0. Sixteen corpora, 4,065
cases, static analysis only. Each earlier dated set stays as published; read
a row against another row only when both name this harness.

## Scope

- Tool: cognium-dev 4.17.0
- Engine source: `https://github.com/cogniumhq/cognium-dev` commit `d95544f`
  (`Merge pull request #893 from cogniumhq/ci/fork-prs-off-self-hosted`)
- Build stamp: `d95544f` at `2026-10-22T21:49:10.871Z`
- Mode: static analysis, default taint configuration, no LLM
- Command:

```sh
node scripts/run-corpus.mjs \
  --cli <cognium-dev packages/cli/dist/cli.js built from d95544f> \
  --all-corpora \
  --out results/2026-10-22-detection-quality
```

- Runtime: Node.js v25.9.0, Darwin arm64
- Run: `2026-10-22T21:51:09Z`
- Scorecards: `results/2026-10-22-detection-quality/`
- Raw scan JSON (gzip): `raw/2026-10-22/`

A case is flagged when a finding lands in its file with exactly the expected
CWE. Findings without a CWE are dropped. Score = TPR − FPR where the corpus
has safe cases. Juliet C# is recall only.

cognium-ai `main` at this publish is 4.22.0 (`a5598319`) and depends on
`circle-ir` 4.16.1. These rows are the cognium-dev CLI, which is the newer
engine. The cognium-ai lane remains `results/2026-05-*`.

## Results by benchmark

| Language | Benchmark | Tests | TP | TN | FP | FN | TPR | FPR | Score |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Java | OWASP Benchmark | 2740 | 1311 | 1064 | 261 | 104 | 92.7% | 19.7% | 73.0% |
| Java | SecuriBench Micro | 122 | 90 | 9 | 1 | 22 | 80.4% | 10.0% | 70.4% |
| Java | WebGoat | 29 | 16 | 8 | 0 | 5 | 76.2% | 0.0% | 76.2% |
| Java | DVJA | 7 | 1 | 4 | 0 | 2 | 33.3% | 0.0% | 33.3% |
| Node.js / TypeScript | NodeGoat | 13 | 1 | 9 | 0 | 3 | 25.0% | 0.0% | 25.0% |
| Node.js / TypeScript | Juice Shop | 14 | 5 | 4 | 0 | 5 | 50.0% | 0.0% | 50.0% |
| Node.js / TypeScript | NodeJS Synthetic | 25 | 16 | 8 | 1 | 0 | 100.0% | 11.1% | 88.9% |
| Python | PyGoat | 26 | 0 | 11 | 0 | 15 | 0.0% | 0.0% | 0.0% |
| Rust | Rust Synthetic | 50 | 32 | 12 | 1 | 5 | 86.5% | 7.7% | 78.8% |
| Rust | CWE-Bench-Rust | 30 | 12 | 11 | 1 | 6 | 66.7% | 8.3% | 58.3% |
| Bash | Bash Synthetic | 31 | 18 | 9 | 0 | 4 | 81.8% | 0.0% | 81.8% |
| HTML/JS | HTML/JS Synthetic | 30 | 12 | 11 | 0 | 7 | 63.2% | 0.0% | 63.2% |
| Go | Go Synthetic | 29 | 17 | 10 | 0 | 2 | 89.5% | 0.0% | 89.5% |
| Go | Vulnerability-goapp | 10 | 0 | 6 | 0 | 4 | 0.0% | 0.0% | 0.0% |
| C#/.NET | C# Synthetic | 15 | 11 | 4 | 0 | 0 | 100.0% | 0.0% | 100.0% |
| C#/.NET | Juliet C# (NIST, default config) | 894 | 25 | n/a | n/a | 869 | 2.8% | n/a | 2.8% |

Added together the sweep is TP 1,567, FN 1,053, FP 265, TN 1,180
(TPR 59.8%, FPR 18.3%). Juliet's 869 misses sit inside that total. The
per-benchmark rows are the numbers to quote.

One row scores 100% (C# Synthetic). One row scores at least 90% (the same row).

## OWASP Benchmark Java v1.2

All 2,740 cases, BenchmarkJava `20cbf3d`. Precision 83.4% (1,311 / 1,572).
Youden 73.0.

The 2026-09-11 comparison on cognium-dev 4.9.13, same commit and the same
flag rule, is TPR 91.0%, FPR 17.4%, precision 84.8%, Youden 73.5. From 4.9.13
to 4.17.0 this scorer moves +24 TP, −24 FN, +30 FP, −30 TN.

| Category | CWE | TP | TN | FP | FN | TPR | FPR |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| cmdi | CWE-78 | 121 | 51 | 74 | 5 | 96.0% | 59.2% |
| crypto | CWE-327 | 130 | 116 | 0 | 0 | 100% | 0% |
| hash | CWE-328 | 89 | 107 | 0 | 40 | 69.0% | 0% |
| ldapi | CWE-90 | 24 | 32 | 0 | 3 | 88.9% | 0% |
| pathtraver | CWE-22 | 121 | 110 | 25 | 12 | 91.0% | 18.5% |
| securecookie | CWE-614 | 36 | 27 | 4 | 0 | 100% | 12.9% |
| sqli | CWE-89 | 261 | 154 | 78 | 11 | 96.0% | 33.6% |
| trustbound | CWE-501 | 66 | 32 | 11 | 17 | 79.5% | 25.6% |
| weakrand | CWE-330 | 218 | 275 | 0 | 0 | 100% | 0% |
| xpathi | CWE-643 | 14 | 20 | 0 | 1 | 93.3% | 0% |
| xss | CWE-79 | 231 | 140 | 69 | 15 | 93.9% | 33.0% |

Command injection, SQL injection, and XSS still carry the false-positive mass.
Weak random, crypto, and hash stay clean on the safe cases; hash recall is 69.0%.

## Vendored corpora against the frozen baseline

`baseline/detection-quality.json` is cognium-dev 4.9.20, seven vendored
corpora, 210 cases, TPR 81.7%, FPR 7.4%. This run on the same seven is
TPR 83.1% (118/142), FPR 4.4% (3/68). The baseline file is not updated.

| Corpus | Movement |
| --- | --- |
| csharp-synthetic | TPR 90.9% → 100% (`xss_response_write_concat`) |
| cwe-bench-rust | FPR 16.7% → 8.3% (`RustTest00017` no longer flagged) |
| rust-synthetic | TPR 83.8% → 86.5% (`sqli_concat_in_loop`, `xss_tera_template`); FPR 15.4% → 7.7% (`deser_safe_validated` no longer flagged) |
| bash-synthetic, go-synthetic, html-js-synthetic, nodejs-synthetic | same TPR and FPR as the baseline |

## Corpora that now finish a scan

On 2026-09-21, PyGoat, NodeGoat, and Vulnerability-goapp aborted (regex crash,
or a directory scan that never returned) and were listed in
`baseline/known-failures.json`. cognium-dev 4.17.0 completes all three, so
those exemptions are removed. Their scores are published here and are not
copied into the frozen baseline:

| Corpus | Tests | TP | TN | FP | FN | TPR | FPR |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| PyGoat | 26 | 0 | 11 | 0 | 15 | 0.0% | 0.0% |
| NodeGoat | 13 | 1 | 9 | 0 | 3 | 25.0% | 0.0% |
| Vulnerability-goapp | 10 | 0 | 6 | 0 | 4 | 0.0% | 0.0% |

PyGoat and Vulnerability-goapp flag none of their labelled vulnerable files.
The safe files stay clean.

## Juliet C#

894 files under `src/testcases`, recall only, default taint config: TPR 2.8%
(25/894). The 2026-09-11 figure of 13.8% is the `_01` variant (123 files)
with the corpus source and sink signatures loaded. This row answers what the
default config does on the whole tree.

## Language summary

| Language | Perfect 100% | 90%+ | Total benchmarks |
| --- | ---: | ---: | ---: |
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

- Static analysis only.
- The frozen baseline is still the 2026-09-21 vendored run. Promoting this
  sweep into that file would be a separate decision.
- April 22 and September 11 rows used other harnesses. Case counts on shared
  names (Vulnerability-goapp 10 here, 13 on 2026-09-11; SecuriBench 122 here,
  123 on 2026-04-22) follow this repo's current expected-results files.
- Per-case misses and false positives are in each
  `results/2026-10-22-detection-quality/<corpus>.scorecard.json`.
