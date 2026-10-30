# Agent Note: 同步上游并保留原生指令安装模式

Status: implemented

## Problem

上游 `079fb262b4d7932515ba4e6341fd57b6f2122f4a` 修复了 Codex 子代理提醒路由和配置末行恢复，并增加来源更新检查和多宿主编译。本 Fork 的原生指令默认安装与精简只读子代理规则需要继续生效。

## Decision

合入上游提交历史、修复、更新检查和编译链，保留本 Fork 的安装契约：默认及 `--hooks` 不管理基础指令；仅 `--override-base` 设置 `model_instructions_file`。旧覆盖安装继续按原有回执恢复，不自动改成原生模式。更新报告给出的安装命令保留已有 Hooks 和基础指令模式。

将本 Fork 的精简 `sub.md` 和 `sub-steer.md` 放到 `recipe/`，由上游编译器生成所有宿主产物与旧 `prompts/` 入口，避免构建覆盖本地角色约束。普通子代理只读、不得继续派发，不承担实现和最终决策。

本次不合入待审 PR #2 的 Advisor、中文模板和 `--update`。本机沿用当前中文 Developer Instructions 和 AGENTS.md。

## Alternatives considered

- 完全使用上游默认值：维护差异最少，但会覆盖原生基础指令，并将精简子代理改成可实施的完整角色，违反已确定的使用方式。
- 只挑选 Hooks 修复：短期改动较少，但缺少配置恢复、来源检查和后续统一编译入口，增加下次同步的重复工作。
- 合入全部历史并保留 Fork 契约：使用成熟的上游实现，同时承担安装器合并和生成产物的维护成本，符合本次同步范围。

## Verification

- `npm test`：69 项通过，Windows 专用检查在 macOS 跳过；Pi 和 OMP 消费测试通过。覆盖原生安装、手动 Developer Instructions 保留、显式覆盖、旧回执、末行恢复、提醒路由和来源检查。
- `npm run build:check`：85 个生成文件无漂移。
- `test:codex-plugin`：真实 Codex CLI 在隔离目录完成安装、更新、检查及恢复。
- `test:dsh`：使用锁定的消费 SDK，5 项测试通过。
- 本机沿用原有恢复回执，以 `--hooks` 更新，并以 `--check` 验证；不使用 `--override-base`。

## Consequences

上游修复和统一编译链可复用，但后续同步仍需维护原生安装分支。精简子代理传播到全部编译目标，减少重复维护；其他宿主的实现型角色不可使用该源。新 Hooks 定义需要用户在 Codex 原生界面重新审核；安装检查不能代替实际会话触发验证。
