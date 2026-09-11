# NIST Juliet Test Suite for C# 1.3

| | |
| --- | --- |
| Kind | Public benchmark suite |
| Language | C#/.NET |
| Used by | `results/2026-09-11/` (cognium-dev 4.9.13) |
| Cases scored | 123 scored files: the baseline `_01` variant of the 10 CWE directories that map to a C# taint sink category (CWE-23, 36, 78, 80, 81, 83, 89, 90, 94, 643). All other CWE directories and variants are out of scope for this result set. |

## Source

NIST SARD suite 110 — https://samate.nist.gov/SARD/test-suites/110

## Revision

Archive `2020-08-01-juliet-test-suite-for-csharp-v1-3.zip`, SHA-256 `2e6dbac4741fb020a0b1c2db69e98aed165987df2bd70bd51f7c8c5302c8e8f8`; 46,586 `.cs` files across 106 CWE directories.

## Ground truth

Juliet naming convention: every `_01` file carries a `Bad()` method with a real vulnerability of the directory's CWE, so every scored file is a positive. `Good*()` controls were not scored, so no false-positive rate is published from this dataset yet.

## Acquisition

```sh
curl -sSLo juliet-csharp.zip https://samate.nist.gov/SARD/downloads/test-suites/2020-08-01-juliet-test-suite-for-csharp-v1-3.zip
shasum -a 256 juliet-csharp.zip   # 2e6dbac4…c8e8f8
unzip -q juliet-csharp.zip -d juliet-csharp   # -> juliet-csharp/src/testcases/CWE*/
```

## Scoring

Flow-aware recall: a file counts as detected only when an unsanitized taint flow of the expected sink type is reported. The runner adds the corpus' own source/sink signatures (console, file, env, TCP, `WebClient`, legacy `System.Web`; ADO.NET, LDAP, XPath, `Process`) to the taint config so misses reflect propagation gaps, not missing signatures.

## License / redistribution

Juliet is public domain (NIST). Not copied into this repository because of size (65.8 MB archive).
