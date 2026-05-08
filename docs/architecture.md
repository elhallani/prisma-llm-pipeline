# Architecture

This document describes the technical architecture of the PRISMA-LLM Pipeline. For a higher-level overview, see the [README](../README.md).

## Three-Phase Design

The pipeline runs in three coordinated phases connected exclusively via programmatic APIs (no manual data transfer).

```
┌────────────────────────────┐
│  PHASE 1 — n8n Workflow    │     6-database acquisition
│  (Phase 1: Acquisition)    │     ↓
│                            │     4-level deduplication
│  • OpenAlex                │     ↓
│  • PubMed (NCBI)           │     Normalisation (25-field schema)
│  • Semantic Scholar        │     ↓
│  • IEEE Xplore             │     ↓ Google Sheets API v4
│  • Scopus                  │     ↓
│  • Springer Nature         │
└──────────────┬─────────────┘
               │
               ▼
┌────────────────────────────┐
│  Google Sheets (Phase 3)   │     Single source of truth
│  • SCREENED tab            │     Reviewer interface
│  • DASHBOARD               │     Audit trail
│  • REVIEW_* tabs           │     Live PRISMA flow
│  • DISAGREEMENTS           │
└──────────────┬─────────────┘
               │ ↑ gspread (read/write)
               ▼ │
┌────────────────────────────┐
│  PHASE 2 — Colab Notebook  │     5-layer screening
│                            │     ↓
│  Cell 1: Connect Sheets    │
│  Cell 2: LLM screening     │ ──→ Groq REST API (Llama 3.3 70B)
│  Cell 3: Write back        │
│  Cell 4: Triple κ          │
│  Cell 5: PDF retrieval     │
│  Cell 6: Logs & exports    │
└────────────────────────────┘
```

## Data Flow

1. **Phase 1 → Sheets**: n8n appends 25-field rows to the `SCREENED` tab via Google Sheets API v4.
2. **Sheets ↔ Phase 2**: Colab reads/writes via the `gspread` Python library using service-account credentials.
3. **Phase 2 → Groq**: LLM inference via REST API (OpenAI-compatible JSON payload).
4. **Phase 3 = Sheets**: All workflow state lives in Sheets; reviewers interact via browser.

## Component Responsibilities

| Component | Function | Single Responsibility |
|-----------|----------|------------------------|
| n8n workflow | Multi-DB acquisition + dedup | Get records into Sheets |
| Google Sheets | Data store + reviewer UI | Source of truth |
| Apps Script | Sheet design + blinding | Structural enforcement |
| Colab notebook | Screening + κ + PDFs | Computation |
| Groq API | LLM inference | Stateless scoring |

## Design Principles

### 1. Separation of Concerns
Each layer has a single function. Replacing any component (e.g., swapping Groq for local vLLM) does not affect the others.

### 2. Decision Authority Preservation
Automated layers (1, 2, 4) reduce volume but never make final inclusion decisions. Only human reviewers (Layers 3, 5) do.

### 3. Configuration-Driven Domain-Agnosticism
All topic-specific parameters live in a single JSON config file. No code modification is required to adapt to a new review topic.

### 4. Structural Blinding
The Google Sheets interface physically hides LLM and prior-reviewer columns from the current reviewer using sheet protection and Apps Script automation. Blinding is enforced by the interface, not by reviewer self-discipline.

### 5. Provider-Agnostic LLM
The Groq endpoint is replaceable with any OpenAI-compatible API by changing a single URL in the configuration:
- Local vLLM
- Ollama
- text-generation-inference
- Any other provider

## Why Three Platforms?

A monolithic Python application was rejected in favour of n8n + Colab + Sheets because:

- **Accessibility**: All three are free, browser-based, no installation.
- **Modularity**: Each can be replaced independently (Apache Airflow ↔ n8n; Jupyter ↔ Colab).
- **Transparency**: n8n's visual workflow is inspectable by non-programmers.
- **Collaboration**: Sheets natively supports multi-user concurrent access with granular permissions, essential for blinded reviewer workflows.

## Database Selection Rationale

| Database | Coverage |
|----------|----------|
| OpenAlex | Multidisciplinary, open metadata |
| PubMed | Biomedical, MeSH controlled vocabulary |
| Semantic Scholar | CS/AI, open-access full text links |
| IEEE Xplore | Engineering, computer science |
| Scopus | Multidisciplinary, citation graph |
| Springer Nature | Multidisciplinary, OA priority |

**Web of Science** was excluded because its API requires institutional subscription. **Google Scholar** was excluded because it lacks an official API (web scraping violates ToS).

The architecture is modular — adding a 7th database requires only a new n8n node, no code changes elsewhere.

## See Also

- [`installation.md`](installation.md) — Step-by-step setup
- [`deployment.md`](deployment.md) — Running the pipeline
- [`domain_adaptation.md`](domain_adaptation.md) — Adapting to a new review topic
- [`troubleshooting.md`](troubleshooting.md) — Common issues
