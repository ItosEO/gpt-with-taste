<p align="right">
  <strong>English</strong> · <a href="README.zh-CN.md">简体中文</a>
</p>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/hero-banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/hero-banner-light.svg">
  <img alt="GPT with Taste — Better judgment. Better taste. Less ceremony." src="assets/hero-banner-light.svg" width="100%">
</picture>

<p align="center">
  A drop-in behavioral recipe for Codex: make ordinary decisions, digest complexity, and deliver work with engineering and visual craft.<br>
  Built for the GPT reasoning family, especially GPT-6.1 Sol and GPT-6 Astra. Replies follow the language you write in.
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#what-changes">What changes</a> ·
  <a href="#featured-case">Comparison</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#research">Research</a>
</p>

---

<a id="install"></a>

## Install / update

Requires Node.js **22+**. The default preserves native Codex model instructions and does not edit `developer_instructions`. It installs a ready-to-copy **Chinese developer-instructions template** and a **critical, independent Advisor agent** in addition to the original prompt sources.

```sh
git clone https://github.com/ItosEO/gpt-with-taste.git
cd gpt-with-taste
npm test
node scripts/install.mjs --hooks
node scripts/install.mjs --check
```

After installation, manually merge [the Chinese developer template](prompts/developer.zh-CN.toml) into the existing top-level `developer_instructions` of `~/.codex/config.toml`, without duplicating the TOML key. The installer copies the template to `~/.codex/prompts/gpt-with-taste/developer.zh-CN.toml` but **never** writes your developer instructions. It also installs `~/.codex/agents/advisor.toml`, a read-only technical review role that actively attempts to falsify assumptions instead of rubber-stamping decisions.

The original three Hook events and matchers stay unchanged. In Codex Desktop **Settings → Hooks** (or `/hooks`), review and trust the installed plugin definitions, then open a new session.

**Update an existing installation** after obtaining new sources:

```sh
git pull --ff-only
npm test
node scripts/install.mjs --update --dry-run
node scripts/install.mjs --update
node scripts/install.mjs --check
```

`--update` preserves the existing Hooks and optional base-override state, upgrades installed files and adds the Advisor and template if missing. It does not fetch Git commits itself. An existing custom `advisor.toml` is never overwritten without explicit `--replace-managed`.

A full base-instructions replacement is **only** available with `--override-base`. Restoring uses `node scripts/install.mjs --restore` from this same clone and Codex home. Full details: [installation](docs/install.md), [recovery](docs/recovery.md), and [prompt map](docs/prompt-map.md).

---

<a id="what-changes"></a>

## What changes

GPT with Taste puts judgment into the outcome: choose sensible defaults, preserve supported claims, synthesize useful collaborator results, and finish work with care.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/comparison-diagram-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/comparison-diagram-light.svg">
  <img alt="Default behavior vs. GPT with Taste — five everyday contrasts" src="assets/comparison-diagram-light.svg" width="100%">
</picture>

The recipe combines judgment, continuous execution, collaboration, and engineering and visual craft. Explore the principles in [Research](docs/research.md), or inspect complete runs, task inputs, and side-by-side outputs in the [Case Archive](docs/cases.md) and [Web Comparison](https://nb-corp.github.io/gpt-with-taste/).

---

<a id="featured-case"></a>

## Comparison · From installation logs to a first task

> **Task request**: Use `notes.md` to write a Chinese getting-started guide for a colleague who has just finished installing. Save it as `START_HERE.md`.

The visible improvement is straightforward: get the reader started first, while installation audits and process disclaimers step out of the way.

[![Codex default vs. GPT with Taste: representative excerpts, with unnecessary self-justification highlighted](assets/case-first-use-en.png)](https://nb-corp.github.io/gpt-with-taste/)

Inspect full inputs, generated documents, and run conditions: [Task & run conditions](docs/cases/codex-first-use/input.md) · [Web comparison page](https://nb-corp.github.io/gpt-with-taste/) · [Case index](docs/cases.md).

---

<a id="how-it-works"></a>

## How it works

1. **The bundled main prompt is opt-in.** Native Codex instructions stay active by default; you may add selected developer instructions manually or explicitly use `--override-base` for full replacement.
2. **Steer refreshes the relevant priorities near each input.** The local plugin sends user reminders to main, scoped reminders to children, and result-consumption reminders to main after a completed wait. A child's paired startup events produce one reminder. [Installation details](docs/install.md#add-optional-per-turn-steering) cover the events and client entry points.

`prompts/sub.md` is a compact, read-only role source for explicitly configured subagents. Hooks give task-focused reminders and do not set role permissions; `--hooks` installs all three routes without changing model instructions.

---

<a id="research"></a>

## Research

[docs/research.md](docs/research.md) details the findings, prompt architecture, and iteration loop behind the recipe: how defensive writing affects the reader's experience, why models need room for ordinary judgment, and how collaborator findings are turned into direct action.

---

<p align="center">
  <a href="LICENSE">MIT License</a> · Community friend link: <a href="https://linux.do/">Linux DO</a>
</p>
