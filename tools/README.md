# Tools

One folder per tool lane. A lane records everything needed to rerun that tool
the way a published result set ran it: version, install source, command, rule
pack or query suite, output format, and known configuration limits. Numbers
never live here — they live in `results/`; a lane README links to the result
sets it produced.

| Lane | Tool | Status | Result sets |
| --- | --- | --- | --- |
| `cognium/` | **cognium-dev** static engine (npm `cognium-dev` / `circle-ir`) | active — the engine measured on `cognium.dev/benchmark` | `results/2026-04-22/`, `results/2026-09-11/` |
| `cognium-ai/` | **cognium-ai** SAST + LLM CLI (npm `cognium-ai`) | active — separate lane, never merged into the static tables | `results/2026-05-05/`, `results/2026-05-27/` |
| `codeql/` | CodeQL CLI | planned — next row in `results/2026-09-11-owasp-java-comparison/` | reference numbers on CWE-Bench-Java (22.5%) are quoted from the IRIS paper, not from a run here |
| `semgrep/` | Semgrep OSS | planned — next row in `results/2026-09-11-owasp-java-comparison/` | — |

## What each lane README must contain

- **Version pinning** — exact tool version per result set; for cognium-dev also
  the npm tarball / release tag, since the CLI wraps a separately versioned
  engine.
- **Install** — the command that yields that version (`npm install -g
  cognium-dev@4.9.13`, `npm install -g cognium-ai@2.7.18`, CodeQL bundle URL,
  `pip install semgrep==…`).
- **Command** — the literal invocation, including rule pack / query suite /
  config file. If a run used a harness rather than the CLI, say which script
  and where it lives; if the harness is not public, say that too.
- **Output** — format produced (JSON, SARIF) and where the raw output is kept
  (`raw/<date>/`, or "withheld" with the reason).
- **Scoring hand-off** — which `benchmarks/<row>/README.md` rule converts the
  output into TP/TN/FP/FN.
- **Limits** — timeouts, languages excluded, features disabled, known
  configuration caveats (e.g. the regex fallback disabled for
  Vulnerability-goapp).

## Fairness rules for comparative lanes

CodeQL and Semgrep results may only be published against the **same dataset
revision and the same scoring rule** as the cognium-dev row they are compared
with, with the query suite / ruleset identifier recorded. A comparison that
mixes datasets, revisions, or scoring rules is not published. Third-party
numbers quoted from papers (IRIS, CodeQL on CWE-Bench-Java) are labelled as
quoted, with the source, wherever they appear.

## Status (2026-09-11)

- `cognium/`: reproduction path for the Go / C# runs verified end to end on
  `circle-ir@4.9.13` (see the lane README). The April 22 one-command harness
  is still not public.
- `cognium-ai/`: `scripts/run-cognium-ai-java-corpus.mjs` verified against
  cognium-ai 4.10.0 with a real static scan (`scripts/README.md`,
  "Verification").
- `codeql/`, `semgrep/`: README stubs only; no configuration has been
  exercised yet.
