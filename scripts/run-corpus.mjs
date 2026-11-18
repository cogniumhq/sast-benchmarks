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
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

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
// Importing this file (the scorer tests do) must not demand a CLI or start a scan.
const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
// `--list` only prints the manifest. It must not require a built CLI, so
// merge-scorecards can ask which corpora were supposed to produce a scorecard.
const listing = isDirect && args.get('list') === 'true';

if (isDirect && !listing && !cli) {
  console.error('usage: run-corpus.mjs --cli <path to cognium-dev cli.js> [--corpus <name> | --all | --list] [--out <dir>]');
  process.exit(2);
}
if (isDirect && !listing && !fs.existsSync(cli)) {
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
    // Labels are `path:function` (introduction/views.py:cmd_lab). A path-only
    // key never hits those names, which is why every published sweep scored
    // tp 0. A finding counts for the def that encloses its line. A label with
    // no colon still matches the whole file.
    match: 'function',
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
  // Archive-based, ground truth derived from the corpus layout rather than a
  // vendored CSV. Recall-only: every scored file is a positive, so no FPR.
  {
    corpus: 'juliet-csharp',
    language: 'C#',
    ext: '.cs',
    archive: 'https://samate.nist.gov/SARD/downloads/test-suites/2020-08-01-juliet-test-suite-for-csharp-v1-3.zip',
    sha256: '2e6dbac4741fb020a0b1c2db69e98aed165987df2bd70bd51f7c8c5302c8e8f8',
    scanPath: 'src/testcases',
    stripTo: 'src',
    cases: 'juliet-csharp',
    recallOnly: true,
    // Default taint config. The published 13.8% recall for this corpus was
    // measured with the corpus' own source/sink signatures added (console,
    // file, env, TCP, WebClient, legacy System.Web; ADO.NET, LDAP, XPath,
    // Process — see datasets/juliet-csharp/README.md), and that runner is not
    // public. So this scores far lower and the two numbers are NOT comparable:
    // most misses here are unrecognised signatures, not propagation gaps.
    //
    // Still a valid regression baseline — it catches a drop from whatever the
    // default config achieves — but it must not be read as the engine's Juliet
    // C# recall. Recovering the signature list would make it comparable.
    configNote: 'default taint config; published 13.8% used added corpus signatures',
  },
  {
    corpus: 'securibench-micro',
    language: 'Java',
    ext: '.java',
    repo: 'https://github.com/too4words/securibench-micro',
    commit: '6a5a72488ea830d99f9464fc1f0562c4f864214b',
    scanPath: 'src/securibench/micro',
    cases: 'securibench-micro',
  },
  // Juliet Java 1.3 via the find-sec-bugs mirror, pinned to a commit so the
  // corpus cannot move under the baseline. Recall-only, like the C# suite: julietJavaCases() scores every
  // CWE<N>_ file as a positive, so this corpus reports TPR and per-CWE TP/FN
  // and never an FPR. Categories are the Juliet directory prefixes, e.g.
  // CWE23_Relative_Path_Traversal, CWE643_Xpath_Injection.
  //
  // cognium-dev once aborted with a V8 heap OOM on this tree (cognium-dev#424,
  // since closed). No longer: the 2026-11-02 PR run on cognium-dev 4.19.0
  // scanned all 40,547 cases in 38s.
  //
  // Excluded from the headline overall TPR/FPR: ~40k cases at a few percent
  // recall would swamp the other corpora. It keeps its own row and is summed
  // separately under summary.excluded_from_overall.
  {
    corpus: 'juliet-java',
    language: 'Java',
    ext: '.java',
    repo: 'https://github.com/find-sec-bugs/juliet-test-suite',
    commit: 'b2c6df3733e2176fe7097e4784895c6891632b4c',
    scanPath: 'src/testcases',
    cases: 'juliet-java',
    recallOnly: true,
    excludeFromOverall: true,
  },
  // Not wired, deliberately — the deriver below is kept because the work is
  // sound; only the corpus is held back:
  //
  //   firing-range  the CATEGORY_CWE map here is inferred, not sourced, and
  //                 matches only 21 of 44 servlets — scoring 0 TP. The dataset
  //                 README records the original run finding all but 3 cases, so
  //                 the fault is far more likely this mapping than the engine.
  //                 It needs the "small vulnerable/safe list in the runner" that
  //                 the README mentions and that is not public. Baselining 0%
  //                 would enshrine a number nobody can defend.
  {
    corpus: 'vulnerability-goapp',
    language: 'Go',
    ext: '.go',
    // Labels are repo-relative paths. The basename default keyed findings as
    // `admin` and the cases as `pkg/admin/admin.go`, so nothing matched.
    match: 'path',
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
function sleepMs(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/** DNS and connection failures are worth a second try. A wrong pin is not. */
export function isTransientFetchError(err) {
  const text = `${err?.message ?? ''}\n${err?.stderr ?? ''}`;
  return /Could not resolve host|Temporary failure in name resolution|Connection reset|Connection refused|timed out|Operation timed out|early EOF|RPC failed|transfer closed|Could not connect|The requested URL returned error: 5|Failed to connect|unable to access/i.test(text);
}

export function withRetry(fn, { attempts = 3, sleep = sleepMs } = {}) {
  let last;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try { return fn(); }
    catch (err) {
      last = err;
      if (!isTransientFetchError(err) || attempt === attempts) throw err;
      const why = String(err?.message ?? err).split('\n')[0];
      console.error(`fetch failed (${attempt}/${attempts}), retrying: ${why}`);
      sleep(attempt === 1 ? 2_000 : 8_000);
    }
  }
  throw last;
}

function fetchCorpus({ corpus, repo, commit }) {
  const cacheRoot = process.env.CORPUS_CACHE || path.join(os.tmpdir(), 'sast-benchmarks-corpora');
  const dir = path.join(cacheRoot, corpus);
  const at = (c) => { try { return execFileSync('git', ['-C', dir, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim() === c; } catch { return false; } };

  if (at(commit)) return dir;

  fs.mkdirSync(cacheRoot, { recursive: true });
  // A one-shot DNS failure (2026-11-04, OWASP Benchmark: "Could not resolve
  // host: github.com") used to fail the corpus for the whole night. Retry the
  // clone. A checkout that lands on the wrong commit is not retried.
  withRetry(() => {
    fs.rmSync(dir, { recursive: true, force: true });
    // blob:none keeps the clone small; the checkout still materialises the tree.
    execFileSync('git', ['clone', '--quiet', '--filter=blob:none', repo, dir], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 900_000 });
    execFileSync('git', ['-C', dir, 'checkout', '--quiet', commit], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 300_000 });
    if (!at(commit)) throw new Error(`checkout did not land on ${commit}`);
  });
  return dir;
}

/**
 * Download and unpack a pinned archive, verified by SHA-256.
 *
 * The digest is the pin. A git corpus pins a commit; an archive has no such
 * identifier, so without checking the hash an upstream re-publish would change
 * the corpus underneath the baseline and read as an engine regression.
 */
function fetchArchive({ corpus, url, sha256, stripTo }) {
  const cacheRoot = process.env.CORPUS_CACHE || path.join(os.tmpdir(), 'sast-benchmarks-corpora');
  const dir = path.join(cacheRoot, corpus);
  const stamp = path.join(dir, '.sha256');

  if (fs.existsSync(stamp) && fs.readFileSync(stamp, 'utf8').trim() === sha256) return dir;

  fs.mkdirSync(cacheRoot, { recursive: true });
  const zip = path.join(cacheRoot, `${corpus}.zip`);
  withRetry(() => {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    execFileSync('curl', ['-sSLo', zip, url], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 1_800_000 });

    const actual = crypto.createHash('sha256').update(fs.readFileSync(zip)).digest('hex');
    if (actual !== sha256) {
      fs.rmSync(zip, { force: true });
      throw new Error(`archive digest mismatch: expected ${sha256}, got ${actual}`);
    }

    execFileSync('unzip', ['-q', '-o', zip, '-d', dir], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 900_000 });
    fs.rmSync(zip, { force: true });
    fs.writeFileSync(stamp, sha256);
  });

  const root = stripTo ? path.join(dir, stripTo) : dir;
  if (!fs.existsSync(root)) throw new Error(`archive unpacked but ${stripTo} is missing`);
  return dir;
}

const cweNum = (v) => { const m = String(v ?? '').match(/(\d+)/); return m ? Number(m[1]) : null; };

/**
 * The version line is `cognium-dev vX.Y.Z` and nothing else. The first semver
 * in the blob is not safe: a warning above that line once had to be ruled out,
 * and a dispatch of tag cognium-dev-v4.17.0 is a real 4.17.0, which only the
 * build SHA distinguishes from a stale label.
 */
export function toolVersion(text) {
  const line = String(text).split(/\r?\n/).map(l => l.trim()).find(l => /^cognium-dev v\d+\.\d+\.\d+$/.test(l));
  return line ? line.slice('cognium-dev v'.length) : null;
}

/**
 * Derive Juliet C# cases from the corpus layout rather than a CSV.
 *
 * Juliet encodes its ground truth in structure: `src/testcases/CWE<N>_.../`
 * gives the CWE, and every `__..._01.cs` variant carries a `Bad()` method with
 * a real vulnerability of that CWE. The dataset README records that only `_01`
 * files are scored and the `Good*()` controls are not, so this corpus yields
 * recall only — there is no true-negative set and therefore no FPR.
 *
 * Scoring a corpus with no negatives as though it had them would report FPR
 * 0.0% and look like perfect precision, which is why `recall_only` is carried
 * through to the scorecard.
 */
function julietCsharpCases(rootDir) {
  const cases = new Map();
  const testcases = path.join(rootDir, 'src', 'testcases');
  if (!fs.existsSync(testcases)) return cases;

  for (const cweDir of fs.readdirSync(testcases)) {
    const cwe = cweNum(cweDir.match(/^CWE(\d+)/)?.[1]);
    if (cwe === null) continue;
    const walk = (d) => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, e.name);
        if (e.isDirectory()) { walk(full); continue; }
        if (!e.name.endsWith('_01.cs')) continue;
        cases.set(path.basename(e.name, '.cs'), { category: cweDir.split('__')[0], cwe, vulnerable: true });
      }
    };
    walk(path.join(testcases, cweDir));
  }
  return cases;
}

/**
 * Derive Juliet Java cases from the corpus layout.
 *
 * Same convention as the C# suite: `CWE<N>_...` in the filename gives the CWE,
 * and every test file carries a `bad()` method with a real vulnerability.
 *
 * Recall-only, and deliberately so. The dataset README describes scoring the
 * `good*()` controls as true negatives, but `bad()` and its controls live in
 * the *same file*, so separating them needs line-level attribution against
 * parsed method boundaries. Counting a file as a negative because it also
 * contains safe code would manufacture true negatives the run never
 * established, so the controls are left unscored and no FPR is reported.
 */
function julietJavaCases(rootDir) {
  const cases = new Map();
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      if (!e.name.endsWith('.java')) continue;
      const cwe = cweNum(e.name.match(/^CWE(\d+)_/)?.[1]);
      if (cwe === null) continue;
      // Skip the shared helpers Juliet ships alongside the cases.
      if (/Helper|Util|AbstractTestCase/i.test(e.name)) continue;
      cases.set(path.basename(e.name, '.java'), { category: e.name.split('__')[0], cwe, vulnerable: true });
    }
  };
  walk(rootDir);
  return cases;
}

/**
 * Derive SecuriBench Micro cases from each test class.
 *
 * Upstream encodes the expected count in the class itself:
 *
 *     public int getVulnerabilityCount() {
 *         return 1;
 *     }
 *
 * A class declaring zero is a genuine negative — the only corpus here besides
 * the synthetics that supplies its own controls — so this one does yield an
 * FPR. Classes with no such method are helpers and are skipped rather than
 * defaulted to zero, which would invent negatives.
 */
function securibenchCases(rootDir) {
  const cases = new Map();
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) { walk(full); continue; }
      if (!e.name.endsWith('.java')) continue;
      const src = fs.readFileSync(full, 'utf8');
      const m = src.match(/getVulnerabilityCount\s*\(\s*\)\s*\{\s*return\s+(\d+)\s*;/);
      if (!m) continue;
      const expected = Number(m[1]);
      // XSS and SQLi dominate the suite; the category directory names the kind.
      const dirName = path.basename(path.dirname(full));
      cases.set(path.basename(e.name, '.java'), {
        category: dirName,
        cwe: /sql/i.test(dirName) ? 89 : 79,
        vulnerable: expected > 0,
      });
    }
  };
  walk(rootDir);
  return cases;
}

/**
 * Derive Firing Range cases from its directory layout.
 *
 * Category per directory under the test tree. The dataset README also mentions
 * "a small vulnerable/safe list in the runner" that is not public, so the safe
 * cases cannot be reconstructed — every derived case is treated as a positive
 * and no FPR is reported. The README's 2 known false positives in `escape/`
 * therefore cannot be reproduced here; that needs the original list.
 */
function firingRangeCases(rootDir) {
  // src/tests holds the vulnerable servlets; src/unit-tests holds the app's
  // own tests. Deriving cases from the latter would score test code as though
  // it were the corpus.
  const CATEGORY_CWE = { reflected: 79, dom: 79, escape: 79, redirect: 601, cors: 942, remoteinclude: 98, urldom: 79 };
  const cases = new Map();
  const walk = (d, category) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) { walk(full, category ?? e.name.toLowerCase()); continue; }
      if (!/\.(java|html)$/.test(e.name)) continue;
      const cwe = CATEGORY_CWE[category ?? ''] ?? null;
      if (cwe === null) continue;
      cases.set(path.basename(e.name).replace(/\.[^.]+$/, ''), { category, cwe, vulnerable: true });
    }
  };
  walk(rootDir, undefined);
  return cases;
}

/**
 * Parse an expectedresults CSV.
 *
 * The vendored CSVs are not uniform: some carry a `name,category,...` header
 * row and some start straight at data, comment lines and blank lines are
 * interleaved, and descriptions may contain an escaped `\,`. Only the first
 * four columns are load-bearing, so split on unescaped commas and take those.
 */
export function readCases(corpus, groundTruth = 'expectedresults.csv') {
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
    const entry = { category: cols[1].trim(), cwe, vulnerable: cols[2].trim().toLowerCase() === 'true' };
    // One path can carry several cases (admin.go is both command injection and
    // SQL injection; NodeGoat research.js is both SSRF and XSS). Keying the
    // map by name alone kept the last row and the earlier label was never scored.
    const existing = cases.get(name);
    if (existing) existing.push(entry);
    else cases.set(name, [entry]);
  }
  return cases;
}

/** Flatten a case map. Derivers store one object per name; readCases stores an array. */
export function caseEntries(cases) {
  const rows = [];
  for (const [name, value] of cases) {
    const list = Array.isArray(value) ? value : [value];
    for (const c of list) rows.push([name, c]);
  }
  return rows;
}

/**
 * `def` / `async def` ranges in a Python file. A def owns lines up to the next
 * def at the same or smaller indent, so a method does not swallow the next
 * method and a nested def stays inside its parent.
 */
export function pythonFunctionRanges(source) {
  const lines = String(source).split(/\r?\n/);
  const defs = [];
  for (let i = 0; i < lines.length; i += 1) {
    const m = /^(\s*)(?:async\s+)?def\s+(\w+)\s*\(/.exec(lines[i]);
    if (m) defs.push({ line: i + 1, indent: m[1].length, name: m[2] });
  }
  return defs.map((d, idx) => {
    let end = lines.length;
    for (let j = idx + 1; j < defs.length; j += 1) {
      if (defs[j].indent <= d.indent) { end = defs[j].line - 1; break; }
    }
    return { name: d.name, line: d.line, end, indent: d.indent };
  });
}

/** Innermost def whose range contains `line`, or null. */
export function enclosingFunction(ranges, line) {
  let best = null;
  for (const d of ranges) {
    if (d.line <= line && line <= d.end && (!best || d.indent >= best.indent)) best = d;
  }
  return best ? best.name : null;
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
      out.push({ file: r.file, cwe: cweNum(v.cwe), line: Number(v.line) || null });
    }
  }
  for (const p of report.cross_file_taint_paths ?? []) {
    const cwe = cweNum(p.sink?.cwe);
    if (cwe !== null && p.sink?.file) out.push({ file: p.sink.file, cwe, line: Number(p.sink.line) || null });
  }
  return out;
}

/**
 * Case key -> set of CWEs flagged for it.
 *
 * Three identifier styles. Synthetic corpora name a case by file basename.
 * Application corpora name it by repo-relative path. PyGoat names it
 * `path:function`; those also get the path key so a file-level label still matches.
 */
export function indexFindings(findings, { match = 'basename', ext = '', repoRoot, dir, readFile = (p) => fs.readFileSync(p, 'utf8') }) {
  const byPath = match === 'path' || match === 'function';
  const cache = new Map();
  const flagged = new Map();
  const add = (key, cwe) => {
    if (!key || cwe === null) return;
    if (!flagged.has(key)) flagged.set(key, new Set());
    flagged.get(key).add(cwe);
  };
  for (const f of findings) {
    if (byPath) {
      const abs = path.resolve(f.file);
      const rel = path.relative(repoRoot ?? dir, abs);
      add(rel, f.cwe);
      if (match === 'function' && rel.endsWith('.py') && f.line) {
        let ranges = cache.get(abs);
        if (ranges === undefined) {
          try { ranges = pythonFunctionRanges(readFile(abs)); }
          catch { ranges = []; }
          cache.set(abs, ranges);
        }
        const name = enclosingFunction(ranges, f.line);
        if (name) add(`${rel}:${name}`, f.cwe);
      }
    } else {
      add(path.basename(f.file, ext) || path.basename(f.file).replace(/\.[^.]+$/, ''), f.cwe);
    }
  }
  return flagged;
}

export function tally(entries, flagged) {
  const byCategory = new Map();
  const nameCount = new Map();
  for (const [name] of entries) nameCount.set(name, (nameCount.get(name) ?? 0) + 1);
  // Two cases on one path (command injection and SQL injection) would otherwise
  // both show up as the same filename, and a miss would not say which one.
  const label = (name, c) => (nameCount.get(name) > 1 ? `${name} (${c.category})` : name);
  let tp = 0, tn = 0, fp = 0, fn = 0;
  const missed = [];
  const spurious = [];
  for (const [name, c] of entries) {
    const hit = flagged.get(name)?.has(c.cwe) ?? false;
    const cat = byCategory.get(c.category) ?? { category: c.category, cwe: `CWE-${c.cwe}`, tp: 0, tn: 0, fp: 0, fn: 0 };
    if (c.vulnerable && hit) { tp += 1; cat.tp += 1; }
    else if (c.vulnerable && !hit) { fn += 1; cat.fn += 1; missed.push(label(name, c)); }
    else if (!c.vulnerable && hit) { fp += 1; cat.fp += 1; spurious.push(label(name, c)); }
    else { tn += 1; cat.tn += 1; }
    byCategory.set(c.category, cat);
  }
  return {
    tests: entries.length,
    tp, tn, fp, fn,
    missed: missed.sort(),
    spurious: spurious.sort(),
    categories: [...byCategory.values()].sort((a, b) => a.category.localeCompare(b.category)),
  };
}

function scoreCorpus({ corpus, language, ext, repo, commit, archive, sha256, stripTo, cases: caseSource, recallOnly, configNote, scanPath, groundTruth, match = 'basename' }) {
  let dir;
  let repoRoot;
  if (archive) {
    try {
      repoRoot = fetchArchive({ corpus, url: archive, sha256, stripTo });
      dir = path.join(repoRoot, scanPath ?? '.');
    } catch (e) {
      return { corpus, language, error: `fetch failed: ${String(e.message ?? e).slice(0, 300)}` };
    }
  } else if (repo) {
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

  const DERIVERS = {
    'juliet-csharp': () => julietCsharpCases(repoRoot),
    'juliet-java': () => julietJavaCases(dir),
    'securibench-micro': () => securibenchCases(dir),
    'firing-range': () => firingRangeCases(dir),
  };
  const cases = caseSource ? DERIVERS[caseSource]() : readCases(corpus, groundTruth);
  const entries = caseEntries(cases);
  if (entries.length === 0) return { corpus, language, error: 'no cases derived — ground truth missing or layout changed' };
  const started = Date.now();
  let report;
  try {
    report = scan(dir);
  } catch (e) {
    return { corpus, language, error: String(e.message ?? e).slice(0, 400) };
  }
  const elapsedMs = Date.now() - started;

  const flagged = indexFindings(normalize(report), { match, ext, repoRoot, dir });
  const scoredCases = tally(entries, flagged);
  const { tp, tn, fp, fn, missed, spurious, categories } = scoredCases;

  const pct = (n) => `${(n * 100).toFixed(1)}%`;
  const tpr = tp + fn > 0 ? tp / (tp + fn) : 0;
  const fpr = fp + tn > 0 ? fp / (fp + tn) : 0;

  return {
    corpus,
    language,
    benchmark: corpus,
    ...(commit ? { dataset_revision: commit } : {}),
    ...(sha256 ? { dataset_revision: `sha256:${sha256}` } : {}),
    // A recall-only corpus has no negatives; reporting FPR 0.0% for it would
    // read as perfect precision rather than "not measured".
    ...(recallOnly ? { recall_only: true } : {}),
    // Scored and reported per corpus, but left out of summary.overall_tpr/fpr.
    ...(excludeFromOverall ? { excluded_from_overall: true } : {}),
    ...(configNote ? { config_note: configNote } : {}),
    tests: scoredCases.tests,
    tp, tn, fp, fn,
    tpr: pct(tpr),
    fpr: pct(fpr),
    score: pct(tpr - fpr),
    score_rule: 'tpr - fpr',
    elapsed_ms: elapsedMs,
    categories,
    // Named cases, so a regression report can say which case changed rather
    // than only that a number moved. A shared path is qualified with its category.
    missed_cases: missed,
    spurious_cases: spurious,
    scan_report: `${corpus}.scan.json`,
    _report: report,
  };
}

// --all stays the vendored set so the fast path keeps working offline;
// --all-corpora adds the pinned fetch-based ones.
const ALL = [...VENDORED, ...FETCHED];

if (isDirect) {
// `--list` prints the corpus names as JSON so CI can build its matrix from
// this manifest. A hand-copied list in the workflow would drift the moment a
// corpus is added here, and the drift would look like a corpus that stopped
// being measured.
if (args.get('list') === 'true') {
  console.log(JSON.stringify(ALL.map(v => v.corpus)));
  process.exit(0);
}

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
    if (row.fn > 0) {
      const shown = row.missed_cases.slice(0, 8);
      const more = row.missed_cases.length - shown.length;
      console.log(`  defects: ${row.missed_cases.length} labelled case(s) not detected: ${shown.join(', ')}${more ? `, and ${more} more` : ''}`);
    }
    fs.writeFileSync(path.join(outDir, `${v.corpus}.scan.json`), JSON.stringify(row._report, null, 2));
  }
  delete row._report;
  fs.writeFileSync(path.join(outDir, `${v.corpus}.scorecard.json`), JSON.stringify(row, null, 2));
  rows.push(row);
}

const scored = rows.filter(r => !r.error && !r.skipped);
const headline = scored.filter(r => !r.excluded_from_overall);
const excluded = scored.filter(r => r.excluded_from_overall);
const sum = (k, list = headline) => list.reduce((a, r) => a + r[k], 0);
const totals = { total_cases: sum('tests'), true_positives: sum('tp'), true_negatives_known: sum('tn'), false_positives: sum('fp'), false_negatives: sum('fn') };
const pct = (n, d) => (d > 0 ? `${((n / d) * 100).toFixed(1)}%` : '0.0%');

// `--version` prints `cognium-dev vX.Y.Z`, then a build line, then attribution.
// Only that first shape counts. A semver anywhere else in the output is not
// the engine that ran.
let version = 'unknown';
try {
  version = toolVersion(execFileSync('node', [cli, '--version'], { encoding: 'utf8' })) ?? 'unknown';
} catch { /* keep unknown */ }

const summary = {
  run_at: new Date().toISOString(),
  // The CLI path is a throwaway build location. The version plus the commit
  // and ref, when the caller passes them, say which engine ran.
  tool: {
    name: 'cognium-dev',
    version,
    ...(args.get('sha') ? { sha: args.get('sha') } : {}),
    ...(args.get('ref') ? { ref: args.get('ref') } : {}),
  },
  scope: selected.some(v => v.repo)
    ? 'vendored corpora plus pinned fetch-based corpora'
    : 'vendored synthetic corpora only',
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
    total_elapsed_ms: scored.reduce((a, r) => a + r.elapsed_ms, 0),
  },
  results: rows,
};

fs.writeFileSync(path.join(outDir, 'run-summary.json'), JSON.stringify(summary, null, 2));

console.log(`\n${'='.repeat(72)}`);
console.log(`cognium-dev ${version} — ${scored.length} corpora, ${totals.total_cases} cases`);
console.log(`TP ${totals.true_positives}  FN ${totals.false_negatives}  FP ${totals.false_positives}  TN ${totals.true_negatives_known}`);
console.log(`overall TPR ${summary.summary.overall_tpr}   FPR ${summary.summary.overall_fpr}   ${(summary.summary.total_elapsed_ms / 1000).toFixed(1)}s`);
if (excluded.length) { const x = summary.summary.excluded_from_overall; console.log(`not in overall: ${x.corpora.join(', ')} — ${x.total_cases} cases, TPR ${x.tpr}`); }
if (summary.summary.errored_benchmarks > 0) console.log(`errored: ${rows.filter(r => r.error).map(r => r.corpus).join(', ')}`);
console.log(`written to ${path.relative(process.cwd(), outDir)}/`);
}
