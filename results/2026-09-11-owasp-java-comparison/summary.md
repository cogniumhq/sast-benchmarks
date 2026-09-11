# OWASP Benchmark Java v1.2 — Full-Suite Tool Comparison: 2026-09-11

One dataset revision, one scoring rule, every tool scored by the same script.
This is the result set to use whenever cognium-dev is compared with another
SAST tool on OWASP Benchmark.

## Setup

- Dataset: `OWASP-Benchmark/BenchmarkJava` commit `20cbf3d11123347e47ed89541e6942836def53f7`
  (2026-09-08); `expectedresults-1.2.csv` byte-identical to
  `datasets/owasp-benchmark-java/expectedresults-1.2.csv`. **2,740 cases**
  (1,415 vulnerable, 1,325 safe) across 11 categories — nothing excluded.
- Rule (the OWASP scorecard rule): a test case is flagged when at least one
  finding lands in its file (`BenchmarkTestNNNNN.java`) with **exactly** the
  case's CWE. Vulnerable + flagged = TP, safe + flagged = FP, and so on.
  TPR = TP/(TP+FN), FPR = FP/(FP+TN), **Youden = TPR − FPR** (the OWASP
  "score"). Findings with another CWE, or without one, never count.
- Tool-reported CWEs are normalized onto the category CWE exactly as OWASP
  BenchmarkUtils does (Semgrep 23/35→22, 80→79, 326/329/696→327, 338→330;
  CodeQL 94→78, 335→330; cognium-dev needs none). A rule that declares several
  CWEs counts for each of them.
- Scorer: `scripts/score-owasp-benchmark.mjs` (adapters for cognium-dev JSON
  and SARIF, so every tool goes through identical code).
- Policy: each tool is published at its **best Youden among its own standard,
  publicly documented configurations**; every configuration tried is kept
  under `alternatives/` and `raw/`.
- Machine-readable: `comparison.json`; per tool `<tool>.scorecard.json`,
  `<tool>.scorecard.md`, `<tool>.per-cwe.csv`; raw output under
  `raw/2026-09-11-owasp-java-comparison/`.

## Results

| Tool | Version | TP | FP | FN | TN | TPR (recall) | FPR | Precision | F1 | Youden |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| cognium-dev | 4.9.13 | 1,287 | 231 | 128 | 1,094 | 91.0% | 17.4% | 84.8% | 87.8% | **73.5%** |
| CodeQL (`java-security-extended`) | 2.27.0 / java-queries 1.11.10 | 1,415 | 531 | 0 | 794 | 100.0% | 40.1% | 72.7% | 84.2% | 59.9% |
| Semgrep OSS (`p/java` + `p/security-audit`) | 1.177.0 | 1,224 | 512 | 191 | 813 | 86.5% | 38.6% | 70.5% | 77.7% | 47.9% |
| SonarQube Community | — | | | | | | | | | *planned* |
| SpotBugs + Find-Sec-Bugs | — | | | | | | | | | *planned* |

Configurations tried and not published as the row (all in `alternatives/`):

| Tool | Configuration | TPR | FPR | Youden |
| --- | --- | ---: | ---: | ---: |
| CodeQL | `java-code-scanning` (default Code Scanning suite) | 82.0% | 24.1% | 57.9 |
| CodeQL | `java-security-extended`, first CWE tag only (literal BenchmarkUtils rule) | 90.9% | 37.6% | 53.3 |
| Semgrep | `p/default` | 88.2% | 41.7% | 46.5 |
| Semgrep | `p/java` alone (= `p/owasp-top-ten`) | 68.6% | 38.6% | 29.9 |

Planned rows are added only when run on this dataset revision with this
scorer; numbers from papers or vendor pages are never entered in this table.

### cognium-dev 4.9.13 by category

| Category | CWE | Cases | Vuln | TP | FP | FN | TN | TPR | FPR | Precision | Youden |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| cmdi | CWE-78 | 251 | 126 | 113 | 39 | 13 | 86 | 89.7% | 31.2% | 74.3% | 58.5% |
| crypto | CWE-327 | 246 | 130 | 130 | 0 | 0 | 116 | 100.0% | 0.0% | 100.0% | 100.0% |
| hash | CWE-328 | 236 | 129 | 89 | 0 | 40 | 107 | 69.0% | 0.0% | 100.0% | 69.0% |
| ldapi | CWE-90 | 59 | 27 | 24 | 0 | 3 | 32 | 88.9% | 0.0% | 100.0% | 88.9% |
| pathtraver | CWE-22 | 268 | 133 | 116 | 0 | 17 | 135 | 87.2% | 0.0% | 100.0% | 87.2% |
| securecookie | CWE-614 | 67 | 36 | 33 | 0 | 3 | 31 | 91.7% | 0.0% | 100.0% | 91.7% |
| sqli | CWE-89 | 504 | 272 | 255 | 0 | 17 | 232 | 93.8% | 0.0% | 100.0% | 93.8% |
| trustbound | CWE-501 | 126 | 83 | 58 | 0 | 25 | 43 | 69.9% | 0.0% | 100.0% | 69.9% |
| weakrand | CWE-330 | 493 | 218 | 218 | 0 | 0 | 275 | 100.0% | 0.0% | 100.0% | 100.0% |
| xpathi | CWE-643 | 35 | 15 | 14 | 0 | 1 | 20 | 93.3% | 0.0% | 100.0% | 93.3% |
| xss | CWE-79 | 455 | 246 | 237 | 192 | 9 | 17 | 96.3% | 91.9% | 55.2% | 4.5% |

Run: `cognium-dev scan <owasp-java>/src/main/java/org/owasp/benchmark/testcode -l java -f json --threads 8 -q -o …`,
default configuration, no project profile detected (the testcode directory
has no `pom.xml`), no LLM. 13.3 s wall-clock on Apple Silicon, Node v25.9.0.
10,176 CWE-bearing findings, all inside test-case files.

### CodeQL 2.27.0 (`java-security-extended`) by category

| Category | CWE | TP | FP | FN | TN | TPR | FPR | Youden |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| cmdi | CWE-78 | 126 | 64 | 0 | 61 | 100.0% | 51.2% | 48.8% |
| crypto | CWE-327 | 130 | 27 | 0 | 89 | 100.0% | 23.3% | 76.7% |
| hash | CWE-328 | 129 | 33 | 0 | 74 | 100.0% | 30.8% | 69.2% |
| ldapi | CWE-90 | 27 | 13 | 0 | 19 | 100.0% | 40.6% | 59.4% |
| pathtraver | CWE-22 | 133 | 66 | 0 | 69 | 100.0% | 48.9% | 51.1% |
| securecookie | CWE-614 | 36 | 0 | 0 | 31 | 100.0% | 0.0% | 100.0% |
| sqli | CWE-89 | 272 | 207 | 0 | 25 | 100.0% | 89.2% | 10.8% |
| trustbound | CWE-501 | 83 | 24 | 0 | 19 | 100.0% | 55.8% | 44.2% |
| weakrand | CWE-330 | 218 | 0 | 0 | 275 | 100.0% | 0.0% | 100.0% |
| xpathi | CWE-643 | 15 | 7 | 0 | 13 | 100.0% | 35.0% | 65.0% |
| xss | CWE-79 | 246 | 90 | 0 | 119 | 100.0% | 43.1% | 56.9% |

Run: database built with `--build-mode=none` from the repository root (41 s,
Temurin JDK 17.0.20.1 for extraction), analyzed with
`codeql/java-queries:codeql-suites/java-security-extended.qls`, `--threads=8`.
7,555 findings, 7,545 inside test-case files.

### Semgrep OSS 1.177.0 (`p/java` + `p/security-audit`) by category

| Category | CWE | TP | FP | FN | TN | TPR | FPR | Youden |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| cmdi | CWE-78 | 112 | 96 | 14 | 29 | 88.9% | 76.8% | 12.1% |
| crypto | CWE-327 | 130 | 0 | 0 | 116 | 100.0% | 0.0% | 100.0% |
| hash | CWE-328 | 89 | 0 | 40 | 107 | 69.0% | 0.0% | 69.0% |
| ldapi | CWE-90 | 26 | 28 | 1 | 4 | 96.3% | 87.5% | 8.8% |
| pathtraver | CWE-22 | 120 | 106 | 13 | 29 | 90.2% | 78.5% | 11.7% |
| securecookie | CWE-614 | 36 | 0 | 0 | 31 | 100.0% | 0.0% | 100.0% |
| sqli | CWE-89 | 234 | 143 | 38 | 89 | 86.0% | 61.6% | 24.4% |
| trustbound | CWE-501 | 43 | 18 | 40 | 25 | 51.8% | 41.9% | 9.9% |
| weakrand | CWE-330 | 218 | 0 | 0 | 275 | 100.0% | 0.0% | 100.0% |
| xpathi | CWE-643 | 14 | 13 | 1 | 7 | 93.3% | 65.0% | 28.3% |
| xss | CWE-79 | 202 | 108 | 44 | 101 | 82.1% | 51.7% | 30.4% |

Run: `semgrep scan --config p/java --config p/security-audit --metrics=off
--sarif`, 12.2 s wall-clock. 2,163 findings, all inside test-case files; 301
findings translated by the OWASP Semgrep CWE mapping (crypto rules tag
CWE-326).

## Reading the rows

- **cognium-dev leads on Youden (73.5 vs 59.9 vs 47.9)** with by far the
  lowest false-positive rate (17.4% vs 40.1% / 38.6%) and the highest
  precision (84.8%).
- **CodeQL `java-security-extended` finds every vulnerable case** (100%
  recall) at the cost of flagging 40% of the safe ones; its sqli FPR is 89.2%.
  Its default `java-code-scanning` suite trades recall for precision (82.0% /
  24.1%, Youden 57.9).
- **Semgrep OSS** is pattern-based: strong on the syntactic categories
  (crypto, weakrand, securecookie at 100 / 0) and weak wherever data flow
  matters (cmdi, ldapi, pathtraver FPR > 75%).

## Reading the cognium-dev row

- Nine of eleven categories have **zero false positives**; sqli, crypto,
  weakrand, xpathi, securecookie, ldapi and pathtraver are at or above 87%
  recall.
- **XSS is the weakness**: 192 of the 209 safe XSS cases are flagged (FPR
  91.9%). The engine does not credit OWASP's output-encoding / escaping
  controls, so nearly every XSS case fires regardless of whether the output is
  encoded. This single category accounts for 192 of the 231 false positives.
- **cmdi** flags 39 of 125 safe cases (FPR 31.2%); **hash** and **trustbound**
  miss 40 and 25 vulnerable cases respectively.
- Both XSS and cmdi precision are concrete engine work items, not scoring
  artefacts: the FP case lists are in `cognium-dev.scorecard.json`.

## Relation to the April 22 static snapshot

`results/2026-04-22/` reports the OWASP Benchmark row as **1,415 cases, 100%
TPR, 0% FPR**, produced by the historical harness that is not in the public
source tree. No combination of whole OWASP categories yields 1,415 cases with
708 vulnerable, so that row's case selection cannot be reconstructed and it
must not be placed next to any other tool's number. The full-suite,
official-rule figure above — **91.0% TPR / 17.4% FPR / Youden 73.5** — is the
reproducible one and is the only OWASP number to use in comparisons.

## Reproduce

```sh
git clone https://github.com/OWASP-Benchmark/BenchmarkJava owasp-java
git -C owasp-java checkout 20cbf3d11123347e47ed89541e6942836def53f7

# cognium-dev
npm install -g cognium-dev@4.9.13
cognium-dev scan owasp-java/src/main/java/org/owasp/benchmark/testcode -l java -f json -q -o cognium-dev-owasp-java.json
node scripts/score-owasp-benchmark.mjs --tool cognium-dev --tool-version 4.9.13 --cognium-dev-json cognium-dev-owasp-java.json --out out

# CodeQL 2.27.0 (codeql-bundle-v2.27.0 from github/codeql-action releases; needs a JDK on PATH for extraction)
codeql database create db --language=java --build-mode=none --source-root owasp-java
codeql database analyze db codeql/java-queries:codeql-suites/java-security-extended.qls --format=sarif-latest -o codeql.sarif
node scripts/score-owasp-benchmark.mjs --tool codeql --tool-version 2.27.0 --sarif codeql.sarif --out out

# Semgrep OSS 1.177.0
semgrep scan --config p/java --config p/security-audit --metrics=off --sarif -o semgrep.sarif owasp-java/src/main/java/org/owasp/benchmark/testcode
node scripts/score-owasp-benchmark.mjs --tool semgrep --tool-version 1.177.0 --sarif semgrep.sarif --out out
```

## Known Gaps

- SonarQube Community and SpotBugs + Find-Sec-Bugs are not yet run (Docker /
  a compiled build respectively); they land on the same revision and scorer.
- Semgrep registry packs resolve by date rather than a pinned version; the
  SARIF records exactly which rules fired.
- Crediting every CWE a rule declares is more generous than BenchmarkUtils'
  first-tag rule; it only changes CodeQL here (53.3 → 59.9) and the strict
  number is published alongside.
- XSS FPR 91.9% and cmdi FPR 31.2% (see above).
- Code-quality findings carry no CWE and are ignored by the rule.
- Static analysis only; the cognium-ai SAST + LLM lane is published separately.
