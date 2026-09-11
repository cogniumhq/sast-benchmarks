# OWASP Benchmark (Java) v1.2

| | |
| --- | --- |
| Kind | Public benchmark suite |
| Language | Java |
| Used by | `results/2026-04-22/` (cognium-dev 3.19.4) |
| Cases scored | 1,415 scored cases (TP 708 / TN 707). The full v1.2 suite has 2,740 test cases; the published run scored the test categories the engine models, and the exact category list was not recorded at publication — record it on the next rerun. |

## Source

https://github.com/OWASP-Benchmark/BenchmarkJava (project page: https://owasp.org/www-project-benchmark/)

## Revision

Benchmark v1.2 (2,740 test cases; `expectedresults-1.2.csv` dated 2016-06-1x). Upstream commit not pinned at the April 22, 2026 publication (imported from the live page); the harness clones the upstream default branch. Pin a commit before the next rerun.

For `results/2026-09-11-owasp-java-comparison/`: commit
`20cbf3d11123347e47ed89541e6942836def53f7` (2026-09-08), all 2,740 cases,
ground truth byte-identical to the committed CSV.

## Ground truth

`expectedresults-1.2.csv` — upstream OWASP ground truth (`test name, category, real vulnerability, cwe`), copied verbatim with attribution.

## Acquisition

```sh
git clone https://github.com/OWASP-Benchmark/BenchmarkJava
# test sources: src/main/java/org/owasp/benchmark/testcode/
```

## Scoring

Per test case: vulnerable and flagged = TP, safe and not flagged = TN. Score = TPR − FPR.

## License / redistribution

OWASP Benchmark is GPL-2.0; the ground-truth CSV is redistributed here unchanged with attribution.
