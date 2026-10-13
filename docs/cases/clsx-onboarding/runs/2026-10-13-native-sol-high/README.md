# clsx onboarding · complete run archive

## Task

> 给刚接触 clsx 的前端同事写一份中文上手文档，放 docs/getting-started.zh-CN.md，能照着安装用起来。

## Outputs

| Run | Assistant messages | Generated guide |
| --- | --- | --- |
| Codex built-in Sol instructions | [Commentary and final reply](builtin-assistant.md) · [JSON](builtin-assistant.json) | [Built-in guide](../../builtin.md) |
| GPT with Taste Main | [Commentary and final reply](taste-assistant.md) · [JSON](taste-assistant.json) | [Taste guide](../../taste.md) |

[source-map.json](source-map.json) links the input, original message ordinals, generated files, prompt snapshots and run conditions. [page-excerpts.json](page-excerpts.json) provides exact passages and their source line ranges.

## Run conditions

Both runs used native Codex `0.162.0-alpha.17.2`, `gpt-6.1-sol`, high reasoning effort and multi-agent disabled on 2026-10-13. They received the same seven complete `clsx` 2.1.1 files, local AGENTS instructions, customized Agent Core and available skills, including writing skills. The [source snapshot](../../source/) comes from [lukeed/clsx](https://github.com/lukeed/clsx) commit `925494cf31bcd97d3337aacd34e659e80cae7fe2`.

- **Built-in:** the official `codex debug models` Sol catalog base, with the literal legacy `{{ personality }}` slot and its two following newline characters removed. Read the [catalog export](prompts/builtin-catalog-base.md) and [effective base](prompts/builtin-effective-base.md).
- **Taste:** the [frozen complete Main](prompts/taste-main.md), matching `prompts/main.md` at commit `2f83a28`.
- **Steer:** zero messages in both runs. Built-in Hooks were disabled; Taste had a configured UserPromptSubmit Hook. This is a Main-only comparison.

## Teaching approach

The built-in guide gives a separate Node installation check, its expected output and a recovery instruction. Taste keeps the check inside the frontend example: toggle `isActive`, then inspect the changed class string.
