# Baseline

`detection-quality.json` is the reference the nightly sweep scores against. A
run below it on any corpus is a regression: the workflow fails and files a
defect naming the cases that changed.

It is a frozen copy of a verified run, not "whichever dated folder is newest" —
so `results/` can accumulate history without any of it silently becoming the
thing that decides pass or fail.

## Current baseline

| | |
|---|---|
| Established | 2026-09-21 |
| Engine | cognium-dev 4.9.20 |
| Scope | 7 vendored corpora, 210 cases |
| Overall | TPR 81.7%, FPR 7.4% |

Verified by running twice on different hosts against cognium-dev 4.9.20 and
4.9.21: byte-identical scorecards. That is why the TPR policy is
zero-tolerance — these corpora carry no measurement noise, so an epsilon would
only hide small real regressions.

## Updating it

Promote a verified run deliberately:

1. Confirm the change is intended — a new detector, a fixed false positive, a
   corpus correction. `compare-baseline.mjs` prints improvements as well as
   regressions, so the diff is visible before you promote anything.
2. Copy that run's `run-summary.json` over `detection-quality.json`, keeping
   the `_comment`, `established`, `established_by` and `verified` fields
   current.
3. Say in the PR *why* the numbers moved.

**Never update the baseline to make a failing run pass.** If a regression is
acceptable — a deliberate precision/recall trade, say — record that reasoning
in the promoting PR. A baseline edited to silence a failure is worse than no
baseline, because it looks like the gate is working.
