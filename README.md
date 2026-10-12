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
  <a href="#how-it-works">How it works</a> ·
  <a href="#research">Research</a> ·
  <a href="docs/cases.md">Cases</a>
</p>

---

## Install

With Node.js 22 or newer installed:

```sh
git clone https://github.com/NB-Corp/gpt-with-taste.git
cd gpt-with-taste
node scripts/install.mjs --hooks
```

We recommend Hooks for multi-turn work: they bring the behavioral priorities back into focus after each user message. For a complete prompt-only installation, use `node scripts/install.mjs` instead. No npm packages are needed.

Both routes install into your active `CODEX_HOME` (otherwise `~/.codex`), write the two managed prompt files, and point the top-level `model_instructions_file` at the main one. Your model, provider, effort, authentication, permissions, MCP servers, roles, and `AGENTS.md` stay exactly as they are. To target another home, add `--home` with a quoted absolute path, e.g. `--home "C:/Users/you/.codex"`.

With `--hooks`, open Codex's `/hooks` screen and review and trust the installed command.

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

Judgment, continuous execution, collaboration, and engineering and visual craft all belong to the recipe. Read the real task slices and the built-in Codex comparison in [docs/cases.md](docs/cases.md).

---

## How it works

1. **The system prompt does the heavy lifting.** It establishes standing instructions for judgment, execution, collaboration, and craft. The instructions are English; replies follow your latest language.
2. **Steer refreshes those priorities each turn.** With `--hooks`, `UserPromptSubmit` runs after each user message and before the model request. The local script returns a focused reminder as developer context: make ordinary choices, absorb complexity, route selectively, and cut useless small print. That puts the same priorities close to the work of the current turn.

`prompts/sub.md` is included for roles you choose. The installer connects the user-turn Steer; `sub-steer.md` and `agent-steer.md` are source files for separate delegated-agent and collaborator-result integrations. Main and sub prompts each contain the complete behavior.

---

## Research

[docs/research.md](docs/research.md) connects published findings to the recipe's design. One finding sets the tone: reviewer-oriented rewrites scored higher with AI reviewers while human readers found them harder to read.

---

## License

[MIT](LICENSE).
