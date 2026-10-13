# 把安装记录变成新人上手说明

> 根据 notes.md，给刚装好的同事写一份中文上手说明，放 START_HERE.md。

两次 Codex 会话收到同一份[安装记录](source/notes.md)：主会话 Main 已实际生效；逐轮提醒插件已安装，三个 Hook 尚待用户信任；记录同时包含子角色状态、测试与恢复细节。

## 看两侧全文

| | Codex 内置 Sol 指令 | GPT with Taste Main |
| --- | --- | --- |
| 生成的上手说明 | [builtin.md](builtin.md) | [taste.md](taste.md) |
| 完整 assistant 消息 | [builtin-assistant.md](builtin-assistant.md) | [taste-assistant.md](taste-assistant.md) |
| 实际模型指令 | [官方 effective base](prompts/builtin-effective-base.md) | [完整 Main](prompts/taste-main.md) |

[page-excerpts.json](page-excerpts.json) 提供可并排展示的原文与行号，包含开头、交付回复及内置侧的检查记录段。

## 实际运行条件

- 2026-10-13，两次原生 Codex `0.162.0-alpha.17.2` 会话，`gpt-6.1-sol`，high reasoning effort。
- 内置侧使用当次 `codex debug models` 导出的官方 Sol base，仅去掉 legacy 字面 `{{ personality }}` slot 及其后的两个换行；Taste 使用完整 `prompts/main.md`，快照见上表。
- 相同安装记录、共享本地 Agent Core、相同权限与执行边界。两侧禁用 user/repo skills，保留 Codex system skills。
- Hooks 与 multi-agent 关闭，web search 关闭，实际 Steer 和 web 操作均为零。

[source-map.json](source-map.json) 连接原输入、完整产物、消息序号和 prompt 来源。本机 Codex home 与 CLI 路径替换为 `<CODEX_HOME>`、`<CODEX_CLI>`；原文其余内容保留，输出链接指向归档文档。
