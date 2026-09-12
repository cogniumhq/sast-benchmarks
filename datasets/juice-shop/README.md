# OWASP Juice Shop

| | |
| --- | --- |
| Kind | Real application (deliberately vulnerable) |
| Language | Node.js / TypeScript |
| Used by | `results/2026-04-22/` (cognium-dev 3.19.4) |
| Cases scored | 14 labelled file/category pairs. |

## Source

https://github.com/juice-shop/juice-shop

## Revision

Not pinned at the April 22, 2026 publication (imported from the live page); the harness clones the upstream default branch. Pin a commit before the next rerun.

## Ground truth

`expectedresults.csv` — `filePath,category,isVulnerable,cwe,description` (commas inside a field are escaped as `\,`). Labels were written for this benchmark against the upstream application source; the upstream app ships no machine-readable ground truth.

## Acquisition

```sh
git clone https://github.com/juice-shop/juice-shop
```

## Scoring

Per labelled file+category: a reported flow of the expected sink type in that file = detected.

## License / redistribution

Juice Shop is MIT. The label file is ours, MIT (see `LICENSE`).
