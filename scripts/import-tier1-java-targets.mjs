#!/usr/bin/env node
import fs from 'node:fs';
import https from 'node:https';

const tier1CsvPath =
  process.argv.find((arg) => !arg.startsWith('-') && arg.endsWith('.csv')) ||
  process.env.TIER1_CSV ||
  'datasets/top-java-github/tier1-targets.csv';
const outDir = process.env.OUT_DIR || 'datasets/top-java-github';
const enrich = process.argv.includes('--enrich');
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

function getJson(url) {
  return new Promise((resolve, reject) => {
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'cognium-sast-benchmark-tier1-import'
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    https
      .get(url, { headers }, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`GitHub API failed: ${res.statusCode} ${body}`));
            return;
          }
          resolve(JSON.parse(body));
        });
      })
      .on('error', reject);
  });
}

function csvEscape(value) {
  return '"' + String(value ?? '').replaceAll('"', '""').replaceAll('\n', ' ') + '"';
}

function parseStars(value) {
  const digits = String(value ?? '').replaceAll(',', '').trim();
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeLicense(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed || trimmed === '—' || trimmed === '-') return null;
  return trimmed;
}

function parseCsvLine(line) {
  const cols = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cols.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  cols.push(current);
  return cols;
}

function parseTier1Csv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = parseCsvLine(lines[0]);
  const rankIdx = header.indexOf('Rank');
  const repoIdx = header.indexOf('Repo');
  const urlIdx = header.indexOf('URL');
  const starsIdx = header.indexOf('Stars');
  const licenseIdx = header.indexOf('License');
  const lastPushIdx = header.indexOf('Last Push');
  const categoryIdx = header.indexOf('Category');
  const notesIdx = header.indexOf('Notes');

  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const fullName = cols[repoIdx]?.trim();
    const [owner, name] = fullName.split('/');
    return {
      rank: Number(cols[rankIdx]),
      full_name: fullName,
      owner,
      name,
      html_url: cols[urlIdx]?.trim(),
      stars: parseStars(cols[starsIdx]),
      license: normalizeLicense(cols[licenseIdx]),
      pushed_at: cols[lastPushIdx]?.trim(),
      category: cols[categoryIdx]?.trim() || '',
      notes: cols[notesIdx]?.trim() || ''
    };
  });
}

function toIsoPushDate(value) {
  if (!value) return null;
  if (value.includes('T')) return value.endsWith('Z') ? value : `${value}Z`;
  return `${value}T00:00:00Z`;
}

function buildProjectFromCsv(entry) {
  return {
    ...entry,
    clone_url: `https://github.com/${entry.full_name}.git`,
    ssh_url: `git@github.com:${entry.full_name}.git`,
    default_branch: null,
    forks: null,
    open_issues: null,
    pushed_at: toIsoPushDate(entry.pushed_at),
    updated_at: null,
    created_at: null,
    description: entry.category || '',
    archived: false,
    disabled: false,
    fork: false,
    size_kb: null,
    language: 'Java'
  };
}

async function enrichFromGitHub(entry) {
  const url = `https://api.github.com/repos/${entry.full_name}`;
  try {
    const repo = await getJson(url);
    return {
      ...entry,
      html_url: repo.html_url,
      clone_url: repo.clone_url,
      ssh_url: repo.ssh_url,
      default_branch: repo.default_branch,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      open_issues: repo.open_issues_count,
      pushed_at: repo.pushed_at,
      updated_at: repo.updated_at,
      created_at: repo.created_at,
      license: repo.license ? repo.license.spdx_id : entry.license,
      description: repo.description || entry.category || '',
      archived: repo.archived,
      disabled: repo.disabled,
      fork: repo.fork,
      size_kb: repo.size,
      language: repo.language || 'Java'
    };
  } catch (error) {
    console.warn(`Warning: could not enrich ${entry.full_name}: ${error.message}`);
    return buildProjectFromCsv(entry);
  }
}

async function buildProject(entry) {
  if (enrich) return enrichFromGitHub(entry);
  return buildProjectFromCsv(entry);
}

const csvText = fs.readFileSync(tier1CsvPath, 'utf8');
const tier1Entries = parseTier1Csv(csvText);
console.log(`Parsed ${tier1Entries.length} tier-1 targets from ${tier1CsvPath}`);

const projects = [];
for (const entry of tier1Entries) {
  projects.push(await buildProject(entry));
  if (enrich) await new Promise((resolve) => setTimeout(resolve, token ? 50 : 300));
}

const doc = {
  generated_at: new Date().toISOString(),
  source: 'Cognium Tier-1 Java security scan targets',
  selection: {
    query: 'Curated tier-1 Java libraries and infrastructure components for security scanning',
    sort: 'rank',
    order: 'asc',
    per_page: projects.length,
    total_count: projects.length,
    tier1_csv: 'datasets/top-java-github/tier1-targets.csv',
    caveats: [
      'Targets are curated for security-relevant Java libraries, not star-ranked popularity.',
      'Includes parsers, serializers, HTTP clients, auth, validation, and related infrastructure.',
      'Selection should be refreshed before each major benchmark publication.',
      'Projects are not security targets until maintainers approve disclosure or a finding is validated through the project security policy.'
    ]
  },
  projects
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(`${outDir}/projects.json`, JSON.stringify(doc, null, 2) + '\n');

const headers = [
  'rank',
  'full_name',
  'html_url',
  'clone_url',
  'default_branch',
  'stars',
  'forks',
  'open_issues',
  'pushed_at',
  'license',
  'category',
  'description'
];
const csv =
  headers.join(',') +
  '\n' +
  projects
    .map((row) =>
      headers
        .map((h) => csvEscape(h === 'category' ? row.category : row[h]))
        .join(',')
    )
    .join('\n') +
  '\n';
fs.writeFileSync(`${outDir}/projects.csv`, csv);
console.log(`Wrote ${projects.length} projects to ${outDir}`);
