# DVJA (Damn Vulnerable Java Application)

| | |
| --- | --- |
| Kind | Real application (deliberately vulnerable) |
| Language | Java |
| Used by | `results/2026-04-22/` (cognium-dev 3.19.4) |
| Cases scored | 7 labelled file/category pairs. |

## Source

https://github.com/appsecco/dvja

## Revision

Not pinned at the April 22, 2026 publication (imported from the live page); the harness clones the upstream default branch. Pin a commit before the next rerun.

## Ground truth

`expectedresults.csv` — `filePath,category,isVulnerable,cwe,description` (commas inside a field are escaped as `\,`). Labels were written for this benchmark against the upstream application source; the upstream app ships no machine-readable ground truth.

## Acquisition

```sh
git clone https://github.com/appsecco/dvja
```

## Scoring

Per labelled file+category: a reported flow of the expected sink type in that file = detected.

## License / redistribution

See the upstream repository's LICENSE for the application source. The label file is ours, MIT (see `LICENSE`).
