# Top Java GitHub Projects Benchmark

This benchmark track runs `cognium-ai` against the top 100 non-archived Java
repositories selected from GitHub by stars.

Dataset:

- `../../datasets/top-java-github/projects.json`
- `../../datasets/top-java-github/projects.csv`

## Benchmark Intent

This track measures how `cognium-ai` behaves on popular real-world Java
repositories with LLM enrichment enabled.

Primary outputs:

- scan completion rate
- timeout and parse-failure rate
- findings by severity
- trust, quality, secrets, and dead-code summaries
- model/provider behavior
- project-level triage queue for validated upstream reports

## Default LLM Lane

Use a local model first to control cost and avoid sending source to a remote
provider by default:

`llama3.2:3b` via Ollama-compatible OpenAI API.

Remote LLM providers should be opt-in per run and documented in the result
metadata.

## Publication Rule

Do not publish raw `cognium-ai` JSON directly if it includes source snippets,
secret values, or generated reasoning text. Publish sanitized aggregate JSON/CSV
and keep detailed raw artifacts local or in a private artifact store.

