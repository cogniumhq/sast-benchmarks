# CWE-Bench-Java

Benchmark track for Java vulnerabilities from CWE-Bench-Java.

## Purpose

Evaluate whether SAST tools detect known real-world Java vulnerabilities in a
reproducible setup.

## Required Result Fields

- dataset source and version
- vulnerable project revision
- fixed project revision or patch reference
- CWE and CVE identifiers
- expected vulnerable location
- tool finding location
- verdict: true positive, false negative, false positive, or inconclusive

## Initial Scope

Start with Cognium / circle-ir, CodeQL, and Semgrep. Add other tools only after
the baseline run and scoring rules are stable.
