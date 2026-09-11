# Google Firing Range

| | |
| --- | --- |
| Kind | Public test application |
| Language | Java servlets serving HTML/JS test pages |
| Used by | `results/2026-04-22/` (cognium-dev 3.19.4) |
| Cases scored | 40 scored cases (TP 35 / FP 2 / FN 3) across the categories the engine models (reflected/DOM XSS, open redirect, CORS, clickjacking). |

## Source

https://github.com/google/firing-range

## Revision

Not pinned at the April 22, 2026 publication (imported from the live page); the harness clones the upstream default branch. Pin a commit before the next rerun.

## Ground truth

Derived from Firing Range's directory layout under `src/tests/` (category per directory) plus a small vulnerable/safe list in the runner; the 2 false positives are in `escape/`, the 3 false negatives in `cors/`.

## Acquisition

```sh
git clone https://github.com/google/firing-range
```

## Scoring

Per test servlet: a reported flow of the category's sink type = detected.

## License / redistribution

Firing Range is Apache-2.0.
