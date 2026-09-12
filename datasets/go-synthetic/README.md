# Go Synthetic

| | |
| --- | --- |
| Kind | Synthetic (authored for this benchmark) |
| Language | Go |
| Used by | `results/2026-09-11/` (cognium-dev 4.9.13) |
| Cases scored | 29 |

## Source

This repository — `testcode/` holds one file per case; `expectedresults.csv` is the ground truth.

## Revision

The committed files are the dataset. Any change to `testcode/` or `expectedresults.csv` is a dataset revision and must be noted in the result set that uses it.

## Ground truth

`expectedresults.csv` — `name,category,isVulnerable,cwe,description`; `testcode/<name>.go` is the analysed source.

## Acquisition

Already in this repository. Each file is analysed on its own with the engine's default configuration.

## Scoring

A case is detected when the engine reports an unsanitized taint flow of the expected sink type, or a matching source and sink with no sanitizer. Score = TPR − FPR.

## License / redistribution

MIT, same as this repository (see `LICENSE`).
