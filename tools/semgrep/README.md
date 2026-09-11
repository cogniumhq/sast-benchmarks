# Semgrep Tool Lane

| | |
| --- | --- |
| Tool | Semgrep OSS engine (`semgrep` on PyPI; the same engine ships as Opengrep) |
| Version used | 1.177.0 (`uv tool install semgrep`) |
| Rulesets | Semgrep Registry packs `p/java` + `p/security-audit`, as resolved on 2026-09-11 (packs are not version-pinned; the SARIF records every rule that fired) |
| Result sets | `results/2026-09-11-owasp-java-comparison/` |
| License note | Semgrep OSS engine is LGPL-2.1; registry rules under their own licenses (mostly Semgrep Rules License / CC); benchmarking and publishing results is permitted |

## Run (OWASP Benchmark Java, 2026-09-11)

```sh
semgrep scan --config p/java --config p/security-audit --metrics=off --sarif \
  -o semgrep-owasp-java.sarif owasp-java/src/main/java/org/owasp/benchmark/testcode
```

- 12.2 s wall-clock; 2,163 findings from 13 rules.
- Published configuration: `p/java` + `p/security-audit` (best Youden). Also
  run and recorded: `p/default`, `p/java` alone, `p/owasp-top-ten` (identical
  to `p/java` on this corpus).
- Output: SARIF 2.1.0; CWEs read from rule tags (`CWE-89: …`).
- CWE normalization per OWASP BenchmarkUtils `SemgrepReader.translate`:
  23/35 → 22, 80 → 79, 326/329/696 → 327, 338 → 330 (301 findings translated;
  the DES / 3DES rules tag CWE-326).
- Scored by `scripts/score-owasp-benchmark.mjs --tool semgrep`.
- `--metrics=off`; no login, no Semgrep AppSec Platform, no Pro engine.

## Limits

- Pattern-based (no inter-procedural taint in the OSS engine): strong on
  syntactic categories, high false-positive rates wherever data flow decides
  (cmdi, ldapi, pathtraver > 75% FPR on this corpus).
- Registry drift: re-runs on a later date may resolve different rule
  versions; record the date with every run.
