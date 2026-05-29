# Schemas

Machine-readable schemas for benchmark result data live here.

Use schemas to keep published JSON stable enough for downstream tooling, charts,
and `cognium.dev/benchmark` pages.

Current schemas:

- `result.schema.json`: JSON schema for a published SAST benchmark result file.

Before publishing new result formats, update or add a schema and validate sample
output against it.
