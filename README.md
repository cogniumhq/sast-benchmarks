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

## The static-analysis story (what the page shows)

Static engine only — default configuration, no LLM anywhere in detection or
verification. Two dated snapshots, never merged:

| Result set | Engine | Rows | Language groups | Headline |
| --- | --- | ---: | --- | --- |
| [`results/2026-04-22/`](results/2026-04-22/summary.md) | cognium-dev 3.19.4 (published then as `circle-ir`) | 16 | Java, Node.js/TS, Python, Rust, Bash, HTML/JS (+ Firing Range) | 8 rows at 100%, 14 at ≥ 90%; CWE-Bench-Java 50.8% (61/120, IRIS-strict) |
| [`results/2026-09-11/`](results/2026-09-11/summary.md) | cognium-dev 4.9.13 | 4 | Go, C#/.NET (preview) | Go Synthetic 78.9%; Vulnerability-goapp TPR 50.0% / FPR 14.3%; C# Synthetic TPR 90.9% / FPR 25.0%; Juliet C# recall 13.8% |

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
node scripts/validate-results.mjs      # schema, sums, artifact paths, folder per row
ls results/2026-04-22 results/2026-09-11 raw datasets benchmarks
```

`scripts/validate-results.mjs` runs in CI on every push and pull request. It
fails if a summary does not equal the sum of its rows, a language-summary
total does not add up, a referenced artifact is missing, or a published row
has no `benchmarks/` or `datasets/` folder.

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
