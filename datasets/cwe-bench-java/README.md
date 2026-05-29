# CWE-Bench-Java Dataset Notes

This folder records dataset source, version, acquisition steps, and any local
normalization used for benchmark runs.

Do not copy large third-party datasets into this repository unless licensing and
size make that practical. Prefer pinned source links, commit hashes, and scripts
that recreate the local dataset layout.

## Source

- Upstream: `https://github.com/iris-sast/cwe-bench-java`

## Local Policy

- Pin the dataset revision for every published result.
- Record any skipped projects and the reason.
- Keep raw scanner output under `raw/YYYY-MM-DD/`.
