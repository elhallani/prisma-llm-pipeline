# Installation Guide

End-to-end installation guide for deploying the PRISMA-LLM Pipeline. Estimated setup time: **30–45 minutes**.

## Prerequisites

| Requirement | Free tier? | Link |
|-------------|------------|------|
| Google account | ✓ | [google.com](https://google.com) |
| n8n (cloud or self-hosted) | ✓ | [n8n.io](https://n8n.io) |
| Groq account | ✓ | [console.groq.com](https://console.groq.com) |
| NCBI account | ✓ | [ncbi.nlm.nih.gov](https://www.ncbi.nlm.nih.gov/account/) |
| Semantic Scholar API access | ✓ | [api.semanticscholar.org](https://www.semanticscholar.org/product/api) |
| IEEE Xplore developer | ✓ | [developer.ieee.org](https://developer.ieee.org/) |
| Scopus (Elsevier) developer | ✓ (institutional access required) | [dev.elsevier.com](https://dev.elsevier.com/) |
| Springer Nature developer | ✓ | [dev.springernature.com](https://dev.springernature.com/) |
| Python 3.10+ (for local scripts) | ✓ | [python.org](https://python.org) |

## Step 1 — Clone the Repository

```bash
git clone https://github.com/elhallani/prisma-llm-pipeline.git
cd prisma-llm-pipeline
```

## Step 2 — Obtain API Keys

Create a free account on each platform and generate an API key:

### Groq (LLM inference)
1. Sign up at [console.groq.com](https://console.groq.com)
2. Navigate to **API Keys** → **Create API Key**
3. Copy the key (starts with `gsk_`)

### NCBI (PubMed)
1. Sign in at [ncbi.nlm.nih.gov](https://www.ncbi.nlm.nih.gov/account/)
2. Go to **Settings** → **API Key Management**
3. Generate a new API key

### Other databases
- **Semantic Scholar**: Request via their [API form](https://www.semanticscholar.org/product/api#api-key-form)
- **IEEE Xplore**: Register at [developer.ieee.org](https://developer.ieee.org/), create an application
- **Scopus**: Register at [dev.elsevier.com](https://dev.elsevier.com/) (requires institutional access)
- **Springer Nature**: Register at [dev.springernature.com](https://dev.springernature.com/), create two applications (Meta API + Open Access)

## Step 3 — Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your API keys:

```bash
GROQ_API_KEY=gsk_your_actual_key_here
NCBI_API_KEY=your_ncbi_key_here
NCBI_EMAIL=your.email@institution.edu
# ... etc.
```

⚠️ **Never commit `.env`.** It is git-ignored by default.

## Step 4 — Set Up Google Sheets

1. Create a new Google Sheets document.
2. Note the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`.
3. Add `GOOGLE_SHEET_ID=SHEET_ID` to your `.env`.
4. Open **Extensions → Apps Script** in your Sheet.
5. Paste the contents of `apps_script/setup_sheet.gs`.
6. Run the `designSheet()` function once to create all tabs and formatting.

## Step 5 — Deploy n8n Workflow

### Option A: n8n Cloud
1. Sign up at [n8n.io](https://n8n.io).
2. Open your workspace → **Workflows** → **Import from File**.
3. Upload `n8n/workflow.json`.
4. Edit the **Config** node to insert your API keys (or use n8n credentials for safer storage).
5. Activate the workflow.

### Option B: Self-hosted n8n
```bash
docker run -d --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```
Then import the workflow JSON via the web UI.

## Step 6 — Set Up Colab Notebook

1. Open `colab/notebook.ipynb` in [Google Colab](https://colab.research.google.com).
2. In the first code cell, set the `SHEET_ID` variable.
3. Store your `GROQ_API_KEY` using Colab's secret manager (🔑 left sidebar) — **do not paste keys in cells**.
4. Mount Google Drive when prompted.

## Step 7 — Customise Configuration

Copy and edit the configuration template:

```bash
cp config/config_template.json config/config_my_review.json
```

Edit:
- `review.title`, `review.pico` — your research question
- `keywords.g1_population`, `g2_intervention`, `g3_method` — your keywords
- `boolean_queries` — adjust per-database queries
- `layer2_llm_scoring.criteria` — adjust scoring rubric for your domain

See [`domain_adaptation.md`](domain_adaptation.md) for detailed walkthrough.

## Step 8 — Run!

See [`deployment.md`](deployment.md) for execution instructions.

## Troubleshooting

If you encounter issues during setup, see [`troubleshooting.md`](troubleshooting.md) or open a [bug report](../.github/ISSUE_TEMPLATE/bug_report.md).
