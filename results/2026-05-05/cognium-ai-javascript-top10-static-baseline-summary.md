# Cognium AI JavaScript Top-10 Static Baseline

Date: 2026-05-05

This run is the first static, no-LLM baseline for the top-starred JavaScript
GitHub corpus in `datasets/top-javascript-github`.

## Run configuration

- Tool: `cognium-ai` 2.5.7
- Mode: static analysis only (`--no-llm`)
- Language filter: JavaScript (`-l javascript`)
- Dataset: `datasets/top-javascript-github/projects.json`
- Slice: offset `0`, limit `10`
- Timeout: 900 seconds per project
- Public output: `results/2026-05-05/cognium-ai-javascript-top10-static-baseline-offset-0-limit-10.json`
- Raw scanner artifacts: withheld from this public repository

Reproduction command:

```bash
node scripts/run-cognium-ai-java-corpus.mjs \
  --dataset datasets/top-javascript-github/projects.json \
  --mode static \
  --language javascript \
  --offset 0 \
  --limit 10 \
  --timeout-seconds 900 \
  --public-out results/2026-05-05 \
  --raw-dir /tmp/cognium-ai-javascript-top10-raw/2026-05-05 \
  --workdir /tmp/cognium-ai-javascript-top10-work \
  --output-prefix cognium-ai-javascript-top10
```

## Aggregate result

Nine projects completed successfully and produced parseable JSON reports.
`mrdoob/three.js` timed out at the configured cap after partial progress.

| Metric | Count |
| --- | ---: |
| Projects attempted | 10 |
| Projects completed with parsed reports | 9 |
| Timed out | 1 |
| Parse errors or incomplete reports | 1 |
| Files analyzed in parsed reports | 5,261 |
| Total findings parsed | 27,028 |
| Critical | 9 |
| High | 917 |
| Medium | 17,347 |
| Low | 8,755 |

## Project results

| Rank | Project | Commit | Files analyzed | Findings | Critical | High | Medium | Low | Run status |
| ---: | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | `facebook/react` | `9635257c1b557acc81f95b1e974a54c752e703a2` | 1817 | 3717 | 3 | 106 | 2289 | 1319 | Completed |
| 2 | `trekhleb/javascript-algorithms` | `115e42816808484f76de4e6703caa8280e03ed54` | 182 | 497 | 0 | 6 | 346 | 145 | Completed |
| 3 | `affaan-m/everything-claude-code` | `841beea45cb25ba51f29fa45b7e272938d19b80a` | 138 | 2527 | 0 | 148 | 2256 | 123 | Completed |
| 4 | `airbnb/javascript` | `8ed19247bef145e3cc41b24a02dd1fe6d9b5e681` | 23 | 42 | 0 | 0 | 6 | 36 | Completed |
| 5 | `vercel/next.js` | `22d9eba40ba67dee3c397b688a298048e4c991ee` | 1283 | 2436 | 0 | 112 | 1820 | 504 | Completed |
| 6 | `Chalarangelo/30-seconds-of-code` | `9a12310b04f59a81af4034731165c86f1678b7dc` | 91 | 843 | 0 | 61 | 446 | 336 | Completed |
| 7 | `nodejs/node` | `459672f50350274937089f3b324b543bcbafce34` | 1478 | 16016 | 6 | 448 | 9483 | 6079 | Completed |
| 8 | `mrdoob/three.js` | `cbd4475b060e9c777c3db944535d17c44e1d09d3` | 238 |  |  |  |  |  | Timed out |
| 9 | `axios/axios` | `78e8dcf8754ed9d1219628540d69d09bdba5a9be` | 81 | 392 | 0 | 20 | 314 | 58 | Completed |
| 10 | `facebook/create-react-app` | `6254386531d263688ccfa542d0e628fbc0de0b28` | 168 | 558 | 0 | 16 | 387 | 155 | Completed |

## Review policy

These scanner counts are not treated as verified defects. Public aggregate
results are useful for benchmark tracking, but individual findings require
source review before any maintainer email, upstream issue, or defect claim is
created.

For this first run, high and critical findings were sampled only to check
whether the corpus and runner produced reviewable output. Detailed finding-level
triage is intentionally not published in this repository because it may include
unverified security claims, false positives, or context that belongs in a
responsible maintainer report.

Publication status:

| Item | Status |
| --- | --- |
| Static scan execution | Complete |
| JSON report parsing | Complete for 9 of 10 projects |
| Aggregate benchmark publication | Complete |
| Raw scanner output publication | Withheld |
| Upstream maintainer outreach | Not started from this run |
| Finding-level public defect claims | Not published |

## Publication decision

No upstream maintainer email or issue was created from this JavaScript top-10
run. The public repository includes only the reproducible corpus, aggregate
counts, and publication-safe review status. Raw scanner output and detailed
finding-level triage remain unpublished.
