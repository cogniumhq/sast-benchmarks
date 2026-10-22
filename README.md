# Cognium SAST Benchmarks

Public, auditable benchmark results for the **cognium-dev** static analysis
engine (`https://github.com/cogniumhq/cognium-dev`, npm `cognium-dev` /
`circle-ir`) and, in a separate lane, the **cognium-ai** SAST + LLM CLI.

This repository is the source of truth behind `https://cognium.dev/benchmark`.
The web page summarizes what is here; every number on it maps to a dated
result set, a raw artifact, a benchmark definition and a dataset record in
this repository. If the page and this repository ever disagree, this
repository wins and the page is wrong.

[![validate-results](https://github.com/cogniumhq/sast-benchmarks/actions/workflows/validate-results.yml/badge.svg)](https://github.com/cogniumhq/sast-benchmarks/actions/workflows/validate-results.yml)
![engine](https://img.shields.io/badge/cognium--dev-4.17.0-orange)
![OWASP Benchmark](https://img.shields.io/badge/OWASP_Benchmark_v1.2-2%2C740_cases-blue)
![languages](https://img.shields.io/badge/languages-Java_%7C_JS%2FTS_%7C_Python_%7C_Go_%7C_Rust_%7C_C%23_%7C_Bash_%7C_HTML-lightgrey)

**Contents:** [Headline comparison](#headline-owasp-benchmark-java-v12-full-suite-tool-comparison) ·
[All published rows](#all-published-static-analysis-rows) ·
[Reading the numbers](#reading-the-numbers) ·
[Reproduce a number](#reproduce-a-number-yourself) ·
[Audit](#how-to-audit) · [Add a tool](#add-a-tool-to-the-comparison) ·
[Layout](#repository-layout) · [Contract](#publishing-contract)

You need nothing but `git` and Node.js 18+ to read, validate and re-score
everything here. Re-running a tool additionally needs that tool (install
lines are in each `tools/<tool>/README.md`).

## Headline: OWASP Benchmark Java v1.2, full suite, tool comparison

All **2,740** test cases (1,415 vulnerable, 1,325 safe), BenchmarkJava
`20cbf3d`, the official OWASP scorecard rule (a case is flagged when a
finding lands in its file with exactly the expected CWE), one open scorer for
every tool, tool CWEs normalized exactly as OWASP's BenchmarkUtils does.
Youden = TPR − FPR is the OWASP "score". Each tool at its best standard
configuration; the others tried are published too.

| Tool | Configuration | TP | FP | FN | TN | TPR | FPR | Precision | Youden |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **cognium-dev 4.9.13** | default, no LLM | 1,287 | 231 | 128 | 1,094 | 91.0% | **17.4%** | **84.8%** | **73.5** |
| CodeQL 2.27.0 | `java-security-extended` | 1,415 | 531 | 0 | 794 | 100.0% | 40.1% | 72.7% | 59.9 |
| Semgrep OSS 1.177.0 | `p/java` + `p/security-audit` | 1,224 | 512 | 191 | 813 | 86.5% | 38.6% | 70.5% | 47.9 |
| SonarQube Community | — | | | | | | | | *planned* |
| SpotBugs + Find-Sec-Bugs | — | | | | | | | | *planned* |

Weak spots are published next to the scores: cognium-dev XSS FPR 91.9% and
cmdi FPR 31.2%; CodeQL sqli FPR 89.2% (default suite: 82.0 / 24.1 / 57.9;
literal first-CWE-tag rule: 53.3); Semgrep FPR above 75% on the data-flow
categories (`p/default`: 46.5). Full detail, per-category tables, raw
SARIF / JSON and per-case FN / FP lists:
[`results/2026-09-11-owasp-java-comparison/`](results/2026-09-11-owasp-java-comparison/summary.md).
Reproduce any row with
[`scripts/score-owasp-benchmark.mjs`](scripts/README.md#score-owasp-benchmarkmjs).

## The static-analysis snapshots (what `cognium.dev/benchmark` shows)

Static engine only — default configuration, no LLM anywhere in detection or
verification. Three dated snapshots, each standing on its own:

| Result set | Engine | Rows | Language groups | Headline |
| --- | --- | ---: | --- | --- |
| [`results/2026-04-22/`](results/2026-04-22/summary.md) | cognium-dev 3.19.4 (published then as `circle-ir`) | 16 | Java, Node.js/TS, Python, Rust, Bash, HTML/JS (+ Firing Range) | 8 rows at 100%, 14 at ≥ 90%; CWE-Bench-Java 50.8% (61/120, IRIS-strict) |
| [`results/2026-09-11/`](results/2026-09-11/summary.md) | cognium-dev 4.9.13 | 4 | Go, C#/.NET (preview) | Go Synthetic 78.9%; Vulnerability-goapp TPR 50.0% / FPR 14.3%; C# Synthetic TPR 90.9% / FPR 25.0%; Juliet C# recall 13.8% |
| [`results/2026-10-22/`](results/2026-10-22/summary.md) | cognium-dev 4.17.0 (`d95544f`) | 16 | Java, Node.js/TS, Python, Rust, Bash, HTML/JS, Go, C#/.NET | OWASP Benchmark TPR 92.7% / FPR 19.7% / Youden 73.0 (2,740 cases); vendored seven TPR 83.1% / FPR 4.4% |

The April snapshot's OWASP row (1,415 cases, 100% / 0%) came from a harness
that is not public and cannot be reconstructed from whole categories; it is
kept as published, footnoted, and never compared with other tools — the
full-suite table above is. The 2026-10-22 OWASP row is the same 2,740-case
scorecard rule on cognium-dev 4.17.0 (TPR 92.7%, FPR 19.7%, Youden 73.0).

### All published static-analysis rows

Every row links to its benchmark definition (what it measures, selection,
scoring rule, known gaps); the same slug under `datasets/` holds the source,
revision and ground truth.

| Language | Benchmark | Tests | TP | TN | FP | FN | TPR | FPR | Score | Result set |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Java | [OWASP Benchmark](benchmarks/owasp-benchmark-java/README.md) | 1415 | 708 | 707 | 0 | 0 | 100% | 0% | 100% | 2026-04-22 |
| Java | [Juliet Test Suite](benchmarks/juliet-java/README.md) | 243 | 122 | 121 | 0 | 0 | 100% | 0% | 100% | 2026-04-22 |
| Java | [SecuriBench Micro](benchmarks/securibench-micro/README.md) | 123 | 60 | 60 | 1 | 2 | 96.8% | 1.6% | 97.7% | 2026-04-22 |
| Java | [CWE-Bench-Java](benchmarks/cwe-bench-java/README.md) | 120 | 61 | — | — | 59 | 50.8% | — | 50.8% | 2026-04-22 |
| Java | [WebGoat](benchmarks/webgoat/README.md) | 29 | 26 | — | — | 3 | 89.7% | — | 89.3% | 2026-04-22 |
| Java | [DVJA](benchmarks/dvja/README.md) | 7 | 7 | — | — | 0 | 100% | — | 100% | 2026-04-22 |
| Node.js / TypeScript | [NodeGoat](benchmarks/nodegoat/README.md) | 14 | 14 | — | — | 0 | 100% | — | 100% | 2026-04-22 |
| Node.js / TypeScript | [Juice Shop](benchmarks/juice-shop/README.md) | 14 | 14 | — | — | 0 | 100% | — | 100% | 2026-04-22 |
| Node.js / TypeScript | [NodeJS Synthetic](benchmarks/nodejs-synthetic/README.md) | 25 | 23 | — | — | 2 | 92.0% | — | 92.9% | 2026-04-22 |
| Python | [PyGoat](benchmarks/pygoat/README.md) | 26 | 23 | — | — | 3 | 88.5% | — | 90.0% | 2026-04-22 |
| Python | [DVPWA](benchmarks/dvpwa/README.md) | 6 | 6 | — | — | 0 | 100% | — | 100% | 2026-04-22 |
| Rust | [Rust Synthetic](benchmarks/rust-synthetic/README.md) | 50 | 46 | — | — | 4 | 92.0% | — | 92.3% | 2026-04-22 |
| Rust | [CWE-Bench-Rust](benchmarks/cwe-bench-rust/README.md) | 30 | 28 | — | — | 2 | 93.3% | — | 94.4% | 2026-04-22 |
| Bash | [Bash Synthetic](benchmarks/bash-synthetic/README.md) | 31 | 31 | — | — | 0 | 100% | — | 100% | 2026-04-22 |
| HTML/JS | [HTML/JS Synthetic](benchmarks/html-js-synthetic/README.md) | 30 | 30 | — | — | 0 | 100% | — | 100% | 2026-04-22 |
| Other | [Firing Range](benchmarks/firing-range/README.md) | 40 | 35 | — | 2 | 3 | 92.1% | — | 92.1% | 2026-04-22 |
| Go | [Go Synthetic](benchmarks/go-synthetic/README.md) | 29 | 15 | 10 | 0 | 4 | 78.9% | 0.0% | 78.9% | 2026-09-11 |
| Go | [Vulnerability-goapp](benchmarks/vulnerability-goapp/README.md) | 13 | 3 | 6 | 1 | 3 | 50.0% | 14.3% | 45.0% | 2026-09-11 |
| C#/.NET | [C# Synthetic](benchmarks/csharp-synthetic/README.md) | 15 | 10 | 3 | 1 | 1 | 90.9% | 25.0% | 65.9% | 2026-09-11 |
| C#/.NET | [Juliet C# (NIST, baseline _01)](benchmarks/juliet-csharp/README.md) | 123 | 17 | — | — | 106 | 13.8% | — | 13.8% | 2026-09-11 |
| Java | [OWASP Benchmark](benchmarks/owasp-benchmark-java/README.md) | 2740 | 1311 | 1064 | 261 | 104 | 92.7% | 19.7% | 73.0% | 2026-10-22 |
| Java | [SecuriBench Micro](benchmarks/securibench-micro/README.md) | 122 | 90 | 9 | 1 | 22 | 80.4% | 10.0% | 70.4% | 2026-10-22 |
| Java | [WebGoat](benchmarks/webgoat/README.md) | 29 | 16 | 8 | 0 | 5 | 76.2% | 0.0% | 76.2% | 2026-10-22 |
| Java | [DVJA](benchmarks/dvja/README.md) | 7 | 1 | 4 | 0 | 2 | 33.3% | 0.0% | 33.3% | 2026-10-22 |
| Node.js / TypeScript | [NodeGoat](benchmarks/nodegoat/README.md) | 13 | 1 | 9 | 0 | 3 | 25.0% | 0.0% | 25.0% | 2026-10-22 |
| Node.js / TypeScript | [Juice Shop](benchmarks/juice-shop/README.md) | 14 | 5 | 4 | 0 | 5 | 50.0% | 0.0% | 50.0% | 2026-10-22 |
| Node.js / TypeScript | [NodeJS Synthetic](benchmarks/nodejs-synthetic/README.md) | 25 | 16 | 8 | 1 | 0 | 100.0% | 11.1% | 88.9% | 2026-10-22 |
| Python | [PyGoat](benchmarks/pygoat/README.md) | 26 | 0 | 11 | 0 | 15 | 0.0% | 0.0% | 0.0% | 2026-10-22 |
| Rust | [Rust Synthetic](benchmarks/rust-synthetic/README.md) | 50 | 32 | 12 | 1 | 5 | 86.5% | 7.7% | 78.8% | 2026-10-22 |
| Rust | [CWE-Bench-Rust](benchmarks/cwe-bench-rust/README.md) | 30 | 12 | 11 | 1 | 6 | 66.7% | 8.3% | 58.3% | 2026-10-22 |
| Bash | [Bash Synthetic](benchmarks/bash-synthetic/README.md) | 31 | 18 | 9 | 0 | 4 | 81.8% | 0.0% | 81.8% | 2026-10-22 |
| HTML/JS | [HTML/JS Synthetic](benchmarks/html-js-synthetic/README.md) | 30 | 12 | 11 | 0 | 7 | 63.2% | 0.0% | 63.2% | 2026-10-22 |
| Go | [Go Synthetic](benchmarks/go-synthetic/README.md) | 29 | 17 | 10 | 0 | 2 | 89.5% | 0.0% | 89.5% | 2026-10-22 |
| Go | [Vulnerability-goapp](benchmarks/vulnerability-goapp/README.md) | 10 | 0 | 6 | 0 | 4 | 0.0% | 0.0% | 0.0% | 2026-10-22 |
| C#/.NET | [C# Synthetic](benchmarks/csharp-synthetic/README.md) | 15 | 11 | 4 | 0 | 0 | 100.0% | 0.0% | 100.0% | 2026-10-22 |
| C#/.NET | [Juliet C# (NIST, default config)](benchmarks/juliet-csharp/README.md) | 894 | 25 | — | — | 869 | 2.8% | — | 2.8% | 2026-10-22 |

`—` means the dataset has no scored negatives for that row (only positives
are labelled), so TN, FP and FPR cannot be reported. It never means zero.

For each row:

- **what it measures, how it is scored, the published numbers** →
  [`benchmarks/<row>/`](benchmarks/README.md)
- **where the cases come from, revision, ground truth** →
  [`datasets/<row>/`](datasets/README.md) — label files for the vulnerable
  applications and the full source of every synthetic set are committed
- **raw evidence** → [`raw/<date>/`](raw/) — page snapshot for April, runner
  logs for September
- **scoring rules and definitions** (Score column, "perfect", "near-perfect",
  what a dash means) → [`benchmarks/static-analysis-suite/`](benchmarks/static-analysis-suite/README.md)
  and [`methodology/`](methodology/README.md)

Known limits are stated next to every score: the April harness is not
public (auditable, not one-command reproducible), C#/.NET is preview, and the
April dataset revisions were not pinned. See
[`docs/run-new-benchmarks.md`](docs/run-new-benchmarks.md) for the rerun
status and [`tools/cognium/`](tools/cognium/README.md) for the exact
reproduction path used for the Go / C# runs.

## The cognium-ai lane (SAST + LLM, published separately)

`cognium-ai` wraps the engine with LLM discovery and verification. Its runs
are published under `results/2026-05-*/` with model, provider and timeout
metadata, and are scored by the CLI's own `benchmark` command. They are never
mixed into the static tables above, and their "static" rows are not the
page's static snapshot (different engine version and scoring — each summary
says so).

- [`results/2026-05-27/`](results/2026-05-27/summary.md): CWE-Bench-Java model
  comparison (Ollama, mlx-lm, cloud) and top-10 GitHub corpora for Java,
  JavaScript, Python.
- [`results/2026-05-05/`](results/2026-05-05/cognium-ai-javascript-top10-static-baseline-summary.md):
  JavaScript top-10 static baseline.
- [`results/2026-05-03/`](results/2026-05-03/top-java-cognium-ai-plan.md):
  top-100 Java corpus plan and one sample run.

Target corpora: `datasets/top-*-github/`. Findings against third-party
projects follow [`docs/upstream-disclosure-policy.md`](docs/upstream-disclosure-policy.md).

## Reading the numbers

| Term | Meaning |
| --- | --- |
| TP / FN | vulnerable case flagged / missed |
| FP / TN | safe case flagged / correctly left alone |
| TPR (recall) | TP / (TP + FN) — share of real vulnerabilities found |
| FPR | FP / (FP + TN) — share of safe cases wrongly flagged |
| Precision | TP / (TP + FP) — share of flags that are real |
| Youden | TPR − FPR — the OWASP Benchmark "score"; 100 is perfect, 0 is a coin flip |
| Score (snapshot tables) | defined per benchmark kind in [`benchmarks/static-analysis-suite/`](benchmarks/static-analysis-suite/README.md): `TPR − FPR` where negatives are scored, recall where only positives exist |
| Perfect / near-perfect | row score = 100% / ≥ 90% |
| `—`, `n/a`, `null` | not measurable on that dataset — never zero |
| "flagged" | a finding in the case's file with **exactly** the expected CWE; a finding of another type never counts, for or against |

Every result set folder has the same shape:

```text
results/<set>/summary.md        human-readable: setup, tables, how it was run, known gaps
results/<set>/results.json      machine-readable rows + summary (schemas/result.schema.json)
results/<set>/results.csv       the same rows, one per line
results/<set>/*-breakdown.csv   per-CWE detail where the benchmark has it
results/<set>/comparison.json   (comparison lanes) one entry per tool, with per-category tables
raw/<set>/                      what the tool actually emitted (gzipped) + normalized findings + logs
```

## Reproduce a number yourself

The headline cognium-dev row, end to end (≈1 minute on a laptop):

```sh
git clone https://github.com/cogniumhq/sast-benchmarks && cd sast-benchmarks
git clone https://github.com/OWASP-Benchmark/BenchmarkJava owasp-java
git -C owasp-java checkout 20cbf3d11123347e47ed89541e6942836def53f7
npm install -g cognium-dev@4.9.13
cognium-dev scan owasp-java/src/main/java/org/owasp/benchmark/testcode -l java -f json -q -o scan.json
node scripts/score-owasp-benchmark.mjs --tool cognium-dev --tool-version 4.9.13 --cognium-dev-json scan.json --out out
#  -> out/cognium-dev.scorecard.md : 2740 | 1287 | 231 | 128 | 1094 | 91.0% | 17.4% | 84.8% | 87.8% | 73.5%
```

The CodeQL and Semgrep rows, and every configuration tried for them, are in
[`results/2026-09-11-owasp-java-comparison/summary.md`](results/2026-09-11-owasp-java-comparison/summary.md#reproduce)
with the same copy-paste form. The Go and C#/.NET runs:
[`tools/cognium/README.md`](tools/cognium/README.md). Anything scored from a
committed dataset (all synthetic sets, the labelled applications) only needs
the engine and the files under `datasets/<row>/`.

To re-score a tool's existing output without re-running it, feed the raw
file from `raw/<set>/` to the scorer — e.g.
`gzip -dc raw/2026-09-11-owasp-java-comparison/codeql-2.27.0-owasp-java.java-security-extended.sarif.gz > codeql.sarif`
then `node scripts/score-owasp-benchmark.mjs --tool codeql --tool-version 2.27.0 --sarif codeql.sarif --out out`.

## Nightly regression sweep

Published benchmark rows above are point-in-time measurements.
Separately, a nightly job scores cognium-dev with `scripts/run-corpus.mjs` and
fails — and files a defect — if any baselined corpus drops below
`baseline/detection-quality.json`.

```sh
# offline vendored subset, and the full sweep the nightly runs
node scripts/run-corpus.mjs --cli ../cognium-dev/packages/cli/dist/cli.js --all --out results/$(date -u +%F)-detection-quality
node scripts/run-corpus.mjs --cli ../cognium-dev/packages/cli/dist/cli.js --all-corpora --out results/$(date -u +%F)-detection-quality
node scripts/compare-baseline.mjs --run results/$(date -u +%F)-detection-quality/run-summary.json
```

`run-corpus.mjs` measures and always exits 0; `compare-baseline.mjs` is the
verdict. Keeping those separate means a measurement run can never be mistaken
for a pass.

**Scope.** `--all-corpora` scores the seven vendored corpora and the pinned
fetch-based corpora. The published 2026-10-22 set is that full run (16 corpora,
4,065 cases) on cognium-dev 4.17.0. `--all` is the offline vendored subset
(210 cases). The frozen baseline still covers only those seven vendored
corpora at cognium-dev 4.9.20. Fetch-based corpora are recorded on each run
and stay ungated until a baseline promotion.

**Policy.** TPR may not drop at all, and FPR may not rise (tolerance
configurable). That is measured rather than assumed: two runs on different
hosts against cognium-dev 4.9.20 and 4.9.21 produced byte-identical
scorecards, so these corpora carry no run-to-run noise and any movement is a
real engine change.

**Updating the baseline** is a deliberate promotion of a verified run, never a
way to make a failing run pass — see [`baseline/README.md`](baseline/README.md).

## How to audit

```sh
git clone https://github.com/cogniumhq/sast-benchmarks
cd sast-benchmarks
node scripts/validate-results.mjs      # schema, sums, artifact paths, folder per row, comparison arithmetic
node scripts/compare-baseline.mjs --run results/<date>-detection-quality/run-summary.json   # nightly sweep vs baseline
ls results/2026-04-22 results/2026-09-11 results/2026-09-11-owasp-java-comparison results/2026-10-22 raw datasets benchmarks
```

`scripts/validate-results.mjs` runs in CI on every push and pull request. It
fails if a summary does not equal the sum of its rows, a language-summary
total does not add up, a referenced artifact is missing, a published row has
no `benchmarks/` or `datasets/` folder, or a comparison row's TP + FP + FN +
TN is not the dataset size.

## Add a tool to the comparison

1. Run the tool on BenchmarkJava `20cbf3d` and keep its SARIF / JSON.
2. `node scripts/score-owasp-benchmark.mjs --tool <name> --tool-version <v> --sarif <file> --out results/<date>/owasp-java`
   — add a CWE-normalization preset only if OWASP BenchmarkUtils has one for
   that tool, and cite it.
3. Publish the best standard configuration as the row; keep every other
   configuration tried under `alternatives/`; gzip the raw output into `raw/`.
4. Add a `tools/<name>/README.md` (version, install, command, limits) and the
   row to `comparison.json`; the validator enforces the rest.

Commercial tools whose licences forbid publishing benchmark results (Snyk,
Checkmarx, Fortify, Veracode and similar) are not run here; their own
published claims may be quoted only as quoted, with the source.

## Repository layout

```text
benchmarks/   one folder per published benchmark row + the track overview
datasets/     one folder per dataset: source, revision, acquisition, ground truth
results/      dated result sets: summary.md, results.json, results.csv, breakdowns
baseline/     the regression reference the nightly sweep scores against
raw/          raw evidence per result set (page snapshot, runner logs)
methodology/  scoring principles and score definitions
tools/        per-tool lanes: cognium-dev, cognium-ai, CodeQL, Semgrep
schemas/      result.schema.json
LICENSE       MIT; THIRD-PARTY-NOTICES.md lists redistributed material under other terms
scripts/      validator, OWASP scorer, nightly sweep runner + baseline comparator, corpus helpers
docs/         publishing workflow, rerun status, disclosure policy
.github/      issue / discussion templates, CI
```

## Publishing contract

Every result set must carry: benchmark and dataset revision, tool name and
exact version, the command used, raw artifact paths, scoring rule, known
limitations, and a link for review. Nothing goes on `cognium.dev/benchmark`
that does not first exist here. Review happens in GitHub Discussions and
issues; see [`docs/publishing.md`](docs/publishing.md).

## Questions and challenges

Open a GitHub issue (templates: benchmark run, reproduction problem, scoring
challenge) or a Discussion. A scoring challenge should name the result set,
the row, the case id(s) from the published FN / FP lists, and the rule you
believe was misapplied.

## Licence

MIT ([`LICENSE`](LICENSE)) for everything authored here — scripts, results,
raw outputs we produced, documentation, our ground-truth label files and the
synthetic test-case sources. Redistributed third-party material keeps its
own terms (OWASP's `expectedresults-1.2.csv` is GPL-2.0; Juliet is public
domain; the vulnerable applications are under their own licences); the
carve-out is listed in [`THIRD-PARTY-NOTICES.md`](THIRD-PARTY-NOTICES.md).

## Canonical links

- Technical publication: `https://cognium.dev/benchmark`
- Engine: `https://github.com/cogniumhq/cognium-dev`
- Official OWASP scorer this repository mirrors: `https://github.com/OWASP-Benchmark/BenchmarkUtils`
- Commercial summary: `https://cognium.net`
