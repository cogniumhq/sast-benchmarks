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
import os from 'node:os';

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
/**
 * Corpora fetched at a pinned commit. Pinning is not optional: without it a
 * dataset update reads as an engine regression, which is the fastest way for a
 * nightly gate to lose credibility and get muted.
 *
 * `scanPath` is the subtree to scan — scanning a whole application repo would
 * measure its build tooling and dependencies rather than its test cases.
 */
const FETCHED = [
  {
    corpus: 'owasp-benchmark-java',
    language: 'Java',
    ext: '.java',
    repo: 'https://github.com/OWASP-Benchmark/BenchmarkJava',
    // Verified in datasets/owasp-benchmark-java/README.md: all 2,740 cases,
    // ground truth byte-identical to the committed CSV.
    commit: '20cbf3d11123347e47ed89541e6942836def53f7',
    scanPath: 'src/main/java/org/owasp/benchmark/testcode',
    groundTruth: 'expectedresults-1.2.csv',
  },
  // Application corpora: real apps with a hand-audited file list. They name
  // cases by repo-relative path, and the scan covers the whole checkout —
  // findings in files the CSV does not list are simply not scored, the same
  // way the OWASP scorer ignores anything outside its case list.
  //
  // Pins below were resolved 2026-09-21 from each repo's default branch. None
  // was recorded upstream, so these are a deliberate choice of reference
  // point, not a recovered fact — see each dataset README.
  {
    corpus: 'webgoat',
    language: 'Java',
    ext: '.java',
    match: 'path',
    repo: 'https://github.com/WebGoat/WebGoat',
    commit: '872d6149d4ef29e4929c2f4eda279f7fbedc52e8',
    scanPath: 'src/main/java',
    groundTruth: 'expectedresults.csv',
  },
  {
    corpus: 'dvja',
    language: 'Java',
    ext: '.java',
    match: 'path',
    repo: 'https://github.com/appsecco/dvja',
    commit: '597ece1ab79ffffea7289d49b0c443bb2ebcbd16',
    scanPath: 'src/main/java',
    groundTruth: 'expectedresults.csv',
  },
  {
    corpus: 'pygoat',
    language: 'Python',
    ext: '.py',
    match: 'path',
    repo: 'https://github.com/adeyosemanputra/pygoat',
    commit: '19d17cc8874861142b330636d068bbde54e86b85',
    scanPath: '.',
    groundTruth: 'expectedresults.csv',
  },
  {
    corpus: 'nodegoat',
    language: 'JavaScript',
    ext: '.js',
    match: 'path',
    repo: 'https://github.com/OWASP/NodeGoat',
    commit: 'c5cb68a7084e4ae7dcc60e6a98768720a81841e8',
    scanPath: 'app',
    groundTruth: 'expectedresults.csv',
  },
  {
    corpus: 'juice-shop',
    language: 'TypeScript',
    ext: '.ts',
    match: 'path',
    repo: 'https://github.com/juice-shop/juice-shop',
    commit: '1618a611b173b4bf114028e6e02549950606e29d',
    scanPath: 'routes',
    groundTruth: 'expectedresults.csv',
  },
  {
    corpus: 'vulnerability-goapp',
    language: 'Go',
    ext: '.go',
    repo: 'https://github.com/Hardw01f/Vulnerability-goapp',
    commit: '6e51a892d449958074f216bb10e55e122d99440c',
    scanPath: '.',
    groundTruth: 'expectedresults.csv',
  },
];

const VENDORED = [
  { corpus: 'bash-synthetic', language: 'Bash', ext: '.sh' },
  { corpus: 'csharp-synthetic', language: 'C#', ext: '.cs' },
  { corpus: 'cwe-bench-rust', language: 'Rust', ext: '.rs' },
  { corpus: 'go-synthetic', language: 'Go', ext: '.go' },
  { corpus: 'html-js-synthetic', language: 'HTML/JS', ext: '.html' },
  { corpus: 'nodejs-synthetic', language: 'JavaScript', ext: '.js' },
  { corpus: 'rust-synthetic', language: 'Rust', ext: '.rs' },
];

/**
 * Clone a pinned corpus into a cache directory, reusing an existing checkout
 * when the commit already matches. A nightly that re-clones OWASP Benchmark
 * every run spends more time fetching than scanning.
 */
function fetchCorpus({ corpus, repo, commit }) {
  const cacheRoot = process.env.CORPUS_CACHE || path.join(os.tmpdir(), 'sast-benchmarks-corpora');
  const dir = path.join(cacheRoot, corpus);
  const at = (c) => { try { return execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() === c; } catch { return false; } };

  if (at(commit)) return dir;

  fs.mkdirSync(cacheRoot, { recursive: true });
  fs.rmSync(dir, { recursive: true, force: true });
  // blob:none keeps the clone small; the checkout still materialises the tree.
  execFileSync('git', ['clone', '--quiet', '--filter=blob:none', repo, dir], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 900_000 });
  execFileSync('git', ['-C', dir, 'checkout', '--quiet', commit], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 300_000 });

  if (!at(commit)) throw new Error(`checkout did not land on ${commit}`);
  return dir;
}

const cweNum = (v) => { const m = String(v ?? '').match(/(\d+)/); return m ? Number(m[1]) : null; };

/**
 * Parse an expectedresults CSV.
 *
 * The vendored CSVs are not uniform: some carry a `name,category,...` header
 * row and some start straight at data, comment lines and blank lines are
 * interleaved, and descriptions may contain an escaped `\,`. Only the first
 * four columns are load-bearing, so split on unescaped commas and take those.
 */
function readCases(corpus, groundTruth = 'expectedresults.csv') {
  const csv = path.join(root, 'datasets', corpus, groundTruth);
  const cases = new Map();
  for (const raw of fs.readFileSync(csv, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const cols = line.split(/(?<!\\),/);
    if (cols.length < 4) continue;
    const name = cols[0].trim();
    // Header row, where present: 'name,...' in synthetic corpora,
    // 'filePath,...' in application ones.
    if (['name', 'filepath'].includes(name.toLowerCase())) continue;
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
  // Write to a file rather than parsing stdout. A large corpus emits megabytes
  // of JSON — OWASP Benchmark alone is ~9MB — and piping that back through
  // execFileSync truncated it mid-document ("Unterminated string in JSON at
  // position 145956"), which surfaced as a corpus-wide ERROR rather than as
  // the buffering problem it was. -o writes the document directly.
  const out = path.join(os.tmpdir(), `corpus-scan-${process.pid}-${Math.random().toString(36).slice(2)}.json`);
  const opts = { encoding: 'utf8', timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] };
  try {
    try {
      execFileSync('node', [cli, 'scan', dir, '-f', 'json', '-o', out], opts);
    } catch (e) {
      // cognium-dev exits 1 when it finds anything (0 = clean, 1 = findings,
      // 2 = error), so on deliberately vulnerable code a *successful* scan
      // exits non-zero. Only 2 and above are real failures.
      if (e.status === 1) { /* findings present */ }
      // status is null when the child was killed by a signal, undefined when
      // spawn itself failed — neither is an exit code, and both were falling
      // through to the 'exited null' branch which discarded the reason.
      else if (e.status == null) throw new Error(`scan did not complete: ${e.signal ? `killed by ${e.signal}` : e.code ?? 'spawn failed'}${e.stderr ? ` — ${String(e.stderr).slice(0, 200)}` : ''}`);
      else throw new Error(`scan exited ${e.status}: ${String(e.stderr ?? '').slice(0, 300)}`);
    }
    if (!fs.existsSync(out)) throw new Error('scan produced no output file');
    const raw = fs.readFileSync(out, 'utf8');
    try {
      return JSON.parse(raw);
    } catch (e) {
      throw new Error(`scan output is not valid JSON (${raw.length} bytes): ${e.message}`);
    }
  } finally {
    fs.rmSync(out, { force: true });
  }
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

function scoreCorpus({ corpus, language, ext, repo, commit, scanPath, groundTruth, match = 'basename' }) {
  let dir;
  let repoRoot;
  if (repo) {
    try {
      repoRoot = fetchCorpus({ corpus, repo, commit });
      dir = path.join(repoRoot, scanPath ?? '.');
    } catch (e) {
      return { corpus, language, error: `fetch failed: ${String(e.message ?? e).slice(0, 300)}` };
    }
  } else {
    dir = path.join(root, 'datasets', corpus, 'testcode');
  }
  if (!fs.existsSync(dir)) return { corpus, language, skipped: `scan path missing: ${dir}` };

  const cases = readCases(corpus, groundTruth);
  const started = Date.now();
  let report;
  try {
    report = scan(dir);
  } catch (e) {
    return { corpus, language, error: String(e.message ?? e).slice(0, 400) };
  }
  const elapsedMs = Date.now() - started;

  // Case key -> set of CWEs flagged for it.
  //
  // Two identifier styles in the vendored ground truth: synthetic corpora name
  // a case by file basename (BenchmarkTest00001), application corpora name it
  // by repo-relative path (src/main/java/.../SqlInjectionLesson2.java). Match
  // the way the corpus identifies itself, or every case reads as a miss.
  const byPath = match === 'path';
  const flagged = new Map();
  const add = (key, cwe) => {
    if (!flagged.has(key)) flagged.set(key, new Set());
    flagged.get(key).add(cwe);
  };
  for (const f of normalize(report)) {
    if (byPath) {
      // Findings carry absolute paths; the CSV is repo-relative.
      const rel = path.relative(repoRoot ?? dir, path.resolve(f.file));
      add(rel, f.cwe);
    } else {
      add(path.basename(f.file, ext) || path.basename(f.file).replace(/\.[^.]+$/, ''), f.cwe);
    }
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
    ...(commit ? { dataset_revision: commit } : {}),
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

// --all stays the vendored set so the fast path keeps working offline;
// --all-corpora adds the pinned fetch-based ones.
const ALL = [...VENDORED, ...FETCHED];
const selected = args.get('all-corpora') === 'true'
  ? ALL
  : args.get('all') === 'true'
    ? VENDORED
    : ALL.filter(v => v.corpus === args.get('corpus'));

if (selected.length === 0) {
  console.error(`no corpus selected. --corpus must be one of: ${ALL.map(v => v.corpus).join(', ')}  (or --all for vendored, --all-corpora for everything)`);
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
  scope: selected.some(v => v.repo)
    ? 'vendored corpora plus pinned fetch-based corpora'
    : 'vendored synthetic corpora only',
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
