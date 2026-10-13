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

## Install

With Node.js 22 or newer installed:

```sh
git clone https://github.com/NB-Corp/gpt-with-taste.git
cd gpt-with-taste
node scripts/install.mjs --hooks
```

We recommend Hooks for multi-turn work in Codex Desktop: reminders arrive with your message, with the child's input, and when main collects a completed result. For a prompt-only installation, run `node scripts/install.mjs` instead. Neither route needs npm packages.

Both routes install into the active `CODEX_HOME` (otherwise `~/.codex`), write the two managed prompt files, and point `model_instructions_file` at the main one. Your model, provider, effort, authentication, permissions, MCP servers, roles, and `AGENTS.md` remain unchanged. To target another home, add `--home` with a quoted absolute path, for example `--home "C:/Users/you/.codex"`.

With `--hooks`, review and trust the three installed definitions in Codex Desktop under **Settings → Hooks**, or in the interactive terminal with `/hooks`. Enable only the events you want. Open a **new Codex session** after installation.

Prefer to delegate? Give your coding assistant this repository and [docs/install-for-ai.md](docs/install-for-ai.md). To recover the managed state, use [docs/recovery.md](docs/recovery.md). The complete installation contract is in [docs/install.md](docs/install.md).

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

> **Task request**: 根据 notes.md，给刚装好的同事写一份中文上手说明，放 START_HERE.md。<br>
> *(Both sessions received the exact same installation notes and Chinese request.)*

The visible improvement is straightforward: get the reader started first, while installation audits and process disclaimers step out of the way.

| Codex default instructions | GPT with Taste |
| :--- | :--- |
| **Where the guide starts** (`builtin.md:1-3`)<br><br># Codex 中文上手说明<br><br>**这份说明依据安装记录 `notes.md` 整理，未重新检查本机配置。**先正常打开一个新的 Codex 会话，就可以开始使用已安装的 Main 提示词；逐轮提醒是可选项，不影响这一步。 | **Where the guide starts** (`taste.md:1-9`)<br><br># Codex 上手：直接开新会话<br><br>GPT with Taste 已安装。**正常打开一个新的 Codex 会话，就会使用 Main 提示词**；不用选择 controller、添加 profile 参数，也不用定制启动器。<br><br>## 先完成你的第一个任务<br><br>用中文说明你要做什么、涉及哪些文件，以及怎样算完成。例如：<br><br>> **帮我梳理这个项目的启动步骤，先只读文件，不修改任何内容。** |
| **Delivery reply** (`builtin-assistant.md`)<br><br>已根据 `notes.md` 写好 [START_HERE.md](docs/cases/codex-first-use/builtin.md)，包含直接使用、可选提醒启用、未验证事项及恢复步骤。**仅新增该文件，未检查或修改实际配置。** | **Delivery reply** (`taste-assistant.md`)<br><br>已根据 `notes.md` 写好 [START_HERE.md](docs/cases/codex-first-use/taste.md)，包含新会话用法、Main/Sub 当前状态、可选提醒启用步骤及恢复命令。 |

Inspect full inputs, generated documents, and run conditions: [Task & run conditions](docs/cases/codex-first-use/input.md) · [Web comparison page](https://nb-corp.github.io/gpt-with-taste/) · [Case index](docs/cases.md).

---

<a id="how-it-works"></a>

## How it works

1. **The system prompt sets standing priorities.** It covers judgment, execution, collaboration, and craft. The instructions are English; replies follow your latest language.
2. **Steer refreshes the relevant priorities near each input.** The local plugin sends user reminders to main, scoped reminders to children, and result-consumption reminders to main after a completed wait. A child's paired startup events produce one reminder. [Installation details](docs/install.md#add-optional-per-turn-steering) cover the events and client entry points.

`prompts/sub.md` is included for roles you choose. Main and sub prompts each contain the complete behavior; `--hooks` installs all three reminder routes.

---

<a id="research"></a>

## Research

[docs/research.md](docs/research.md) details the findings, prompt architecture, and iteration loop behind the recipe: how defensive writing affects the reader's experience, why models need room for ordinary judgment, and how collaborator findings are turned into direct action.

---

<p align="center">
  <a href="LICENSE">MIT License</a> · Community friend link: <a href="https://linux.do/">Linux DO</a>
</p>
