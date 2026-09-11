# OWASP Benchmark Java v1.2 — codeql 2.27.0

Scoring rule: a test case is flagged when at least one finding lands in its file with exactly the expected CWE. All 2740 cases scored. Youden = TPR − FPR (the OWASP scorecard "score").

| Cases | TP | FP | FN | TN | TPR (recall) | FPR | Precision | F1 | Youden |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2740 | 1415 | 531 | 0 | 794 | 100.0% | 40.1% | 72.7% | 84.2% | 59.9% |

Findings: 7555 total, 7545 inside test cases with a CWE, 0 without a CWE (ignored), 10 outside test-case files (ignored). CWE normalization preset "codeql" (0 findings translated, per OWASP BenchmarkUtils); multi-CWE rules: all.

## By category

| Category | CWE | Cases | Vuln | TP | FP | FN | TN | TPR | FPR | Precision | Youden |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| cmdi | CWE-78 | 251 | 126 | 126 | 64 | 0 | 61 | 100.0% | 51.2% | 66.3% | 48.8% |
| crypto | CWE-327 | 246 | 130 | 130 | 27 | 0 | 89 | 100.0% | 23.3% | 82.8% | 76.7% |
| hash | CWE-328 | 236 | 129 | 129 | 33 | 0 | 74 | 100.0% | 30.8% | 79.6% | 69.2% |
| ldapi | CWE-90 | 59 | 27 | 27 | 13 | 0 | 19 | 100.0% | 40.6% | 67.5% | 59.4% |
| pathtraver | CWE-22 | 268 | 133 | 133 | 66 | 0 | 69 | 100.0% | 48.9% | 66.8% | 51.1% |
| securecookie | CWE-614 | 67 | 36 | 36 | 0 | 0 | 31 | 100.0% | 0.0% | 100.0% | 100.0% |
| sqli | CWE-89 | 504 | 272 | 272 | 207 | 0 | 25 | 100.0% | 89.2% | 56.8% | 10.8% |
| trustbound | CWE-501 | 126 | 83 | 83 | 24 | 0 | 19 | 100.0% | 55.8% | 77.6% | 44.2% |
| weakrand | CWE-330 | 493 | 218 | 218 | 0 | 0 | 275 | 100.0% | 0.0% | 100.0% | 100.0% |
| xpathi | CWE-643 | 35 | 15 | 15 | 7 | 0 | 13 | 100.0% | 35.0% | 68.2% | 65.0% |
| xss | CWE-79 | 455 | 246 | 246 | 90 | 0 | 119 | 100.0% | 43.1% | 73.2% | 56.9% |
