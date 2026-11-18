#!/usr/bin/env node
// Grow the daily detection coverage.
//
// The sweep already runs every day. This is the part that makes coverage
// accumulate: a labelled vulnerable case the scan detects is added to
// baseline/coverage.json and is still required the next day. The file only
// grows. A later run that misses a covered case is a regression, and the
// case stays in the file so the gate stays red until the scan detects it
// again. Cases the scan has never detected are not added; compare-baseline
// --defects logs those.
//
// A corpus that errors or is skipped is not treated as a loss. The scan did
// not recheck it, and compare-baseline already fails an errored corpus.
// A scorecard with no detected_cases (a run from before this field existed)
// is left untouched.
//
// Usage:
//   node scripts/update-coverage.mjs --run <run-summary.json> [--coverage baseline/coverage.json] [--write] [--lost <out.md>]
//
// Exit 0 = every previously covered case was detected again.
// Exit 1 = one or more covered cases were missed. --write still records new detections.
// Exit 2 = the run summary could not be read.

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
const coveragePath = path.resolve(root, args.get('coverage') || 'baseline/coverage.json');

if (!runPath) {
  console.error('usage: update-coverage.mjs --run <run-summary.json> [--coverage <file>] [--write] [--lost <out.md>]');
  process.exit(2);
}

const runAbs = path.resolve(root, runPath);
if (!fs.existsSync(runAbs)) { console.error(`run summary not found: ${runPath}`); process.exit(2); }
let run;
try { run = JSON.parse(fs.readFileSync(runAbs, 'utf8')); }
catch (e) { console.error(`run summary is not valid JSON: ${e.message}`); process.exit(2); }

const empty = {
  _comment: 'Labelled vulnerable cases a daily scan has detected. The set only grows. A later run that misses one is a regression. Cases the scan has not detected are not listed here; compare-baseline.mjs --defects logs those.',
  corpora: {},
};
let coverage = empty;
if (fs.existsSync(coveragePath)) {
  try { coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8')); }
  catch (e) { console.error(`coverage file is not valid JSON: ${e.message}`); process.exit(2); }
}
if (!coverage.corpora || typeof coverage.corpora !== 'object') coverage.corpora = {};

const runRows = new Map((run.results ?? []).map(r => [r.corpus, r]));
const lost = [];
const added = [];
const notes = [];

for (const [corpus, cases] of Object.entries(coverage.corpora)) {
  const row = runRows.get(corpus);
  if (!row) {
    lost.push({ corpus, cases: [...cases], detail: 'corpus absent from this run' });
    continue;
  }
  if (row.error || row.skipped) {
    notes.push(`${corpus}: not rechecked (${row.error || row.skipped})`);
    continue;
  }
  if (!Array.isArray(row.detected_cases)) {
    notes.push(`${corpus}: scorecard has no detected_cases; left as it is`);
    continue;
  }
  const detected = new Set(row.detected_cases);
  const missing = cases.filter(c => !detected.has(c));
  if (missing.length) lost.push({ corpus, cases: missing, detail: 'previously detected, missed this run' });
}

for (const row of run.results ?? []) {
  if (row.error || row.skipped || !Array.isArray(row.detected_cases)) continue;
  const known = new Set(coverage.corpora[row.corpus] ?? []);
  const fresh = row.detected_cases.filter(c => !known.has(c)).sort();
  if (fresh.length === 0) continue;
  added.push({ corpus: row.corpus, cases: fresh });
  coverage.corpora[row.corpus] = [...known, ...fresh].sort();
}

const corpora = {};
for (const name of Object.keys(coverage.corpora).sort()) corpora[name] = coverage.corpora[name];
coverage.corpora = corpora;
if (!coverage._comment) coverage._comment = empty._comment;

const addedCount = added.reduce((n, d) => n + d.cases.length, 0);
const lostCount = lost.reduce((n, d) => n + d.cases.length, 0);

if (addedCount === 0) console.log('coverage unchanged.');
else {
  console.log(`coverage grew by ${addedCount}:`);
  for (const d of added) console.log(`  ${d.corpus}: ${d.cases.length}`);
}
if (notes.length) {
  console.log('notes:');
  for (const n of notes) console.log(`  ${n}`);
}
if (lostCount === 0) console.log('no previously detected case was missed.');
else {
  console.log(`COVERAGE LOST (${lostCount}):`);
  for (const d of lost) console.log(`  ${d.corpus}: ${d.cases.slice(0, 8).join(', ')}${d.cases.length > 8 ? `, and ${d.cases.length - 8} more` : ''} — ${d.detail}`);
}

if (args.get('lost')) {
  const lines = [];
  if (lostCount === 0) lines.push('No previously detected case was missed.');
  else {
    lines.push(`Previously detected cases missed this run (${lostCount}):`);
    lines.push('');
    for (const d of lost) {
      lines.push(`### ${d.corpus}`);
      lines.push('');
      lines.push(d.detail);
      lines.push('');
      for (const c of d.cases.slice(0, 40)) lines.push(`- ${c}`);
      if (d.cases.length > 40) lines.push(`- … and ${d.cases.length - 40} more`);
      lines.push('');
    }
  }
  const out = path.resolve(args.get('lost'));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, lines.join('\n'));
}

if (args.get('write') === 'true' && addedCount > 0) {
  fs.mkdirSync(path.dirname(coveragePath), { recursive: true });
  fs.writeFileSync(coveragePath, JSON.stringify(coverage, null, 2) + '\n');
  console.log(`wrote ${path.relative(root, coveragePath)}`);
}

process.exit(lostCount === 0 ? 0 : 1);
