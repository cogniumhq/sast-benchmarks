import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), 'update-coverage.mjs');

function writeRun(dir, results) {
  fs.writeFileSync(path.join(dir, 'run.json'), JSON.stringify({ results }));
}

function run(dir, extra = []) {
  return execFileSync(process.execPath, [
    script,
    '--run', path.join(dir, 'run.json'),
    '--coverage', path.join(dir, 'coverage.json'),
    '--lost', path.join(dir, 'lost.md'),
    ...extra,
  ], { encoding: 'utf8' });
}

test('a detected case is added and stays required', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coverage-'));
  fs.writeFileSync(path.join(dir, 'coverage.json'), JSON.stringify({ corpora: {} }));
  writeRun(dir, [
    { corpus: 'pygoat', detected_cases: ['introduction/views.py:cmd_lab'], missed_cases: ['introduction/views.py:sql_lab'] },
  ]);
  const out = run(dir, ['--write']);
  const coverage = JSON.parse(fs.readFileSync(path.join(dir, 'coverage.json'), 'utf8'));
  assert.deepEqual(coverage.corpora.pygoat, ['introduction/views.py:cmd_lab']);
  assert.match(out, /coverage grew by 1/);
  assert.doesNotMatch(JSON.stringify(coverage), /sql_lab/);
});

test('missing a previously detected case fails and does not drop it', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coverage-'));
  fs.writeFileSync(path.join(dir, 'coverage.json'), JSON.stringify({
    corpora: { pygoat: ['introduction/views.py:cmd_lab'] },
  }));
  writeRun(dir, [
    { corpus: 'pygoat', detected_cases: ['introduction/views.py:ssrf_lab'], missed_cases: ['introduction/views.py:cmd_lab'] },
  ]);
  let failed = false;
  try { run(dir, ['--write']); }
  catch (e) {
    failed = true;
    assert.equal(e.status, 1);
    assert.match(e.stdout, /COVERAGE LOST/);
  }
  assert.equal(failed, true);
  const coverage = JSON.parse(fs.readFileSync(path.join(dir, 'coverage.json'), 'utf8'));
  assert.deepEqual(coverage.corpora.pygoat, ['introduction/views.py:cmd_lab', 'introduction/views.py:ssrf_lab']);
  assert.match(fs.readFileSync(path.join(dir, 'lost.md'), 'utf8'), /cmd_lab/);
});

test('an errored corpus is not treated as lost coverage', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coverage-'));
  fs.writeFileSync(path.join(dir, 'coverage.json'), JSON.stringify({
    corpora: { owasp: ['BenchmarkTest00001'] },
  }));
  writeRun(dir, [
    { corpus: 'owasp', error: 'fetch failed: Could not resolve host' },
  ]);
  const out = run(dir, ['--write']);
  assert.match(out, /not rechecked/);
  const coverage = JSON.parse(fs.readFileSync(path.join(dir, 'coverage.json'), 'utf8'));
  assert.deepEqual(coverage.corpora.owasp, ['BenchmarkTest00001']);
});

test('a scorecard without detected_cases does not wipe coverage', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'coverage-'));
  fs.writeFileSync(path.join(dir, 'coverage.json'), JSON.stringify({
    corpora: { 'bash-synthetic': ['old.sh'] },
  }));
  writeRun(dir, [
    { corpus: 'bash-synthetic', missed_cases: ['old.sh'], tp: 0, fn: 1 },
  ]);
  const out = run(dir);
  assert.match(out, /no detected_cases/);
  const coverage = JSON.parse(fs.readFileSync(path.join(dir, 'coverage.json'), 'utf8'));
  assert.deepEqual(coverage.corpora['bash-synthetic'], ['old.sh']);
});
