#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (!arg.startsWith('--')) continue;
  const key = arg.slice(2);
  const next = process.argv[i + 1];
  if (next && !next.startsWith('--')) {
    args.set(key, next);
    i += 1;
  } else {
    args.set(key, 'true');
  }
}

const datasetPath = args.get('dataset') || 'datasets/top-java-github/projects.json';
const workDir = args.get('workdir') || '/tmp/cognium-ai-java-top100-work';
const privateRawDir = args.get('raw-dir') || '/tmp/cognium-ai-java-top100-raw';
const publicOutDir = args.get('public-out') || 'results/2026-05-03';
const limit = Number(args.get('limit') || 5);
const offset = Number(args.get('offset') || 0);
const dryRun = args.get('dry-run') === 'true';
const command = args.get('command') || 'cognium-ai';
const mode = args.get('mode') || 'llm';
const isStaticMode = mode === 'static' || args.get('no-llm') === 'true';
const model = isStaticMode ? 'none' : (args.get('model') || process.env.LLM_ENRICHMENT_MODEL || 'llama3.2:3b');
const provider = isStaticMode ? 'None' : (args.get('provider') || process.env.LLM_PROVIDER || 'Ollama');
const scanTimeoutSeconds = Number(args.get('timeout-seconds') || 1800);
const language = args.get('language') || 'java';
const outputPrefix = args.get('output-prefix') || 'cognium-ai-java-top100';

const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
const projects = dataset.projects.slice(offset, offset + limit);
fs.mkdirSync(workDir, { recursive: true });
fs.mkdirSync(privateRawDir, { recursive: true });
fs.mkdirSync(publicOutDir, { recursive: true });

function run(cmd, cmdArgs, options = {}) {
  return spawnSync(cmd, cmdArgs, {
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    encoding: 'utf8',
    timeout: options.timeout ? options.timeout * 1000 : undefined,
    env: { ...process.env, ...options.env },
    maxBuffer: 128 * 1024 * 1024
  });
}

function parseProgress(raw) {
  const discovered = raw.match(/Discovered (\d+) files to scan/);
  const analyzeMatches = [...raw.matchAll(/\[analyze\] (\d+)\/(\d+).*?\((\d+) findings\)/g)];
  const report = raw.match(/\[report\] (\d+)\/(\d+)/);
  const lastAnalyze = analyzeMatches.at(-1);
  return {
    discovered_files: discovered ? Number(discovered[1]) : null,
    analyzed_files: lastAnalyze ? Number(lastAnalyze[1]) : null,
    expected_files: lastAnalyze ? Number(lastAnalyze[2]) : (report ? Number(report[2]) : null),
    progress_findings: lastAnalyze ? Number(lastAnalyze[3]) : null,
    report_completed: Boolean(report),
    reported_files: report ? Number(report[1]) : null
  };
}

function parseScan(reportRaw, progressRaw = '') {
  const progress = parseProgress(progressRaw);
  try {
    const parsed = JSON.parse(reportRaw);
    const findings = parsed.findings || parsed.results || [];
    const counts = { critical: 0, high: 0, medium: 0, low: 0, unknown: 0 };
    for (const finding of findings) {
      const sev = String(finding.severity || finding.level || 'unknown').toLowerCase();
      if (counts[sev] === undefined) counts.unknown += 1;
      else counts[sev] += 1;
    }
    return { ...progress, total: findings.length, ...counts, parse_error: false };
  } catch {
    return { ...progress, total: null, critical: null, high: null, medium: null, low: null, unknown: null, parse_error: true };
  }
}

const summaries = [];
for (const project of projects) {
  const safeName = project.full_name.replaceAll('/', '__');
  const repoDir = path.join(workDir, safeName);
  const rawPath = path.join(privateRawDir, `${safeName}.scan.json`);
  console.log(`\n==> [${project.rank}] ${project.full_name}`);

  if (dryRun) {
    summaries.push({ ...project, status: 'planned', mode: isStaticMode ? 'static' : 'llm', model, provider, raw_publication: 'withheld' });
    continue;
  }

  if (!fs.existsSync(repoDir)) {
    const cloneUrl = project.clone_url || project.html_url + '.git';
    const clone = run('git', ['clone', '--depth', '1', cloneUrl, repoDir]);
    if (clone.status !== 0) {
      summaries.push({ ...project, status: 'clone_failed', model, provider, raw_publication: 'withheld' });
      continue;
    }
  }

  const commit = run('git', ['-C', repoDir, 'rev-parse', 'HEAD'], { capture: true });
  const startedAt = new Date().toISOString();
  const scanArgs = ['scan', repoDir, '-f', 'json', '-o', rawPath];
  if (language && language !== 'all') scanArgs.push('-l', language);
  if (isStaticMode) scanArgs.push('--no-llm');
  const scan = run(command, scanArgs, { capture: true, timeout: scanTimeoutSeconds });
  const endedAt = new Date().toISOString();
  const reportRaw = fs.existsSync(rawPath) ? fs.readFileSync(rawPath, 'utf8') : '';
  if (!reportRaw && (scan.stdout || scan.stderr)) fs.writeFileSync(rawPath, scan.stdout || scan.stderr || '');
  const metrics = parseScan(reportRaw || scan.stdout || '', scan.stdout || scan.stderr || '');
  summaries.push({
    rank: project.rank,
    full_name: project.full_name,
    html_url: project.html_url,
    commit: commit.stdout ? commit.stdout.trim() : null,
    mode: isStaticMode ? 'static' : 'llm',
    model,
    provider,
    language,
    started_at: startedAt,
    ended_at: endedAt,
    exit_code: scan.status,
    signal: scan.signal,
    error_code: scan.error ? scan.error.code : null,
    timed_out: (scan.error && scan.error.code === 'ETIMEDOUT') || (scan.status === null && scan.signal === 'SIGTERM'),
    raw_publication: 'withheld',
    ...metrics
  });
}

const output = {
  generated_at: new Date().toISOString(),
  dataset: datasetPath,
  offset,
  limit,
  mode: isStaticMode ? 'static' : 'llm',
  model,
  provider,
  language,
  raw_artifacts: 'not published in this repository',
  projects: summaries
};
const suffixPrefix = isStaticMode ? 'static-baseline' : 'llm';
const suffix = dryRun ? `${suffixPrefix}-planned` : `${suffixPrefix}-offset-${offset}-limit-${limit}`;
fs.writeFileSync(path.join(publicOutDir, outputPrefix + "-" + suffix + ".json"), JSON.stringify(output, null, 2) + '\n');
console.log(`\nWrote sanitized summary for ${summaries.length} projects to ${publicOutDir}`);
