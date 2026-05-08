# Reproducibility & Compliance Checklist

This document audits the PRISMA-LLM Pipeline against the major reproducibility and responsible-AI frameworks for evidence synthesis. Designed for editors, reviewers, and review teams considering adoption.

## TIER Protocol (Transparency in Iterative Evidence)

| Item | Status | Notes |
|------|--------|-------|
| Pre-registered protocol | ⚠️ Optional | Add PROSPERO/OSF ID if applicable to your review |
| Public source code | ✅ | This repository, MIT license |
| Versioned releases | ✅ | Semantic versioning, GitHub releases |
| Persistent identifier | ⏳ Planned | Zenodo DOI to be assigned upon first formal release |
| Configuration files included | ✅ | `config/config_AD_speech.json` (validation case) |
| Random seeds documented | ✅ | NumPy seed = 42 (κ bootstrap, sample selection) |
| Software dependencies pinned | ✅ | `requirements.txt` |
| API versions documented | ✅ | Listed in `docs/architecture.md` |

## RAIES (Responsible AI in Evidence Synthesis) — Flemyng & Noel-Storr 2025

| Principle | Implementation |
|-----------|----------------|
| **Transparency** | All code, prompts, and configurations are public. The LLM prompt is provided verbatim in `colab/prompts/llm_screening_prompt.md`. |
| **Reproducibility** | Open-weight model (Llama 3.3 70B); deterministic temperature = 0; pinned dependencies; documented API versions; fixed random seeds. |
| **Validated human oversight** | Triple Cohen's κ framework (κ₁ human–human, κ₂ human–LLM, κ₃ independent). Bootstrap 95% CIs reported. Arbitration rule (κ < 0.60 → R3 review). |
| **Decision authority** | Humans retain final inclusion authority at Layers 3 and 5. LLM output is non-decisional (informs but does not determine). |
| **Auditability** | Per-criterion JSON scores from LLM provide audit trail. Apps Script logs all reviewer decisions. Disagreements automatically routed to dedicated tab. |
| **Bias mitigation** | Structural blinding (sheet protection hides LLM/prior-reviewer columns); independent reviewer (R2) with no role in prompt design ensures κ₃ is uncontaminated. |

## DEST (Digital Evidence Synthesis Tools) Framework — Bond & Callaghan 2024

| Criterion | Status |
|-----------|--------|
| Open source license | ✅ MIT |
| Versioned codebase | ✅ Semantic versioning |
| Documentation completeness | ✅ Installation, deployment, troubleshooting, adaptation |
| Test coverage | ⚠️ Manual validation via Colab notebook end-to-end runs |
| Continuous integration | ✅ GitHub Actions (`.github/workflows/ci.yml`) |
| Issue tracking | ✅ GitHub Issues with templates |
| Active maintenance | ✅ Tracked in CHANGELOG |
| User support channel | ✅ GitHub Discussions + email |

## PRISMA 2020 Reporting Checklist

The pipeline supports compliance with PRISMA 2020 reporting items:

| Item | Pipeline support |
|------|------------------|
| 1. Title | User-defined in config |
| 2. Abstract | User-authored |
| 3. Rationale | User-authored |
| 4. Objectives (PICO) | Captured in `review.pico` |
| 5. Eligibility criteria | Encoded in keyword filter + LLM criteria |
| 6. Information sources | 6 databases auto-logged with versions |
| 7. Search strategy | Boolean queries stored in config (auto-exported) |
| 8. Selection process | 5-layer screening, fully logged |
| 9. Data collection | Layer 5 + extraction template auto-generated |
| 10. Data items | Configurable extraction schema |
| 11. Risk of bias | Hand-off to PROBAST/RoB 2 (manual) |
| 13. Synthesis methods | User-authored |
| 14–16. Reporting | Auto-generated PRISMA flow diagram (SVG) |

## Reproducibility Stress Test

To verify reproducibility, an independent team should be able to:

1. **Clone**: `git clone <repo>` ✅
2. **Configure**: Edit `.env` with own API keys ✅
3. **Run**: Execute the pipeline end-to-end ✅
4. **Compare**: Reproduce within ±1% of reported metrics on the same data
   - Note: minor floating-point variation expected from GPU non-associativity in LLM inference
   - Empirically observed: 96% pairwise agreement across 3 runs (Fleiss' κ = 0.92)

## Known Limitations to Reproducibility

1. **Groq free tier policy**: Free-tier availability is not guaranteed for future deployments. The protocol is provider-agnostic — any OpenAI-compatible endpoint (local vLLM, Ollama) is a drop-in replacement.

2. **LLM weights**: Llama 3.3 70B weights are publicly available from Meta AI (December 2024 release). Independent verification, local deployment, and audit are possible.

3. **Database content drift**: API queries on the same date should return the same results, but databases may update retrospectively (e.g., adding back-issues). Document the retrieval date for full reproducibility.

4. **Reviewer subjectivity**: Inter-rater reliability is reported but not eliminated. The triple κ framework quantifies this rather than asserting equivalence.

## Independent Verification

We welcome independent verification by external research teams. If you reproduce the protocol on a new domain or independently validate the AD/speech case study, please:

1. Open a [discussion](../../discussions) describing your setup and results.
2. Consider submitting a PR with a `config/config_<your_domain>_example.json` and brief notes.

## See Also

- [`architecture.md`](architecture.md) — Technical design
- [`domain_adaptation.md`](domain_adaptation.md) — Adapting to your topic
- [`troubleshooting.md`](troubleshooting.md) — Common issues
