# Raw Artifacts: 2026-09-11 OWASP Benchmark Java full-suite comparison

Raw tool output behind `results/2026-09-11-owasp-java-comparison/`. One
pair of files per tool:

- `<tool>-<version>-owasp-java.scan.json.gz` (or `.sarif.gz`): the tool's
  unmodified output, gzip-compressed; the only edit is that the absolute
  checkout path is replaced with `<owasp-java>`.
- `<tool>-<version>-owasp-java.normalized-findings.json`: the same findings
  after the scorer's adapter — `[{ file, cwe, line, rule }]` with the file
  reduced to `BenchmarkTestNNNNN.java` — which is exactly what the scoring
  rule consumed.

Current files:

- `cognium-dev-4.9.13-owasp-java.scan.json.gz` — `cognium-dev scan -f json`,
  2,740 files, 15,917 findings (10,176 with a CWE).
- `cognium-dev-4.9.13-owasp-java.normalized-findings.json`.

Dataset: `OWASP-Benchmark/BenchmarkJava` commit
`20cbf3d11123347e47ed89541e6942836def53f7`.
