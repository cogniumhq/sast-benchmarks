# OWASP Benchmark Java v1.2 — cognium-dev 4.9.13

Scoring rule: a test case is flagged when at least one finding lands in its file with exactly the expected CWE. All 2740 cases scored. Youden = TPR − FPR (the OWASP scorecard "score").

| Cases | TP | FP | FN | TN | TPR (recall) | FPR | Precision | F1 | Youden |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 2740 | 1287 | 231 | 128 | 1094 | 91.0% | 17.4% | 84.8% | 87.8% | 73.5% |

Findings: 10176 total, 10176 inside test cases with a CWE, 0 without a CWE (ignored), 0 outside test-case files (ignored).

## By category

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
