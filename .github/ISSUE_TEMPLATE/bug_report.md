---
name: Bug report
about: Report a bug or unexpected behaviour
title: '[BUG] '
labels: bug
assignees: ''
---

## Description

A clear and concise description of the bug.

## Pipeline Phase / Layer

- [ ] Phase 1 — n8n acquisition
- [ ] Phase 1 — Deduplication
- [ ] Phase 2 — Layer 1 (keyword filter)
- [ ] Phase 2 — Layer 2 (LLM scoring)
- [ ] Phase 2 — Layer 3 (human review interface)
- [ ] Phase 2 — Layer 4 (PDF retrieval)
- [ ] Phase 2 — Layer 5 (full-text)
- [ ] Phase 2 — Triple κ computation
- [ ] Phase 3 — Google Sheets dashboard
- [ ] Documentation
- [ ] Other (specify):

## Steps to Reproduce

1. Configure ...
2. Run ...
3. Observe ...

## Expected Behaviour

What you expected to happen.

## Actual Behaviour

What actually happened. Include error messages or screenshots if relevant.

## Environment

- Pipeline version (commit hash or tag): `vX.X.X`
- OS: `[e.g. Ubuntu 22.04 / macOS 14 / Windows 11]`
- Python version: `[e.g. 3.11.4]`
- n8n version: `[e.g. 1.45.0]`
- LLM provider: `[Groq / local vLLM / other]`
- Model: `[llama-3.3-70b-versatile / other]`

## Configuration

⚠️ **Do NOT paste API keys.** Share only the relevant sections of your config (with secrets redacted).

```json
{ ... }
```

## Logs

⚠️ **Redact any tokens, keys, or personal data.**

```
[paste error trace or relevant logs]
```

## Additional Context

Anything else that might help — related issues, recent changes, custom modifications.
