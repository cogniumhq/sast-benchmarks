#!/usr/bin/env node
// Validates every results/<date>/results.json in this repository.
//
// Checks (no dependencies, so it runs anywhere Node 18+ does):
//   1. required fields from schemas/result.schema.json are present
//   2. per-row TP/TN/FP/FN/tests add up to the summary block
//   3. language_summary rows add up to the Total row
//   4. every path under `artifacts` exists in the repository
//   5. every row has a benchmarks/<slug>/ and datasets/<slug>/ folder
//
// Exit code 1 on any failure. Run: node scripts/validate-results.mjs

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const problems = [];
const fail = (file, msg) => problems.push(`${file}: ${msg}`);

// Page row name -> folder slug shared by benchmarks/ and datasets/.
const SLUG = {
  'OWASP Benchmark': 'owasp-benchmark-java',
  'Juliet Test Suite': 'juliet-java',
  'SecuriBench Micro': 'securibench-micro',
  'CWE-Bench-Java': 'cwe-bench-java',
  'WebGoat': 'webgoat',
  'DVJA': 'dvja',
  'NodeGoat': 'nodegoat',
  'Juice Shop': 'juice-shop',
  'NodeJS Synthetic': 'nodejs-synthetic',
  'PyGoat': 'pygoat',
  'DVPWA': 'dvpwa',
  'Rust Synthetic': 'rust-synthetic',
  'CWE-Bench-Rust': 'cwe-bench-rust',
  'Bash Synthetic': 'bash-synthetic',
  'HTML/JS Synthetic': 'html-js-synthetic',
  'Firing Range': 'firing-range',
  'Go Synthetic': 'go-synthetic',
  'Vulnerability-goapp': 'vulnerability-goapp',
  'C# Synthetic': 'csharp-synthetic',
  'Juliet C# (NIST, baseline _01)': 'juliet-csharp',
};

const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas/result.schema.json'), 'utf8'));
const sum = (rows, k) => rows.reduce((a, r) => a + (typeof r[k] === 'number' ? r[k] : 0), 0);

const resultFiles = fs.readdirSync(path.join(root, 'results'))
  .map((d) => path.join('results', d, 'results.json'))
  .filter((p) => fs.existsSync(path.join(root, p)));

for (const rel of resultFiles) {
  let j;
  try {
    j = JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
  } catch (e) {
    fail(rel, `invalid JSON: ${e.message}`);
    continue;
  }

  // 1. schema required fields (top level + nested `required` arrays)
  for (const k of schema.required) if (!(k in j)) fail(rel, `missing required field "${k}"`);
  for (const [k, def] of Object.entries(schema.properties)) {
    if (def.required && j[k]) for (const r of def.required) if (!(r in j[k])) fail(rel, `missing "${k}.${r}"`);
  }

  // 2. row sums vs summary
  if (Array.isArray(j.results) && j.summary) {
    const checks = {
      total_cases: sum(j.results, 'tests'),
      true_positives: sum(j.results, 'tp'),
      false_negatives: sum(j.results, 'fn'),
      false_positives: sum(j.results, 'fp'),
      true_negatives_known: sum(j.results, 'tn'),
      total_benchmarks: j.results.length,
    };
    for (const [k, v] of Object.entries(checks)) {
      if (k in j.summary && j.summary[k] !== v) fail(rel, `summary.${k}=${j.summary[k]} but rows sum to ${v}`);
    }
    for (const r of j.results) {
      if (typeof r.tp === 'number' && typeof r.fn === 'number' && r.tpr) {
        const tpr = (100 * r.tp) / (r.tp + r.fn);
        const stated = parseFloat(r.tpr);
        if (Math.abs(tpr - stated) > 0.1) fail(rel, `${r.benchmark}: TPR ${r.tpr} but TP/(TP+FN) = ${tpr.toFixed(1)}%`);
      }
      if (typeof r.fp === 'number' && typeof r.tn === 'number' && r.fpr) {
        const fpr = (100 * r.fp) / (r.fp + r.tn);
        const stated = parseFloat(r.fpr);
        if (Math.abs(fpr - stated) > 0.1) fail(rel, `${r.benchmark}: FPR ${r.fpr} but FP/(FP+TN) = ${fpr.toFixed(1)}%`);
      }
      if (Array.isArray(r.categories)) {
        for (const k of ['tp', 'tn', 'fp', 'fn']) {
          const c = sum(r.categories, k);
          if (typeof r[k] === 'number' && c !== r[k]) fail(rel, `${r.benchmark}: categories ${k} sum ${c} != row ${r[k]}`);
        }
      }
      // 5. folder per row
      const slug = SLUG[r.benchmark];
      if (!slug) fail(rel, `${r.benchmark}: no slug mapping in scripts/validate-results.mjs`);
      else for (const dir of ['benchmarks', 'datasets']) {
        if (!fs.existsSync(path.join(root, dir, slug, 'README.md'))) fail(rel, `${r.benchmark}: missing ${dir}/${slug}/README.md`);
      }
    }
  }

  // 3. language summary
  if (Array.isArray(j.language_summary)) {
    const total = j.language_summary.find((x) => x.language === 'Total');
    const rows = j.language_summary.filter((x) => x.language !== 'Total');
    if (total) for (const k of ['perfect_100', 'at_or_above_90', 'total_benchmarks']) {
      const s = sum(rows, k);
      if (s !== total[k]) fail(rel, `language_summary Total.${k}=${total[k]} but rows sum to ${s}`);
    }
    if (total && Array.isArray(j.results) && total.total_benchmarks !== j.results.length) {
      fail(rel, `language_summary total ${total.total_benchmarks} != ${j.results.length} result rows`);
    }
    if (Array.isArray(j.results)) {
      const perfect = j.results.filter((r) => parseFloat(r.score) === 100).length;
      const near = j.results.filter((r) => parseFloat(r.score) >= 90).length;
      if (total && total.perfect_100 !== perfect) fail(rel, `perfect_100=${total.perfect_100} but ${perfect} rows score 100%`);
      if (total && total.at_or_above_90 !== near) fail(rel, `at_or_above_90=${total.at_or_above_90} but ${near} rows score >= 90%`);
    }
  }

  // 4. artifacts exist
  if (j.artifacts) for (const [k, p] of Object.entries(j.artifacts)) {
    if (typeof p === 'string' && !fs.existsSync(path.join(root, p))) fail(rel, `artifacts.${k} -> "${p}" does not exist`);
  }
}

if (resultFiles.length === 0) problems.push('no results/*/results.json files found');
if (problems.length) {
  console.error(`FAIL (${problems.length})`);
  for (const p of problems) console.error(' - ' + p);
  process.exit(1);
}
console.log(`OK: ${resultFiles.length} result set(s) validated: ${resultFiles.join(', ')}`);
