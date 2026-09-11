# cognium-dev SAST Benchmark Results: 2026-09-11 — Go and C#/.NET

First scored static-analysis results for the two engine-supported languages
that were missing from the April 22, 2026 snapshot (`results/2026-04-22/`).
This is a separate dated result set on a newer engine version; it does **not**
re-score the 16 April benchmarks, and the two sets must not be merged into one
table without stating the engine version per row.

## Scope

- Tool: cognium-dev (npm engine package `circle-ir@4.9.13`; the same engine
  version ships as `cognium-dev@4.9.13`)
- Engine source: `https://github.com/cogniumhq/cognium-dev`, release tags
  `circle-ir-v4.9.13` / `cognium-dev-v4.9.13` (commit `79d2c7f`). Note: the
  engine's own release notes record that the published 4.9.13 npm tarball was
  built from `main` one commit past the tag (`ef652dc`, C# allowlist
  character-strip sanitizer credit), so the npm package, not the tag, is the
  exact artifact measured here.
- Mode: static analysis only, default taint configuration
- LLM verification: not used
- Benchmarks: 4 (2 Go, 2 C#/.NET)
- Runtime: Bun 1.3.14 (Node v25.9.0 available), macOS 26.6.2, Apple Silicon
- Run date: 2026-09-11
- Raw runner logs: `raw/2026-09-11/`

## Results by Benchmark

| Language | Benchmark | Tests | TP | TN | FP | FN | TPR | FPR | Score |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Go | Go Synthetic | 29 | 15 | 10 | 0 | 4 | 78.9% | 0.0% | 78.9% |
| Go | Vulnerability-goapp | 13 | 3 | 6 | 1 | 3 | 50.0% | 14.3% | 45.0% |
| C#/.NET | C# Synthetic | 15 | 10 | 3 | 1 | 1 | 90.9% | 25.0% | 65.9% |
| C#/.NET | Juliet C# (NIST, baseline `_01`) | 123 | 17 | n/a | n/a | 106 | 13.8% | n/a | 13.8% |

Score column, as computed by each runner:

- Go Synthetic, C# Synthetic: `TPR − FPR` (same rule as the published
  Bash / HTML/JS / NodeJS / Rust synthetic suites).
- Vulnerability-goapp: mean over categories of per-category `TPR − FPR`
  (cmdi 100%, sqli −20%, pathtraver 0%, xss 100%).
- Juliet C#: recall only. Baseline `_01` files are all vulnerable, so there
  are no negatives to score; TN/FP/FPR are not measurable on this variant.

## Language Summary

| Language | Perfect 100% | 90%+ | Total Benchmarks |
| --- | ---: | ---: | ---: |
| Go | 0 | 0 | 2 |
| C#/.NET | 0 | 0 | 2 |
| Total | 0 | 0 | 4 |

## Go Synthetic by Category

29 hand-written cases (19 vulnerable, 10 safe) modelled on `net/http`,
Gorilla mux and Gin patterns. Detection rule: an unsanitized taint flow of the
expected sink type, or a source and a matching sink with no sanitizer.

| Category | CWE | TP | TN | FP | FN | TPR | FPR |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| sqli | CWE-89 | 4 | 2 | 0 | 0 | 100% | 0% |
| cmdi | CWE-78 | 3 | 2 | 0 | 1 | 75.0% | 0% |
| pathtraver | CWE-22 | 3 | 2 | 0 | 1 | 75.0% | 0% |
| xss | CWE-79 | 1 | 2 | 0 | 2 | 33.3% | 0% |
| ssrf | CWE-918 | 4 | 2 | 0 | 0 | 100% | 0% |

False negatives: `cmdi_exec_stdin_to_sh` (`os.Stdin` → `sh -c`, no source
recognised), `pathtraver_open_form` (`os.OpenFile` with `PostForm` path, sink
not recognised), `xss_fprintf_tainted` (`fmt.Fprintf(w, tainted)`),
`xss_writestring_form` (`io.WriteString(w, tainted)`).

## Vulnerability-goapp (real Go application)

Corpus: `https://github.com/Hardw01f/Vulnerability-goapp`, commit
`6e51a892d449958074f216bb10e55e122d99440c` (2020-06-09). 13 labelled
file/category pairs (6 vulnerable, 7 safe) from the expected-results fixture
recorded in the raw log.

| Category | CWE | TP | TN | FP | FN |
| --- | --- | ---: | ---: | ---: | ---: |
| cmdi | CWE-78 | 2 | 1 | 0 | 0 |
| sqli | CWE-89 | 0 | 4 | 1 | 2 |
| pathtraver | CWE-22 | 0 | 0 | 0 | 1 |
| xss | CWE-79 | 1 | 1 | 0 | 0 |

Misses: `pkg/admin/admin.go` and `pkg/search/search.go` build SQL by string
concatenation and execute it through the `mysql` shell client rather than
`database/sql`, so no SQL sink fires (the command-injection flow on the same
call sites is caught); `pkg/image/imageUploader.go` opens
`"./assets/img/" + handler.Filename` and the multipart filename is not
recognised as a source. False positive: `pkg/login/login.go` uses a
parameterized `db.Query(sql, mail)` and is still flagged.

Scoring note: the harness runner for this suite includes a regex fallback that
upgrades a miss to a detection when an unambiguous syntactic pattern is present
(`exec.Command("sh","-c",…)`, `"mysql … " +`, `fmt.Fprintf(w, ident`,
`os.Open…(… +`). That fallback is **disabled** for the published row above so
the number measures the engine only. With the harness default (fallback on) the
same run scores TP 4 / FN 2, TPR 66.7%, score 70.0%; that log is kept as
`raw/2026-09-11/vulnerability-goapp-harness-default.log` for comparison and is
not the published result.

## C# Synthetic by Category

15 curated ASP.NET Core / ADO.NET / EF Core cases (11 vulnerable, 4 safe),
flow-aware scoring: a case counts as detected only on an unsanitized taint flow
of the expected sink type, or a source and matching sink with no sanitizer.

| Category | CWE | TP | TN | FP | FN |
| --- | --- | ---: | ---: | ---: | ---: |
| sqli | CWE-89 | 2 | 0 | 1 | 0 |
| cmdi | CWE-78 | 1 | 1 | 0 | 0 |
| pathtraver | CWE-22 | 1 | 1 | 0 | 0 |
| ssrf | CWE-918 | 1 | 0 | 0 | 0 |
| xss | CWE-79 | 0 | 1 | 0 | 1 |
| codeinj | CWE-94 | 1 | 0 | 0 | 0 |
| deser | CWE-502 | 1 | 0 | 0 | 0 |
| ldap | CWE-90 | 1 | 0 | 0 | 0 |
| xpath | CWE-643 | 1 | 0 | 0 | 0 |
| xxe | CWE-611 | 1 | 0 | 0 | 0 |

Failures: FP `sqli_adonet_parameterized_safe` (parameterized `SqlCommand`
with `AddWithValue` still reports source + sink co-occurrence); FN
`xss_response_write_concat` (`Response.Write` with concatenated request input
is not registered as an XSS sink in the default C# model).

## Juliet C# by CWE (NIST SARD suite 110, Juliet C# 1.3)

Corpus: `2020-08-01-juliet-test-suite-for-csharp-v1-3.zip` from
`https://samate.nist.gov/SARD/downloads/test-suites/`, SHA-256
`2e6dbac4741fb020a0b1c2db69e98aed165987df2bd70bd51f7c8c5302c8e8f8`
(46,586 `.cs` files across 106 CWE directories). The runner scores only the
baseline `_01` variant of the 10 CWE directories that map to a C# taint sink
category in the engine; each `_01` file carries a `Bad()` method with a real
vulnerability, so this is a recall measure. The runner supplies the Juliet
source and sink signatures (console, file, environment, TCP, `WebClient`,
legacy `System.Web` request reads; ADO.NET, LDAP, XPath, `Process` sinks) via
the taint config, so residual misses are propagation gaps rather than missing
signatures.

| CWE | Category | Detected | Missed | Rate |
| --- | --- | ---: | ---: | ---: |
| CWE-023 | Relative Path Traversal | 0 / 10 | 10 | 0.0% |
| CWE-036 | Absolute Path Traversal | 0 / 10 | 10 | 0.0% |
| CWE-078 | Command Injection | 0 / 10 | 10 | 0.0% |
| CWE-080 | XSS (basic) | 0 / 18 | 18 | 0.0% |
| CWE-081 | XSS (error message) | 0 / 9 | 9 | 0.0% |
| CWE-083 | XSS (attribute) | 0 / 9 | 9 | 0.0% |
| CWE-089 | SQL Injection | 8 / 27 | 19 | 29.6% |
| CWE-090 | LDAP Injection | 2 / 10 | 8 | 20.0% |
| CWE-094 | Code Injection | 0 / 10 | 10 | 0.0% |
| CWE-643 | XPath Injection | 7 / 10 | 3 | 70.0% |
| Total | | 17 / 123 | 106 | 13.8% |

Per-file verdicts are in `raw/2026-09-11/juliet-csharp-variant-01.log`; the
same data is in `juliet-csharp-breakdown.csv`.

## Known Gaps

- C#/.NET support in cognium-dev is labelled experimental / preview. These are
  the first scored public numbers for it; the engine's own release notes state
  it was previously "not benchmark-verified". The Juliet recall of 13.8% is the
  honest baseline to improve from, not a coverage claim.
- Juliet C# is scored on the `_01` baseline variant only. The remaining
  variants (`_02` … `_81` control-flow, data-flow and cross-file shapes) and
  the `Good*()` controls were not scored, so no C# false-positive rate is
  published from Juliet.
- Go XSS via `fmt.Fprintf` / `io.WriteString` and Go SQL executed through a
  shell client are not detected; these account for most Go misses.
- Vulnerability-goapp has only 13 labelled cases; one flag moves the FPR by
  14.3 points. Treat it as a smoke test, not a precision measurement.
- Both real-app corpora (Vulnerability-goapp, Juliet) and both synthetic sets
  use different scoring rules; the Score column is defined per runner above and
  is not comparable across rows.
- These results test static analysis only; the full SAST plus LLM verification
  pipeline is separate.
- The per-suite runner scripts used here are not yet published in a public
  repository. Reproduction steps and the exact engine package version are in
  `tools/cognium/README.md`; publishing the runners is tracked in
  `docs/run-new-benchmarks.md`.

## Raw Evidence

- Go Synthetic log: `../../raw/2026-09-11/go-synthetic.log`
- Vulnerability-goapp (published, engine-only): `../../raw/2026-09-11/vulnerability-goapp-engine-only.log`
- Vulnerability-goapp (harness default with regex fallback, for comparison): `../../raw/2026-09-11/vulnerability-goapp-harness-default.log`
- C# Synthetic log: `../../raw/2026-09-11/csharp-synthetic.log`
- Juliet C# log: `../../raw/2026-09-11/juliet-csharp-variant-01.log`
- Structured JSON: `results.json`
- CSV: `results.csv`
- Juliet C# breakdown CSV: `juliet-csharp-breakdown.csv`
