# Deployment & Execution Guide

How to run the PRISMA-LLM Pipeline end-to-end after [installation](installation.md).

Estimated runtime for a typical review (~1 000 records): **2–4 hours of compute** + **8–20 hours of human review** at Layers 3 and 5.

## Pre-Run Checklist

Before launching:

- [ ] Configuration JSON file validates (no syntax errors): `python -c "import json; json.load(open('config/active.json'))"`
- [ ] All API keys in `.env` (test with a small query first)
- [ ] Google Sheet created and `Apps Script` `designSheet()` executed
- [ ] Reviewer roles assigned (R1, R2, R3) with confirmed email access
- [ ] *(Optional)* Protocol pre-registered on PROSPERO/OSF if applicable to your review

## Execution Sequence

### Phase 1 — Acquisition (n8n) · ~15 minutes

1. Open your n8n instance.
2. Open the imported workflow.
3. Click **Execute Workflow** ▶.
4. Monitor each database node — green = success, red = error.
5. Verify final node "Export Complete" returns expected count.
6. Check your Google Sheet — `SCREENED` tab should be populated.

**Expected output**: ~500 to 2 000 records depending on topic breadth.

### Phase 2 — Screening (Colab) · ~1–2 hours

Open `colab/notebook.ipynb` and run cells in order:

| Cell | Action | Time |
|------|--------|------|
| 1 | Mount Drive, install deps | 30 s |
| 2 | Connect to Sheet | 5 s |
| 3 | Enrich missing abstracts | 5–10 min |
| 4 | Fill venue/quality | 1–2 min |
| 5 | **LLM screening (Layer 2)** | **30–60 min** |
| 6 | Pre-fill `filter_manuel` | 1 min |
| 7 | Sample 50 articles for κ | 30 s |
| 8 | Compute triple κ + bootstrap CIs | 1 min |
| 9 | PDF retrieval (Layer 4) | 10–30 min |
| 10 | Prepare full-text reading | 30 s |
| 11 | Generate extraction template | 30 s |
| 12 | Generate PRISMA flow SVG | 5 s |

### Phase 3 — Human Review · 8–20 hours of reviewer time

#### Layer 3 (R1)
1. R1 opens the Sheet, `SCREENED` tab.
2. The `filter_llm` and `raison_llm` columns are hidden.
3. R1 reviews each record (title + abstract) and fills `filter_manuel` with `INCLUDE` or `EXCLUDE`.
4. After R1's decision is submitted, the LLM columns auto-unhide for inspection.

#### κ Validation (R2 sample)
1. R2 receives access to a separate sheet/CSV with the n=120 stratified sample.
2. R2 sees only `title` + `abstract` columns (blinded).
3. R2 fills `filter_supervisor2` with `INCLUDE` or `EXCLUDE`.
4. Re-run Cell 8 of the notebook to compute final κ values.

#### Disagreement Resolution
- The `DISAGREEMENTS` tab is auto-populated.
- R3 (arbiter) reviews and adds final decision.

#### Layer 5 (Full-Text)
1. R1 and R2 independently read PDFs from `/PRISMA/` Drive folder.
2. Each fills decision + reason in `REVIEW_FULLTEXT` tab.
3. R3 arbitrates remaining disagreements.
4. Final included set populates `FINAL_INCLUDED` tab.

## Monitoring Progress

- **Live dashboard**: `Dashboard` tab refreshes formulas in real-time.
- **Logs**: Colab cells print progress; n8n shows execution history.
- **PRISMA flow**: Auto-generated SVG saved to your Google Drive folder after Cell 12.

## Stopping & Resuming

The pipeline is **idempotent** — re-running any cell skips already-processed records (checks for non-empty `filter_*` values).

To force a re-run on a subset, clear the relevant column for those records.

## Outputs

After full completion:

```
/PRISMA/
├── *.pdf                          ← Retrieved full texts
├── PRISMA_flow_v18.svg            ← Auto-generated PRISMA 2020 diagram
├── kappa_results.json             ← Triple κ + bootstrap CIs
└── /templates/
    ├── Data_Extraction.csv        ← Empty template for Layer 5+
    ├── PROBAST_RoB_assessment.csv ← Risk-of-bias template
    └── Kappa_Sample_Supervisor.csv
```

## Estimated Costs

For a typical run (~1 000 records → ~250 to LLM):
- Groq inference (Llama 3.3 70B): **$0.00** (free tier)
- GPT-4o equivalent: ~$2.50
- Local vLLM on A100 GPU: free (after hardware)
- Reviewer time (R1 + R2 + R3 combined): ~12-20 hours

## After Completion

1. Archive the run on Zenodo (full Sheet export + config + PRISMA SVG).
2. Update `CHANGELOG.md` with the run's metadata.
3. Cite this software (`CITATION.cff`) and the methodology paper in your review.

For issues, see [`troubleshooting.md`](troubleshooting.md).
