# Phase 2 — Google Colab Notebook

This directory contains the **Phase 2 notebook** that implements the 5-layer screening pipeline (Section 2.3 of the methodology paper).

## Files

- [`notebook.ipynb`](notebook.ipynb) — Main notebook (13 sections, fully commented, no credentials)
- [`prompts/llm_screening_prompt.md`](prompts/llm_screening_prompt.md) — Verbatim LLM prompt (Box 1 of the paper)

## Notebook Structure

The notebook has **13 sections**, each clearly explained with prerequisites, what the code does, and expected outputs:

| Section | Purpose | Pipeline layer |
|---------|---------|----------------|
| 1 | Setup (mount Drive, install deps) | – |
| 2 | Connect to Google Sheets | – |
| 3 | *(Optional)* Enrich missing metadata via CrossRef + Semantic Scholar | – |
| 4 | *(Optional)* Annotate publication_type + Scimago quartile | – |
| **5** | **LLM Screening (Llama 3.3 70B)** — the core screening cell | **Layer 2** |
| 6 | Pre-fill manual review column with LLM defaults | – |
| 7 | Draw stratified n=120 sample for R2 (independent reviewer) | – |
| **8** | **Compute Triple Cohen's κ** + bootstrap 95% CIs | – |
| **9** | **Automated PDF retrieval** (12-source open-access fallback chain) | **Layer 4** |
| 10 | Prepare list for full-text reading | Layer 5 |
| 11 | Generate empty data extraction template | – |
| 12 | Generate PRISMA 2020 flow diagram (SVG) | – |
| 13 | Final summary & next steps | – |

## Prerequisites

Before running this notebook:

1. **Google Sheet** populated by Phase 1 (n8n workflow)
2. **Apps Script `designSheet()`** has been executed on that Sheet
3. **Two Colab Secrets** configured (🔑 left sidebar in Colab):
   - `GROQ_API_KEY` — your Groq API key
   - `GOOGLE_SHEET_ID` — your Sheet ID

⚠️ **Never paste API keys directly into cells.** All references use `userdata.get(...)`.

## Running the Notebook

### First time

1. Open the notebook in [Google Colab](https://colab.research.google.com).
2. Upload it via **File → Upload notebook**, OR open from GitHub: **File → Open notebook → GitHub** and paste this repo URL.
3. Run **Section 1 → Section 2** to verify connectivity.
4. Continue through the sections in order.

### Idempotent

The notebook is **safe to re-run**. Each cell checks for already-processed records (non-empty `filter_*` cells) and skips them. To force re-processing, clear the relevant column in the Sheet first.

### Section dependencies

```
Section 1 (Setup)
    ↓
Section 2 (Connect to Sheets)
    ↓
[Sections 3, 4 are optional]
    ↓
Section 5 (LLM Screening)         ← requires Phase 1 (n8n) done
    ↓
Section 6 (Pre-fill manual)       ← requires Section 5 done
    ↓
Section 7 (Sample for κ)          ← R1 reviews after this
    ↓                                  Send CSV to R2
Section 8 (Compute Triple κ)      ← requires R2 returned CSV
    ↓
Section 9 (PDF retrieval)         ← requires R1 finalised filter_manuel
    ↓
Sections 10–13 (post-processing)
```

## Customising for Your Review

The only file you need to edit for your own review topic:

- **`prompts/llm_screening_prompt.md`** OR the `PROMPT` variable in **Section 5 of the notebook** — adapt the research question and 5 PICO criteria to your topic.

The pipeline is designed so **all topic-specific parameters live in `config/config_*.json`** (loaded by Phase 1 / n8n), and only the prompt needs touching in the notebook itself.

See [`docs/domain_adaptation.md`](../docs/domain_adaptation.md) for a full walkthrough.

## Performance & Cost

For ~600 articles passed to Layer 2 (Section 5):

| Metric | Value |
|--------|-------|
| Total runtime | 30–60 min (Section 5 only) |
| Per-article time | 4.5 sec |
| Tokens per article | ~800 input + ~150 output |
| Groq free tier limit | 30 req/min, 14 400 tokens/min |
| **Cost** | **$0.00** (Groq free tier) |
| GPT-4o equivalent | ~$2.20 |

## Provider Substitution

The notebook is **provider-agnostic**. To use a non-Groq endpoint (local vLLM, Ollama, etc.), edit the URL in Section 5:

```python
# Default (Groq):
url = 'https://api.groq.com/openai/v1/chat/completions'

# Local vLLM:
url = 'http://localhost:8000/v1/chat/completions'

# Ollama:
url = 'http://localhost:11434/v1/chat/completions'
```

All these endpoints accept the same OpenAI-compatible JSON payload.

## Troubleshooting

See [`docs/troubleshooting.md`](../docs/troubleshooting.md) for common issues (rate limits, malformed JSON, sheet permissions, etc.).
