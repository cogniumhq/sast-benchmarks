import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { caseEntries, enclosingFunction, indexFindings, isTransientFetchError, pythonFunctionRanges, tally, toolVersion, withRetry } from './run-corpus.mjs';

const py = [
  'def register(request):',
  '    return None',
  '',
  'def cmd_lab(request):',
  '    sink(request.GET["cmd"])',
  '',
  'def cmd_lab_safe(request):',
  '    return "static"',
].join('\n');

test('a python finding is attributed to the def that encloses its line', () => {
  const ranges = pythonFunctionRanges(py);
  assert.equal(enclosingFunction(ranges, 1), 'register');
  assert.equal(enclosingFunction(ranges, 5), 'cmd_lab');
  assert.equal(enclosingFunction(ranges, 8), 'cmd_lab_safe');
});

test('file:function labels match the enclosing def and ignore a different CWE', () => {
  const cases = new Map([
    ['introduction/views.py:cmd_lab', [{ category: 'cmdi', cwe: 78, vulnerable: true }]],
    ['introduction/views.py:cmd_lab_safe', [{ category: 'cmdi', cwe: 78, vulnerable: false }]],
    ['introduction/views.py:register', [{ category: 'sqli', cwe: 0, vulnerable: false }]],
  ]);
  const findings = [
    { file: '/src/introduction/views.py', cwe: 78, line: 5 },
    { file: '/src/introduction/views.py', cwe: 89, line: 2 },
  ];
  const flagged = indexFindings(findings, {
    match: 'function',
    repoRoot: '/src',
    readFile: () => py,
  });
  const result = tally(caseEntries(cases), flagged);
  assert.equal(result.tp, 1);
  assert.equal(result.fn, 0);
  assert.equal(result.fp, 0);
  assert.equal(result.tn, 2);
  assert.deepEqual(result.detected, ['introduction/views.py:cmd_lab']);
  assert.deepEqual(result.missed, []);
});

test('two cases on one path are both scored', () => {
  const cases = new Map([
    ['pkg/admin/admin.go', [
      { category: 'cmdi', cwe: 78, vulnerable: true },
      { category: 'sqli', cwe: 89, vulnerable: true },
    ]],
    ['pkg/login/login.go', [{ category: 'sqli', cwe: 89, vulnerable: false }]],
  ]);
  const findings = [
    { file: '/src/pkg/admin/admin.go', cwe: 78, line: 93 },
  ];
  const flagged = indexFindings(findings, { match: 'path', repoRoot: '/src' });
  const result = tally(caseEntries(cases), flagged);
  assert.equal(result.tests, 3);
  assert.equal(result.tp, 1);
  assert.equal(result.fn, 1);
  assert.equal(result.tn, 1);
  assert.deepEqual(result.detected, ['pkg/admin/admin.go (cmdi)']);
  assert.deepEqual(result.missed, ['pkg/admin/admin.go (sqli)']);
});

test('the engine version is the cognium-dev line, not an earlier semver', () => {
  const text = [
    'DeprecationWarning: something about 4.17.0',
    'cognium-dev v4.19.0',
    'build c45d2e4 · 2026-11-03T02:49:17.000Z',
    'Powered by Cognium Labs',
  ].join('\n');
  assert.equal(toolVersion(text), '4.19.0');
  assert.equal(toolVersion('v4.17.0\n'), null);
});

test('a DNS failure is retried and a bad pin is not', () => {
  assert.equal(isTransientFetchError(new Error("fatal: unable to access 'https://github.com/x': Could not resolve host: github.com")), true);
  assert.equal(isTransientFetchError(new Error('archive digest mismatch: expected abc, got def')), false);

  let calls = 0;
  const slept = [];
  const got = withRetry(() => {
    calls += 1;
    if (calls === 1) throw new Error('Could not resolve host: github.com');
    return 'cloned';
  }, { sleep: (ms) => slept.push(ms) });
  assert.equal(got, 'cloned');
  assert.equal(calls, 2);
  assert.deepEqual(slept, [2000]);

  let pins = 0;
  assert.throws(() => withRetry(() => {
    pins += 1;
    throw new Error('checkout did not land on abc');
  }, { sleep: () => {} }), /did not land/);
  assert.equal(pins, 1);
});

test('scoreCorpus accepts excludeFromOverall, the Juliet Java headline flag', () => {
  const src = fs.readFileSync(new URL('./run-corpus.mjs', import.meta.url), 'utf8');
  const start = src.indexOf('function scoreCorpus(');
  const sig = src.slice(start, src.indexOf(') {', start));
  assert.match(sig, /\bexcludeFromOverall\b/);
});
