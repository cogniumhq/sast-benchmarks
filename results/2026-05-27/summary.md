# Cognium-AI Benchmark Results — 2026-05-27

**Engine:** cognium-ai v2.7.18 · circle-ir-ai  
**Date:** 2026-05-27 / 2026-05-28  
**Ollama version:** 0.24.0 (local, upgraded during run)

---

## 1. Curated Benchmark Suite (Static SAST — no LLM)

| Benchmark | Language | Tests | Score | TPR | FPR | Notes |
|---|---|---|---|---|---|---|
| OWASP Benchmark v1.2 | Java | 1,415 | **100%** | 100% | 0% | 11 categories, 0 FP |
| Juliet Test Suite v01 | Java | 243 | **100%** | 100% | 0% | 14 CWEs, 0 FN |
| SecuriBench Micro | Java | 108 vuln / 15 safe | **97.7% TPR** | 97.7% | 6.7% | 2 FN (aliasing, collection copy); 1 FP |
| CWE-Bench-Java (static) | Java | 119 CVEs | **71.4%** | — | — | 85/119 detected; CodeQL=22.5%, IRIS/GPT-4=45.8% |
| OWASP Python Benchmark | Python | 1,230 | **84.1% TPR** | 84.1% | 14.9% | F1=80.2%; 100% on sqli/weakrand/hash/cookie; weak on deser/ldap |
| NodeJS Benchmark | JavaScript | 25 | **100% TPR** | 100% | 11.1% | F1=97.0%; 1 FP on cmdi |

---

## 2. CWE-Bench-Java — Model Comparison

| Tool / Model | Provider | Model Size | Flags | LLM Delay | Score | CWE-022 | CWE-078 | CWE-079 | CWE-094 | Date |
|---|---|---|---|---|---|---|---|---|---|---|
| CodeQL | — | — | — | — | 22.5% (27/120) | — | — | — | — | IRIS paper |
| IRIS (GPT-4) | OpenAI | — | — | — | 45.8% (55/120) | — | — | — | — | IRIS paper |
| cognium-ai | Static | — | `--no-llm` | — | **71.4%** (85/119) | 83.3% | 61.5% | 64.5% | 57.1% | 2026-05-28 |
| cognium-ai + qwen3-coder:30b | Ollama | 18 GB | `--llm-discovery --cloned-only` | 1s | **79.8%** (95/119) | 87.0% | 84.6% | 74.2% | 66.7% | 2026-05-21 |
| cognium-ai + gpt-oss:20b | Ollama | 13 GB | `--llm-discovery --cloned-only` | 1s | **81.5%** (97/119) | 90.7% | 69.2% | 83.9% | 61.9% | 2026-05-28 |
| cognium-ai + qwen3-coder-next | Ollama | 51 GB | `--llm-discovery --cloned-only` | 2s | ⚠️ OOM | — | — | — | — | 2026-05-28 |
| cognium-ai + kimi-k2.6 | llmproxy.xus.one | cloud | `--llm-discovery --cloned-only` | 1s | **71.4%** (85/119) | 83.3% | 61.5% | 64.5% | 57.1% | 2026-05-28 |
| cognium-ai + claude-opus-latest | llmproxy.xus.one | cloud | `--llm-discovery --cloned-only` | 1s | **71.4%** (85/119) | 83.3% | 61.5% | 64.5% | 57.1% | 2026-05-28 |

> ⚠️ qwen3-coder-next OOM: 51GB model requires 64GB+ RAM. Machine has ~2GB free after OS.  
> ⚠️ Issue #72: Cloud runs (kimi-k2.6, claude-opus-latest) show no LLM uplift — `.env` in `circle-ir-ai/` overwrites externally set `LLM_BASE_URL`/`LLM_API_KEY` vars via dotenv. Fix: `dotenvConfig({ override: false })`. Pending re-run after fix is merged.

---

## 3. Corpus Runs — Top-10 GitHub Repos per Language

Findings are static SAST results (corpus runner uses LLM model label only; actual enrichment subject to issue #72).

### 3a. Java — Top-10 by Stars

| Repo | qwen3-coder:30b | gpt-oss:20b | qwen3-coder-next |
|---|---|---|---|
| spring-projects/spring-boot | 22,248 (368C/971H) | 22,248 (368C/971H) | 22,248 (368C/971H) |
| macrozheng/mall | 14,747 (1C/4H) | 14,747 (1C/4H) | 14,747 (1C/4H) |
| krahets/hello-algo | 4,039 (0C/0H) | 4,039 (0C/0H) | 4,039 (0C/0H) |
| iluwatar/java-design-patterns | 3,831 (138C/72H) | 3,831 (138C/72H) | 3,831 (138C/72H) |
| MisterBooo/LeetCodeAnimation | 49 | 49 | 49 |
| GrowingGit/GitHub-Chinese-Top-Charts | 1 | 1 | 1 |
| doocs/advanced-java | 1 | 1 | 1 |
| Snailclimb/JavaGuide | 0 | 0 | 0 |
| elastic/elasticsearch | Timeout | Timeout | Timeout |
| NationalSecurityAgency/ghidra | Timeout | Timeout | Timeout |
| **TOTAL (8/10)** | **44,916** | **44,916** | **44,916** |

### 3b. JavaScript — Top-10 by Stars

| Repo | qwen3-coder:30b | gpt-oss:20b | qwen3-coder-next |
|---|---|---|---|
| nodejs/node | 10,780 (479C/957H) | Timeout | 10,780 (479C/957H) |
| mrdoob/three.js | 4,963 (364C/673H) | Timeout | 4,963 (364C/673H) |
| vercel/next.js | 1,154 (182C/258H) | Timeout | 1,154 (182C/258H) |
| affaan-m/everything-claude-code | 1,115 (123C/427H) | 1,115 (123C/427H) | 1,115 (123C/427H) |
| Chalarangelo/30-seconds-of-code | 635 (50C/16H) | 635 (50C/16H) | 635 (50C/16H) |
| axios/axios | 295 (23C/18H) | 295 (23C/18H) | 295 (23C/18H) |
| facebook/create-react-app | 366 (64C/90H) | 366 (64C/90H) | 366 (64C/90H) |
| trekhleb/javascript-algorithms | 401 (25C/0H) | 401 (25C/0H) | 401 (25C/0H) |
| airbnb/javascript | 38 (2C/0H) | 38 (2C/0H) | 38 (2C/0H) |
| facebook/react | Timeout | Timeout | Timeout |
| **TOTAL** | **19,747** | **2,850 (4 timeouts)** | **19,747** |

### 3c. Python — Top-10 by Stars

| Repo | qwen3-coder:30b | gpt-oss:20b | qwen3-coder-next |
|---|---|---|---|
| huggingface/transformers | 35,764 (423C/1316H) | 35,764 (423C/1316H) | 35,764 (423C/1316H) |
| NousResearch/hermes-agent | 11,827 (788C/1404H) | 11,827 (788C/1404H) | 11,827 (788C/1404H) |
| Significant-Gravitas/AutoGPT | 9,218 (304C/752H) | 9,218 (304C/752H) | 9,218 (304C/752H) |
| yt-dlp/yt-dlp | 4,785 (37C/248H) | 4,785 (37C/248H) | 4,785 (37C/248H) |
| AUTOMATIC1111/stable-diffusion-webui | 1,659 (59C/100H) | 1,659 (59C/100H) | 1,659 (59C/100H) |
| TheAlgorithms/Python | 2,149 (4C/125H) | 2,149 (4C/125H) | 2,149 (4C/125H) |
| donnemartin/system-design-primer | 130 | 130 | 130 |
| vinta/awesome-python | 28 | 28 | 28 |
| EbookFoundation/free-programming-books | 19 | 19 | 19 |
| public-apis/public-apis | 8 | 8 | 8 |
| **TOTAL (10/10)** | **65,587** | **65,587** | **65,587** |

---

## 4. Key Observations

- **Corpus findings are identical across all models** — confirms static SAST dominates; LLM enrichment differences only show up in CWE-Bench-Java with `--llm-discovery` mode
- **gpt-oss:20b is slower** — 4 JS timeouts vs 1 for qwen3-coder:30b and qwen3-coder-next
- **LLM uplift on CWE**: qwen3-coder:30b +8.4pp (71.4% → 79.8%); others pending fix for issue #72
- **Python has no timeouts** across all models; Java/JS have consistent large-repo timeouts

---

## 5. Pending

| Item | Status |
|---|---|
| Cloud models (cognium/kimi-k2.6, cognium/claude-opus-latest) | Not yet run; via llmproxy.xus.one |
| qwen3-coder-next CWE run | Blocked: OOM — requires 64GB+ RAM (model is 51GB) |
| BrainHQ wiki update | Blocked on Anthropic API credits |
