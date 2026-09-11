# OWASP Benchmark Java v1.2 — codeql 2.27.0

Scoring rule: a test case is flagged when at least one finding lands in its file with exactly the expected CWE. All 2740 cases scored. Youden = TPR − FPR (the OWASP scorecard "score").

| Cases | TP | FP | FN | TN | TPR (recall) | FPR | Precision | F1 | Youden |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2740 | 1160 | 319 | 255 | 1006 | 82.0% | 24.1% | 78.4% | 80.2% | 57.9% |

Findings: 6499 total, 6491 inside test cases with a CWE, 0 without a CWE (ignored), 8 outside test-case files (ignored). CWE normalization preset "codeql" (0 findings translated, per OWASP BenchmarkUtils); multi-CWE rules: all.

## By category

| Category | CWE | Cases | Vuln | TP | FP | FN | TN | TPR | FPR | Precision | Youden |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| cmdi | CWE-78 | 251 | 126 | 83 | 29 | 43 | 96 | 65.9% | 23.2% | 74.1% | 42.7% |
| crypto | CWE-327 | 246 | 130 | 130 | 27 | 0 | 89 | 100.0% | 23.3% | 82.8% | 76.7% |
| hash | CWE-328 | 236 | 129 | 0 | 0 | 129 | 107 | 0.0% | 0.0% | 0.0% | 0.0% |
| ldapi | CWE-90 | 59 | 27 | 27 | 13 | 0 | 19 | 100.0% | 40.6% | 67.5% | 59.4% |
| pathtraver | CWE-22 | 268 | 133 | 133 | 66 | 0 | 69 | 100.0% | 48.9% | 66.8% | 51.1% |
| securecookie | CWE-614 | 67 | 36 | 36 | 0 | 0 | 31 | 100.0% | 0.0% | 100.0% | 100.0% |
| sqli | CWE-89 | 504 | 272 | 272 | 87 | 0 | 145 | 100.0% | 37.5% | 75.8% | 62.5% |
| trustbound | CWE-501 | 126 | 83 | 0 | 0 | 83 | 43 | 0.0% | 0.0% | 0.0% | 0.0% |
| weakrand | CWE-330 | 493 | 218 | 218 | 0 | 0 | 275 | 100.0% | 0.0% | 100.0% | 100.0% |
| xpathi | CWE-643 | 35 | 15 | 15 | 7 | 0 | 13 | 100.0% | 35.0% | 68.2% | 65.0% |
| xss | CWE-79 | 455 | 246 | 246 | 90 | 0 | 119 | 100.0% | 43.1% | 73.2% | 56.9% |
