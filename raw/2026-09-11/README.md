# Raw Artifacts: 2026-09-11

Runner logs for the Go and C#/.NET static-analysis runs on `circle-ir@4.9.13`
(cognium-dev 4.9.13). See `results/2026-09-11/summary.md` for the scored
result and scoring rules.

## Files

- `go-synthetic.log`: Go Synthetic, 29 cases, per-case verdicts and category table.
- `vulnerability-goapp-engine-only.log`: Vulnerability-goapp, 13 cases, regex fallback disabled. **This is the published run.**
- `vulnerability-goapp-harness-default.log`: same corpus with the harness runner's regex fallback enabled. Comparison only; not published.
- `csharp-synthetic.log`: C# Synthetic, 15 curated cases.
- `juliet-csharp-variant-01.log`: NIST Juliet C# 1.3, `_01` baseline files across 10 CWE directories, per-file FN list and per-CWE table.

Scratch working-directory paths were replaced with `<bench-dir>` in the logs.
