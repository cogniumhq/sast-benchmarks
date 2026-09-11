# cognium-dev Tool Lane

Configuration, commands, and notes for cognium-dev benchmark runs.

`cognium-dev` (`https://github.com/cogniumhq/cognium-dev`, npm packages
`cognium-dev` and `circle-ir`) is the static-analysis engine measured on
`https://cognium.dev/benchmark`. It was published under the package name
`circle-ir` until the 4.x line; result sets in this repository name the tool
`cognium-dev` and record `former_name: circle-ir` where the run predates the
rename.

## Published Runs

| Result set | Engine | How it was produced |
| --- | --- | --- |
| `results/2026-04-22/` | cognium-dev 3.19.4 (as `circle-ir`) | Imported from the live page. The one-command harness that produced it is not in the public source tree; the set is auditable, not reproducible from a single published command. |
| `results/2026-09-11/` | circle-ir 4.9.13 (npm, same engine as cognium-dev 4.9.13) | Go and C#/.NET suites run through the benchmark runners recorded in `results/2026-09-11/summary.md`, against the published npm package. Raw logs in `raw/2026-09-11/`. |

## Reproducing the 2026-09-11 Go / C# runs

The runners call the engine's `analyze()` API directly (no CLI, no LLM):

```sh
mkdir bench && cd bench
printf '{"type":"module","dependencies":{"circle-ir":"4.9.13"}}' > package.json
bun install                                  # or npm install
git clone --depth 1 https://github.com/Hardw01f/Vulnerability-goapp.git vulnerability-goapp
curl -sSLo juliet-csharp.zip https://samate.nist.gov/SARD/downloads/test-suites/2020-08-01-juliet-test-suite-for-csharp-v1-3.zip
unzip -q juliet-csharp.zip -d juliet-csharp  # yields juliet-csharp/src/testcases
# copy the runner scripts listed in results/2026-09-11/summary.md into ./runners
bun run runners/run-go.ts --verbose
bun run runners/run-csharp.ts --verbose
bun run runners/run-vulnerability-goapp.ts --verbose --expected-results data/expectedresults.csv
bun run runners/run-csharp-juliet.ts --verbose    # baseline _01 variant
```

The runner scripts themselves currently live in a private harness; publishing
them alongside the result set is tracked in `docs/run-new-benchmarks.md`.

## What every run must record

- engine package and exact version (and npm tarball / commit when available)
- rule pack or analyzer configuration (default config unless stated)
- exact command
- runtime (Node/Bun version, OS)
- raw output path under `raw/YYYY-MM-DD/`
- scoring rule used by the runner (flow-aware vs. source+sink co-occurrence)
