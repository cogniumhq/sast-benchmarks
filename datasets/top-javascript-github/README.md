# Top JavaScript GitHub Projects Dataset

This dataset captures a working corpus for a `cognium-ai` JavaScript analysis track.

Selection source: GitHub Search API.

Selection query:

`language:JavaScript stars:>10000 archived:false`

Sort order: stars descending.

Snapshot files:

- `projects.json`: structured project metadata and selection caveats
- `projects.csv`: tabular project list for review and batching

## Use

This corpus is intended for broad ecosystem scanning and benchmark publication,
not for immediate upstream vulnerability disclosure.

Before publishing project-level findings:

1. Pin each project to the exact commit scanned.
2. Validate findings manually or with a second tool.
3. Redact raw source snippets and secret-like values.
4. Follow the target project security policy before opening public issues or sending private disclosures.
5. Publish aggregate metrics first, then project-level details only after review.

## Caveats

Star-ranked GitHub search includes libraries, frameworks, developer tools,
learning repositories, and example collections. That is acceptable for an
initial ecosystem signal, but result summaries should not claim this is a
statistically representative JavaScript software sample.
