# cognium-ai Tool Lane

Configuration, commands, and notes for `cognium-ai` benchmark and evaluation runs.

`cognium-ai` is the AI-powered CLI layer for LLM-enhanced static analysis,
trust scoring, quality scoring, secrets scanning, dead-code detection, and
semantic understanding.

## Versions Used in Published Runs

| Result set | cognium-ai | Mode |
| --- | --- | --- |
| `results/2026-05-05/` | 2.5.7 | static (`--no-llm`), JavaScript top-10 |
| `results/2026-05-27/` | 2.7.18 | static + `--llm-discovery` (Ollama, mlx-lm, cloud proxy), CWE-Bench-Java and top-10 corpora |

Package: `https://www.npmjs.com/package/cognium-ai`. Always report the version
recorded in the dated result folder; cognium-ai wraps a separately versioned
engine, so a cognium-ai version alone does not pin the static analyzer.

This lane is published separately from the static-analysis snapshot on
`cognium.dev/benchmark` (`tools/cognium/`) and its numbers are never merged
into it.

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
