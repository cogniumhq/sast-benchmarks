# Detection-quality sweep — vendored corpora

Produced by `.github/workflows/detection-quality.yml` via
`scripts/run-corpus.mjs --all`. This is a **regression baseline**, not a
published benchmark result: it deliberately carries `run-summary.json` rather
than `results.json`, so `scripts/validate-results.mjs` — which gates published
result sets — does not treat it as one.

## Scope

The seven corpora whose scannable source is vendored under
`datasets/<corpus>/testcode`, so the sweep needs no network. The fetch-based
corpora (OWASP Benchmark Java, Juliet, SecuriBench, CWE-Bench-Java, WebGoat…)
are **not** included yet and are the next thing to add.

Numbers here are therefore not comparable to the headline figures quoted for
OWASP Benchmark — different corpora, much smaller, and synthetic.

## Scoring

Identical rule to `score-owasp-benchmark.mjs`, so results stay comparable
across corpora: a case counts as flagged when at least one finding lands in its
file with exactly the case's CWE.

    TP  vulnerable case flagged      FN  vulnerable case not flagged
    FP  safe case flagged            TN  safe case not flagged
    TPR = TP/(TP+FN)   FPR = FP/(FP+TN)   score = TPR - FPR

Findings without a CWE (quality and reliability passes) are dropped rather than
counted as false positives — again matching the OWASP scorer.

## Reading a regression

Each `<corpus>.scorecard.json` lists `missed_cases` and `spurious_cases` by
name, so a movement can be traced to the specific cases that changed without
re-running anything.
