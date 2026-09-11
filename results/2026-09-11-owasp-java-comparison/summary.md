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
- Scorer: `scripts/score-owasp-benchmark.mjs` (adapters for cognium-dev JSON
  and SARIF, so every tool goes through identical code).
- Machine-readable: `comparison.json`; per tool `<tool>.scorecard.json`,
  `<tool>.scorecard.md`, `<tool>.per-cwe.csv`; raw output under
  `raw/2026-09-11-owasp-java-comparison/`.

## Results

| Tool | Version | TP | FP | FN | TN | TPR (recall) | FPR | Precision | F1 | Youden |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| cognium-dev | 4.9.13 | 1,287 | 231 | 128 | 1,094 | 91.0% | 17.4% | 84.8% | 87.8% | **73.5%** |
| CodeQL | — | | | | | | | | | *planned* |
| Semgrep OSS | — | | | | | | | | | *planned* |
| SonarQube Community | — | | | | | | | | | *planned* |
| SpotBugs + Find-Sec-Bugs | — | | | | | | | | | *planned* |

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
git clone --depth 1 https://github.com/OWASP-Benchmark/BenchmarkJava owasp-java
git -C owasp-java checkout 20cbf3d11123347e47ed89541e6942836def53f7   # or note the commit you got
npm install -g cognium-dev@4.9.13
cognium-dev scan owasp-java/src/main/java/org/owasp/benchmark/testcode -l java -f json -q -o cognium-dev-owasp-java.json
node scripts/score-owasp-benchmark.mjs --tool cognium-dev --tool-version 4.9.13 \
  --cognium-dev-json cognium-dev-owasp-java.json --out /tmp/owasp-score
```

## Known Gaps

- Single tool so far; competitor rows land as they are run with the same
  scorer, dataset revision and rule.
- XSS FPR 91.9% and cmdi FPR 31.2% (see above).
- Code-quality findings carry no CWE and are ignored by the rule.
- Static analysis only; the cognium-ai SAST + LLM lane is published separately.
