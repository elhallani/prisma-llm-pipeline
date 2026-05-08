# Adapting the Pipeline to a New Review Topic

This guide implements **Section 2.7** of the methodology paper. The pipeline is **fully domain-agnostic** — adapting it to a new systematic review topic requires editing only one configuration file (`config/config_<your_topic>.json`). No code modification is needed.

## Five-Step Adaptation Procedure

### Step 1 — Design the Keyword Lists (Layer 1)

In your config, populate three keyword groups:

```json
{
  "keywords": {
    "g1_population":   [ "term1", "synonym1", "abbreviation1" ],
    "g2_intervention": [ "term1", "synonym1" ],
    "g3_method":       [ "term1", "synonym1" ]
  }
}
```

**Recommended size**: 5–8 terms per group, including:
- Primary concept
- Common synonyms
- Abbreviations
- MeSH equivalents (for biomedical reviews)

#### Pilot test (recommended)

Before full deployment:
1. Manually identify 20 known-relevant + 20 known-irrelevant articles from a preliminary search.
2. Run Layer 1 on this 40-article test set.
3. Verify ≥ 90% (≥ 18/20) of relevant articles are classified `INCLUDE` or `BORDERLINE`.

If recall < 90%, add terms from missed articles' titles/abstracts.

⚠️ **Consequence of poor keyword design**: false negatives at Layer 1 are *deterministic* — records are excluded before the LLM sees them, and this loss is irrecoverable downstream.

### Step 2 — Replace the Layer 1 Binary Questions

Each of the three questions maps to one keyword group:

```json
{
  "layer1_keyword_filter": {
    "questions": [
      { "id": "q1", "keywords_ref": "g1_population",   "label": "Population/condition mentioned?" },
      { "id": "q2", "keywords_ref": "g2_intervention", "label": "Intervention/exposure/modality mentioned?" },
      { "id": "q3", "keywords_ref": "g3_method",       "label": "Method/technology mentioned?" }
    ]
  }
}
```

Layer 1 is **deterministic** — questions must be answerable by keyword presence alone (no semantic interpretation).

### Step 3 — Re-specify the LLM Scoring Criteria (Box 1)

Edit `colab/prompts/llm_screening_prompt.md` and the criteria section in your config. The five criteria must reflect your PICO dimensions:

| Criterion | Domain mapping | Typical scoring |
|-----------|----------------|------------------|
| **P1 — Population** | Target population vs comparator | 0 = absent; 1 = mentioned; 2 = diagnostic criteria explicit |
| **I2 — Input/Intervention** | Data type, intervention, or exposure | 0 = absent; 1 = mentioned; 2 = detailed description |
| **M3 — Method** | Analytical approach (often stable across domains) | 0 = absent; 1 = named; 2 = architecture/training detailed |
| **O4 — Originality** | Distinguishes empirical work from reviews/editorials | 0 = review/editorial; 1 = original; 2 = novel design |
| **C5 — Contribution** | Substantive contribution to target domain | 0 = off-topic; 1 = incremental; 2 = significant advancement |

Use your review's pre-specified inclusion criteria as the reference for P1 (these typically come from your protocol or pre-registration document — PROSPERO, OSF, or institutional protocol).

### Step 4 — Configure Database Queries

Update Boolean strings per database. Note syntax differences:

| Database | Syntax |
|----------|--------|
| OpenAlex | Standard Boolean |
| Scopus | `TITLE-ABS-KEY(...)` wrapper |
| PubMed | Boolean + MeSH headings |
| IEEE Xplore | Standard Boolean |
| Semantic Scholar | Natural language (relevance-ranked) |
| Springer Nature | Multi-query keyword combinations |

Template structure:
```
G1_terms AND G2_terms AND G3_terms [AND year_range] [AND filters]
```

### Step 5 — Calibrate the Inclusion Threshold

The default threshold `T = 7` (out of 10) is recall-favouring per EPOC guidance.

Adjust based on your review type:

| Review type | Recommended threshold | Rationale |
|-------------|------------------------|------------|
| Safety-critical | ≥ 6 | Maximum recall; missed studies more costly |
| Cochrane review | ≥ 6 | Maximum recall |
| Sparse-evidence | ≥ 6 | Don't miss relevant work |
| Standard | ≥ 7 | Balanced sensitivity/specificity |
| Large-scale (>5000 records) | ≥ 8 | Precision-prioritised; lower full-text screening cost |

The mandatory gates (P1≥1, I2≥1, O4≥1) prevent high scores on peripheral criteria from generating false positives that lack core PICO elements. Adjust which criteria are mandatory per your domain — for example, M3 might be mandatory if the method is a defining inclusion criterion.

## Worked Examples

### Example 1: AI-based Alzheimer's Disease Detection (Validation Case)

See [`config/config_AD_speech.json`](../config/config_AD_speech.json) — the actual configuration used for the proof-of-concept validation reported in the paper.

PICO:
- **P**: AD vs healthy controls (binary)
- **I**: Speech, text, or multimodal data
- **C**: Healthy age-matched controls
- **O**: Binary classification metrics

### Example 2: Sepsis Prediction from Physiological Signals (Planned)

### Example 2: Sepsis Prediction from Physiological Signals (Conceptual)

A different biomedical domain demonstrating the protocol's adaptability:

- **P**: Sepsis vs non-sepsis ICU patients
- **I**: Physiological signals (vital signs, lab values, MIMIC-III/IV)
- **C**: Non-septic controls
- **O**: Early warning prediction (sensitivity, specificity)

Configuration would replace the keyword arrays accordingly:
```javascript
const POPULATION   = ["sepsis", "septic shock", "septicemia", "ICU patient", ...];
const INTERVENTION = ["physiological signals", "vital signs", "ECG", "MIMIC", ...];
const METHOD       = ["machine learning", "deep learning", "early warning", ...];
```

The remaining workflow components (acquisition, deduplication, screening, retrieval) operate without modification — demonstrating the protocol's true domain-agnosticism.

Demonstrates adaptation to a different biomedical domain with different PICO structure.

## Validation Checklist Before Full Run

Before launching the full pipeline on a new topic:

- [ ] Keyword pilot test passed (≥ 90% recall on 40-article test set)
- [ ] Boolean queries return reasonable result counts per database (not 0, not millions)
- [ ] LLM prompt produces valid JSON on 5-10 test articles
- [ ] Decision rule manually verified on 10 known cases
- [ ] *(Optional)* Protocol pre-registered (PROSPERO for clinical reviews, OSF for methodology validation, or other registry as appropriate)
- [ ] Configuration file is syntactically valid JSON
- [ ] All API keys are configured in `.env`

## Reporting Domain Adaptations

If you adapt the pipeline to a new topic and want to share your configuration:

1. Place your config in `config/config_<topic>_example.json`
2. Submit a PR with a brief description in this document under "Worked Examples"
3. Include performance metrics if you've run validation (sensitivity, specificity, κ values)

We welcome diverse domain adaptations to demonstrate generalisability.
