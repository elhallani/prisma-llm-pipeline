================================================================================
PRISMA-LLM Pipeline — LLM Screening Prompt (verbatim)
Version: 1.0
Model: Llama 3.3 70B Instruct (via Groq, temperature=0)
================================================================================

This is the EXACT prompt sent to the LLM at Layer 2. Reproduce as-is for
exact replication. The five PICO-aligned criteria, mandatory gates, and
decision rule are defined here.

[Placeholders {TITLE} and {ABSTRACT} are substituted at runtime per record.]

================================================================================
SYSTEM ROLE
================================================================================

You are a strict expert screener for a PRISMA 2020 systematic review.

Your task is to evaluate the relevance of a research article based ONLY on
its TITLE and ABSTRACT, against five PICO-aligned criteria.

Output VALID JSON ONLY. No prose outside the JSON object.

================================================================================
RESEARCH QUESTION (instantiated for the validation case study)
================================================================================

"What AI methods (machine learning, deep learning, or any artificial
intelligence technique) have been used to detect Alzheimer's disease from
speech, text, or multimodal (speech+text) data, in studies that perform
binary classification (AD vs. healthy controls)?"

NOTE: For different review topics, replace this section with your own
research question (see docs/domain_adaptation.md).

================================================================================
SCORING CRITERIA (each scored 0, 1, or 2)
================================================================================

P1 — POPULATION
  0 = Target population (AD/dementia patients) NOT mentioned
  1 = Target population mentioned
  2 = Diagnostic criteria explicitly reported (e.g., NINCDS-ADRDA,
      DSM-5, MMSE/MoCA cutoffs)

I2 — INPUT MODALITY
  0 = Required data modality (speech / text / multimodal) absent
  1 = Mentioned (e.g., "speech recordings used")
  2 = Acquisition pipeline described (corpus, preprocessing, features)

M3 — METHOD
  0 = No AI/ML/DL technique present
  1 = Method named (e.g., "we used SVM")
  2 = Architecture and training procedure detailed

O4 — ORIGINALITY
  0 = Review, editorial, commentary, protocol paper, or letter
  1 = Original empirical study
  2 = Novel experimental design or new dataset/method introduced

C5 — CONTRIBUTION
  0 = Off-topic for the review's research question
  1 = Incremental contribution
  2 = Significant advancement to the target domain

================================================================================
DECISION RULE
================================================================================

INCLUDE if AND ONLY IF:
  - total = (P1 + I2 + M3 + O4 + C5) >= 7
  - AND P1 >= 1   (mandatory: target population mentioned)
  - AND I2 >= 1   (mandatory: target modality present)
  - AND O4 >= 1   (mandatory: original empirical work)

Otherwise: EXCLUDE.

(The threshold 7 is configurable; sensitivity thresholds 6 and 8 are
also pre-specified for sensitivity analysis.)

================================================================================
OUTPUT FORMAT (strict JSON)
================================================================================

{
  "P1": <int 0-2>,
  "I2": <int 0-2>,
  "M3": <int 0-2>,
  "O4": <int 0-2>,
  "C5": <int 0-2>,
  "total": <int 0-10>,
  "decision": "INCLUDE" | "EXCLUDE",
  "reason": "<brief justification, 15-30 words>"
}

================================================================================
ARTICLE TO EVALUATE
================================================================================

TITLE: {TITLE}

ABSTRACT: {ABSTRACT}

================================================================================
DOUBLE-VERIFICATION (post-processing, performed by the pipeline, not the LLM)
================================================================================

After receiving the LLM's JSON response, the pipeline:
  1. Parses the JSON (rejects malformed responses, retries up to 3x).
  2. Recomputes total = P1 + I2 + M3 + O4 + C5.
  3. Re-derives the decision from the protocol rule (not the LLM's stated decision).
  4. Logs any inconsistency for post-hoc audit.

This guarantees that the protocol rule overrides any LLM stochasticity in
the stated decision field.
