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

- Cognium / circle-ir
- cognium-ai
- CodeQL
- Semgrep

## Published Results

- `results/2026-04-22/`: circle-ir 3.19.4 static-analysis benchmark results
  imported from the live `cognium.dev/benchmark` page.
- `results/2026-04-30/`: sanitized cognium-ai static and LLM-enriched
  evaluation results on an intentionally vulnerable Python demo repository.

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
