# OWASP Benchmark Java v1.2 — semgrep 1.177.0

Scoring rule: a test case is flagged when at least one finding lands in its file with exactly the expected CWE. All 2740 cases scored. Youden = TPR − FPR (the OWASP scorecard "score").

| Cases | TP | FP | FN | TN | TPR (recall) | FPR | Precision | F1 | Youden |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2740 | 1248 | 552 | 167 | 773 | 88.2% | 41.7% | 69.3% | 77.6% | 46.5% |

Findings: 2404 total, 2404 inside test cases with a CWE, 0 without a CWE (ignored), 0 outside test-case files (ignored). CWE normalization preset "semgrep" (301 findings translated, per OWASP BenchmarkUtils).

## By category

| Category | CWE | Cases | Vuln | TP | FP | FN | TN | TPR | FPR | Precision | Youden |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| cmdi | CWE-78 | 251 | 126 | 117 | 109 | 9 | 16 | 92.9% | 87.2% | 51.8% | 5.7% |
| crypto | CWE-327 | 246 | 130 | 130 | 0 | 0 | 116 | 100.0% | 0.0% | 100.0% | 100.0% |
| hash | CWE-328 | 236 | 129 | 89 | 0 | 40 | 107 | 69.0% | 0.0% | 100.0% | 69.0% |
| ldapi | CWE-90 | 59 | 27 | 26 | 28 | 1 | 4 | 96.3% | 87.5% | 48.1% | 8.8% |
| pathtraver | CWE-22 | 268 | 133 | 120 | 106 | 13 | 29 | 90.2% | 78.5% | 53.1% | 11.7% |
| securecookie | CWE-614 | 67 | 36 | 36 | 0 | 0 | 31 | 100.0% | 0.0% | 100.0% | 100.0% |
| sqli | CWE-89 | 504 | 272 | 253 | 170 | 19 | 62 | 93.0% | 73.3% | 59.8% | 19.7% |
| trustbound | CWE-501 | 126 | 83 | 43 | 18 | 40 | 25 | 51.8% | 41.9% | 70.5% | 9.9% |
| weakrand | CWE-330 | 493 | 218 | 218 | 0 | 0 | 275 | 100.0% | 0.0% | 100.0% | 100.0% |
| xpathi | CWE-643 | 35 | 15 | 14 | 13 | 1 | 7 | 93.3% | 65.0% | 51.9% | 28.3% |
| xss | CWE-79 | 455 | 246 | 202 | 108 | 44 | 101 | 82.1% | 51.7% | 65.2% | 30.4% |
