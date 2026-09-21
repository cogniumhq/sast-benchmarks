#!/usr/bin/env node
// Run cognium-dev against a vendored synthetic corpus and score it.
//
// Companion to score-owasp-benchmark.mjs, which scores OWASP Benchmark Java
// from a scan JSON you produce separately. This script does both halves for the
// corpora whose source is vendored under datasets/<corpus>/testcode, so a full
// run needs no network and no per-corpus runner script.
//
// Scoring rule, deliberately the same as the OWASP scorer so numbers are
// comparable across corpora: a case counts as flagged when at least one finding
// lands in its file with exactly the case's CWE.
//
//   TP  vulnerable case flagged        FN  vulnerable case not flagged
//   FP  safe case flagged              TN  safe case not flagged
//   TPR = TP/(TP+FN)   FPR = FP/(FP+TN)   score (OWASP "Youden") = TPR - FPR
//
// Usage:
//   node scripts/run-corpus.mjs --cli <path/to/cognium-dev/cli.js> --corpus go-synthetic
//   node scripts/run-corpus.mjs --cli <...> --all --out results/2026-09-21
//
// Writes <out>/<corpus>.scorecard.json and <out>/<corpus>.scan.json per corpus,
// plus <out>/run-summary.json aggregating every corpus in the run.
//
// Exit code is 0 for a completed run regardless of scores — this script
// measures, it does not gate. Baseline comparison is a separate step so a
// measurement run can never be mistaken for a pass/fail verdict.

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
const cli = args.get('cli');
const outDir = path.resolve(root, args.get('out') || `results/${new Date().toISOString().slice(0, 10)}-run`);
const timeoutMs = Number(args.get('timeout-ms') || 600_000);

if (!cli) {
  console.error('usage: run-corpus.mjs --cli <path to cognium-dev cli.js> [--corpus <name> | --all] [--out <dir>]');
  process.exit(2);
}
if (!fs.existsSync(cli)) {
  console.error(`cognium-dev CLI not found: ${cli}`);
  process.exit(2);
}

/**
 * Corpora whose scannable source is vendored in this repo. Everything else in
 * datasets/ needs fetching at a pinned revision and is out of scope here —
 * see docs/ for the fetch-based corpora.
 *
 * `ext` is the source extension, used to map a case name to its file: the CSVs
 * identify cases by basename only.
 */
const VENDORED = [
  { corpus: 'bash-synthetic', language: 'Bash', ext: '.sh' },
  { corpus: 'csharp-synthetic', language: 'C#', ext: '.cs' },
  { corpus: 'cwe-bench-rust', language: 'Rust', ext: '.rs' },
  { corpus: 'go-synthetic', language: 'Go', ext: '.go' },
  { corpus: 'html-js-synthetic', language: 'HTML/JS', ext: '.html' },
  { corpus: 'nodejs-synthetic', language: 'JavaScript', ext: '.js' },
  { corpus: 'rust-synthetic', language: 'Rust', ext: '.rs' },
];

const cweNum = (v) => { const m = String(v ?? '').match(/(\d+)/); return m ? Number(m[1]) : null; };

/**
 * Parse an expectedresults CSV.
 *
 * The vendored CSVs are not uniform: some carry a `name,category,...` header
 * row and some start straight at data, comment lines and blank lines are
 * interleaved, and descriptions may contain an escaped `\,`. Only the first
 * four columns are load-bearing, so split on unescaped commas and take those.
 */
function readCases(corpus) {
  const csv = path.join(root, 'datasets', corpus, 'expectedresults.csv');
  const cases = new Map();
  for (const raw of fs.readFileSync(csv, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const cols = line.split(/(?<!\\),/);
    if (cols.length < 4) continue;
    const name = cols[0].trim();
    if (name.toLowerCase() === 'name') continue; // header row, where present
    const cwe = cweNum(cols[3]);
    if (cwe === null) continue;
    cases.set(name, { category: cols[1].trim(), cwe, vulnerable: cols[2].trim().toLowerCase() === 'true' });
  }
  return cases;
}

/**
 * Run `cognium-dev scan <dir> -f json` and return the parsed report.
 *
 * cognium-dev exits 1 when it finds anything (0 = clean, 1 = findings,
 * 2 = error), so on a corpus of deliberately vulnerable code a successful run
 * is *expected* to exit non-zero. execFileSync throws on any non-zero status,
 * so exit 1 has to be treated as success and its stdout read off the error.
 * Only 2 and above are real failures.
 */
function scan(dir) {
  const opts = {
    encoding: 'utf8',
    timeout: timeoutMs,
    maxBuffer: 256 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  };
  let stdout;
  try {
    stdout = execFileSync('node', [cli, 'scan', dir, '-f', 'json'], opts);
  } catch (e) {
    if (e.status === 1 && e.stdout) stdout = e.stdout;          // findings present
    else if (e.status === undefined) throw new Error(`scan did not complete (timeout or signal ${e.signal ?? '?'})`);
    else throw new Error(`scan exited ${e.status}: ${String(e.stderr ?? '').slice(0, 300)}`);
  }
  // The CLI prints progress lines before the JSON body; take from the first `{`.
  const start = stdout.indexOf('{');
  if (start === -1) throw new Error('no JSON in scan output');
  return JSON.parse(stdout.slice(start));
}

/**
 * Normalize a scan report to { file, cwe } pairs, mirroring the OWASP scorer:
 * only findings carrying a CWE can match a case, so quality findings are
 * dropped rather than counted as false positives.
 */
function normalize(report) {
  const out = [];
  for (const r of report.files ?? report.results ?? []) {
    for (const v of r.vulnerabilities || []) {
      if (!v.cwe) continue;
      out.push({ file: r.file, cwe: cweNum(v.cwe) });
    }
  }
  for (const p of report.cross_file_taint_paths ?? []) {
    const cwe = cweNum(p.sink?.cwe);
    if (cwe !== null && p.sink?.file) out.push({ file: p.sink.file, cwe });
  }
  return out;
}

function scoreCorpus({ corpus, language, ext }) {
  const dir = path.join(root, 'datasets', corpus, 'testcode');
  if (!fs.existsSync(dir)) return { corpus, language, skipped: 'no vendored testcode' };

  const cases = readCases(corpus);
  const started = Date.now();
  let report;
  try {
    report = scan(dir);
  } catch (e) {
    return { corpus, language, error: String(e.message ?? e).slice(0, 400) };
  }
  const elapsedMs = Date.now() - started;

  // file basename (minus extension) -> set of CWEs flagged in it
  const flagged = new Map();
  for (const f of normalize(report)) {
    const base = path.basename(f.file, ext) || path.basename(f.file).replace(/\.[^.]+$/, '');
    if (!flagged.has(base)) flagged.set(base, new Set());
    flagged.get(base).add(f.cwe);
  }

  const byCategory = new Map();
  let tp = 0, tn = 0, fp = 0, fn = 0;
  const missed = [];
  const spurious = [];

  for (const [name, c] of cases) {
    const hit = flagged.get(name)?.has(c.cwe) ?? false;
    const cat = byCategory.get(c.category) ?? { category: c.category, cwe: `CWE-${c.cwe}`, tp: 0, tn: 0, fp: 0, fn: 0 };
    if (c.vulnerable && hit) { tp += 1; cat.tp += 1; }
    else if (c.vulnerable && !hit) { fn += 1; cat.fn += 1; missed.push(name); }
    else if (!c.vulnerable && hit) { fp += 1; cat.fp += 1; spurious.push(name); }
    else { tn += 1; cat.tn += 1; }
    byCategory.set(c.category, cat);
  }

  const pct = (n) => `${(n * 100).toFixed(1)}%`;
  const tpr = tp + fn > 0 ? tp / (tp + fn) : 0;
  const fpr = fp + tn > 0 ? fp / (fp + tn) : 0;

  return {
    corpus,
    language,
    benchmark: corpus,
    tests: cases.size,
    tp, tn, fp, fn,
    tpr: pct(tpr),
    fpr: pct(fpr),
    score: pct(tpr - fpr),
    score_rule: 'tpr - fpr',
    elapsed_ms: elapsedMs,
    categories: [...byCategory.values()].sort((a, b) => a.category.localeCompare(b.category)),
    // Named cases, so a regression report can say which case changed rather
    // than only that a number moved.
    missed_cases: missed.sort(),
    spurious_cases: spurious.sort(),
    scan_report: `${corpus}.scan.json`,
    _report: report,
  };
}

const selected = args.get('all') === 'true'
  ? VENDORED
  : VENDORED.filter(v => v.corpus === args.get('corpus'));

if (selected.length === 0) {
  console.error(`no corpus selected. --corpus must be one of: ${VENDORED.map(v => v.corpus).join(', ')}  (or --all)`);
  process.exit(2);
}

fs.mkdirSync(outDir, { recursive: true });

const rows = [];
for (const v of selected) {
  process.stdout.write(`scanning ${v.corpus} ... `);
  const row = scoreCorpus(v);
  if (row.error) console.log(`ERROR: ${row.error}`);
  else if (row.skipped) console.log(`skipped (${row.skipped})`);
  else {
    console.log(`${row.tests} cases  TP ${row.tp} FN ${row.fn} FP ${row.fp} TN ${row.tn}  TPR ${row.tpr} FPR ${row.fpr}  (${(row.elapsed_ms / 1000).toFixed(1)}s)`);
    fs.writeFileSync(path.join(outDir, `${v.corpus}.scan.json`), JSON.stringify(row._report, null, 2));
  }
  delete row._report;
  fs.writeFileSync(path.join(outDir, `${v.corpus}.scorecard.json`), JSON.stringify(row, null, 2));
  rows.push(row);
}

const scored = rows.filter(r => !r.error && !r.skipped);
const sum = (k) => scored.reduce((a, r) => a + r[k], 0);
const totals = { total_cases: sum('tests'), true_positives: sum('tp'), true_negatives_known: sum('tn'), false_positives: sum('fp'), false_negatives: sum('fn') };

// `--version` prints three lines ("cognium-dev v4.9.20", build, attribution);
// the version is the vN.N.N token on the first, not the last word of the blob.
let version = 'unknown';
try {
  const out = execFileSync('node', [cli, '--version'], { encoding: 'utf8' });
  version = out.match(/v?(\d+\.\d+\.\d+)/)?.[1] ?? 'unknown';
} catch { /* keep unknown */ }

const summary = {
  run_at: new Date().toISOString(),
  // Only the version is recorded. The CLI path is a throwaway build location
  // that varies per run and carries no information for a reader of a published
  // report — this repository is public, so artifacts stay free of local paths.
  tool: { name: 'cognium-dev', version },
  scope: 'vendored synthetic corpora only — fetch-based corpora are not included',
  summary: {
    ...totals,
    total_benchmarks: scored.length,
    errored_benchmarks: rows.filter(r => r.error).length,
    overall_tpr: totals.true_positives + totals.false_negatives > 0
      ? `${((totals.true_positives / (totals.true_positives + totals.false_negatives)) * 100).toFixed(1)}%` : '0.0%',
    overall_fpr: totals.false_positives + totals.true_negatives_known > 0
      ? `${((totals.false_positives / (totals.false_positives + totals.true_negatives_known)) * 100).toFixed(1)}%` : '0.0%',
    total_elapsed_ms: scored.reduce((a, r) => a + r.elapsed_ms, 0),
  },
  results: rows,
};

fs.writeFileSync(path.join(outDir, 'run-summary.json'), JSON.stringify(summary, null, 2));

console.log(`\n${'='.repeat(72)}`);
console.log(`cognium-dev ${version} — ${scored.length} corpora, ${totals.total_cases} cases`);
console.log(`TP ${totals.true_positives}  FN ${totals.false_negatives}  FP ${totals.false_positives}  TN ${totals.true_negatives_known}`);
console.log(`overall TPR ${summary.summary.overall_tpr}   FPR ${summary.summary.overall_fpr}   ${(summary.summary.total_elapsed_ms / 1000).toFixed(1)}s`);
if (summary.summary.errored_benchmarks > 0) console.log(`errored: ${rows.filter(r => r.error).map(r => r.corpus).join(', ')}`);
console.log(`written to ${path.relative(process.cwd(), outDir)}/`);
