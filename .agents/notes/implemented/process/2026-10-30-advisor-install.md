# Agent Note: 合入 Advisor 并保留新版安装契约

Status: implemented

## Problem

PR #2 基于旧版安装器，与已同步的主分支冲突。用户要求保留主分支的新功能和修复，再合入 Advisor 并安装到本机。

## Decision

以主分支安装器为基础，增加 Advisor 与中文 Developer Instructions 模板的受管理副本。默认不编辑用户 Developer Instructions，不覆盖原生基础指令。新增 `--update` 从现有收据继承 Hooks 与基础指令模式，不执行 Git 拉取。保留更新检查、来源记录、配置末行恢复及安装字节核验。

Advisor 使用官方独立 TOML 角色格式，不新增配置注册逻辑。只读是角色行为约束，不是独立沙箱。普通精简 Sub 维持原有契约。主代理审查规则写入 recipe/main.md 后统一编译。

## Alternatives considered

- 直接使用旧 PR 安装器：改动较少，但会丢失新修复与更新检查，因此放弃。
- 自动合并中文模板到用户配置：立即生效，但会修改用户自定义指令，因此只安装模板供手动使用。
- 保持每次显式指定安装模式：无需新参数，但容易遗漏 Hooks；保留 PR 的收据驱动更新入口。

## Verification

- npm test：75 项通过，1 项 Windows 专用检查跳过；Pi、OMP 消费检查通过。
- npm run build:check：85 个生成文件一致。
- 真实 Codex CLI 隔离安装、更新、检查和恢复通过。
- 未进行 Advisor 的真实任务模型调用，未声称已完成独立顾问复核。

## Consequences

Advisor 与模板纳入原有收据，支持同名冲突检查及恢复。新会话可发现个人角色；角色继承父会话模型、权限和可用工具。旧同步记录中未合 PR #2 的范围决定仅适用于此前同步任务，见同目录 2026-10-30-sync-upstream-native-mode.md。
