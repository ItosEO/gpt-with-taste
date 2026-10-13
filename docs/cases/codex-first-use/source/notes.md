# Codex 配置安装记录

## 安装的内容

本机 Codex home 为 `<CODEX_HOME>`。已经安装 GPT with Taste 的完整英文 Main 和 Sub 两份提示词；对话语言跟随用户，项目产物沿用项目语言。

`config.toml` 的顶层 `model_instructions_file` 已指向 `<CODEX_HOME>/prompts/gpt-with-taste/main.md`。正常打开新的 Codex 会话就使用这份 Main，不需要选择 controller、另加 profile 参数或使用定制启动器。所选模型和 provider、effort、权限、MCP、skills、AGENTS、并发配置保持原样。

一轮真实的 GPT-6.1 Sol/high 请求已经记录到与作者源相同的完整 Main 正文。完整 Sub 文件也已安装，但安装器没有改动或自动替换用户已有子角色。实际子角色的 developer 指令能加载；此前子角色的 `model_instructions_file` 设置没有将继承的 Main base 换成 Sub。所选子角色可以通过支持的 `developer_instructions` 通道组合完整 Sub，组合的真正子会话投递还未检查。

## 可选的逐轮提醒

正式插件 `gpt-with-taste@gpt-with-taste-local` 已通过 Codex 的 marketplace/plugin CLI 安装。插件缓存包含当前三份提醒源：用户输入给 Main、子任务输入给 Sub、已完成子任务的 wait_agent 结果给 Main。脚本保留原任务和工具结果，不改写它们。

三个 Hook 定义均已被正常发现并开启：`UserPromptSubmit`、`SubagentStart`、`PostToolUse`（matcher `^wait_agent$`）。当前三项的 `trustStatus` 都是 `untrusted`。

Codex 的正式审查入口是使用同一 home 的交互终端 `/hooks`。用户在这里审查并信任该插件的这三个定义；命令均指向插件的 `hooks/steer.mjs`。当前公开 app-server API 提供 `hooks/list`，没有对应的 Hook 信任批准方法。安装器没有手写 trust 文件或 hash，没有设置全局 bypass。

在已完成的一轮正常 `exec resume` 父子任务中，三路提醒都没有投递，审计文件也没有产生。原用户输入与子任务结果都保留单份；任务本身完成。插件安装检查与事件投递是两项状态。通过 `/hooks` 完成信任后，还需沿自然任务核提醒实际到达对应消费者。

## 已做的检查与恢复

安装器有 17 个 fixture 检查，另有一项真实 CLI 集成检查；安装、更新、旧 Hook 去重、保留原恢复值和恢复路径已检查。真实 home 的 install、check、restore dry-run 均正常结束。没有执行真实卸载。

恢复只使用同一 clone 下的一份私有 `.gpt-with-taste/install-receipt.json`。多次安装保留首次安装前的 `model_instructions_file` 与受管文件基线，没有累积备份副本。旧的中性提示词文件保留在原位置。

恢复入口是在当前 clone 根运行：

```sh
node scripts/install.mjs --restore --home "<CODEX_HOME>" --dry-run
node scripts/install.mjs --restore --home "<CODEX_HOME>"
```

可选插件恢复连预览也需要可用的 Codex CLI。记录的 CLI 路径是 `<CODEX_CLI>`；它不可用时，可加 `--codex` 指向可用的 CLI。

源码在独立 Git 仓库 GPT with Taste 管理；公开仓为 `https://github.com/NB-Corp/gpt-with-taste`。本机上述插件安装源码还未推送到公开仓；README 展示制作当前暂停。
