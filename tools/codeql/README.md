# CodeQL Tool Lane

| | |
| --- | --- |
| Tool | GitHub CodeQL CLI |
| Version used | 2.27.0 — `codeql-bundle-v2.27.0` from `https://github.com/github/codeql-action/releases` (`codeql-bundle-osx64.tar.gz`, SHA-256 `33144291ddcf14ca969a658dfdda679f5dc8c8fee630c9c8251dc7a8dab5719c`); bundled query pack `codeql/java-queries` 1.11.10 |
| Result sets | `results/2026-09-11-owasp-java-comparison/` |
| License note | CodeQL CLI is free for analysis of open-source code; the OWASP Benchmark is open source |

## Run (OWASP Benchmark Java, 2026-09-11)

```sh
# a JDK must be on PATH for the Java extractor (Temurin 17.0.20.1 was used); the bundle ships no JRE for it
codeql database create db --language=java --build-mode=none --source-root owasp-java --overwrite
codeql database analyze db codeql/java-queries:codeql-suites/java-security-extended.qls \
  --format=sarif-latest --threads=8 -o codeql-java-security-extended.sarif
```

- Database: whole repository root as source root (`--build-mode=none`, no
  compilation), 41 s.
- Published configuration: `java-security-extended.qls` (best Youden). Also
  run and recorded: `java-code-scanning.qls` (the default Code Scanning
  suite).
- Output: SARIF 2.1.0; CWEs read from rule tags (`external/cwe/cwe-089`).
  A rule declaring several CWEs (e.g. `java/weak-cryptographic-algorithm`:
  327 + 328) counts for each; the literal first-tag number is recorded too.
- CWE normalization per OWASP BenchmarkUtils `sarif/CodeQLReader.mapCwe`:
  94 → 78, 335 → 330 (neither fired here).
- Scored by `scripts/score-owasp-benchmark.mjs --tool codeql`.

## Limits

- No compilation means no bytecode-level facts; for OWASP Benchmark (plain
  servlets, no build needed to resolve types) this matched the compiled
  numbers the test-bench measured in April 2026 exactly under the first-tag
  rule (1286 / 498 / 129 / 827).
- Reference numbers quoted elsewhere on CWE-Bench-Java (22.5%) come from the
  IRIS paper, not from a run here, and are labelled as quoted.
