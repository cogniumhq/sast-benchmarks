#!/usr/bin/env node
// Compare a detection-quality run against the committed baseline.
//
// Separate from run-corpus.mjs on purpose: that script measures and always
// exits 0, so a measurement run can never be mistaken for a verdict. This one
// is the verdict, and nothing else in the pipeline decides pass/fail.
//
// Usage:
//   node scripts/compare-baseline.mjs --run results/<date>-detection-quality/run-summary.json
//   node scripts/compare-baseline.mjs --run <...> --baseline baseline/detection-quality.json
//   node scripts/compare-baseline.mjs --run <...> --markdown report.md
//
// Exit 0 = no regression (improvements are fine and are reported).
// Exit 1 = regression.
// Exit 2 = could not compare (missing file, corpus errored, unreadable).
//
// Policy, and why:
//
//   TPR may not drop at all. Two runs on different hosts against different
//   engine builds produced byte-identical scorecards, so these corpora carry
//   no measurement noise — any recall loss is a real engine change, and an
//   epsilon would only hide small ones. Recall loss is the failure this exists
//   to catch.
//
//   FPR may rise by up to --fpr-tolerance (default 0, same reasoning). Kept as
//   a knob because adding a detector legitimately trades precision for recall,
//   and a release may want to accept that deliberately.
//
//   A corpus that errored is a failure, not a pass. A harness that cannot scan
//   reports no regressions, which would otherwise look identical to success.

import fs from 'node:fs';
import path from 'node:path';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const a = process.argv[i];
  if (!a.startsWith('--')) continue;
  const next = process.argv[i + 1];
  if (next && !next.startsWith('--')) { args.set(a.slice(2), next); i += 1; } else args.set(a.slice(2), 'true');
}

const root = path.resolve(new URL('..', import.meta.url).pathname);
const runPath = args.get('run');
const baselinePath = path.resolve(root, args.get('baseline') || 'baseline/detection-quality.json');
const fprTolerance = Number(args.get('fpr-tolerance') || 0);
const knownPath = path.resolve(root, args.get('known-failures') || 'baseline/known-failures.json');

if (!runPath) {
  console.error('usage: compare-baseline.mjs --run <run-summary.json> [--baseline <file>] [--fpr-tolerance <pp>] [--markdown <out.md>]');
  process.exit(2);
}

const read = (p, label) => {
  const abs = path.resolve(root, p);
  if (!fs.existsSync(abs)) { console.error(`${label} not found: ${p}`); process.exit(2); }
  try { return JSON.parse(fs.readFileSync(abs, 'utf8')); }
  catch (e) { console.error(`${label} is not valid JSON: ${e.message}`); process.exit(2); }
};

const run = read(runPath, 'run summary');
const base = read(baselinePath, 'baseline');

/**
 * Corpora cognium-dev currently fails on, each tied to an open defect.
 *
 * An entry suppresses exactly one failure: that corpus, that kind, and an
 * error matching `expect`. A different error on the same corpus still fails,
 * because "pygoat is broken" must not become cover for pygoat breaking in a
 * new way.
 *
 * An entry whose corpus has started working is itself a failure. Otherwise the
 * register rots into a permanent amnesty: the engine gets fixed, nobody
 * notices, and the corpus silently stops being gated.
 */
const known = new Map();
if (fs.existsSync(knownPath)) {
  try {
    for (const f of JSON.parse(fs.readFileSync(knownPath, 'utf8')).failures ?? []) known.set(f.corpus, f);
  } catch (e) {
    console.error(`known-failures file is not valid JSON: ${e.message}`);
    process.exit(2);
  }
}
const suppressed = [];
const staleExemptions = [];

const num = (pct) => Number(String(pct ?? '0').replace('%', ''));
const byCorpus = (summary) => new Map((summary.results ?? []).map(r => [r.corpus, r]));

const baseRows = byCorpus(base);
const runRows = byCorpus(run);

const regressions = [];
const improvements = [];
const notes = [];

// A corpus present in the baseline but absent from the run is a regression in
// coverage: silently measuring less is the same failure as measuring worse.
for (const corpus of baseRows.keys()) {
  if (!runRows.has(corpus)) {
    regressions.push({ corpus, kind: 'corpus-missing', detail: 'present in baseline, absent from this run' });
  }
}

for (const [corpus, cur] of runRows) {
  if (cur.error) {
    const k = known.get(corpus);
    // Match on the recorded signature, not merely the corpus name.
    if (k && k.kind === 'corpus-errored' && (!k.expect || cur.error.includes(k.expect))) {
      suppressed.push({ corpus, issue: k.issue, detail: cur.error.slice(0, 160) });
    } else if (k) {
      regressions.push({
        corpus, kind: 'corpus-errored-differently',
        detail: `known failure is "${k.expect}" (${k.issue}) but this run failed with: ${cur.error.slice(0, 200)}`,
      });
    } else {
      // A corpus absent from the baseline has never scored, so its failure is
      // not a regression from anything — it is a corpus that has never worked.
      // Still gated (an unscannable corpus is a failure, per the policy note
      // at the top), but named for what it is: reporting it as a regression
      // sends whoever picks it up looking for the change that broke it, and
      // there isn't one.
      regressions.push({
        corpus,
        kind: baseRows.has(corpus) ? 'corpus-errored' : 'corpus-errored-unbaselined',
        detail: cur.error,
      });
    }
    continue;
  }

  // Listed as broken but it scored — the exemption is stale and must be
  // removed, or the corpus silently stops being gated.
  if (known.has(corpus)) {
    staleExemptions.push({
      corpus, kind: 'exemption-stale',
      detail: `listed in known-failures (${known.get(corpus).issue}) but scored ${cur.tpr}/${cur.fpr} — remove the entry so this corpus is gated again`,
    });
  }
  if (cur.skipped) { notes.push(`${corpus}: skipped (${cur.skipped})`); continue; }

  const prev = baseRows.get(corpus);
  if (!prev) { notes.push(`${corpus}: new corpus, no baseline — recorded, not gated`); continue; }

  const dTpr = num(cur.tpr) - num(prev.tpr);
  const dFpr = num(cur.fpr) - num(prev.fpr);

  // Case-level detail, so a report can name what changed rather than only that
  // a percentage moved.
  const prevMissed = new Set(prev.missed_cases ?? []);
  const curMissed = new Set(cur.missed_cases ?? []);
  const prevSpurious = new Set(prev.spurious_cases ?? []);
  const curSpurious = new Set(cur.spurious_cases ?? []);
  const newlyMissed = [...curMissed].filter(c => !prevMissed.has(c)).sort();
  const nowFound = [...prevMissed].filter(c => !curMissed.has(c)).sort();
  const newlySpurious = [...curSpurious].filter(c => !prevSpurious.has(c)).sort();
  const noLongerSpurious = [...prevSpurious].filter(c => !curSpurious.has(c)).sort();

  if (dTpr < 0) {
    regressions.push({
      corpus, kind: 'tpr-drop',
      detail: `${prev.tpr} -> ${cur.tpr} (${dTpr.toFixed(1)}pp)`,
      cases: newlyMissed,
    });
  }
  if (dFpr > fprTolerance) {
    regressions.push({
      corpus, kind: 'fpr-rise',
      detail: `${prev.fpr} -> ${cur.fpr} (+${dFpr.toFixed(1)}pp, tolerance ${fprTolerance}pp)`,
      cases: newlySpurious,
    });
  }
  if (dTpr > 0) improvements.push({ corpus, kind: 'tpr-gain', detail: `${prev.tpr} -> ${cur.tpr} (+${dTpr.toFixed(1)}pp)`, cases: nowFound });
  if (dFpr < 0) improvements.push({ corpus, kind: 'fpr-drop', detail: `${prev.fpr} -> ${cur.fpr} (${dFpr.toFixed(1)}pp)`, cases: noLongerSpurious });

  // Case churn with no net movement still matters: swapping one missed case
  // for another leaves TPR flat while the engine's behaviour changed.
  if (dTpr === 0 && newlyMissed.length > 0) {
    notes.push(`${corpus}: TPR unchanged but different cases missed — now missing ${newlyMissed.join(', ')}; now finding ${nowFound.join(', ') || 'none'}`);
  }
}

regressions.push(...staleExemptions);

const fmt = (e) => `  ${e.corpus} [${e.kind}] ${e.detail}` + (e.cases?.length ? `\n      cases: ${e.cases.join(', ')}` : '');

console.log(`baseline: ${path.relative(root, baselinePath)}  (cognium-dev ${base.tool?.version ?? '?'})`);
console.log(`run:      ${runPath}  (cognium-dev ${run.tool?.version ?? '?'})`);
console.log('');

if (suppressed.length) {
  console.log(`known failures, not gated (${suppressed.length}):`);
  for (const e of suppressed) console.log(`  ${e.corpus} — ${e.issue} — ${e.detail}`);
  console.log('');
}
if (improvements.length) {
  console.log(`improvements (${improvements.length}):`);
  for (const e of improvements) console.log(fmt(e));
  console.log('');
}
if (notes.length) {
  console.log('notes:');
  for (const n of notes) console.log(`  ${n}`);
  console.log('');
}

if (regressions.length === 0) {
  console.log(`no regressions. overall TPR ${run.summary?.overall_tpr} / FPR ${run.summary?.overall_fpr}`);
} else {
  console.log(`REGRESSIONS (${regressions.length}):`);
  for (const e of regressions) console.log(fmt(e));
}

if (args.get('markdown')) {
  const md = [];
  md.push(`## Detection quality — cognium-dev ${run.tool?.version ?? '?'}`);
  md.push('');
  md.push(`Baseline: cognium-dev ${base.tool?.version ?? '?'} · overall TPR ${run.summary?.overall_tpr} / FPR ${run.summary?.overall_fpr}`);
  md.push('');
  if (suppressed.length) {
    md.push(`### Known failures, not gated (${suppressed.length})`);
    md.push('');
    md.push('| Corpus | Issue | Error |');
    md.push('|---|---|---|');
    for (const e of suppressed) md.push(`| ${e.corpus} | ${e.issue} | ${e.detail.replace(/\|/g, ' ')} |`);
    md.push('');
  }
  if (regressions.length) {
    md.push(`### Regressions (${regressions.length})`);
    md.push('');
    md.push('| Corpus | Kind | Change | Cases |');
    md.push('|---|---|---|---|');
    for (const e of regressions) md.push(`| ${e.corpus} | ${e.kind} | ${e.detail} | ${e.cases?.join(', ') || '—'} |`);
    md.push('');
  } else {
    md.push('No regressions.');
    md.push('');
  }
  if (improvements.length) {
    md.push(`### Improvements (${improvements.length})`);
    md.push('');
    md.push('| Corpus | Kind | Change | Cases |');
    md.push('|---|---|---|---|');
    for (const e of improvements) md.push(`| ${e.corpus} | ${e.kind} | ${e.detail} | ${e.cases?.join(', ') || '—'} |`);
    md.push('');
  }
  if (notes.length) { md.push('### Notes'); md.push(''); for (const n of notes) md.push(`- ${n}`); md.push(''); }
  md.push('| Corpus | Cases | TP | FN | FP | TN | TPR | FPR |');
  md.push('|---|---|---|---|---|---|---|---|');
  for (const r of run.results ?? []) {
    if (r.error) { md.push(`| ${r.corpus} | — | | | | | ERROR | |`); continue; }
    md.push(`| ${[r.corpus, r.tests, r.tp, r.fn, r.fp, r.tn, r.tpr, r.fpr].join(' | ')} |`);
  }
  fs.writeFileSync(path.resolve(root, args.get('markdown')), md.join('\n') + '\n');
}

process.exit(regressions.length === 0 ? 0 : 1);
