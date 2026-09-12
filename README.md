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
![engine](https://img.shields.io/badge/cognium--dev-4.9.13-orange)
![OWASP Benchmark](https://img.shields.io/badge/OWASP_Benchmark_v1.2-2%2C740_cases-blue)
![languages](https://img.shields.io/badge/languages-Java_%7C_JS%2FTS_%7C_Python_%7C_Go_%7C_Rust_%7C_C%23_%7C_Bash_%7C_HTML-lightgrey)

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
verification. Two dated snapshots, never merged:

| Result set | Engine | Rows | Language groups | Headline |
| --- | --- | ---: | --- | --- |
| [`results/2026-04-22/`](results/2026-04-22/summary.md) | cognium-dev 3.19.4 (published then as `circle-ir`) | 16 | Java, Node.js/TS, Python, Rust, Bash, HTML/JS (+ Firing Range) | 8 rows at 100%, 14 at ≥ 90%; CWE-Bench-Java 50.8% (61/120, IRIS-strict) |
| [`results/2026-09-11/`](results/2026-09-11/summary.md) | cognium-dev 4.9.13 | 4 | Go, C#/.NET (preview) | Go Synthetic 78.9%; Vulnerability-goapp TPR 50.0% / FPR 14.3%; C# Synthetic TPR 90.9% / FPR 25.0%; Juliet C# recall 13.8% |

The April snapshot's OWASP row (1,415 cases, 100% / 0%) came from a harness
that is not public and cannot be reconstructed from whole categories; it is
kept as published, footnoted, and never compared with other tools — the
full-suite table above is.

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

## How to audit

```sh
git clone https://github.com/cogniumhq/sast-benchmarks
cd sast-benchmarks
node scripts/validate-results.mjs      # schema, sums, artifact paths, folder per row, comparison arithmetic
ls results/2026-04-22 results/2026-09-11 results/2026-09-11-owasp-java-comparison raw datasets benchmarks
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
raw/          raw evidence per result set (page snapshot, runner logs)
methodology/  scoring principles and score definitions
tools/        per-tool lanes: cognium-dev, cognium-ai, CodeQL, Semgrep
schemas/      result.schema.json
scripts/      validator and corpus helpers
docs/         publishing workflow, rerun status, disclosure policy
.github/      issue / discussion templates, CI
```

## Publishing contract

Every result set must carry: benchmark and dataset revision, tool name and
exact version, the command used, raw artifact paths, scoring rule, known
limitations, and a link for review. Nothing goes on `cognium.dev/benchmark`
that does not first exist here. Review happens in GitHub Discussions and
issues; see [`docs/publishing.md`](docs/publishing.md).

## Canonical links

- Technical publication: `https://cognium.dev/benchmark`
- Engine: `https://github.com/cogniumhq/cognium-dev`
- Commercial summary: `https://cognium.net`
