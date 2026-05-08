# Phase 1 — n8n Workflow

This directory contains the **Phase 1 workflow** that automates record acquisition, normalisation, deduplication, and Layer 1 keyword screening (Section 2.2 of the methodology paper).

## Files

- [`workflow.json`](workflow.json) — Importable n8n workflow (no API keys, no secrets)

## What This Workflow Does

The workflow is organised into **6 phases** (each documented inline as a sticky note):

| Phase | Purpose | Nodes |
|-------|---------|-------|
| **1A** | Configuration (single editable node) | `⚙️ Config` |
| **1B** | Database acquisition (6 APIs in parallel) | `📡 1. OpenAlex API` ... `📡 6. Springer Nature API` |
| **1C** | Progressive cascade merging | `🔗 Merge: ...` (5 merge nodes) |
| **1D** | Normalisation + 4-level deduplication | `🗂️ Normalise (25-field schema)`, `🔍 4-Level Deduplication` |
| **1E** | Layer 1 binary keyword screening | `📋 Layer 1: Keyword Filter` |
| **1F** | Output to Google Sheets + PRISMA SVG | `📝 Write to Google Sheet`, `🖼️ PRISMA Flow Diagram (SVG)`, `✅ Run Summary & Logs` |

## 🔒 Security: API Keys Are NOT in This File

This workflow contains **zero hardcoded credentials**. All API keys are read from **n8n environment variables** at runtime, which means:

- ✅ Safe to commit to public Git repositories
- ✅ Safe to share between team members
- ✅ Different deployments use different keys without editing the workflow

You configure the keys **once** in n8n, then the workflow uses them automatically.

---

## 🚀 Setup Guide

### Step 1 — Get Your API Keys (free tiers)

| Service | Sign-up URL | What to copy |
|---------|-------------|---------------|
| NCBI / PubMed | https://www.ncbi.nlm.nih.gov/account/ | API Key (Settings → API Key Management) |
| Semantic Scholar | https://www.semanticscholar.org/product/api | API Key (request via form) |
| IEEE Xplore | https://developer.ieee.org/ | Application Key |
| Scopus (Elsevier) | https://dev.elsevier.com/ | API Key (institutional access required) |
| Springer Nature | https://dev.springernature.com/ | Two keys: Meta API + Open Access |

> 💡 **OpenAlex** does not require a key (free, no registration). Just provide your email via the `mailto` parameter.

### Step 2 — Configure n8n Environment Variables

You need to set **8 variables** in n8n. The procedure differs slightly between n8n Cloud and self-hosted:

#### A. n8n Cloud

1. Open your n8n cloud workspace.
2. Go to **Settings** → **Variables** (left sidebar).
3. Click **+ Add Variable** for each of these:

| Variable name | Value |
|---------------|-------|
| `PRISMA_NCBI_KEY` | Your NCBI API key |
| `PRISMA_NCBI_EMAIL` | Your institutional email (for NCBI usage stats) |
| `PRISMA_SPRINGER_KEY` | Your Springer Nature key |
| `PRISMA_SPRINGER_OA_KEY` | Your Springer Open Access key |
| `PRISMA_SEMANTIC_SCHOLAR_KEY` | Your Semantic Scholar key |
| `PRISMA_IEEE_KEY` | Your IEEE Xplore key |
| `PRISMA_SCOPUS_KEY` | Your Scopus (Elsevier) key |
| `PRISMA_GOOGLE_SHEET_ID` | The ID portion of your Sheet URL |

> ⚠️ n8n Cloud Variables require a **Pro** or higher plan. On the free tier, use the Code node fallback method described below.

#### B. n8n Self-Hosted (Docker)

Edit your `docker-compose.yml` or startup script:

```yaml
services:
  n8n:
    image: n8nio/n8n
    environment:
      - PRISMA_NCBI_KEY=your_ncbi_key
      - PRISMA_NCBI_EMAIL=your.email@institution.edu
      - PRISMA_SPRINGER_KEY=your_springer_key
      - PRISMA_SPRINGER_OA_KEY=your_springer_oa_key
      - PRISMA_SEMANTIC_SCHOLAR_KEY=your_semantic_scholar_key
      - PRISMA_IEEE_KEY=your_ieee_key
      - PRISMA_SCOPUS_KEY=your_scopus_key
      - PRISMA_GOOGLE_SHEET_ID=your_sheet_id
```

Then restart: `docker-compose down && docker-compose up -d`.

#### C. n8n Self-Hosted (npm)

Add to your `.env` file in the n8n install directory:

```bash
PRISMA_NCBI_KEY=your_ncbi_key
PRISMA_NCBI_EMAIL=your.email@institution.edu
PRISMA_SPRINGER_KEY=your_springer_key
PRISMA_SPRINGER_OA_KEY=your_springer_oa_key
PRISMA_SEMANTIC_SCHOLAR_KEY=your_semantic_scholar_key
PRISMA_IEEE_KEY=your_ieee_key
PRISMA_SCOPUS_KEY=your_scopus_key
PRISMA_GOOGLE_SHEET_ID=your_sheet_id
```

Then restart n8n: `npm run start`.

#### D. n8n Cloud Free Tier (fallback)

If you cannot use Variables, paste your keys **once** into the Config node code (lines reading `$env.PRISMA_*_KEY`). This is acceptable for personal use but **never commit this version of the workflow to Git**.

---

### Step 3 — Set Up Google Sheets Credential

The `📝 Write to Google Sheet` node requires authentication via **Google OAuth2**.

1. Open the workflow in n8n.
2. Click on the `📝 Write to Google Sheet` node.
3. Under **Credential to connect with**, click **Create New**.
4. Choose **Google Sheets OAuth2 API**.
5. Follow the OAuth flow to authorise n8n to access your Sheet.
6. Save the credential (give it a recognisable name like "PRISMA Reviewer").

> 📖 Detailed guide: <https://docs.n8n.io/integrations/builtin/credentials/google/oauth-generic/>

---

### Step 4 — Import the Workflow

1. Open n8n.
2. Click **Workflows** (sidebar) → **Add Workflow** → **Import from File**.
3. Select [`workflow.json`](workflow.json).
4. Click **Save**.

---

### Step 5 — Customise for Your Review Topic

Open the **`⚙️ Config`** node — this is the **only** node you ever edit. The Config uses a **Wizard mode**: you only fill 6 sections at the top, and everything else (Boolean queries for 6 databases, pagination, rate limits) is **auto-generated**.

```javascript
// ╔══════════════════════════════════════════════════════════════════╗
// ║  🔧 EDIT THIS BLOCK — Your review configuration                  ║
// ╚══════════════════════════════════════════════════════════════════╝

const REVIEW = {
  title:        "Your systematic review title",
  prospero_id:  null,  // optional
  year_from:    2018,
  year_to:      2025,
  language:     "english",
  corpus_size:  "medium",   // "small" | "medium" | "large" | "debug"
};

const POPULATION   = [ /* 5–15 terms covering your population/condition */ ];
const INTERVENTION = [ /* 5–30 terms covering your modality/intervention */ ];
const METHOD       = [ /* 5–30 terms covering your AI methods */ ];
const EXCLUDE_TOPICS = [ /* off-topic exclusions */ ];
const EXCLUDE_TYPES  = [ /* non-research types like "editorial", "letter" */ ];

// ╔══════════════════════════════════════════════════════════════════╗
// ║  🪄 EVERYTHING BELOW IS AUTO-GENERATED — Do NOT edit             ║
// ╚══════════════════════════════════════════════════════════════════╝
// (Boolean queries, PAGES, RATE, RETRY, validation, etc.)
```

**What's auto-generated**:

| What | How |
|---|---|
| 8 Boolean queries (one per DB) | Built from your keyword arrays with correct syntax per database (PubMed `[dp]`, Scopus `TITLE-ABS-KEY`, Semantic Scholar natural language, etc.) |
| `PAGES` (pagination per DB) | Sized by `corpus_size`: `small`=200/DB · `medium`=500/DB · `large`=1000/DB · `debug`=20/DB |
| `RATE` (rate limits) | Sensible defaults per DB |
| `RETRY` (retry policy) | 3 retries with exponential backoff |
| Validation | Throws clear errors if env vars missing or keyword groups too small |

**Total to edit for a new review topic: ~25 lines.** No need to write Boolean syntax for 6 different databases.

> 📖 See [`docs/domain_adaptation.md`](../docs/domain_adaptation.md) for a worked example adapting to a different domain (sepsis prediction).

---

### Step 6 — Pilot Run (`debug` mode)

Before launching the full run, do a small pilot to verify everything works:

1. In the `⚙️ Config` node, set `REVIEW.corpus_size = "debug"`.
2. This caps each database to 20–50 records (~120 total).
3. Click **Execute Workflow** ▶ and verify all 6 API nodes succeed.
4. Check your Google Sheet — the `SCREENED` tab should have a few rows.

---

### Step 7 — Production Run

1. In the `⚙️ Config` node, set `REVIEW.corpus_size = "small"` / `"medium"` / `"large"` according to your needs:

| Size | OpenAlex | PubMed | Semantic | IEEE | Scopus | Springer | Total ~ |
|------|----------|--------|----------|------|--------|----------|---------|
| `debug` | 50 | 20 | 20 | 50 | 25 | 20 | ~185 |
| `small` | 200 | 200 | 200 | 200 | 100 | 100 | ~1000 |
| `medium` | 600 | 500 | 500 | 500 | 200 | 200 | ~2500 |
| `large` | 1000 | 800 | 500 | 800 | 250 | 200 | ~3550 |

2. Click **Execute Workflow** ▶.
3. Wait ~10–30 minutes depending on size.
4. Verify the final node `✅ Run Summary & Logs` reports the expected counts.

Phase 2 (Colab notebook) takes over from here.

---

## ⚙️ Configuration Reference

### `corpus_size` setting

```javascript
const REVIEW = {
  // ...
  corpus_size: "medium",   // "small" | "medium" | "large" | "debug"
};
```

| Mode | OpenAlex | PubMed | Semantic | IEEE | Scopus | Springer | Total ~ | Use for |
|------|----------|--------|----------|------|--------|----------|---------|---------|
| `debug` | 50 | 20 | 20 | 50 | 25 | 20 | ~185 | Pilot test |
| `small` | 200 | 200 | 200 | 200 | 100 | 100 | ~1000 | Niche topics |
| `medium` | 600 | 500 | 500 | 500 | 200 | 200 | ~2500 | Most reviews |
| `large` | 1000 | 800 | 500 | 800 | 250 | 200 | ~3550 | Broad reviews |

### Boolean Query Syntax per Database

| Database | Syntax notes |
|----------|--------------|
| OpenAlex | Standard Boolean (`AND`, `OR`) |
| PubMed | Boolean + MeSH headings + `[dp]` for date |
| Scopus | `TITLE-ABS-KEY(...)` wrapper, `PUBYEAR > N` |
| Semantic Scholar | Natural language only (no Boolean) |
| IEEE Xplore | Standard Boolean |
| Springer | Multi-keyword (loose AND) |

### Rate Limits

The workflow respects each API's rate limits via the `RATE` constant:

```javascript
const RATE = {
  openalex: 200,    // 5 req/sec
  pubmed:   150,    // ~6 req/sec with API key
  semantic: 1200,   // 1 req/sec without key (or 100/sec with key)
  ieee:     300,
  scopus:   250,
  springer: 800,
};
```

If you hit rate limits, increase these values (in milliseconds).

---

## 🔍 Troubleshooting

### "Missing required n8n environment variables"

The Config node's validation block detected missing variables. Re-check Step 2 above and ensure all 8 variables are configured.

### One database returns 0 records

Most likely causes:
- **API key invalid** → re-generate
- **Boolean query too restrictive** → test the query directly in the database's web search
- **Rate limit hit** → increase `RATE.<db>` value

### "429 Too Many Requests"

Increase the rate-limit delay for that specific database in the `RATE` constant.

### Workflow timeout

n8n Cloud has a 5-minute execution timeout per workflow on the free plan. Solutions:
- Reduce `max_total` per database in `PAGES_PROD`
- Self-host n8n with `EXECUTIONS_TIMEOUT=3600`
- Split into multiple runs by year range (`year_start` / `year_end`)

### Google Sheets writes fail

- Verify your OAuth credential is valid (re-authenticate if it has expired)
- Verify your Google account has Editor access to the target Sheet
- Check the `PRISMA_GOOGLE_SHEET_ID` variable matches your Sheet URL

### Springer Nature returns errors

Springer's API uses two different endpoints (Meta API + Open Access). If you only have one key, set both env vars to the same value:

```bash
PRISMA_SPRINGER_KEY=abc123
PRISMA_SPRINGER_OA_KEY=abc123
```

---

## 🎯 Architecture Notes

### Why Code nodes instead of HTTP Request nodes?

Each database API has unique pagination, response parsing, and partial-deduplication logic that would require multiple chained HTTP Request nodes. The Code node consolidates this into a single, auditable function per database.

### Why cascade merge instead of flat?

For corpora > 1,000 records, n8n's flat Merge node holds all data in memory simultaneously. Cascade merging (pair-wise binary tree) keeps peak memory bounded, preventing out-of-memory errors on n8n Cloud.

### Why generate the PRISMA SVG here?

Phase 1 produces all the counts needed for the **identification** and **screening** sections of the PRISMA 2020 flow. The downstream Phase 2 (Colab) populates the eligibility and inclusion sections. Generating the partial SVG in Phase 1 lets reviewers see the flow taking shape in real time.

---

## 📚 Related Documentation

- [`../docs/architecture.md`](../docs/architecture.md) — Three-phase architecture overview
- [`../docs/domain_adaptation.md`](../docs/domain_adaptation.md) — Adapting to a new review topic
- [`../docs/troubleshooting.md`](../docs/troubleshooting.md) — Common issues across all phases
- [`../colab/README.md`](../colab/README.md) — Phase 2 Colab notebook (next step after this workflow)
