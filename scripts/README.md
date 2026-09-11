# Scripts

Reproducibility and publication helpers. All scripts are plain Node.js
(18+), dependency-free ESM, and run from the repository root. None of them
modifies a published `results/<date>/` folder unless you point it there
explicitly.

| Script | Purpose | Touches the network? | Writes to |
| --- | --- | --- | --- |
| `validate-results.mjs` | Gate: checks every `results/*/results.json` | no | nothing (exit code only) |
| `import-tier1-java-targets.mjs` | Rebuild `datasets/top-java-github/` from the curated tier-1 CSV | only with `--enrich` | `datasets/top-java-github/` (or `OUT_DIR`) |
| `select-top-java-projects.mjs` | Legacy star-ranked GitHub Search selector | yes (GitHub Search API) | `datasets/top-java-github-search/` (or `OUT_DIR`) |
| `run-cognium-ai-java-corpus.mjs` | Clone a corpus slice, run `cognium-ai`, publish a sanitized summary | yes (git clone, optional LLM) | `--public-out` (default `results/<today>/`), private raw dir |

Last verified working: 2026-09-11 (Node 25.9, macOS) — see "Verification" at the
bottom.

---

## `validate-results.mjs`

The repository's consistency gate. Runs in CI on every push and pull request
(`.github/workflows/validate-results.yml`); run it locally before committing a
result set.

```sh
node scripts/validate-results.mjs
```

For every `results/<date>/results.json` it checks:

1. Required fields from `schemas/result.schema.json` (top level and nested
   `required` arrays).
2. Arithmetic: `summary.total_cases / true_positives / false_negatives /
   false_positives / true_negatives_known / total_benchmarks` equal the sum of
   the `results[]` rows; each row's stated `tpr` equals `TP/(TP+FN)` and `fpr`
   equals `FP/(FP+TN)` within 0.1 pt; per-row `categories[]` sum to the row.
3. `language_summary`: per-language rows sum to the `Total` row, the total
   equals the number of result rows, and the `perfect_100` / `at_or_above_90`
   counts match the rows' `score` values.
4. Every path under `artifacts` exists in the repository.
5. Every row's benchmark name maps to a slug (table at the top of the script)
   with a `benchmarks/<slug>/README.md` and a `datasets/<slug>/README.md`.

Exit code 1 with one line per problem, otherwise `OK: N result set(s)
validated`. Adding a new benchmark row requires adding its slug to the map,
which is deliberate: it forces the folders to exist.

Files that are not named `results.json` (the cognium-ai lane's per-run JSON)
are not validated by this script.

---

## `import-tier1-java-targets.mjs`

Rebuilds `datasets/top-java-github/projects.json` and `projects.csv` from the
curated tier-1 target list `datasets/top-java-github/tier1-targets.csv`
(100 Java libraries and infrastructure components chosen for security-scan
relevance, not stars).

```sh
node scripts/import-tier1-java-targets.mjs                       # from the default CSV
node scripts/import-tier1-java-targets.mjs path/to/other.csv     # explicit CSV
GITHUB_TOKEN=... node scripts/import-tier1-java-targets.mjs --enrich
```

| Input | Default | Meaning |
| --- | --- | --- |
| positional `*.csv` / `TIER1_CSV` | `datasets/top-java-github/tier1-targets.csv` | curated list (`owner/repo`, tier, stars, license, category, rationale) |
| `OUT_DIR` | `datasets/top-java-github` | where `projects.json` + `projects.csv` are written |
| `--enrich` | off | backfill `stars`, `default_branch`, `license` (SPDX id), `pushed_at`, `description`, `html_url`, `clone_url` from the GitHub REST API (one call per repo); on API failure the CSV values are kept with a warning |
| `GITHUB_TOKEN` / `GH_TOKEN` | unset | raises the API rate limit for `--enrich`; unauthenticated calls are limited to 60/hour |

Output is deterministic apart from `generated_at`: rerunning without
`--enrich` reproduces the committed dataset byte-for-byte except for that
timestamp. Enrichment fields change as upstream repositories change; commit
the regenerated files with a note of the date.

---

## `select-top-java-projects.mjs`

Legacy selector: queries the GitHub Search API for the top repositories by
stars and writes the same `projects.json` / `projects.csv` shape. This is how
`datasets/top-javascript-github/` and `datasets/top-python-github/` were
produced (with `GITHUB_SEARCH_QUERY` set to the language and `PER_PAGE=10`).

```sh
GITHUB_TOKEN=$(gh auth token) \
GITHUB_SEARCH_QUERY='language:Python stars:>5000 archived:false' \
PER_PAGE=10 OUT_DIR=datasets/top-python-github \
node scripts/select-top-java-projects.mjs
```

| Env | Default | Meaning |
| --- | --- | --- |
| `GITHUB_SEARCH_QUERY` | `language:Java stars:>5000 archived:false` | search query; sorted by stars, descending |
| `PER_PAGE` | `100` | number of repositories to keep |
| `OUT_DIR` | `datasets/top-java-github-search` | output folder — **never** the curated `datasets/top-java-github/`, which is owned by `import-tier1-java-targets.mjs` |
| `GITHUB_TOKEN` / `GH_TOKEN` | unset | strongly recommended; the unauthenticated Search API allows 10 requests/minute |

The result is a snapshot: star counts and ordering drift daily, so the
`generated_at` field inside `projects.json` is the dataset revision. Prefer
`import-tier1-java-targets.mjs` for security benchmarks; star rank selects
tutorials and awesome-lists as readily as real libraries (see the
`GrowingGit/GitHub-Chinese-Top-Charts` rows in `results/2026-05-27/`).

---

## `run-cognium-ai-java-corpus.mjs`

Runs the cognium-ai lane over a slice of a corpus dataset: shallow-clones each
repository, runs `cognium-ai scan <repo> -f json`, keeps the raw scanner
output in a **private** directory, and writes a sanitized per-project summary
(counts by severity, timing, timeout / parse-error flags — never findings or
source lines) into the public results folder.

```sh
# plan only: writes <prefix>-<kind>-planned.json listing the slice, no clone, no scan
node scripts/run-cognium-ai-java-corpus.mjs --dry-run --limit 100

# static baseline, JavaScript top-10 (this is the results/2026-05-05 command)
node scripts/run-cognium-ai-java-corpus.mjs \
  --dataset datasets/top-javascript-github/projects.json \
  --mode static --language javascript \
  --offset 0 --limit 10 --timeout-seconds 900 \
  --public-out results/2026-05-05 \
  --raw-dir /path/to/private/raw --workdir /path/to/work \
  --output-prefix cognium-ai-javascript-top10

# LLM-enriched slice against a local Ollama model
LLM_BASE_URL=http://localhost:11434/v1 LLM_API_KEY=ollama \
node scripts/run-cognium-ai-java-corpus.mjs --mode llm --model qwen3-coder:30b --provider Ollama \
  --offset 14 --limit 1 --timeout-seconds 1800 --public-out results/$(date +%F)
```

| Option | Default | Meaning |
| --- | --- | --- |
| `--dataset <path>` | `datasets/top-java-github/projects.json` | corpus file with a `projects[]` array (`full_name`, `clone_url` / `html_url`) |
| `--offset <n>` / `--limit <n>` | `0` / `5` | slice of `projects[]` to process |
| `--mode static\|llm` (or `--no-llm`) | `llm` | `static` adds `--no-llm` to the scan and records model `none` |
| `--model <name>` / `--provider <name>` | `LLM_ENRICHMENT_MODEL` / `LLM_PROVIDER`, else `llama3.2:3b` / `Ollama` | recorded in the summary; the model itself is configured through cognium-ai's own `LLM_*` environment |
| `--language <lang>` | `java` | passed as `-l <lang>`; `all` omits the filter |
| `--command <bin>` | `cognium-ai` | scanner binary (use a path to test a local build) |
| `--timeout-seconds <n>` | `1800` | per-project scan timeout; a timeout is recorded as `timed_out: true`, not a failure of the run |
| `--workdir <dir>` | `/tmp/cognium-ai-java-top100-work` | clone location (shallow, `--depth 1`) |
| `--raw-dir <dir>` | `/tmp/cognium-ai-java-top100-raw` | private raw `scan.json` per project — **do not commit**; it can contain source `lineContent` |
| `--public-out <dir>` | `results/<today>` | sanitized summary destination |
| `--output-prefix <p>` | `cognium-ai-java-top100` | summary file name: `<prefix>-<kind>-offset-<o>-limit-<l>.json`, or `<prefix>-<kind>-planned.json` for dry runs, where `<kind>` is `static-baseline` or `llm` |
| `--dry-run` | off | write the planned slice only |

Summary JSON (`generated_at`, `dataset`, `offset`, `limit`, `mode`, `model`,
`provider`, `language`, `raw_artifacts: "not published in this repository"`,
`projects[]`). Per scanned project: `rank`, `full_name`, `html_url`, the
scanned `commit`, `mode`, `model`, `provider`, `language`, `started_at`,
`ended_at`, `exit_code`, `signal`, `error_code`, `timed_out`,
`raw_publication: "withheld"`, then the parsed metrics — `discovered_files`,
`progress_*`, findings `total` and `critical` / `high` / `medium` / `low` /
`unknown`, and `parse_error: true` when the scanner output was not valid
JSON. Projects that were not scanned carry the dataset row plus `status:
"planned"` (dry run) or `status: "clone_failed"`. Raw output is written to
`<raw-dir>/<owner>__<repo>.scan.json` and never to the public folder.
Publishing anything beyond this summary goes through
`docs/upstream-disclosure-policy.md`.

Requires `cognium-ai` on `PATH` (`npm install -g cognium-ai`) and `git`.
Record the cognium-ai version in the result set's summary; the script does not
capture it.

---

## Verification (2026-09-11)

All four scripts were exercised from a scratch copy of the repository:

- `validate-results.mjs`: passes on `results/2026-04-22` and
  `results/2026-09-11`; CI run green.
- `import-tier1-java-targets.mjs`: regenerated 100 projects; identical to the
  committed dataset except `generated_at`.
- `select-top-java-projects.mjs`: live GitHub Search query returned 100
  Python repositories into a scratch `OUT_DIR`.
- `run-cognium-ai-java-corpus.mjs`: `--dry-run --limit 100` wrote the planned
  slice to `results/<today>`; the documented static-baseline form with every
  flag wrote `cognium-ai-javascript-top10-static-baseline-planned.json`; and a
  real run (`--mode static --language javascript --offset 3 --limit 1`,
  cognium-ai 4.10.0) cloned `airbnb/javascript` at `8ed1924`, scanned it
  (exit 0, 23 files, 34 findings: 0 critical / 0 high / 2 medium / 29 low,
  `parse_error: false`), kept the 216 KB raw `scan.json` in the private dir and
  wrote the 1 KB sanitized summary to the public dir.

Two defaults were corrected that day: the corpus runner used to default
`--public-out` to the historical `results/2026-05-03/`, and the selector used
to write into the curated `datasets/top-java-github/`.
