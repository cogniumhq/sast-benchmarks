# cognium-ai Tool Lane

Configuration, commands, and notes for `cognium-ai` benchmark and evaluation runs.

`cognium-ai` is the AI-powered CLI layer for LLM-enhanced static analysis,
trust scoring, quality scoring, secrets scanning, dead-code detection, and
semantic understanding.

## Current Source

Source metadata inspected for the April 2026 publication:

- Package name: `cognium-ai`
- Local package version in `package.json`: `1.10.15`
- Published/evaluated CLI version in test report: pre-2.5.0 and v2.5.0

The version mismatch should be resolved before future public benchmark claims.
Use the evaluated CLI version from the dated result folder when reporting an
older test run.

## Representative Commands

Static baseline:

```sh
cognium-ai scan . --no-llm
cognium-ai trust .
cognium-ai quality .
cognium-ai secrets .
cognium-ai health .
cognium-ai dead-code .
cognium-ai understand .
```

LLM enrichment with GitHub Models:

```sh
cognium-ai scan . \
  --llm-base-url https://models.github.ai/inference \
  --llm-api-key "$GITHUB_TOKEN" \
  --llm-model openai/gpt-4o-mini
```

LLM enrichment with local Ollama:

```sh
export LLM_BASE_URL=http://localhost:11434/v1
export LLM_API_KEY=lm-studio
export LLM_ENRICHMENT_MODEL=llama3.2:3b
export LLM_DISCOVERY_MODEL=llama3.2:3b
cognium-ai scan .
```

## Publication Rules

- Do not publish raw secrets JSON because it can contain full `lineContent` values.
- Publish aggregate secret counts and redacted findings only.
- Record model, provider, timeout behavior, parse failures, and severity deltas.
- Keep static and LLM-enriched results separate.
- Flag engine-level regressions separately from model limitations.
