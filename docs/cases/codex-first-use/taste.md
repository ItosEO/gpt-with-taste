# Codex 上手：直接开新会话

GPT with Taste 已安装。**正常打开一个新的 Codex 会话，就会使用 Main 提示词**；不用选择 controller、添加 profile 参数，也不用定制启动器。

## 先完成你的第一个任务

用中文说明你要做什么、涉及哪些文件，以及怎样算完成。例如：

> 帮我梳理这个项目的启动步骤，先只读文件，不修改任何内容。

对话语言跟随你，项目产物沿用项目语言。安装的提示词是英文，不影响用中文交流。

本次安装没有改动你原来的模型、provider、effort、权限、MCP、skills、AGENTS 或并发配置，继续按原来的方式使用即可。

## 哪些已经生效

- **主会话 Main：已验证。** 已通过真实请求确认加载完整 Main，文件位于 `<CODEX_HOME>/prompts/gpt-with-taste/main.md`。
- **子会话 Sub：文件已安装，实际使用待验证。** 安装器没有替换已有子角色；此前子角色的文件设置也未将继承的 Main 换成 Sub。所选子角色可通过 `developer_instructions` 组合完整 Sub，但真正子会话的组合投递还未检查。

## 可选：开启逐轮提醒

**不处理这一项，也可以先使用主会话 Main。** 逐轮提醒是另外安装的插件能力。

插件 `gpt-with-taste@gpt-with-taste-local` 已安装，三个 Hook 已被发现并开启，但当前信任状态都为 `untrusted`。已做的父子任务检查中，三路提醒均未投递。

要启用提醒：

1. 在使用同一 Codex home（`<CODEX_HOME>`）的交互终端中输入 `/hooks`。
2. 审查该插件的三个定义；命令均指向插件的 `hooks/steer.mjs`。确认后在该入口信任它们：
   - `UserPromptSubmit`：用户输入时，向 Main 提醒。
   - `SubagentStart`：子任务输入时，向 Sub 提醒。
   - `PostToolUse`，matcher 为 `^wait_agent$`：子任务完成、返回 `wait_agent` 结果时，向 Main 提醒。
3. 信任后，用正常任务检查提醒是否实际到达对应主会话或子会话；涉及子任务的两路也要核实。

脚本保留原任务和工具结果，不改写它们。请通过 `/hooks` 审查和信任，不要手写信任文件或设置全局 bypass。

## 需要恢复安装前状态时

恢复依赖**当初安装所用的同一份源码副本（clone）** 中的私有文件 `.gpt-with-taste/install-receipt.json`，请保留它。该记录保留首次安装前的配置与受管文件基线。

在该 clone 根目录先预览：

```sh
node scripts/install.mjs --restore --home "<CODEX_HOME>" --dry-run
```

检查预览，确认要恢复后再执行：

```sh
node scripts/install.mjs --restore --home "<CODEX_HOME>"
```

可选插件的恢复连预览也需要可用的 Codex CLI。安装记录中的 CLI 路径为：

```text
<CODEX_CLI>
```

如果它已不可用，在恢复命令后加 `--codex "可用的 CLI 完整路径"`。真实 home 的安装、检查和恢复预览已通过；尚未执行真实卸载。

源码公开仓：<https://github.com/NB-Corp/gpt-with-taste>。本机这次插件安装的源码尚未推送到公开仓，恢复时应使用原安装 clone，不要用重新下载的公开仓替代。
