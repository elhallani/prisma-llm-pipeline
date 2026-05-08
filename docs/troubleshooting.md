# Troubleshooting

Common issues and solutions encountered when deploying the PRISMA-LLM Pipeline.

## n8n / Phase 1 Issues

### "401 Unauthorized" from a database API
**Cause**: Invalid or expired API key.
**Fix**:
1. Verify the key in your provider's dashboard (Groq, NCBI, IEEE, etc.).
2. Regenerate the key.
3. Update your `.env` and re-import the n8n workflow (or update n8n credentials).
4. Never commit the key.

### "429 Too Many Requests" / Rate limit hit
**Cause**: Exceeding API rate limits (especially Semantic Scholar at 1 req/s without API key).
**Fix**:
- Increase `rate_limit_ms` in `config.databases.<db>` (e.g., 1500 ms instead of 1200 for Semantic Scholar).
- Reduce `pages` and `max_total` to limit total requests per run.
- For Groq: respect 30 req/min and 14 400 tokens/min on free tier; consider [pricing tiers](https://console.groq.com/settings/billing) if needed.

### Springer Nature returns 0 records
**Cause**: Springer's Meta API uses different syntax than other databases.
**Fix**: Verify your query uses the correct format:
```
"Alzheimer" (speech OR text) ("deep learning" OR "machine learning")
```
Test directly at [api.springernature.com](https://api.springernature.com/).

### IEEE Xplore returns truncated metadata
**Cause**: IEEE API by default returns minimal fields.
**Fix**: Ensure your query node includes `&format=json` and request full record format.

### n8n workflow times out
**Cause**: Default n8n execution timeout (5 min on cloud free tier).
**Fix**: Either:
- Reduce per-database `max_total` to limit total runtime.
- Self-host n8n with longer timeout (`EXECUTIONS_TIMEOUT=3600`).
- Split into multiple workflow runs by year range.

## Phase 2 / Colab Issues

### "PERMISSION_DENIED" when reading Sheet
**Cause**: Service account doesn't have access to the Sheet.
**Fix**:
1. In Google Sheets, click **Share**.
2. Add the service account email (from your `service_account.json`).
3. Grant **Editor** permissions.

### Colab notebook can't find `userdata`
**Cause**: Colab Secrets unavailable in older runtime versions.
**Fix**: Update Colab runtime (**Runtime → Change runtime type**) or fall back to environment variables:
```python
import os
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
```

### LLM returns malformed JSON
**Cause**: Llama 3.3 70B occasionally outputs JSON wrapped in markdown code fences.
**Fix**: The pipeline includes a robust JSON parser that strips fences and retries up to 3 times. If you still see errors:
```python
# Cell 5: enable verbose JSON debugging
DEBUG_JSON = True
```

### "RuntimeError: Failed to write to Sheet"
**Cause**: Sheet API quota exceeded (default 60 read/write requests per minute per user).
**Fix**: Add a delay between writes:
```python
time.sleep(1)  # between Cells writing back to Sheets
```

### Triple κ computation throws ValueError
**Cause**: Mismatched record IDs across R1, R2, LLM decisions.
**Fix**: The notebook's Cell 8 automatically intersects record IDs across the three sources. If you still see errors, check that all three columns (`filter_manuel`, `filter_supervisor2`, `filter_llm`) contain only `INCLUDE` or `EXCLUDE` values (no empty cells, no typos).

## Phase 3 / Google Sheets Issues

### Apps Script: "Service has been called too many times"
**Cause**: Apps Script has a 6-min execution time limit per call.
**Fix**: Run `designSheet()` in chunks. Comment out tabs you don't need to recreate.

### Dashboard formulas show "#REF!" or "#NAME?"
**Cause**: Tab renamed or column structure changed.
**Fix**: Re-run `designSheet()` to regenerate formulas with current column letters.

### Blinding columns are visible to R2
**Cause**: User has Editor access to the spreadsheet (overrides hidden columns).
**Fix**: Use **Sheet protection**:
1. Right-click the column → **Protect range**.
2. Set permissions → **Only you** (R2 can view but not unhide).
3. For true blinding, give R2 access to a separate Sheet that pulls only blinded columns via `IMPORTRANGE`.

## PDF Retrieval (Layer 4) Issues

### Many PDFs are 404 / not found
**Cause**: Records are paywalled and not on any open-access source.
**Fix**: This is expected behaviour. Records routed to `PDF_NOT_FOUND` tab require manual follow-up:
- Interlibrary loan
- Direct author email request
- Institutional library access

The protocol does NOT use Sci-Hub or any circumvention tools (per ethical/legal policy).

### Unpaywall returns "404"
**Cause**: DOI not registered with Crossref or Unpaywall.
**Fix**: Provide a valid `UNPAYWALL_EMAIL` in `.env`. Some recent papers take days to be indexed.

## Reproducibility Issues

### My κ values differ from those reported in the paper by > 0.05
**Possible causes**:
- Different bootstrap seed → minor variation expected.
- Different sample stratification → use `seed = 42` exactly.
- Database content drift (results retrieved later may differ slightly).

**Fix**: Reproduce on the archived Zenodo gold standard (n=120) with `seed=42` for exact reproduction.

### My LLM decisions differ from the paper's reported set
**Cause**: GPU non-associativity in floating-point operations causes minor stochasticity even at temperature=0.
**Expected variation**: ~4% of decisions may flip on borderline cases (totals 6-7).
**Fix**: For publication, run 3 times and report the modal decision (as we did, achieving Fleiss' κ = 0.92).

## Getting Help

If your issue isn't listed:

1. Search [existing issues](../../issues).
2. Open a [bug report](../.github/ISSUE_TEMPLATE/bug_report.md) with full details.
3. For broader questions, use [GitHub Discussions](../../discussions).

⚠️ **Never include API keys, screening data, or personal information in issues.**
