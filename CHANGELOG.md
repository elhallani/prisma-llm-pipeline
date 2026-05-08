# Changelog

All notable changes to the PRISMA-LLM Pipeline will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] — 2026-05-08

### Added — Initial public release

- **Phase 1 — n8n Workflow** (`n8n/workflow.json`):
  - 6-database record acquisition (OpenAlex, PubMed, Semantic Scholar, IEEE Xplore, Scopus, Springer Nature).
  - 4-level deduplication pipeline (DOI exact → normalised title → Jaccard trigram → author-year hash).
  - Layer 1 binary keyword screening (3-question filter).
  - Wizard-mode Config node: edit ~25 lines, all Boolean queries auto-generated per database.
  - Domain-agnostic: all topic-specific parameters in single Config node.

- **Phase 2 — Google Colab Notebook** (`colab/notebook.ipynb`):
  - Layer 2: LLM-assisted structured scoring (Llama 3.3 70B via Groq, 5 PICO-aligned criteria).
  - Layer 3: Independent human verification with structural blinding.
  - Layer 4: Automated PDF retrieval from 12 open-access sources.
  - Layer 5: Full-text assessment with R1+R2 dual review and R3 arbitration.
  - Triple Cohen's κ framework with bootstrap 95% CI (1,000 resamples, seed = 42).
  - 13 sections with clear documentation and idempotent re-execution.

- **Phase 3 — Google Apps Script** (`apps_script/setup_sheet.gs`):
  - Auto-creates 11 dedicated tabs (Dashboard, SCREENED, KAPPA_RESULTS, etc.).
  - Live PRISMA dashboard with formulas.
  - Structural blinding via column-level protection.

- **Configuration** (`config/`):
  - `config_template.json` — generic template for any review topic.
  - `config_AD_speech.json` — worked example (AI-based AD detection from speech).

- **Documentation** (`docs/`):
  - Architecture, installation, deployment, domain adaptation, troubleshooting.

- **Security**:
  - All API keys read from n8n environment variables (zero hardcoded secrets).
  - Comprehensive `.gitignore` for credentials and screening data.
  - Pre-configured GitHub Actions for secret scanning.

- **License**: MIT (see `LICENSE`).

### Notes

- A peer-reviewed methodology paper describing this pipeline is in preparation.
- This `CHANGELOG.md` will document any breaking changes, new features, and bug fixes.

---

## Versioning Policy

- **MAJOR** version: incompatible API/configuration schema changes.
- **MINOR** version: new features, additional database integrations, new layers (backwards-compatible).
- **PATCH** version: bug fixes, documentation, dependency updates.

[0.1.0]: https://github.com/elhallani/prisma-llm-pipeline/releases/tag/v0.1.0
