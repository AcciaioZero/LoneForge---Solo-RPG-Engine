# Contributing to LoneForge

Thank you for your interest in contributing to LoneForge! This document explains how to report issues, propose changes, and submit contributions.

---

## Before you start
- Read the `LICENSE` (MIT) and `CODE_OF_CONDUCT.md`.
- If you plan a large feature or breaking change, open an Issue first to discuss scope and design.

---

## How to contribute (quick workflow)
1. **Fork** the repository.
2. **Create a branch** from `main`:
   - Use descriptive names: `feature/items-generator`, `fix/dice-roller-bug`.
3. **Make changes** on your branch.
4. **Commit** with clear messages (imperative tense).
5. **Push** your branch to your fork.
6. **Open a Pull Request** against `main` in the upstream repo.

---

## Branching and commit conventions
- **Branch prefixes:** `feature/`, `fix/`, `chore/`, `docs/`.
- **Commit message format:** `type(scope): short description`  
  Example: `fix(dice-roller): correct critical hit calculation`
- Keep PRs focused and small when possible.

---

## Pull request checklist
When opening a PR, please:
- Link the related Issue (if any).
- Describe what the PR changes and why.
- Include screenshots or logs for UI/behavior changes.
- Add or update tests where applicable.
- Ensure code follows project style and passes existing tests.
- Be responsive to review feedback.

A maintainer will review and may request changes before merging.

---

## Issues
- Search existing issues before opening a new one.
- For bug reports, include:
  - Clear title and steps to reproduce.
  - Expected vs actual behavior.
  - Environment (browser/OS/version).
  - Screenshots or logs if relevant.
- For feature requests, explain the use case and suggested approach.

---

## Reporting suspected copyrighted content
If you find content that may infringe copyright (e.g., text or data copied from a protected source), please:
1. Open an Issue titled:  
   `Possible copyright issue: <short description>`
2. Include:
   - File path(s) or JSON key(s)
   - A short explanation of why it may be copyrighted
   - A link or reference to the original source if available

Maintainers will review reports promptly and take corrective action if needed.

---

## Code style and tests
- Follow common Java conventions (clear naming, small functions).
- Add or update unit tests for bug fixes and new features.
- Run tests locally before opening a PR.

---

## Content and localization
- All game content (monsters, spells, items, lore) must be original or properly licensed.
- When adding content, include a short note in the PR describing the source and confirming originality.
- If contributing translations, add them in a separate folder and follow the existing localization structure.

---

## Templates (suggested `.github` files)
You can add these templates under `.github/ISSUE_TEMPLATE/` and `.github/PULL_REQUEST_TEMPLATE.md`.

**Bug report (`.github/ISSUE_TEMPLATE/bug_report.md`)**
```md
---
name: Bug report
about: Report a reproducible bug
---

**Title:** [BUG] short description

**Steps to reproduce**
1.
2.
3.

**Expected behavior**

**Actual behavior**

**Environment**
- Browser / OS:
- Version:
- Additional info:
