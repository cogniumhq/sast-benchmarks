# Schemas

Machine-readable schemas for benchmark result data live here.

Use schemas to keep published JSON stable enough for downstream tooling, charts,
and `cognium.dev/benchmark` pages.

Current schemas:

- `result.schema.json`: JSON schema for a published SAST benchmark result file.

Validation: `node scripts/validate-results.mjs` checks every
`results/*/results.json` against the schema's required fields plus the
arithmetic and artifact rules the schema cannot express; CI runs it on every
push and pull request.

Before publishing new result formats, update or add a schema and validate sample
output against it.
