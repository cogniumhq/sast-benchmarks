# Static-Analysis Suite (`cognium.dev/benchmark`)

The benchmark track behind `https://cognium.dev/benchmark`: the cognium-dev
static engine, default configuration, no LLM, scored against a mix of public
benchmark suites, deliberately vulnerable applications, and synthetic case sets.

Published result sets:

- `results/2026-04-22/` — cognium-dev 3.19.4 (then `circle-ir`), 16 rows, 6
  language groups.
- `results/2026-09-11/` — cognium-dev 4.9.13, 4 rows adding Go and C#/.NET.

## What each row measures

| Row | Kind | Dataset folder | Scores | Negatives scored? |
| --- | --- | --- | --- | --- |
| OWASP Benchmark | public suite | `datasets/owasp-benchmark-java/` | TP, TN, FP, FN, TPR, FPR | yes |
| Juliet Test Suite | public suite | `datasets/juliet-java/` | TP, TN, FP, FN, TPR, FPR | yes |
| SecuriBench Micro | public suite | `datasets/securibench-micro/` | TP, TN, FP, FN, TPR, FPR | yes |
| CWE-Bench-Java | public CVE corpus | `datasets/cwe-bench-java/` | TP, FN, TPR (per project) | no |
| WebGoat, DVJA, NodeGoat, Juice Shop, PyGoat, DVPWA | real app | `datasets/<app>/` | TP, FN, TPR (+ FP where labelled) | partially |
| Firing Range | public test app | `datasets/firing-range/` | TP, FP, FN, TPR | partially |
| NodeJS / Rust / Bash / HTML-JS / Go / C# Synthetic, CWE-Bench-Rust | synthetic | `datasets/<name>/` | TP, TN, FP, FN, TPR, FPR | yes |
| Vulnerability-goapp | real app | `datasets/vulnerability-goapp/` | TP, TN, FP, FN, TPR, FPR | yes |
| Juliet C# | public suite (`_01` baseline only) | `datasets/juliet-csharp/` | TP, FN, TPR | no |

A dash (`—` on the page, `n/a` in the CSVs, `null` in JSON) means the row's
dataset has no scored negatives, so TN, FP and FPR cannot be reported for it.

## Scoring rules

- **Detection rule (all rows):** a case counts as detected only when the engine
  reports a finding of the expected sink / CWE type for that case. A finding of
  another type does not count.
- **Synthetic sets and Go/C# rows:** detected = an unsanitized taint flow of the
  expected sink type, or a matching source and sink with no sanitizer in the
  file. `Score = TPR − FPR`.
- **Public suites with negatives (OWASP, Juliet Java, SecuriBench):** per test
  case, vulnerable-and-flagged = TP, safe-and-not-flagged = TN.
  `Score = TPR − FPR`.
- **CWE-Bench-Java:** per-project binary detection. Each of the 120 projects
  contains one CVE; the project counts as detected only when a sink of the
  expected CWE type is reported inside the documented fix method's line range
  (the IRIS-paper strict rule, so numbers are comparable with the published
  CodeQL and IRIS baselines). A single missed sink in a complex project is a
  full miss. `Score = TPR`.
- **Real applications:** per labelled file + category from the committed
  `expectedresults.csv`. Score follows the runner: TPR where only positives are
  labelled; a per-category mean of `TPR − FPR` where safe files are labelled
  (Vulnerability-goapp).
- **Juliet C# (`_01` baseline):** recall only; every scored file is a positive.

## Language summary definitions

- **Perfect:** row score is exactly 100%.
- **Near-perfect (90%+):** row score ≥ 90% (includes perfect rows).
- Every published row is counted in exactly one language row of the summary
  table, including Firing Range under "Other".

## Known gaps (as published)

- SSTI is not in the engine's CWE coverage (PyGoat false negative).
- Firing Range: 2 false positives in `escape/`, 3 false negatives in `cors/`.
- CWE-Bench-Java is per-project, not per-CVE-site.
- Go: `fmt.Fprintf` / `io.WriteString` XSS and SQL executed through a shell
  client are not detected.
- C#/.NET is experimental; Juliet C# recall is 13.8% on the `_01` baseline and
  no C# false-positive rate has been published yet.
- The one-command harness for the April 22 set is not in the public source
  tree; see `docs/run-new-benchmarks.md`.
- The April OWASP Benchmark row (1,415 cases, 100% / 0%) cannot be
  reconstructed from whole categories; the reproducible full-suite number
  (2,740 cases, official rule) is in `results/2026-09-11-owasp-java-comparison/`
  and is the one used for tool comparisons.

## What the track does not measure

The SAST + LLM verification pipeline (cognium-ai) is published separately under
`results/2026-05-*/` and is never mixed into these rows.
