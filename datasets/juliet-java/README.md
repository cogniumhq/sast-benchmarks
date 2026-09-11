# NIST Juliet Test Suite for Java

| | |
| --- | --- |
| Kind | Public benchmark suite |
| Language | Java |
| Used by | `results/2026-04-22/` (cognium-dev 3.19.4) |
| Cases scored | 243 scored cases (122 vulnerable / 121 safe) across the 14 CWE families the engine models; baseline `_01` variants. |

## Source

NIST SARD Juliet Java 1.3 — https://samate.nist.gov/SARD/test-suites/112. The harness clones the community mirror https://github.com/find-sec-bugs/juliet-test-suite.

## Revision

Not pinned at the April 22, 2026 publication (imported from the live page); the harness clones the upstream default branch. Pin a commit before the next rerun.

## Ground truth

Derived from Juliet's own naming convention: every test file carries a `bad()` method and `good*()` controls; the runner scores the `bad` flow of the file's CWE as the vulnerable case and the `good` controls as safe.

## Acquisition

```sh
git clone https://github.com/find-sec-bugs/juliet-test-suite
```

## Scoring

Per file: `bad()` flagged with the expected sink type = TP; `good*()` not flagged = TN.

## License / redistribution

Juliet is public domain (NIST).
