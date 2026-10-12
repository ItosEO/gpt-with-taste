<p align="right">
  <strong>English</strong> · <a href="README.zh-CN.md">简体中文</a>
</p>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/hero-banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/hero-banner-light.svg">
  <img alt="GPT with Taste — Better judgment. Better taste. Less ceremony." src="assets/hero-banner-light.svg" width="100%">
</picture>

<p align="center">
  A drop-in behavioral recipe that stops Codex from acting like an anxious contractor.<br>
  It makes ordinary calls, digests the noise, and delivers work with engineering and visual craft.<br>
  Built for the GPT reasoning family — above all GPT-6.1 Sol and GPT-6 Astra. Replies follow the language you write in.
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#what-changes">What changes</a> ·
  <a href="#a-real-case">A real case</a> ·
  <a href="#how-it-works">How it works</a> ·
  <a href="#research">Research</a>
</p>

---

## Install

With Node.js 22 or newer installed:

```sh
git clone https://github.com/NB-Corp/gpt-with-taste.git
cd gpt-with-taste
node scripts/install.mjs --hooks
```

We recommend Hooks for multi-turn work when your Codex client dispatches the corresponding events: they bring the behavioral priorities back into focus near the current turn. For a complete prompt-only installation, use `node scripts/install.mjs` instead. No npm packages are needed.

Both routes install into your active `CODEX_HOME` (otherwise `~/.codex`), write the two managed prompt files, and point the top-level `model_instructions_file` at the main one. Your model, provider, effort, authentication, permissions, MCP servers, roles, and `AGENTS.md` stay exactly as they are. To target another home, add `--home` with a quoted absolute path, e.g. `--home "C:/Users/you/.codex"`.

With `--hooks`, trust the three installed definitions in Codex Desktop under **Settings → Hooks**, or in the interactive terminal with `/hooks`. Review `UserPromptSubmit`, `SubagentStart` and `PostToolUse` before enabling them.

Open a **new Codex session** to use the installed instructions.

Prefer to delegate? Hand this repository to your coding assistant together with [docs/install-for-ai.md](docs/install-for-ai.md). To revert, [docs/recovery.md](docs/recovery.md) restores the managed state in one command. The full contract: [docs/install.md](docs/install.md).

---

## What changes

GPT with Taste puts judgment into your outcome: choose sensible defaults, preserve supported claims, synthesize collaborator results, and finish well-crafted work. These are the habits it targets:

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/comparison-diagram-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/comparison-diagram-light.svg">
  <img alt="Default behavior vs. GPT with Taste — five everyday contrasts" src="assets/comparison-diagram-light.svg" width="100%">
</picture>

Judgment, continuous execution, collaboration, and engineering and visual craft all belong to the recipe. The task slices that shaped these rules live in [docs/research.md](docs/research.md#development-cases); the output differences are visible in the case below.

---

## A real case

Two fresh Codex sessions received the same request — update a component guide so callers can safely override Tailwind utility classes. Built-in instructions on the left, GPT with Taste on the right; these are the closing moments of each document:

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/case-button-overrides-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/case-button-overrides-light.svg">
  <img alt="Same task, two instruction sets — closing excerpts of each generated guide, compared" src="assets/case-button-overrides-light.svg" width="100%">
</picture>

Both documents complete the task, and both keep the caveat about custom utilities. The difference is where the judgment goes: the built-in answer tells the reader what must be true, while the Taste answer hands over a working pattern. The quotes are verbatim; the highlights only mark them. Full comparison and original files: [docs/cases.md](docs/cases.md) · [site/index.html](site/index.html) (best opened from a local clone).

---

## How it works

1. **The system prompt does the heavy lifting.** It establishes standing instructions for judgment, execution, collaboration, and craft. The instructions are English; replies follow your latest language.
2. **Steer refreshes those priorities when the client dispatches a Hook event.** The local script returns a focused reminder as developer context: make ordinary choices, absorb complexity, route selectively, and cut useless small print. The tested `exec resume` workflow did not dispatch these optional events, so verify delivery in your Codex client before relying on them.

`prompts/sub.md` is included for roles you choose. The installer connects the user-turn Steer; `sub-steer.md` and `agent-steer.md` are source files for separate delegated-agent and collaborator-result integrations. Main and sub prompts each contain the complete behavior.

---

## Research

[docs/research.md](docs/research.md) connects published findings to the recipe's design. One finding sets the tone: reviewer-oriented rewrites scored higher with AI reviewers while human readers found them harder to read. The same file holds the development cases that shaped the rules.

---

<p align="center">
  <a href="LICENSE">MIT License</a> · Community friend link: <a href="https://linux.do/">Linux DO</a>
</p>
