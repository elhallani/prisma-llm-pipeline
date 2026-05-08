# Phase 3 — Google Apps Script

This directory contains the Apps Script that designs the Google Sheets dashboard and **structurally enforces the blinding** described in Section 2.3.3 of the paper.

## Files

- `setup_sheet.gs` — Main script: creates tabs, formats dashboard, sets data validations, hides LLM columns from R1, hides R1+LLM columns from R2.

## What This Script Does

| Function | Purpose |
|----------|---------|
| `designSheet()` | Master function: runs all setup steps in order |
| `createTabs()` | Creates 11 dedicated tabs (Dashboard, SCREENED, KAPPA_RESULTS, REVIEW_LLM, REVIEW_MANUEL, DISAGREEMENTS, REVIEW_PDF, REVIEW_FULLTEXT, PDF_NOT_FOUND, FINAL_INCLUDED, ALL_EXCLUDED) |
| `createDashboard()` | Builds the live PRISMA dashboard with formulas |
| `createKappaTab()` | Sets up the κ results tab |
| `ensureSupervisorColumns()` | Adds R2/R3 columns if missing |
| `makeSmartTab()` | Applies conditional formatting to a tab |
| `colLetter()` | Helper: column index → letter |
| `getSep()`, `putCF2()` | Internal utilities |

## Quick Start

1. Open your Google Sheet.
2. Go to **Extensions → Apps Script**.
3. Delete the default `Code.gs` content.
4. Paste the contents of `setup_sheet.gs`.
5. Click **Save** (💾) and authorise when prompted.
6. From the function dropdown, select `designSheet` and click **Run** ▶.

## Resulting Dashboard Structure

After running `designSheet()`, your Sheet will have:

- **Dashboard** — Live PRISMA flow with five-layer screening funnel, breakdowns by source/year/quality/type, triple κ panel.
- **SCREENED** — Main data tab (all 962 records after dedup, in our validation case).
- **KAPPA_RESULTS** — Triple κ values + 95% CIs after bootstrap.
- **REVIEW_LLM** — LLM decisions per record.
- **REVIEW_MANUEL** — R1 (first reviewer) decisions.
- **DISAGREEMENTS** — Auto-populated from R1 ≠ LLM mismatches.
- **REVIEW_PDF** — Layer 4 PDF retrieval log.
- **REVIEW_FULLTEXT** — Layer 5 full-text decisions (R1 + R2).
- **PDF_NOT_FOUND** — Manual follow-up queue.
- **FINAL_INCLUDED** — Final included records after all layers.
- **ALL_EXCLUDED** — All exclusions with reason taxonomy.

## Blinding Enforcement

The script implements **structural blinding** (paper Section 2.3.3):

- **For R1 (filter_manuel)**: Columns `filter_llm` and `raison_llm` are hidden until R1 submits their decision.
- **For R2 (filter_supervisor2)**: Columns `filter_llm`, `raison_llm`, `filter_manuel`, `raison_manuelle` are hidden — R2 sees only title + abstract.
- **For R3 (arbiter)**: Sees all columns to perform arbitration.

This blinding is enforced by sheet-level protection + Apps Script automation, not reviewer self-discipline.

## Customisation

The script reads tab names and column names from constants at the top. To customise:

```javascript
var manualCols = ["filter_manuel","filter_readfulltext","filter_supervisor2","filter_supervisor3"];
```

Modify these constants if your column naming differs.
