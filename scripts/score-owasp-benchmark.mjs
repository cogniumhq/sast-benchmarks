#!/usr/bin/env node
// Score a SAST tool's output against the OWASP Benchmark ground truth using the
// official scorecard rule: a test case counts as flagged when at least one
// finding lands in its file (BenchmarkTestNNNNN) with exactly the test case's
// CWE. Every one of the 2,740 v1.2 cases is scored — there is no category
// subsetting — so results from different tools are comparable.
//
//   TP  vulnerable case flagged          FN  vulnerable case not flagged
//   FP  safe case flagged                TN  safe case not flagged
//   TPR = TP/(TP+FN)   FPR = FP/(FP+TN)   Youden (OWASP "score") = TPR − FPR
//
// Input findings can come from:
//   --cognium-dev-json <scan.json>   cognium-dev `scan -f json` output
//   --sarif <file.sarif>             any SARIF 2.1.0 producer (CodeQL, Semgrep,
//                                    SpotBugs/Find-Sec-Bugs, ...) — the CWE is
//                                    read from rule tags / properties
//   --findings <normalized.json>     [{ "file", "cwe", "line", "rule" }]
//
// Usage:
//   node scripts/score-owasp-benchmark.mjs --tool cognium-dev --tool-version 4.9.13 \
//     --cognium-dev-json raw/<date>/cognium-dev-owasp-java.json --out results/<date>/owasp-java
//
// Writes <out>/<tool>.scorecard.json, <out>/<tool>.scorecard.md,
// <out>/<tool>.per-cwe.csv and <out>/<tool>.normalized-findings.json.

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
const expectedPath = args.get('expected') || path.join(root, 'datasets/owasp-benchmark-java/expectedresults-1.2.csv');
const tool = args.get('tool') || 'unknown-tool';
const toolVersion = args.get('tool-version') || 'unknown';
const outDir = args.get('out') || `results/${new Date().toISOString().slice(0, 10)}/owasp-java`;
const TEST_RE = /(BenchmarkTest\d{5})/;

// ---------- ground truth ----------
const cases = new Map(); // name -> { category, cwe, vulnerable }
for (const line of fs.readFileSync(expectedPath, 'utf8').split('\n')) {
  const cols = line.split(',');
  if (!cols[0] || !cols[0].startsWith('BenchmarkTest')) continue;
  cases.set(cols[0].trim(), { category: cols[1].trim(), cwe: Number(cols[3]), vulnerable: cols[2].trim() === 'true' });
}
if (cases.size === 0) { console.error(`no test cases in ${expectedPath}`); process.exit(1); }

// ---------- adapters -> normalized findings ----------
const cweNum = (v) => { const m = String(v ?? '').match(/(\d+)/); return m ? Number(m[1]) : null; };

function fromCogniumDev(file) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  const out = [];
  for (const r of j.results || []) {
    for (const v of r.vulnerabilities || []) {
      if (!v.cwe) continue; // quality findings carry no CWE and cannot match a case
      out.push({ file: r.file, cwe: cweNum(v.cwe), line: v.line ?? null, rule: v.type });
    }
  }
  return out;
}

function fromSarif(file) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  const out = [];
  for (const run of j.runs || []) {
    const rules = new Map();
    const driverRules = run.tool?.driver?.rules || [];
    const extRules = (run.tool?.extensions || []).flatMap((e) => e.rules || []);
    for (const rule of [...driverRules, ...extRules]) {
      const tags = rule.properties?.tags || [];
      let cwe = null;
      for (const t of tags) { const m = String(t).match(/cwe[-_/ ]?0*(\d+)/i); if (m) { cwe = Number(m[1]); break; } }
      if (cwe === null && rule.properties?.cwe) cwe = cweNum(Array.isArray(rule.properties.cwe) ? rule.properties.cwe[0] : rule.properties.cwe);
      if (cwe === null) for (const rel of rule.relationships || []) { const m = String(rel.target?.id ?? '').match(/^0*(\d+)$/); if (m) { cwe = Number(m[1]); break; } }
      rules.set(rule.id, cwe);
    }
    for (const res of run.results || []) {
      const loc = res.locations?.[0]?.physicalLocation;
      const uri = loc?.artifactLocation?.uri || '';
      let cwe = rules.has(res.ruleId) ? rules.get(res.ruleId) : null;
      if (cwe === null) { const m = String(res.ruleId ?? '').match(/cwe[-_/ ]?0*(\d+)/i); if (m) cwe = Number(m[1]); }
      if (cwe === null && res.properties?.cwe) cwe = cweNum(res.properties.cwe);
      out.push({ file: uri, cwe, line: loc?.region?.startLine ?? null, rule: res.ruleId ?? null });
    }
  }
  return out;
}

let findings;
if (args.get('cognium-dev-json')) findings = fromCogniumDev(args.get('cognium-dev-json'));
else if (args.get('sarif')) findings = fromSarif(args.get('sarif'));
else if (args.get('findings')) findings = JSON.parse(fs.readFileSync(args.get('findings'), 'utf8'));
else { console.error('need --cognium-dev-json, --sarif or --findings'); process.exit(1); }

// ---------- scoring ----------
const flagged = new Map(); // case -> Set(cwe)
let matched = 0, unmapped = 0, noCwe = 0;
for (const f of findings) {
  const m = TEST_RE.exec(f.file || '');
  if (!m) { unmapped += 1; continue; }
  if (f.cwe === null || f.cwe === undefined) { noCwe += 1; continue; }
  if (!flagged.has(m[1])) flagged.set(m[1], new Set());
  flagged.get(m[1]).add(f.cwe);
  matched += 1;
}

const perCat = new Map();
const totals = { tp: 0, fp: 0, fn: 0, tn: 0 };
const lists = { tp: [], fp: [], fn: [] };
for (const [name, c] of cases) {
  const key = `${c.category} CWE-${c.cwe}`;
  if (!perCat.has(key)) perCat.set(key, { category: c.category, cwe: c.cwe, tp: 0, fp: 0, fn: 0, tn: 0 });
  const p = perCat.get(key);
  const hit = flagged.get(name)?.has(c.cwe) ?? false;
  const k = c.vulnerable ? (hit ? 'tp' : 'fn') : (hit ? 'fp' : 'tn');
  p[k] += 1; totals[k] += 1; if (lists[k]) lists[k].push(name);
}
const pct = (n, d) => (d > 0 ? (100 * n) / d : 0);
const metrics = (t) => {
  const tpr = pct(t.tp, t.tp + t.fn), fpr = pct(t.fp, t.fp + t.tn), prec = pct(t.tp, t.tp + t.fp);
  const f1 = prec + tpr > 0 ? (2 * prec * tpr) / (prec + tpr) : 0;
  return { tpr, fpr, precision: prec, f1, youden: tpr - fpr };
};
const overall = metrics(totals);
const rows = [...perCat.values()].sort((a, b) => a.category.localeCompare(b.category)).map((p) => ({ ...p, ...metrics(p) }));

// ---------- output ----------
fs.mkdirSync(outDir, { recursive: true });
const f1 = (x) => x.toFixed(1) + '%';
const scorecard = {
  benchmark: 'OWASP Benchmark Java v1.2',
  scoring_rule: 'file-level match on BenchmarkTestNNNNN with exact CWE; all 2,740 cases; Youden = TPR - FPR',
  ground_truth: path.relative(root, expectedPath),
  tool, tool_version: toolVersion,
  generated_at: new Date().toISOString(),
  cases: cases.size,
  findings_total: findings.length,
  findings_mapped_to_cases: matched,
  findings_outside_test_cases: unmapped,
  findings_without_cwe: noCwe,
  totals, overall: Object.fromEntries(Object.entries(overall).map(([k, v]) => [k, Number(v.toFixed(2))])),
  per_category: rows.map((r) => ({ ...r, tpr: +r.tpr.toFixed(2), fpr: +r.fpr.toFixed(2), precision: +r.precision.toFixed(2), f1: +r.f1.toFixed(2), youden: +r.youden.toFixed(2) })),
  fn_cases: lists.fn, fp_cases: lists.fp,
};
fs.writeFileSync(path.join(outDir, `${tool}.scorecard.json`), JSON.stringify(scorecard, null, 2) + '\n');
fs.writeFileSync(path.join(outDir, `${tool}.normalized-findings.json`), JSON.stringify(findings.map((x) => ({ ...x, file: x.file.replace(/.*\/(BenchmarkTest\d{5}\.java)$/, '$1') })), null, 0) + '\n');
const csv = ['tool,tool_version,category,cwe,total,vulnerable,tp,fp,fn,tn,tpr,fpr,precision,f1,youden',
  ...rows.map((r) => [tool, toolVersion, r.category, `CWE-${r.cwe}`, r.tp + r.fp + r.fn + r.tn, r.tp + r.fn, r.tp, r.fp, r.fn, r.tn, f1(r.tpr), f1(r.fpr), f1(r.precision), f1(r.f1), f1(r.youden)].join(',')),
  [tool, toolVersion, 'TOTAL', '', cases.size, totals.tp + totals.fn, totals.tp, totals.fp, totals.fn, totals.tn, f1(overall.tpr), f1(overall.fpr), f1(overall.precision), f1(overall.f1), f1(overall.youden)].join(',')].join('\n') + '\n';
fs.writeFileSync(path.join(outDir, `${tool}.per-cwe.csv`), csv);
const md = `# OWASP Benchmark Java v1.2 — ${tool} ${toolVersion}

Scoring rule: a test case is flagged when at least one finding lands in its file with exactly the expected CWE. All ${cases.size} cases scored. Youden = TPR − FPR (the OWASP scorecard "score").

| Cases | TP | FP | FN | TN | TPR (recall) | FPR | Precision | F1 | Youden |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| ${cases.size} | ${totals.tp} | ${totals.fp} | ${totals.fn} | ${totals.tn} | ${f1(overall.tpr)} | ${f1(overall.fpr)} | ${f1(overall.precision)} | ${f1(overall.f1)} | ${f1(overall.youden)} |

Findings: ${findings.length} total, ${matched} inside test cases with a CWE, ${noCwe} without a CWE (ignored), ${unmapped} outside test-case files (ignored).

## By category

| Category | CWE | Cases | Vuln | TP | FP | FN | TN | TPR | FPR | Precision | Youden |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows.map((r) => `| ${r.category} | CWE-${r.cwe} | ${r.tp + r.fp + r.fn + r.tn} | ${r.tp + r.fn} | ${r.tp} | ${r.fp} | ${r.fn} | ${r.tn} | ${f1(r.tpr)} | ${f1(r.fpr)} | ${f1(r.precision)} | ${f1(r.youden)} |`).join('\n')}
`;
fs.writeFileSync(path.join(outDir, `${tool}.scorecard.md`), md);
console.log(md);
console.log(`wrote ${outDir}/${tool}.{scorecard.json,scorecard.md,per-cwe.csv,normalized-findings.json}`);
