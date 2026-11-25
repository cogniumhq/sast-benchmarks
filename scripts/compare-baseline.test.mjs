import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'compare-baseline.mjs');

function run(dir, extra = []) {
  const defects = path.join(dir, 'defects.md');
  const out = execFileSync(process.execPath, [
    script,
    '--run', path.join(dir, 'run.json'),
    '--baseline', path.join(dir, 'baseline.json'),
    '--known-failures', path.join(dir, 'known.json'),
    '--defects', defects,
    ...extra,
  ], { encoding: 'utf8' });
  return { out, defects: fs.readFileSync(defects, 'utf8'), count: fs.readFileSync(`${defects}.count`, 'utf8') };
}

function runExpectExit(dir, code, extra = []) {
  try {
    run(dir, extra);
    assert.fail('expected non-zero exit');
  } catch (e) {
    assert.equal(e.status, code, e.stderr ?? e.stdout);
    return { out: `${e.stdout ?? ''}`, status: e.status };
  }
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

test('a baseline corpus missing from the run is a regression', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-baseline-'));
  fs.writeFileSync(path.join(dir, 'known.json'), JSON.stringify({ failures: [] }));
  fs.writeFileSync(path.join(dir, 'baseline.json'), JSON.stringify({
    tool: { version: '4.9.20' },
    results: [
      { corpus: 'bash-synthetic', tpr: '100.0%', fpr: '0.0%', missed_cases: [], spurious_cases: [] },
      { corpus: 'pygoat', tpr: '90.0%', fpr: '0.0%', missed_cases: [], spurious_cases: [] },
    ],
  }));
  fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify({
    tool: { version: '4.22.0' },
    summary: { overall_tpr: '100.0%', overall_fpr: '0.0%' },
    results: [
      { corpus: 'bash-synthetic', tests: 1, tp: 1, fn: 0, fp: 0, tn: 0, tpr: '100.0%', fpr: '0.0%', missed_cases: [], spurious_cases: [] },
    ],
  }));

  const result = runExpectExit(dir, 1);
  assert.match(result.out, /corpus-missing/);
  assert.match(result.out, /pygoat/);
});

test('a known corpus error is suppressed when the message matches expect', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-baseline-'));
  fs.writeFileSync(path.join(dir, 'known.json'), JSON.stringify({
    failures: [{ corpus: 'pygoat', kind: 'corpus-errored', expect: 'timeout', issue: 'cogniumhq/cognium-dev#99' }],
  }));
  fs.writeFileSync(path.join(dir, 'baseline.json'), JSON.stringify({
    tool: { version: '4.9.20' },
    results: [
      { corpus: 'bash-synthetic', tpr: '100.0%', fpr: '0.0%', missed_cases: [], spurious_cases: [] },
    ],
  }));
  fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify({
    tool: { version: '4.22.0' },
    summary: { overall_tpr: '100.0%', overall_fpr: '0.0%' },
    results: [
      { corpus: 'bash-synthetic', tests: 1, tp: 1, fn: 0, fp: 0, tn: 0, tpr: '100.0%', fpr: '0.0%', missed_cases: [], spurious_cases: [] },
      { corpus: 'pygoat', error: 'scan timeout after 600s' },
    ],
  }));

  const result = run(dir);
  assert.match(result.out, /known failures, not gated/);
  assert.match(result.out, /pygoat/);
  assert.match(result.out, /no regressions/);
});

test('a known failure with a different error is corpus-errored-differently', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-baseline-'));
  fs.writeFileSync(path.join(dir, 'known.json'), JSON.stringify({
    failures: [{ corpus: 'pygoat', kind: 'corpus-errored', expect: 'timeout', issue: '#99' }],
  }));
  fs.writeFileSync(path.join(dir, 'baseline.json'), JSON.stringify({
    tool: { version: '4.9.20' },
    results: [],
  }));
  fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify({
    tool: { version: '4.22.0' },
    summary: {},
    results: [{ corpus: 'pygoat', error: 'disk full' }],
  }));

  const result = runExpectExit(dir, 1);
  assert.match(result.out, /corpus-errored-differently/);
});

test('an unbaselined corpus error is corpus-errored-unbaselined', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-baseline-'));
  fs.writeFileSync(path.join(dir, 'known.json'), JSON.stringify({ failures: [] }));
  fs.writeFileSync(path.join(dir, 'baseline.json'), JSON.stringify({ tool: { version: '4.9.20' }, results: [] }));
  fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify({
    tool: { version: '4.22.0' },
    summary: {},
    results: [{ corpus: 'pygoat', error: 'clone failed' }],
  }));

  const result = runExpectExit(dir, 1);
  assert.match(result.out, /corpus-errored-unbaselined/);
});

test('a stale known-failure entry fails when the corpus scores again', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-baseline-'));
  fs.writeFileSync(path.join(dir, 'known.json'), JSON.stringify({
    failures: [{ corpus: 'pygoat', kind: 'corpus-errored', expect: 'timeout', issue: '#99' }],
  }));
  fs.writeFileSync(path.join(dir, 'baseline.json'), JSON.stringify({
    tool: { version: '4.9.20' },
    results: [{ corpus: 'pygoat', tpr: '0.0%', fpr: '0.0%', missed_cases: [], spurious_cases: [] }],
  }));
  fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify({
    tool: { version: '4.22.0' },
    summary: { overall_tpr: '100.0%', overall_fpr: '0.0%' },
    results: [
      { corpus: 'pygoat', tests: 1, tp: 1, fn: 0, fp: 0, tn: 0, tpr: '100.0%', fpr: '0.0%', missed_cases: [], spurious_cases: [] },
    ],
  }));

  const result = runExpectExit(dir, 1);
  assert.match(result.out, /exemption-stale/);
});

test('fpr rise above tolerance is a regression with spurious cases named', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-baseline-'));
  fs.writeFileSync(path.join(dir, 'known.json'), JSON.stringify({ failures: [] }));
  fs.writeFileSync(path.join(dir, 'baseline.json'), JSON.stringify({
    tool: { version: '4.9.20' },
    results: [{ corpus: 'bash-synthetic', tpr: '100.0%', fpr: '0.0%', missed_cases: [], spurious_cases: [] }],
  }));
  fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify({
    tool: { version: '4.22.0' },
    summary: { overall_tpr: '100.0%', overall_fpr: '10.0%' },
    results: [
      {
        corpus: 'bash-synthetic', tests: 10, tp: 9, fn: 0, fp: 1, tn: 0,
        tpr: '100.0%', fpr: '10.0%', missed_cases: [], spurious_cases: ['noise.sh'],
      },
    ],
  }));

  const result = runExpectExit(dir, 1, ['--fpr-tolerance', '0']);
  assert.match(result.out, /fpr-rise/);
  assert.match(result.out, /noise\.sh/);
});

test('improvements and markdown output are emitted when metrics move the right way', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-baseline-'));
  const report = path.join(dir, 'report.md');
  fs.writeFileSync(path.join(dir, 'known.json'), JSON.stringify({ failures: [] }));
  fs.writeFileSync(path.join(dir, 'baseline.json'), JSON.stringify({
    tool: { version: '4.9.20' },
    results: [{
      corpus: 'bash-synthetic',
      tpr: '50.0%',
      fpr: '20.0%',
      missed_cases: ['lost.sh'],
      spurious_cases: ['old-fp.sh'],
    }],
  }));
  fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify({
    tool: { version: '4.22.0' },
    summary: { overall_tpr: '100.0%', overall_fpr: '0.0%' },
    results: [{
      corpus: 'bash-synthetic', tests: 2, tp: 2, fn: 0, fp: 0, tn: 0,
      tpr: '100.0%', fpr: '0.0%',
      missed_cases: [], spurious_cases: [],
    }],
  }));

  const result = run(dir, ['--markdown', report]);
  assert.match(result.out, /improvements/);
  assert.match(result.out, /tpr-gain/);
  assert.match(result.out, /fpr-drop/);
  const md = fs.readFileSync(report, 'utf8');
  assert.match(md, /### Improvements/);
  assert.match(md, /No regressions/);
  assert.match(md, /lost\.sh/);
});

test('flat TPR with swapped missed cases is noted, not a regression', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'compare-baseline-'));
  fs.writeFileSync(path.join(dir, 'known.json'), JSON.stringify({ failures: [] }));
  fs.writeFileSync(path.join(dir, 'baseline.json'), JSON.stringify({
    tool: { version: '4.9.20' },
    results: [{
      corpus: 'bash-synthetic', tpr: '50.0%', fpr: '0.0%',
      missed_cases: ['a.sh'], spurious_cases: [],
    }],
  }));
  fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify({
    tool: { version: '4.22.0' },
    summary: { overall_tpr: '50.0%', overall_fpr: '0.0%' },
    results: [{
      corpus: 'bash-synthetic', tests: 2, tp: 1, fn: 1, fp: 0, tn: 0,
      tpr: '50.0%', fpr: '0.0%', missed_cases: ['b.sh'], spurious_cases: [],
    }],
  }));

  const result = run(dir);
  assert.match(result.out, /TPR unchanged but different cases missed/);
  assert.match(result.out, /no regressions/);
});

test('exits 2 when --run is omitted', () => {
  try {
    execFileSync(process.execPath, [script], { encoding: 'utf8' });
    assert.fail('expected exit 2');
  } catch (e) {
    assert.equal(e.status, 2);
    assert.match(`${e.stderr ?? ''}`, /usage:/);
  }
});
