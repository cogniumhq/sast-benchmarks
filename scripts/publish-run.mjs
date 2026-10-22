#!/usr/bin/env node
// Turn a detection-quality run-summary into a dated result set.
//
// The nightly sweep uploads artifacts and does not commit. The monthly run,
// and a workflow_dispatch with publish=true, call this so the measurement
// lands in the repository the benchmark page reads.
//
//   node scripts/publish-run.mjs \
//     --run results/<date>-detection-quality/run-summary.json \
//     --date YYYY-MM-DD --sha <cognium-dev commit> \
//     [--scans <dir of *.scan.json>] [--index]
//
//   node scripts/publish-run.mjs --check \
//     --run results/2026-10-22-detection-quality/run-summary.json \
//     --expect results/2026-10-22/results.json \
//     --date 2026-10-22 --sha <commit>
//
// Exit 0: wrote results/<date>/results.json (or --check matched).
// Exit 2: a corpus did not score. Writes summary.md only, no results.json,
//         so validate-results.mjs does not treat a partial sweep as published.
// Exit 1: usage, an unnamed corpus, or a --check mismatch.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const a = process.argv[i];
  if (!a.startsWith('--')) continue;
  const next = process.argv[i + 1];
  if (next && !next.startsWith('--')) { args.set(a.slice(2), next); i += 1; } else args.set(a.slice(2), 'true');
}

const root = path.resolve(new URL('..', import.meta.url).pathname);

// Display name and catalog language for every corpus the sweep can score.
// The display name must stay a key in scripts/validate-results.mjs SLUG, and
// the corpus id is the benchmarks/ and datasets/ folder.
const PUBLISHED = [
  ['owasp-benchmark-java', 'OWASP Benchmark', 'Java'],
  ['securibench-micro', 'SecuriBench Micro', 'Java'],
  ['webgoat', 'WebGoat', 'Java'],
  ['dvja', 'DVJA', 'Java'],
  ['nodegoat', 'NodeGoat', 'Node.js / TypeScript'],
  ['juice-shop', 'Juice Shop', 'Node.js / TypeScript'],
  ['nodejs-synthetic', 'NodeJS Synthetic', 'Node.js / TypeScript'],
  ['pygoat', 'PyGoat', 'Python'],
  ['rust-synthetic', 'Rust Synthetic', 'Rust'],
  ['cwe-bench-rust', 'CWE-Bench-Rust', 'Rust'],
  ['bash-synthetic', 'Bash Synthetic', 'Bash'],
  ['html-js-synthetic', 'HTML/JS Synthetic', 'HTML/JS'],
  ['go-synthetic', 'Go Synthetic', 'Go'],
  ['vulnerability-goapp', 'Vulnerability-goapp', 'Go'],
  ['csharp-synthetic', 'C# Synthetic', 'C#/.NET'],
  ['juliet-csharp', 'Juliet C# (NIST, default config)', 'C#/.NET'],
];
const BY_CORPUS = new Map(PUBLISHED.map(([corpus, benchmark, language]) => [corpus, { benchmark, language }]));

const fail = (msg, code = 1) => { console.error(msg); process.exit(code); };

const runPath = args.get('run');
const date = args.get('date');
const sha = args.get('sha') || '';
if (!runPath || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
  fail('usage: publish-run.mjs --run <run-summary.json> --date YYYY-MM-DD [--sha <commit>] [--scans <dir>] [--index] [--check --expect <results.json>]');
}

const summary = JSON.parse(fs.readFileSync(path.resolve(root, runPath), 'utf8'));
const version = summary.tool?.version || 'unknown';
const short = sha ? sha.slice(0, 7) : 'unknown';
const errored = (summary.results || []).filter((r) => r.error);

const validatorSrc = fs.readFileSync(path.join(root, 'scripts/validate-results.mjs'), 'utf8');
for (const [, benchmark] of PUBLISHED) {
  if (!validatorSrc.includes(`'${benchmark}':`)) {
    fail(`${benchmark} is not a SLUG key in scripts/validate-results.mjs`);
  }
}

function buildRows() {
  const byCorpus = new Map((summary.results || []).map((r) => [r.corpus, r]));
  const unknown = [...byCorpus.keys()].filter((c) => !BY_CORPUS.has(c) && !byCorpus.get(c).error);
  if (unknown.length) {
    fail(`no published name for: ${unknown.join(', ')}. Add them to PUBLISHED in scripts/publish-run.mjs and to SLUG in scripts/validate-results.mjs`);
  }
  const rows = [];
  for (const [corpus] of PUBLISHED) {
    const r = byCorpus.get(corpus);
    if (!r || r.error) continue;
    // No scored negatives: FP/(FP+TN) is undefined, and the validator rejects a stated 0%.
    const recall = r.recall_only === true || ((r.fp ?? 0) === 0 && (r.tn ?? 0) === 0);
    const row = {
      language: BY_CORPUS.get(corpus).language,
      benchmark: BY_CORPUS.get(corpus).benchmark,
      corpus,
      tests: r.tests,
      tp: r.tp,
      tn: recall ? null : r.tn,
      fp: recall ? null : r.fp,
      fn: r.fn,
      tpr: r.tpr,
      fpr: recall ? null : r.fpr,
      score: r.score,
      score_rule: recall
        ? 'recall only; default taint config; every scored file is a positive'
        : r.score_rule,
      categories: r.categories || [],
    };
    if (r.dataset_revision) row.dataset_revision = r.dataset_revision;
    if (r.config_note) row.config_note = r.config_note;
    rows.push(row);
  }
  // A corpus that scored but is not in PUBLISHED already failed above.
  // Corpora in PUBLISHED that this run did not include are simply absent;
  // an errored one is reported by the caller and blocks results.json.
  return rows;
}

function languageSummary(rows) {
  const order = [];
  const buckets = new Map();
  for (const r of rows) {
    if (!buckets.has(r.language)) { buckets.set(r.language, []); order.push(r.language); }
    buckets.get(r.language).push(r);
  }
  const langs = order.map((language) => {
    const list = buckets.get(language);
    return {
      language,
      perfect_100: list.filter((r) => parseFloat(r.score) === 100).length,
      at_or_above_90: list.filter((r) => parseFloat(r.score) >= 90).length,
      total_benchmarks: list.length,
    };
  });
  langs.push({
    language: 'Total',
    perfect_100: langs.reduce((a, r) => a + r.perfect_100, 0),
    at_or_above_90: langs.reduce((a, r) => a + r.at_or_above_90, 0),
    total_benchmarks: rows.length,
  });
  return langs;
}

const num = (v) => (typeof v === 'number' ? v : 0);
const same = (a, b) => (a == null && b == null) || a === b;

if (args.get('check') === 'true') {
  const expectPath = args.get('expect');
  if (!expectPath) fail('--check requires --expect <results.json>');
  const expect = JSON.parse(fs.readFileSync(path.resolve(root, expectPath), 'utf8'));
  const rows = buildRows();
  const problems = [];
  const byName = new Map(rows.map((r) => [r.benchmark, r]));
  if (rows.length !== (expect.results || []).length) problems.push(`row count ${rows.length} != ${expect.results.length}`);
  for (const e of expect.results || []) {
    const r = byName.get(e.benchmark);
    if (!r) { problems.push(`missing ${e.benchmark}`); continue; }
    for (const k of ['tests', 'tp', 'tn', 'fp', 'fn', 'tpr', 'fpr', 'score', 'language']) {
      if (!same(r[k], e[k])) problems.push(`${e.benchmark}.${k}: generated ${r[k]} != published ${e[k]}`);
    }
  }
  const totals = {
    total_cases: rows.reduce((a, r) => a + num(r.tests), 0),
    true_positives: rows.reduce((a, r) => a + num(r.tp), 0),
    true_negatives_known: rows.reduce((a, r) => a + num(r.tn), 0),
    false_positives: rows.reduce((a, r) => a + num(r.fp), 0),
    false_negatives: rows.reduce((a, r) => a + num(r.fn), 0),
  };
  for (const [k, v] of Object.entries(totals)) {
    if (expect.summary?.[k] !== v) problems.push(`summary.${k}: generated ${v} != published ${expect.summary?.[k]}`);
  }
  if (problems.length) fail(problems.join('\n'));
  console.log(`check ok: ${rows.length} rows match ${expectPath}`);
  process.exit(0);
}

const sweepDir = path.join(root, 'results', `${date}-detection-quality`);
const outDir = path.join(root, 'results', date);
const rawDir = path.join(root, 'raw', date);
fs.mkdirSync(sweepDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

const sweepReadme = errored.length
  ? `# Detection-quality sweep — ${date}\n\nScorecards for a run that did not publish \`results.json\`. Corpora that did not score: ${errored.map((r) => r.corpus).join(', ')}.\n`
  : `# Detection-quality sweep — ${date}\n\nMachine output behind [\`../${date}/\`](../${date}/summary.md). cognium-dev ${version}${sha ? `, commit \`${short}\`` : ''}.\n\nThis folder keeps \`run-summary.json\` and one scorecard per corpus. \`scripts/validate-results.mjs\` validates \`results/${date}/results.json\`.\n\nRaw scan JSON, when the sweep uploaded it, is gzipped under \`raw/${date}/<corpus>.scan.json.gz\`.\n`;
fs.writeFileSync(path.join(sweepDir, 'README.md'), sweepReadme);

if (errored.length) {
  const names = errored.map((r) => `${r.corpus} (${r.error})`).join('\n- ');
  fs.writeFileSync(path.join(outDir, 'summary.md'), `# Detection-quality sweep ${date}\n\nThis run did not publish \`results.json\`. A corpus that did not score is not a measured rate, and omitting it would publish a smaller suite than the sweep ran.\n\n- ${names}\n\nScorecards: \`results/${date}-detection-quality/\`.\n`);
  console.error(`incomplete sweep, no results.json: ${errored.map((r) => r.corpus).join(', ')}`);
  process.exit(2);
}

const rows = buildRows();
const langs = languageSummary(rows);
const pins = rows.filter((r) => r.dataset_revision).map((r) => `${r.corpus} ${r.dataset_revision}`).join('; ');
const doc = {
  published_at: date,
  run_at: summary.run_at,
  source_url: `https://github.com/cogniumhq/sast-benchmarks/tree/main/results/${date}`,
  benchmark: {
    name: 'cognium-dev SAST Benchmarks — detection-quality sweep',
    source_url: 'https://cognium.dev/benchmark/',
    revision: 'scripts/run-corpus.mjs per corpus, merged by scripts/merge-scorecards.mjs',
  },
  dataset: {
    name: 'Vendored synthetic corpora plus pinned fetch-based corpora',
    revision: pins ? `${pins}; vendored synthetic corpora are the copies committed under datasets/` : 'vendored synthetic corpora under datasets/',
    source_url: 'https://github.com/cogniumhq/sast-benchmarks',
  },
  tool: {
    name: 'cognium-dev',
    package: 'cognium-dev',
    version,
    source_url: 'https://github.com/cogniumhq/cognium-dev',
    release_commit: sha,
    configuration: 'static analysis only; default taint config; no LLM. Juliet C# is recall-only under that default config.',
    command: `node scripts/run-corpus.mjs --cli <cognium-dev ${short} packages/cli/dist/cli.js> --corpus <name> --out results/run/<name> && node scripts/merge-scorecards.mjs --version ${version} --out results/${date}-detection-quality && node scripts/publish-run.mjs --run results/${date}-detection-quality/run-summary.json --date ${date} --sha ${sha}`,
    runtime: 'GitHub Actions, node:22-bookworm',
  },
  summary: {
    total_cases: rows.reduce((a, r) => a + num(r.tests), 0),
    true_positives: rows.reduce((a, r) => a + num(r.tp), 0),
    true_negatives_known: rows.reduce((a, r) => a + num(r.tn), 0),
    false_positives: rows.reduce((a, r) => a + num(r.fp), 0),
    false_negatives: rows.reduce((a, r) => a + num(r.fn), 0),
    total_benchmarks: rows.length,
    perfect_benchmarks: langs.at(-1).perfect_100,
    benchmarks_at_or_above_90_percent: langs.at(-1).at_or_above_90,
    languages: langs.length - 1,
    overall_tpr: summary.summary?.overall_tpr,
    overall_fpr: summary.summary?.overall_fpr,
  },
  results: rows,
  language_summary: langs,
  artifacts: {
    raw_output: `raw/${date}/`,
    summary_markdown: `results/${date}/summary.md`,
    summary_csv: `results/${date}/results.csv`,
    scorecards: `results/${date}-detection-quality/`,
  },
  limitations: [
    'Static analysis only, default taint configuration, no LLM in detection or verification.',
    'A case counts as flagged when at least one finding lands in its file with exactly the expected CWE. Findings without a CWE are dropped.',
    'The frozen regression baseline (baseline/detection-quality.json) is not updated by this publish.',
    'Juliet C# is the full src/testcases tree under the default taint config, recall only. The 2026-09-11 Juliet row is the _01 variant with the corpus source and sink signatures loaded.',
    'Aggregate TPR and FPR add every corpus together, including recall-only Juliet. Quote a per-benchmark row for a rate that belongs to one dataset.',
  ],
};

const cell = (v) => (v == null ? 'n/a' : String(v));
const csv = [
  'published_at,source_url,tool,tool_version,mode,llm_verification,language,benchmark,tests,tp,tn,fp,fn,tpr,fpr,score',
  ...rows.map((r) => [
    date,
    `https://github.com/cogniumhq/sast-benchmarks/tree/main/results/${date}`,
    'cognium-dev',
    version,
    'static-analysis',
    'false',
    r.language.includes(',') ? `"${r.language}"` : r.language,
    r.benchmark.includes(',') ? `"${r.benchmark}"` : r.benchmark,
    r.tests, r.tp, cell(r.tn), cell(r.fp), r.fn, r.tpr, cell(r.fpr), r.score,
  ].join(',')),
];

function mdTable(headers, body) {
  const line = (cells) => `| ${cells.join(' | ')} |`;
  return [
    line(headers),
    line(headers.map(() => '---')),
    ...body.map(line),
  ].join('\n');
}
const dash = (v) => (v == null ? 'n/a' : String(v));
const summaryMd = [
  `# cognium-dev SAST Benchmark Results: ${date}`,
  '',
  `Detection-quality sweep on cognium-dev ${version}${sha ? ` (commit \`${short}\`)` : ''}. ${rows.length} corpora, ${doc.summary.total_cases} cases. Static analysis only, default taint configuration, no LLM.`,
  '',
  '## Scope',
  '',
  `- Tool: cognium-dev ${version}`,
  sha ? `- Engine commit: \`${sha}\`` : null,
  '- Mode: static analysis, default taint configuration, no LLM',
  `- Command: \`node scripts/publish-run.mjs --run results/${date}-detection-quality/run-summary.json --date ${date}\``,
  '- Runtime: GitHub Actions, node:22-bookworm',
  summary.run_at ? `- Run: \`${summary.run_at}\`` : null,
  `- Scorecards: \`results/${date}-detection-quality/\``,
  `- Raw scan JSON (gzip): \`raw/${date}/\``,
  '',
  'A case is flagged when a finding lands in its file with exactly the expected CWE. Score = TPR − FPR where the corpus has safe cases.',
  '',
  '## Results by benchmark',
  '',
  mdTable(
    ['Language', 'Benchmark', 'Tests', 'TP', 'TN', 'FP', 'FN', 'TPR', 'FPR', 'Score'],
    rows.map((r) => [r.language, r.benchmark, r.tests, r.tp, dash(r.tn), dash(r.fp), r.fn, r.tpr, dash(r.fpr), r.score]),
  ),
  '',
  `Together: TP ${doc.summary.true_positives}, FN ${doc.summary.false_negatives}, FP ${doc.summary.false_positives}, TN ${doc.summary.true_negatives_known} (TPR ${doc.summary.overall_tpr}, FPR ${doc.summary.overall_fpr}).`,
  '',
  '## Language summary',
  '',
  mdTable(
    ['Language', 'Perfect 100%', '90%+', 'Total benchmarks'],
    langs.map((r) => [r.language, r.perfect_100, r.at_or_above_90, r.total_benchmarks]),
  ),
  '',
  '## Known limits',
  '',
  ...doc.limitations.map((l) => `- ${l}`),
  '',
].filter((l) => l != null).join('\n');

fs.mkdirSync(rawDir, { recursive: true });
const scanRoot = args.get('scans');
let gzipped = 0;
if (scanRoot) {
  const abs = path.resolve(root, scanRoot);
  const found = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith('.scan.json')) found.push(p);
    }
  };
  walk(abs);
  for (const file of found) {
    const base = path.basename(file, '.scan.json');
    fs.writeFileSync(path.join(rawDir, `${base}.scan.json.gz`), zlib.gzipSync(fs.readFileSync(file), { level: 9 }));
    gzipped += 1;
  }
}
if (!fs.existsSync(path.join(rawDir, 'README.md'))) {
  fs.writeFileSync(path.join(rawDir, 'README.md'), gzipped
    ? `# Raw scans — ${date}\n\nGzipped cognium-dev scan JSON from the detection-quality sweep. One \`<corpus>.scan.json.gz\` per corpus.\n`
    : `# Raw scans — ${date}\n\nNo scan JSON was attached to this run. Scorecards are in \`results/${date}-detection-quality/\`.\n`);
}

fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify(doc, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, 'results.csv'), csv.join('\n') + '\n');
fs.writeFileSync(path.join(outDir, 'summary.md'), summaryMd);

if (args.get('index') === 'true') {
  const indexPath = path.join(root, 'results/README.md');
  const index = fs.readFileSync(indexPath, 'utf8');
  const start = '<!-- automated-sweeps:start -->';
  const end = '<!-- automated-sweeps:end -->';
  if (!index.includes(start) || !index.includes(end)) fail(`results/README.md is missing ${start} / ${end}`);
  const bullet = `- \`${date}\`: cognium-dev ${version} (\`${short}\`) detection-quality sweep, ${rows.length} corpora, ${doc.summary.total_cases} cases, TPR ${doc.summary.overall_tpr} / FPR ${doc.summary.overall_fpr}. Scorecards in \`${date}-detection-quality/\`.`;
  const block = index.slice(index.indexOf(start) + start.length, index.indexOf(end));
  const lines = block.split('\n').filter((l) => l.startsWith('- `') && !l.startsWith(`- \`${date}\``));
  lines.push(bullet);
  lines.sort();
  const next = index.slice(0, index.indexOf(start) + start.length) + `\n${lines.join('\n')}\n` + index.slice(index.indexOf(end));
  fs.writeFileSync(indexPath, next);
}

console.log(`published results/${date}/  ${rows.length} corpora, ${doc.summary.total_cases} cases, TPR ${doc.summary.overall_tpr} FPR ${doc.summary.overall_fpr}, ${gzipped} raw scans`);
