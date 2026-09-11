# Stanford SecuriBench Micro

| | |
| --- | --- |
| Kind | Public benchmark suite |
| Language | Java |
| Used by | `results/2026-04-22/` (cognium-dev 3.19.4) |
| Cases scored | 123 scored cases (TP 60 / TN 60 / FP 1 / FN 2). |

## Source

https://github.com/too4words/securibench-micro (mirror of the original Stanford suite)

## Revision

Not pinned at the April 22, 2026 publication (imported from the live page); the harness clones the upstream default branch. Pin a commit before the next rerun.

## Ground truth

Upstream: each test class documents its expected vulnerability count in a comment; the runner reads those.

## Acquisition

```sh
git clone https://github.com/too4words/securibench-micro
```

## Scoring

Per test class, expected vulnerabilities vs. reported flows. Score = TPR − FPR.

## License / redistribution

See the upstream repository.
