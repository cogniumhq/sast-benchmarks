# Top Java GitHub Projects Dataset

This dataset captures a working corpus for the `cognium-ai` Java security scan track.

Selection source: Cognium Tier-1 Java security scan targets (`tier1-targets.csv`).

Selection criteria:

- Curated Java libraries and infrastructure components with high security relevance
- Categories include parsers, serializers, HTTP clients, auth, validation, templates, and related tooling
- Excludes demo apps, interview guides, learning repos, and example collections

Snapshot files:

- `tier1-targets.csv`: upstream curated target list
- `projects.json`: structured project metadata and selection caveats
- `projects.csv`: tabular project list for review and batching

Refresh command:

```bash
node scripts/import-tier1-java-targets.mjs
```

Optional GitHub API enrichment (requires `GITHUB_TOKEN`):

```bash
node scripts/import-tier1-java-targets.mjs --enrich
```

## Use

This corpus is intended for security-focused Java library scanning and benchmark publication,
not for immediate upstream vulnerability disclosure.

Before publishing project-level findings:

1. Pin each project to the exact commit scanned.
2. Validate findings manually or with a second tool.
3. Redact raw source snippets and secret-like values.
4. Follow the target project's security policy before opening public issues.
5. Publish aggregate metrics first, then project-level details only after review.

## Caveats

This is a curated security-relevant sample, not a star-ranked popularity snapshot.
Result summaries should not claim this is a statistically representative Java software sample.
