# Cognium SAST Benchmarks

Public, reproducible benchmark results for Cognium and comparable SAST tools.

This repository is the auditable source of truth behind `cognium.dev/benchmark`.
The website should summarize these results, but raw data, commands, tool
configuration, and methodology live here.

## Goals

- Publish regular SAST benchmark results with raw evidence.
- Make every score reproducible from a clean checkout.
- Track benchmark, dataset, tool, and scoring changes over time.
- Give researchers and maintainers a place to challenge results.

## Repository Layout

```text
benchmarks/          Benchmark-specific run definitions
datasets/            Dataset metadata and acquisition notes
methodology/         Scoring, validation, and limitations
tools/               Per-tool configuration and run notes
results/             Dated summaries suitable for publication
raw/                 Raw logs, scanner outputs, and artifacts
schemas/             Machine-readable result formats
scripts/             Reproducibility helpers
docs/                Website-ready technical documentation
.github/             Issues, discussions, and automation
```

## First Benchmark Track

The first track is `CWE-Bench-Java`, focused on real-world Java CVEs and CWE
classes used for SAST evaluation.

Initial tool lanes:

- cognium-dev (formerly published as `circle-ir`)
- cognium-ai
- CodeQL
- Semgrep

## Published Results

Static-analysis snapshots (what `cognium.dev/benchmark` shows):

- `results/2026-04-22/`: cognium-dev 3.19.4 (published then as `circle-ir`)
  static-analysis results across 16 benchmarks / 6 language groups, imported
  from the live `cognium.dev/benchmark` page. Raw page snapshot in
  `raw/2026-04-22/`.
- `results/2026-09-11/`: cognium-dev 4.9.13 first scored results for the two
  languages missing from the April snapshot — Go (Go Synthetic,
  Vulnerability-goapp) and C#/.NET (curated ASP.NET Core / ADO.NET set, NIST
  Juliet C# baseline). Raw runner logs in `raw/2026-09-11/`.

cognium-ai (SAST + LLM) lanes, published separately from the static snapshots:

- `results/2026-05-05/`: JavaScript top-10 static baseline.
- `results/2026-05-27/`: Java / JavaScript / Python top-10 LLM-enriched runs
  across several models.

## Publishing Contract

Each benchmark result should include:

- benchmark and dataset version
- tool name and version
- exact command used
- raw output artifact path
- scoring summary
- known limitations
- commit hash for the result
- discussion or issue link for review

## Canonical Links

- Technical publication: `https://cognium.dev/benchmark`
- Commercial summary: `https://cognium.net`
- Source repository: `https://github.com/cogniumhq/sast-benchmarks`
