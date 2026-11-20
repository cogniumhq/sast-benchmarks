import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'compare-baseline.mjs');

function run(dir) {
  const defects = path.join(dir, 'defects.md');
  const out = execFileSync(process.execPath, [
    script,
    '--run', path.join(dir, 'run.json'),
    '--baseline', path.join(dir, 'baseline.json'),
    '--known-failures', path.join(dir, 'known.json'),
    '--defects', defects,
  ], { encoding: 'utf8' });
  return { out, defects: fs.readFileSync(defects, 'utf8'), count: fs.readFileSync(`${defects}.count`, 'utf8') };
}

test('logs a miss on a corpus the baseline does not cover, and keeps an accepted baseline miss', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-baseline-'));
  fs.writeFileSync(path.join(dir, 'known.json'), JSON.stringify({ failures: [] }));
  fs.writeFileSync(path.join(dir, 'baseline.json'), JSON.stringify({
    tool: { version: '4.9.20' },
    results: [
      { corpus: 'bash-synthetic', tpr: 80, fpr: 0, missed_cases: ['old-miss.sh'], spurious_cases: [] },
    ],
  }));
  fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify({
    tool: { version: '4.22.0' },
    summary: { overall_tpr: '70.0%', overall_fpr: '0.0%' },
    results: [
      { corpus: 'bash-synthetic', tests: 2, tp: 1, fn: 1, fp: 0, tn: 0, tpr: '50.0%', fpr: '0.0%', missed_cases: ['old-miss.sh'], spurious_cases: [] },
      { corpus: 'pygoat', tests: 2, tp: 0, fn: 2, fp: 0, tn: 0, tpr: '0.0%', fpr: '0.0%', missed_cases: ['introduction/views.py:sql_lab', 'introduction/views.py:xss_lab'], spurious_cases: [] },
    ],
  }));

  let result;
  try {
    result = run(dir);
  } catch (e) {
    // TPR drop on the baselined corpus is still a regression. The defect
    // log is written before the exit.
    result = {
      out: `${e.stdout ?? ''}`,
      defects: fs.readFileSync(path.join(dir, 'defects.md'), 'utf8'),
      count: fs.readFileSync(path.join(dir, 'defects.md.count'), 'utf8'),
    };
    assert.equal(e.status, 1);
  }

  assert.match(result.defects, /introduction\/views\.py:sql_lab/);
  assert.match(result.defects, /introduction\/views\.py:xss_lab/);
  assert.doesNotMatch(result.defects, /old-miss\.sh/);
  assert.equal(result.count.trim(), '2');
  assert.match(result.out, /undetected defects \(2\)/);
});

test('a new miss on a baselined corpus is a defect; the previously accepted miss is not', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-baseline-'));
  fs.writeFileSync(path.join(dir, 'known.json'), JSON.stringify({ failures: [] }));
  fs.writeFileSync(path.join(dir, 'baseline.json'), JSON.stringify({
    tool: { version: '4.9.20' },
    results: [
      { corpus: 'bash-synthetic', tpr: '50.0%', fpr: '0.0%', missed_cases: ['old-miss.sh'], spurious_cases: [] },
    ],
  }));
  fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify({
    tool: { version: '4.22.0' },
    summary: { overall_tpr: '50.0%', overall_fpr: '0.0%' },
    results: [
      { corpus: 'bash-synthetic', tests: 2, tp: 0, fn: 2, fp: 0, tn: 0, tpr: '0.0%', fpr: '0.0%', missed_cases: ['old-miss.sh', 'new-miss.sh'], spurious_cases: [] },
    ],
  }));

  let result;
  try {
    result = run(dir);
  } catch (e) {
    result = {
      out: `${e.stdout ?? ''}`,
      defects: fs.readFileSync(path.join(dir, 'defects.md'), 'utf8'),
      count: fs.readFileSync(path.join(dir, 'defects.md.count'), 'utf8'),
    };
  }
  assert.match(result.defects, /new-miss\.sh/);
  assert.doesNotMatch(result.defects, /old-miss\.sh/);
  assert.equal(result.count.trim(), '1');
});

test('nothing to log when every miss is already in the baseline', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-baseline-'));
  fs.writeFileSync(path.join(dir, 'known.json'), JSON.stringify({ failures: [] }));
  fs.writeFileSync(path.join(dir, 'baseline.json'), JSON.stringify({
    tool: { version: '4.9.20' },
    results: [
      { corpus: 'bash-synthetic', tpr: '50.0%', fpr: '0.0%', missed_cases: ['old-miss.sh'], spurious_cases: [] },
    ],
  }));
  fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify({
    tool: { version: '4.22.0' },
    summary: { overall_tpr: '50.0%', overall_fpr: '0.0%' },
    results: [
      { corpus: 'bash-synthetic', tests: 2, tp: 1, fn: 1, fp: 0, tn: 0, tpr: '50.0%', fpr: '0.0%', missed_cases: ['old-miss.sh'], spurious_cases: [] },
    ],
  }));

  const result = run(dir);
  assert.equal(result.count.trim(), '0');
  assert.match(result.defects, /No labelled cases went undetected/);
  assert.match(result.out, /no undetected cases outside the baseline/);
});
