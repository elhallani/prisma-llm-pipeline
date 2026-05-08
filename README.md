# PRISMA-LLM Pipeline

> **An Integrated Semi-Automated Screening Pipeline for Systematic Reviews**
> Five-Layer Human-in-the-Loop Design · Structured LLM Scoring · Open-Source Deployment

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRISMA 2020](https://img.shields.io/badge/PRISMA-2020--compliant-green)](https://www.prisma-statement.org/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)](https://www.python.org/)

An open-source, reproducible, human-in-the-loop pipeline for **PRISMA 2020-compliant systematic review screening**.

This repository contains everything you need to **deploy this protocol on your own systematic review** — regardless of topic. Edit one configuration file, deploy three components (n8n + Colab + Sheets), and run.

---

## ✨ What you get

- 🤖 **Open-weight LLM screening** with Llama 3.3 70B (no proprietary models required)
- 📚 **6-database acquisition** — OpenAlex, PubMed, Semantic Scholar, IEEE Xplore, Scopus, Springer
- 🔁 **4-level deduplication** — DOI → title → Jaccard trigram → author-year hash
- 👥 **Triple Cohen's κ** — human–human, human–LLM, independent human–LLM
- 📄 **12-source PDF retrieval** — fully automated open-access fallback chain
- 💰 **Zero cost** — runs on Groq free tier + Google Colab + Google Sheets + n8n cloud
- 🌍 **Domain-agnostic** — adapt to any review topic via one JSON config file

---

## 🏗️ Three-Phase Architecture

```
┌─────────────────────┐    ┌──────────────────────┐    ┌─────────────────────┐
│  Phase 1            │    │  Phase 2             │    │  Phase 3            │
│  n8n Workflow       │───▶│  Google Colab        │───▶│  Google Sheets      │
│                     │    │  (Python notebook)   │    │  (Dashboard)        │
│  • 6 database APIs  │    │  • 5-layer screening │    │  • Reviewer UI      │
│  • Normalisation    │    │  • LLM (Llama 3.3)   │    │  • Live PRISMA flow │
│  • 4-level dedup    │    │  • Triple Cohen's κ  │    │  • Audit trail      │
└─────────────────────┘    └──────────────────────┘    └─────────────────────┘
```

See [`docs/architecture.md`](docs/architecture.md) for full data-flow diagrams and design rationale.

---

## 🚀 Getting Started

**Goal**: deploy the pipeline on your own systematic review topic in ≈ 30–45 minutes.

### Step 1 — Clone the repository

```bash
git clone https://github.com/elhallani/prisma-llm-pipeline.git
cd prisma-llm-pipeline
```

### Step 2 — Get free API keys

You need accounts on these platforms (all free tiers):

| Service | Purpose | Get key |
|---|---|---|
| Groq | LLM inference | https://console.groq.com/keys |
| NCBI | PubMed access | https://www.ncbi.nlm.nih.gov/account/ |
| Semantic Scholar | Open metadata | https://www.semanticscholar.org/product/api |
| IEEE Xplore | Engineering papers | https://developer.ieee.org/ |
| Scopus (Elsevier) | Multidisciplinary | https://dev.elsevier.com/ |
| Springer Nature | Publisher metadata | https://dev.springernature.com/ |

### Step 3 — Configure for your review topic

Copy the template and edit it:

```bash
cp config/config_template.json config/config_my_review.json
```

The pipeline uses a **Wizard-mode** configuration: edit only 6 sections (title, years, 3 keyword arrays, exclusions). Boolean queries for the 6 databases are auto-generated.

📖 **Detailed walkthrough**: [`docs/domain_adaptation.md`](docs/domain_adaptation.md)

A worked example for the validation case (AI-based AD detection from speech) is in [`config/config_AD_speech.json`](config/config_AD_speech.json).

### Step 4 — Deploy the three components

| Component | Where to deploy | Guide |
|---|---|---|
| 🟦 **n8n workflow** | n8n cloud or self-hosted | [`n8n/README.md`](n8n/README.md) |
| 🟩 **Colab notebook** | Google Colab | [`colab/README.md`](colab/README.md) |
| 🟨 **Apps Script** | Your Google Sheet | [`apps_script/README.md`](apps_script/README.md) |

📖 **Step-by-step setup**: [`docs/installation.md`](docs/installation.md)

### Step 5 — Run the pipeline

📖 **Execution guide**: [`docs/deployment.md`](docs/deployment.md)

---

## 📂 Repository Layout

| Path | Contents |
|------|----------|
| [`config/`](config/) | Configuration templates + worked example |
| [`n8n/`](n8n/) | Phase 1 — record acquisition workflow |
| [`colab/`](colab/) | Phase 2 — five-layer screening notebook + LLM prompt |
| [`apps_script/`](apps_script/) | Phase 3 — Google Sheets dashboard & blinding logic |
| [`docs/`](docs/) | Installation, deployment, adaptation, troubleshooting |

---

## 📖 Documentation

| Document | When to read |
|---|---|
| [`docs/installation.md`](docs/installation.md) | First-time setup (≈ 30–45 min) |
| [`docs/deployment.md`](docs/deployment.md) | Running the pipeline end-to-end |
| [`docs/domain_adaptation.md`](docs/domain_adaptation.md) | Adapting to your own review topic |
| [`docs/architecture.md`](docs/architecture.md) | Technical design & data flow |
| [`docs/troubleshooting.md`](docs/troubleshooting.md) | Common issues & fixes |

---

## 🤝 Contributing

Contributions welcome — bug reports, feature ideas, documentation improvements, additional domain adaptations. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).

---

## 📜 License

MIT License — see [`LICENSE`](LICENSE). You are free to use, modify, distribute, and adapt for any purpose, including commercial use.

---

## 📖 Citation

If this protocol helps your research, please cite the repository:

```bibtex
@misc{elhallani_prisma_llm_pipeline_2026,
  author       = {El Hallani, Anass and Chakhtouna, Adil and Adib, Abdellah},
  title        = {{PRISMA-LLM Pipeline: Five-Layer Human-in-the-Loop
                   Systematic Review Screening}},
  year         = {2026},
  publisher    = {GitHub},
  howpublished = {\url{https://github.com/elhallani/prisma-llm-pipeline}}
}
```

A `CITATION.cff` file is also provided so GitHub displays a citation widget on the repository sidebar.

> 📌 *A peer-reviewed methodology paper describing this pipeline is in preparation. This citation entry will be updated with the journal DOI when the paper is published.*

---

## 👥 Authors

- **Anass El Hallani** — PhD candidate · [LIM Lab](), Hassan II University of Casablanca, Morocco
  · [ORCID 0009-0007-3449-4327](https://orcid.org/0009-0007-3449-4327)
- **Adil Chakhtouna** — Supervisor, LIM
- **Abdellah Adib** — Co-supervisor, LIM

📧 Contact: anass.elhallani-etu@etu.univh2c.ma

---

<sub>v0.1.0 · 2026 · MIT</sub>
