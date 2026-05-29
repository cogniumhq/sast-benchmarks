# Running and Publishing New SAST Benchmarks

This document describes practical ways to produce new benchmark results and
publish them into this repository.

## Current State

The repository already publishes one imported result set:

- `results/2026-04-22/`: imported from `https://cognium.dev/benchmark/`
- `raw/2026-04-22/cognium-dev-benchmark.html`: source snapshot from the live page

The live page says the reproduction command is:

```sh
git clone https://github.com/cogniumhq/circle-ir
cd circle-ir/benchmarks
npm install
npm run benchmark
```

However, as of this repo review, the local `circle-ir/package.json` does not
define a `benchmark` script. Treat that as the first blocker before publishing
fresh reruns. Imported historical results can remain, but new results should be
produced by a command that exists in the source repository.

## Recommended Tracks

### Track 1: Cognium / circle-ir Fresh Run

Purpose: publish the latest Cognium SAST result with raw output and a dated
summary.

Required fix first:

- Add or restore a benchmark harness in `cogniumhq/circle-ir`.
- Make `npm run benchmark` or an equivalent command produce machine-readable
  output.
- Commit the exact command in `tools/cognium/README.md` and the dated result
  folder.

Target output shape:

```text
raw/YYYY-MM-DD/cognium-circle-ir.json
raw/YYYY-MM-DD/cognium-circle-ir.log
results/YYYY-MM-DD/results.json
results/YYYY-MM-DD/results.csv
results/YYYY-MM-DD/summary.md
```

Minimum result metadata:

- circle-ir version
- circle-ir commit SHA
- benchmark dataset revision
- command
- Node.js version
- OS/runner
- raw artifact paths
- limitations

### Track 2: CWE-Bench-Java Subset Run

Purpose: produce a repeatable Java CVE benchmark run before attempting the full
120-project benchmark.

Start with a small, named subset:

```sh
cd <circle-ir-checkout>/cwe-bench-java
python3 scripts/setup.py --no-build --cwe CWE-022
```

Then run the Cognium analyzer against fetched Java source files once the harness
exists.

For full builds, CWE-Bench-Java requires multiple JDK versions, Maven, Gradle,
Git, wget, zip/unzip, tar, and Python. Because that setup is heavy, publish the
first fresh result as a clearly labeled subset run before publishing a full
benchmark claim.

### Track 3: cognium-ai Static and LLM Evaluation

Purpose: publish AI-assisted SAST behavior separately from the core circle-ir
static benchmark.

Keep this lane separate because `cognium-ai` results include model, provider,
timeout, and JSON parsing behavior that should not be mixed with deterministic
static-analysis scoring.

Representative static baseline:

```sh
cognium-ai scan . --no-llm
cognium-ai trust .
cognium-ai quality .
cognium-ai secrets .
```

Representative LLM-enriched run:

```sh
export LLM_BASE_URL=http://localhost:11434/v1
export LLM_API_KEY=lm-studio
export LLM_ENRICHMENT_MODEL=llama3.2:3b
export LLM_DISCOVERY_MODEL=llama3.2:3b
cognium-ai scan .
```

Required publication metadata:

- cognium-ai version and source commit
- model name and provider
- target repository and commit
- command and environment variables used
- total findings by severity
- timeout count and JSON parse failure count
- trust, quality, and secrets summaries
- known engine regressions versus model limitations
- redaction note for any secret-like findings

Do not publish raw JSON if it includes source `lineContent` for seeded secrets.
Publish aggregate secret counts, redacted examples, or non-sensitive per-run
summaries instead.

For ecosystem-scale Java scans, use the top-Java GitHub corpus:

```sh
node scripts/select-top-java-projects.mjs
node scripts/run-cognium-ai-java-corpus.mjs --dry-run --limit 100
node scripts/run-cognium-ai-java-corpus.mjs --offset 0 --limit 5 --timeout-seconds 1800
```

Keep raw scan outputs in the configured private raw directory and commit only
sanitary aggregate summaries.

### Track 4: CodeQL Baseline

Purpose: compare Cognium against a known SAST baseline.

CodeQL's CLI flow is:

```sh
codeql database create <db-dir> --language=java --source-root <project-dir>
codeql database analyze --format=sarifv2.1.0 --output=<output.sarif> <db-dir> <query-suite-or-pack>
```

Publish CodeQL outputs as raw SARIF under `raw/YYYY-MM-DD/` and normalize the
scored result into `results/YYYY-MM-DD/results.json`.

Use this only when the same dataset revision and scoring rules are pinned for
Cognium and CodeQL.

### Track 5: Semgrep Baseline

Purpose: provide a second easy-to-run open-source baseline.

Semgrep can export JSON and SARIF:

```sh
semgrep ci --json --json-output=semgrep.json --sarif-output=semgrep.sarif
```

For local/no-platform runs, use an explicit ruleset and record it:

```sh
semgrep scan --config=p/java --json --output=semgrep.json <project-dir>
```

Publish both raw outputs and the ruleset identifier.

### Track 6: OWASP Benchmark Scorecard

Purpose: publish a benchmark that already has an established scorecard format.

OWASP Benchmark includes scorecard generators for AST tools. If Cognium emits a
supported or convertible result format, use the OWASP scorecard as an additional
artifact rather than replacing the repo's own JSON/CSV format.

Target artifacts:

```text
raw/YYYY-MM-DD/owasp-benchmark-cognium-output.json
raw/YYYY-MM-DD/owasp-benchmark-scorecard/
results/YYYY-MM-DD/summary.md
```

## Publish Workflow

1. Create a dated run folder: `results/YYYY-MM-DD/` and `raw/YYYY-MM-DD/`.
2. Pin source revisions: tool commit, dataset commit, ruleset/query version.
3. Run tools and save unmodified raw outputs.
4. Normalize into `results/YYYY-MM-DD/results.json` and `results.csv`.
5. Add a human-readable `summary.md` with limitations next to the score.
6. Validate JSON parsing and links.
7. Commit and push to `cogniumhq/sast-benchmarks`.
8. Open a GitHub Discussion for methodology review.
9. Mirror the summary to `cognium.dev/benchmark` after the GitHub source is live.

## Quality Bar Before Public Promotion

Do not promote a new benchmark broadly until these are true:

- the command exists in the public source repo
- raw output is committed or attached as a release artifact
- scoring rules are documented
- dataset revision is pinned
- known false positives and false negatives are listed
- at least one external-friendly reproduction path is documented

## Useful Source References

- CWE-Bench-Java dataset: `https://github.com/iris-sast/cwe-bench-java`
- CWE-Bench-Java Hugging Face dataset: `https://huggingface.co/datasets/iris-sast/CWE-Bench-Java`
- CodeQL CLI manual: `https://docs.github.com/en/code-security/codeql-cli/codeql-cli-manual`
- CodeQL database analyze: `https://docs.github.com/en/code-security/codeql-cli/codeql-cli-manual/database-analyze`
- Semgrep CLI docs: `https://semgrep.dev/docs/getting-started/cli`
- OWASP Benchmark: `https://owasp.org/www-project-benchmark/`
