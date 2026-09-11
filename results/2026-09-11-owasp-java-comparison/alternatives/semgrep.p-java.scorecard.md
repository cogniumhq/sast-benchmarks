# OWASP Benchmark Java v1.2 — semgrep 1.177.0

Scoring rule: a test case is flagged when at least one finding lands in its file with exactly the expected CWE. All 2740 cases scored. Youden = TPR − FPR (the OWASP scorecard "score").

| Cases | TP | FP | FN | TN | TPR (recall) | FPR | Precision | F1 | Youden |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2740 | 970 | 512 | 445 | 813 | 68.6% | 38.6% | 65.5% | 67.0% | 29.9% |

Findings: 1909 total, 1909 inside test cases with a CWE, 0 without a CWE (ignored), 0 outside test-case files (ignored). CWE normalization preset "semgrep" (301 findings translated, per OWASP BenchmarkUtils).

## By category

| Category | CWE | Cases | Vuln | TP | FP | FN | TN | TPR | FPR | Precision | Youden |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| cmdi | CWE-78 | 251 | 126 | 112 | 96 | 14 | 29 | 88.9% | 76.8% | 53.8% | 12.1% |
| crypto | CWE-327 | 246 | 130 | 130 | 0 | 0 | 116 | 100.0% | 0.0% | 100.0% | 100.0% |
| hash | CWE-328 | 236 | 129 | 89 | 0 | 40 | 107 | 69.0% | 0.0% | 100.0% | 69.0% |
| ldapi | CWE-90 | 59 | 27 | 26 | 28 | 1 | 4 | 96.3% | 87.5% | 48.1% | 8.8% |
| pathtraver | CWE-22 | 268 | 133 | 120 | 106 | 13 | 29 | 90.2% | 78.5% | 53.1% | 11.7% |
| securecookie | CWE-614 | 67 | 36 | 0 | 0 | 36 | 31 | 0.0% | 0.0% | 0.0% | 0.0% |
| sqli | CWE-89 | 504 | 272 | 234 | 143 | 38 | 89 | 86.0% | 61.6% | 62.1% | 24.4% |
| trustbound | CWE-501 | 126 | 83 | 43 | 18 | 40 | 25 | 51.8% | 41.9% | 70.5% | 9.9% |
| weakrand | CWE-330 | 493 | 218 | 0 | 0 | 218 | 275 | 0.0% | 0.0% | 0.0% | 0.0% |
| xpathi | CWE-643 | 35 | 15 | 14 | 13 | 1 | 7 | 93.3% | 65.0% | 51.9% | 28.3% |
| xss | CWE-79 | 455 | 246 | 202 | 108 | 44 | 101 | 82.1% | 51.7% | 65.2% | 30.4% |
