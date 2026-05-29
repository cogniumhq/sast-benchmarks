#!/usr/bin/env node
import fs from 'node:fs';
import https from 'node:https';

const outDir = 'datasets/top-java-github';
const query = process.env.GITHUB_SEARCH_QUERY || 'language:Java stars:>5000 archived:false';
const perPage = Number(process.env.PER_PAGE || 100);
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

function getJson(url) {
  return new Promise((resolve, reject) => {
    const headers = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'cognium-sast-benchmark-selector'
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    https.get(url, { headers }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`GitHub API failed: ${res.statusCode} ${body}`));
          return;
        }
        resolve(JSON.parse(body));
      });
    }).on('error', reject);
  });
}

function csvEscape(value) {
  return '"' + String(value ?? '').replaceAll('"', '""').replaceAll('\n', ' ') + '"';
}

const url = new URL('https://api.github.com/search/repositories');
url.searchParams.set('q', query);
url.searchParams.set('sort', 'stars');
url.searchParams.set('order', 'desc');
url.searchParams.set('per_page', String(perPage));

const data = await getJson(url);
if (!Array.isArray(data.items)) throw new Error('GitHub API response did not include items[]');
fs.mkdirSync(outDir, { recursive: true });

const projects = data.items.map((r, index) => ({
  rank: index + 1,
  full_name: r.full_name,
  owner: r.owner.login,
  name: r.name,
  html_url: r.html_url,
  clone_url: r.clone_url,
  ssh_url: r.ssh_url,
  default_branch: r.default_branch,
  stars: r.stargazers_count,
  forks: r.forks_count,
  open_issues: r.open_issues_count,
  pushed_at: r.pushed_at,
  updated_at: r.updated_at,
  created_at: r.created_at,
  license: r.license ? r.license.spdx_id : null,
  description: r.description || '',
  archived: r.archived,
  disabled: r.disabled,
  fork: r.fork,
  size_kb: r.size,
  language: r.language
}));

const doc = {
  generated_at: new Date().toISOString(),
  source: 'GitHub Search API',
  selection: {
    query,
    sort: 'stars',
    order: 'desc',
    per_page: perPage,
    total_count: data.total_count,
    caveats: [
      'Star ranking is popularity-biased and can include learning resources, examples, frameworks, and applications.',
      'Selection should be refreshed before each major benchmark publication.',
      'Projects are not security targets until maintainers approve disclosure or a finding is validated through the project security policy.'
    ]
  },
  projects
};

fs.writeFileSync(`${outDir}/projects.json`, JSON.stringify(doc, null, 2) + '\n');
const headers = ['rank','full_name','html_url','clone_url','default_branch','stars','forks','open_issues','pushed_at','license','description'];
const csv = headers.join(',') + '\n' + projects.map(row => headers.map(h => csvEscape(row[h])).join(',')).join('\n') + '\n';
fs.writeFileSync(`${outDir}/projects.csv`, csv);
console.log(`Wrote ${projects.length} projects to ${outDir}`);
