# Datasets

Dataset source, version, acquisition, and ground-truth notes live here. Every
benchmark row published in `results/` and on `cognium.dev/benchmark` maps to
exactly one folder below.

Do not treat benchmark scores as reproducible unless the dataset revision is
pinned. Each dataset folder records:

- upstream source URL
- commit, release, archive hash, or snapshot date
- local acquisition command
- the ground-truth file the runner scores against (committed here when it is
  ours or small and redistributable)
- scoring rule and licensing / redistribution constraints

## Static-analysis benchmarks (`cognium.dev/benchmark`)

| Benchmark row | Language | Folder | Ground truth in repo | Result set |
| --- | --- | --- | --- | --- |
| OWASP Benchmark | Java | `owasp-benchmark-java/` | `expectedresults-1.2.csv` (upstream) | 2026-04-22 |
| Juliet Test Suite | Java | `juliet-java/` | naming convention (metadata only) | 2026-04-22 |
| SecuriBench Micro | Java | `securibench-micro/` | in-source annotations (metadata only) | 2026-04-22 |
| CWE-Bench-Java | Java | `cwe-bench-java/` | upstream dataset (metadata only) | 2026-04-22 |
| WebGoat | Java | `webgoat/` | `expectedresults.csv` (ours, 29) | 2026-04-22 |
| DVJA | Java | `dvja/` | `expectedresults.csv` (ours, 7) | 2026-04-22 |
| NodeGoat | Node.js | `nodegoat/` | `expectedresults.csv` (ours, 14) | 2026-04-22 |
| Juice Shop | Node.js / TS | `juice-shop/` | `expectedresults.csv` (ours, 14) | 2026-04-22 |
| NodeJS Synthetic | Node.js | `nodejs-synthetic/` | `testcode/` + `expectedresults.csv` (25) | 2026-04-22 |
| PyGoat | Python | `pygoat/` | `expectedresults.csv` (ours, 26) | 2026-04-22 |
| DVPWA | Python | `dvpwa/` | `expectedresults.csv` (ours, 6) | 2026-04-22 |
| Rust Synthetic | Rust | `rust-synthetic/` | `testcode/` + `expectedresults.csv` (50) | 2026-04-22 |
| CWE-Bench-Rust | Rust | `cwe-bench-rust/` | `testcode/` + `expectedresults.csv` (30) | 2026-04-22 |
| Bash Synthetic | Bash | `bash-synthetic/` | `testcode/` + `expectedresults.csv` (31) | 2026-04-22 |
| HTML/JS Synthetic | HTML/JS | `html-js-synthetic/` | `testcode/` + `expectedresults.csv` (30) | 2026-04-22 |
| Firing Range | Java servlets / HTML-JS | `firing-range/` | category map (metadata only) | 2026-04-22 |
| Go Synthetic | Go | `go-synthetic/` | `testcode/` + `expectedresults.csv` (29) | 2026-09-11 |
| Vulnerability-goapp | Go | `vulnerability-goapp/` | `expectedresults.csv` (ours, 13) | 2026-09-11 |
| C# Synthetic | C#/.NET | `csharp-synthetic/` | `testcode/` + `expectedresults.csv` (15) | 2026-09-11 |
| Juliet C# | C#/.NET | `juliet-csharp/` | naming convention; archive SHA-256 pinned | 2026-09-11 |

"Ours" means the labels were written for this benchmark against a public
vulnerable application that ships no machine-readable ground truth. Synthetic
sets are fully contained in this repository: the committed `testcode/` files
are the dataset.

Large third-party suites (OWASP Benchmark sources, Juliet Java, Juliet C#,
SecuriBench Micro, CWE-Bench-Java, the vulnerable applications) are not copied
here; each folder records how to fetch them and which revision was used.

## cognium-ai (SAST + LLM) target corpora

Used by the LLM-lane result sets, not by the static-analysis snapshots:

- `top-java-github/`: curated tier-1 Java libraries and infrastructure
  components for security scanning.
- `top-javascript-github/`: GitHub Search API snapshot for the top 10
  non-archived JavaScript repositories by stars.
- `top-python-github/`: GitHub Search API snapshot for the top 10 non-archived
  Python repositories by stars.
