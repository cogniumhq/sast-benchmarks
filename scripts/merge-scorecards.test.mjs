import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

const repo = path.resolve(new URL('..', import.meta.url).pathname);

test('a corpus with no scorecard is recorded, and the summary names the commit', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-scorecards-'));
  const input = path.join(dir, 'in');
  const out = path.join(dir, 'out');
  fs.mkdirSync(input);
  fs.writeFileSync(path.join(input, 'bash-synthetic.scorecard.json'), JSON.stringify({
    corpus: 'bash-synthetic', language: 'Bash', tests: 1, tp: 1, tn: 0, fp: 0, fn: 0, tpr: '100.0%', fpr: '0.0%', elapsed_ms: 1,
  }));
  execFileSync(process.execPath, [
    'scripts/merge-scorecards.mjs',
    '--in', input,
    '--out', out,
    '--version', '4.17.0',
    '--sha', 'c45d2e4deadbeef',
    '--ref', 'cognium-dev-v4.17.0',
    '--baseline', path.join(dir, 'absent.json'),
  ], { cwd: repo });

  const summary = JSON.parse(fs.readFileSync(path.join(out, 'run-summary.json'), 'utf8'));
  assert.deepEqual(summary.tool, { name: 'cognium-dev', version: '4.17.0', sha: 'c45d2e4deadbeef', ref: 'cognium-dev-v4.17.0' });
  const owasp = summary.results.find(r => r.corpus === 'owasp-benchmark-java');
  assert.match(owasp.error, /no scorecard produced/);
  const card = JSON.parse(fs.readFileSync(path.join(out, 'owasp-benchmark-java.scorecard.json'), 'utf8'));
  assert.equal(card.error, owasp.error);
  const bash = summary.results.find(r => r.corpus === 'bash-synthetic');
  assert.equal(bash.tp, 1);
  assert.equal(bash.error, undefined);
});

test('a corpus only named in the baseline gets an error row when no scorecard exists', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-scorecards-'));
  const input = path.join(dir, 'in');
  const out = path.join(dir, 'out');
  const baseline = path.join(dir, 'baseline.json');
  fs.mkdirSync(input);
  fs.writeFileSync(baseline, JSON.stringify({
    tool: { version: '4.17.0' },
    results: [
      { corpus: 'bash-synthetic', language: 'Bash', tpr: '100.0%', fpr: '0.0%' },
      { corpus: 'retired-corpus', language: 'Java', tpr: '90.0%', fpr: '1.0%' },
    ],
  }));
  fs.writeFileSync(path.join(input, 'bash-synthetic.scorecard.json'), JSON.stringify({
    corpus: 'bash-synthetic', language: 'Bash', tests: 1, tp: 1, tn: 0, fp: 0, fn: 0, tpr: '100.0%', fpr: '0.0%', elapsed_ms: 1,
  }));
  execFileSync(process.execPath, [
    'scripts/merge-scorecards.mjs',
    '--in', input,
    '--out', out,
    '--version', '4.17.0',
    '--baseline', baseline,
  ], { cwd: repo });

  const summary = JSON.parse(fs.readFileSync(path.join(out, 'run-summary.json'), 'utf8'));
  const retired = summary.results.find(r => r.corpus === 'retired-corpus');
  assert.ok(retired);
  assert.match(retired.error, /no scorecard produced/);
  assert.equal(retired.language, 'Java');
});
