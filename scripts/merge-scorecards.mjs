#!/usr/bin/env node
// Recombine per-corpus scorecards into one run summary.
//
// The sweep runs a job per corpus so each is its own check and a corpus that
// crashes or hangs cannot stop the others reporting. That leaves the scorecards
// scattered across artifacts, and compare-baseline.mjs needs the same
// run-summary.json shape run-corpus.mjs produces for a whole-sweep run.
//
// Usage:
//   node scripts/merge-scorecards.mjs --in <dir> --version <x.y.z> --out <dir>
//
// `--in` is searched recursively, so it can be pointed straight at a
// download-artifact directory of scorecard-<corpus>/ folders.
//
// A corpus present in the baseline but missing entirely from the inputs is
// recorded as an error rather than dropped: a job that never produced a
// scorecard — cancelled, evicted, timed out before writing — would otherwise
// vanish from the summary and read as "not measured" instead of "failed".

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const a = process.argv[i];
  if (!a.startsWith('--')) continue;
  const next = process.argv[i + 1];
  if (next && !next.startsWith('--')) { args.set(a.slice(2), next); i += 1; } else args.set(a.slice(2), 'true');
}

const root = path.resolve(new URL('..', import.meta.url).pathname);
const inDir = args.get('in');
const outDir = args.get('out');
const version = args.get('version') || 'unknown';
const sha = args.get('sha') || '';
const ref = args.get('ref') || '';
const baselinePath = path.resolve(root, args.get('baseline') || 'baseline/detection-quality.json');

if (!inDir || !outDir) {
  console.error('usage: merge-scorecards.mjs --in <dir> --out <dir> [--version <x.y.z>] [--baseline <file>]');
  process.exit(2);
}
if (!fs.existsSync(inDir)) { console.error(`input directory not found: ${inDir}`); process.exit(2); }

/** Every *.scorecard.json under a directory tree. */
function findScorecards(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findScorecards(p));
    else if (entry.name.endsWith('.scorecard.json')) out.push(p);
  }
  return out;
}

const rows = [];
const seen = new Set();
for (const file of findScorecards(inDir).sort()) {
  let row;
  try { row = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (e) { console.error(`skipping unreadable ${file}: ${e.message}`); continue; }
  if (!row?.corpus || seen.has(row.corpus)) continue;
  seen.add(row.corpus);
  rows.push(row);
}

function expectedCorpora() {
  const script = path.join(root, 'scripts/run-corpus.mjs');
  const out = execFileSync(process.execPath, [script, '--list'], { encoding: 'utf8' });
  const names = JSON.parse(out);
  if (!Array.isArray(names) || names.length === 0) throw new Error('--list returned no corpora');
  return names;
}

// Every corpus the manifest says this run should measure. A job that dies
// before writing a scorecard — including one the baseline has never gated,
// which is what happened to OWASP Benchmark on 2026-11-04 — is an error row,
// not a corpus that quietly disappears.
for (const corpus of expectedCorpora()) {
  if (!seen.has(corpus)) {
    rows.push({ corpus, error: 'no scorecard produced — the job did not complete' });
    seen.add(corpus);
  }
}

// A corpus the baseline expects but that produced no scorecard at all is a
// failure, not an absence. Without this a job killed before writing its
// artifact would silently shrink the run. The manifest loop above covers the
// corpora still being measured; this covers one the baseline still names
// after it was removed from the manifest.
if (fs.existsSync(baselinePath)) {
  try {
    const base = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    for (const b of base.results ?? []) {
      if (!seen.has(b.corpus)) {
        rows.push({ corpus: b.corpus, language: b.language, error: 'no scorecard produced — the job did not complete' });
        seen.add(b.corpus);
      }
    }
  } catch { /* a malformed baseline is compare-baseline.mjs's problem to report */ }
}

rows.sort((a, b) => a.corpus.localeCompare(b.corpus));

const scored = rows.filter(r => !r.error && !r.skipped);
// Corpora flagged excluded_from_overall (juliet-java) keep their rows but stay
// out of the headline totals, which would otherwise be dominated by them.
const headline = scored.filter(r => !r.excluded_from_overall);
const excluded = scored.filter(r => r.excluded_from_overall);
const sum = (k, list = headline) => list.reduce((a, r) => a + (r[k] ?? 0), 0);
const totals = {
  total_cases: sum('tests'),
  true_positives: sum('tp'),
  true_negatives_known: sum('tn'),
  false_positives: sum('fp'),
  false_negatives: sum('fn'),
};
const pct = (n, d) => (d > 0 ? `${((n / d) * 100).toFixed(1)}%` : '0.0%');

const summary = {
  run_at: new Date().toISOString(),
  tool: {
    name: 'cognium-dev',
    version,
    // The version string alone could not tell a dispatch of tag
    // cognium-dev-v4.17.0 from a main build whose label had gone stale.
    ...(sha ? { sha } : {}),
    ...(ref ? { ref } : {}),
  },
  scope: 'per-corpus jobs merged into one summary',
  summary: {
    ...totals,
    total_benchmarks: scored.length,
    errored_benchmarks: rows.filter(r => r.error).length,
    overall_tpr: pct(totals.true_positives, totals.true_positives + totals.false_negatives),
    overall_fpr: pct(totals.false_positives, totals.false_positives + totals.true_negatives_known),
    ...(excluded.length ? {
      excluded_from_overall: {
        corpora: excluded.map(r => r.corpus),
        total_cases: sum('tests', excluded),
        true_positives: sum('tp', excluded),
        false_negatives: sum('fn', excluded),
        tpr: pct(sum('tp', excluded), sum('tp', excluded) + sum('fn', excluded)),
      },
    } : {}),
    total_elapsed_ms: scored.reduce((a, r) => a + (r.elapsed_ms ?? 0), 0),
  },
  results: rows,
};

fs.mkdirSync(path.resolve(root, outDir), { recursive: true });
fs.writeFileSync(path.resolve(root, outDir, 'run-summary.json'), JSON.stringify(summary, null, 2) + '\n');
for (const row of rows) {
  // An errored corpus still gets a scorecard. Leaving the file out made the
  // 2026-11-04 OWASP fetch failure look like the corpus had not been run.
  fs.writeFileSync(path.resolve(root, outDir, `${row.corpus}.scorecard.json`), JSON.stringify(row, null, 2) + '\n');
}

console.log(`merged ${scored.length} scored + ${summary.summary.errored_benchmarks} errored -> ${outDir}/run-summary.json`);
console.log(`overall TPR ${summary.summary.overall_tpr}  FPR ${summary.summary.overall_fpr}  (${totals.total_cases} cases)`);
if (excluded.length) { const x = summary.summary.excluded_from_overall; console.log(`not in overall: ${x.corpora.join(', ')} — ${x.total_cases} cases, TPR ${x.tpr}`); }
if (summary.summary.errored_benchmarks > 0) {
  console.log(`errored: ${rows.filter(r => r.error).map(r => r.corpus).join(', ')}`);
}
