# cognium-ai Top Java Projects Run Plan: 2026-05-03

This is the kickoff plan for scanning the top 100 GitHub Java repositories with
`cognium-ai` and LLM enrichment.

## Dataset

- Selection file: `../../datasets/top-java-github/projects.json`
- Selection CSV: `../../datasets/top-java-github/projects.csv`
- Selection source: GitHub Search API
- Query: `language:Java stars:>5000 archived:false`
- Sort: stars descending
- Count: 100 repositories

## Execution Strategy

Run in batches, not as one monolithic job.

Recommended first pass:

`node scripts/run-cognium-ai-java-corpus.mjs --dry-run --limit 100`

Pilot batch:

`node scripts/run-cognium-ai-java-corpus.mjs --mode static --language java --offset 0 --limit 5 --timeout-seconds 1800`

Then continue in batches of 5-10 repositories after confirming runtime,
resource usage, and result format.

## Language Filter

Use `--language java`, which passes `-l java` to `cognium-ai`. Without this filter the scanner may traverse non-Java assets in documentation-heavy repositories, which makes the corpus slower and less comparable.

## LLM Default

Use local Ollama-compatible LLM settings first:

`llama3.2:3b`

Reason: this keeps source local by default and avoids sending public project
source to a remote LLM provider unless a specific run opts into that.

## Public Artifact Rule

Raw scan outputs are not published in this repository by default. Public
artifacts should contain curated aggregate JSON/CSV data with:

- repository name and URL
- commit SHA scanned
- model and provider
- completion status
- duration and timeout status
- finding counts by severity
- parse failure indicator
- raw publication status: `withheld`

## Upstream Issues

Do not create upstream GitHub issues automatically from first-pass scan output.
Use `../../docs/upstream-disclosure-policy.md`.

Safe sequence:

1. complete scan
2. triage high-confidence findings
3. validate manually from pinned commit
4. check each project's security policy
5. use private disclosure for security-sensitive issues
6. open public issues only for non-sensitive, validated, minimal reports

