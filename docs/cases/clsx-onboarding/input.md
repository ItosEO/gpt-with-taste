# Task and materials

Model: GPT-6.1 Sol, reasoning effort: high. Both runs used native Codex 0.162.0-alpha.17.2 with multi-agent disabled, and received the same seven source files, the same local AGENTS instructions, and the same skills. The built-in side used the Sol instructions from the Codex model catalog, with the legacy literal `{{ personality }}` placeholder removed and the user's custom instruction file excluded. The Taste side ran a frozen copy of the complete `prompts/main.md` only — Hooks were configured but did not trigger in this run (zero Steer messages).

## User request

> 给刚接触 clsx 的前端同事写一份中文上手文档，放 docs/getting-started.zh-CN.md，能照着安装用起来。

## Starting materials

Seven complete files from [`lukeed/clsx`](https://github.com/lukeed/clsx) 2.1.1 (commit `925494cf`), archived byte-exact in [source/](source/): `readme.md`, `package.json`, `license`, `src/index.js`, `src/lite.js`, `clsx.d.ts`, `clsx.d.mts`. The working directory did not contain `dist/`, `bin`, or `test/`; neither document presented that state to the reader.
