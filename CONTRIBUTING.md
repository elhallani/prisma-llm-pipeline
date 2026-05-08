# Contributing to PRISMA-LLM Pipeline

Thank you for your interest in contributing! This project welcomes contributions from the systematic review, evidence synthesis, and computational research communities.

## 🐛 Reporting Bugs

Before opening an issue:

1. **Search existing issues** to avoid duplicates.
2. **Check the [troubleshooting guide](docs/troubleshooting.md)** for known problems.
3. If your issue is new, open a [bug report](.github/ISSUE_TEMPLATE/bug_report.md) including:
   - Pipeline version (commit hash or tag)
   - Phase and layer where the bug occurs (e.g., "Phase 2, Layer 2 LLM scoring")
   - Minimal reproducible example
   - Expected vs. actual behaviour
   - Environment (OS, Python version, n8n version)
   - **Never include API keys or screening data** in issue text

## ✨ Suggesting Enhancements

Open a [feature request](.github/ISSUE_TEMPLATE/feature_request.md) describing:

- The use case motivating the request
- How it relates to PRISMA 2020 / RAIES / DEST compliance
- Whether it preserves the human-in-the-loop design principle

## 🔧 Pull Requests

1. **Fork** the repository and create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Test** your changes:
   - Validate any JSON config you edit: `python -c "import json; json.load(open('config/your_config.json'))"`
   - If you edit the Colab notebook, run it end-to-end on a small test corpus
   - If you edit the n8n workflow, execute it once and verify Sheet output

3. **Document** your changes:
   - Update relevant docs in `docs/`
   - Add an entry to `CHANGELOG.md` under "Unreleased"
   - Update docstrings for modified functions

4. **Commit** with a clear message following [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat(layer2): add support for local Ollama endpoint
   fix(dedup): handle missing DOI in Level 1 matching
   docs(readme): clarify Groq rate limits
   ```

5. **Push** and open a pull request against `main`. Use the [PR template](.github/PULL_REQUEST_TEMPLATE.md).

### PR Checklist

- [ ] Configuration JSON files are syntactically valid
- [ ] No secrets committed (run `git diff --staged | grep -iE 'api_?key|secret|token'`)
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Commit messages follow Conventional Commits
- [ ] PR description references related issue(s)

## 🧪 Adding a New Domain Adaptation

If you adapt the pipeline to a new review topic and want to share the configuration:

1. Place your config in `config/config_<topic>_example.json`
2. Add a brief description in `docs/domain_adaptation.md` under "Worked Examples"
3. Include performance metrics (sensitivity, specificity, κ) if validated

## 🛡️ Security

**Never commit API keys, credentials, or screening datasets.** If you discover a security vulnerability, please email `anass.elhallani-etu@etu.univh2c.ma` rather than opening a public issue.

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold its terms.

## 🤝 Questions?

Open a [discussion](../../discussions) for general questions, or contact the corresponding author at `anass.elhallani-etu@etu.univh2c.ma`.
