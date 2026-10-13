# Codex 中文上手说明

这份说明依据安装记录 `notes.md` 整理，未重新检查本机配置。先正常打开一个新的 Codex 会话，就可以开始使用已安装的 Main 提示词；逐轮提醒是可选项，不影响这一步。

## 1. 直接开始使用

像平常一样启动 Codex，新建会话并用中文提出任务即可：

- 不需要选择 controller、添加 profile 参数或使用定制启动器。
- 对话语言跟随用户；项目中的文档、代码等产物沿用项目语言。
- 原有模型、provider、effort、权限、MCP、skills、AGENTS 和并发配置保持不变。

本机 Codex home 是 `<CODEX_HOME>`。顶层 `config.toml` 的 `model_instructions_file` 已指向：

```text
<CODEX_HOME>/prompts/gpt-with-taste/main.md
```

安装记录中的一轮真实 GPT-6.1 Sol/high 请求已确认加载与作者源一致的完整英文 Main 正文。这是已完成的验证，不表示需要切换到该模型才能使用。

## 2. 哪些已生效，哪些还没确认

| 项目 | 安装记录中的状态 |
| --- | --- |
| Main 提示词 | 已安装，真实请求已验证加载 |
| Sub 提示词 | 完整文件已安装，但没有自动替换已有子角色 |
| 提醒插件 | 已安装，三个 Hook 均已被发现并开启，但仍为 `untrusted` |
| 提醒实际投递 | 尚未验证成功；已完成的父子任务中三路提醒均未投递 |

使用子代理时，不要默认它已经切换到 Sub：此前子角色的 `model_instructions_file` 设置没有把继承的 Main base 换成 Sub。子角色的 developer 指令能加载，所选角色可通过支持的 `developer_instructions` 通道组合完整 Sub，但这种组合在真正子会话中的投递还未检查。

## 3. 可选：启用逐轮提醒

插件名称是 `gpt-with-taste@gpt-with-taste-local`。它提供三路提醒：

| Hook | 提醒送达位置 |
| --- | --- |
| `UserPromptSubmit` | 用户输入时，送给 Main |
| `SubagentStart` | 子任务输入时，送给 Sub |
| `PostToolUse`，matcher 为 `^wait_agent$` | 子任务完成后的 `wait_agent` 结果处，送给 Main |

提醒脚本保留原任务和工具结果，不改写它们。要启用：

1. 打开使用同一 Codex home（`<CODEX_HOME>`）的交互终端。
2. 输入 `/hooks`，审查该插件的三个定义；它们的命令都应指向插件的 `hooks/steer.mjs`。
3. 审查后，在这个入口信任这三个定义。
4. 再通过自然任务检查提醒是否到达对应消费者，包括用户输入、子任务启动和等待子任务完成三个环节。

“插件已安装”“Hook 已开启”和“提醒已送达”是不同状态。记录中的一次正常 `exec resume` 父子任务虽然完成了，但没有投递提醒，也没有产生审计文件；原用户输入和子任务结果仍各保留单份。

当前公开 app-server API 只有 `hooks/list`，没有 Hook 信任批准方法。请使用 `/hooks` 审查，不要手写 trust 文件或 hash，也不要设置全局 bypass。完成信任后，仍需检查实际投递。

## 4. 需要恢复时

恢复要在**当初安装所用的同一 clone 根目录**运行，并依赖其中的私有收据 `.gpt-with-taste/install-receipt.json`。笔记没有提供该 clone 的本机路径，操作前需先确认位置和收据。

先预览，不执行真实恢复：

```sh
node scripts/install.mjs --restore --home "<CODEX_HOME>" --dry-run
```

确认预览符合预期后，再执行：

```sh
node scripts/install.mjs --restore --home "<CODEX_HOME>"
```

多次安装保留的是首次安装前的 `model_instructions_file` 和受管文件基线，不是每次安装各存一份备份。旧的中性提示词文件仍保留在原位置。

可选插件的恢复连预览也需要可用的 Codex CLI。记录中的路径为：

```text
<CODEX_CLI>
```

若该路径不可用，可在上述命令后加 `--codex "可用的 CLI 路径"`。

## 5. 验证与源码边界

安装记录已完成 17 个 fixture 检查和一项真实 CLI 集成检查，覆盖安装、更新、旧 Hook 去重、保留原恢复值和恢复路径。真实 home 的 install、check、restore dry-run 均正常结束，**没有执行真实卸载**。

公开源码仓库是 <https://github.com/NB-Corp/gpt-with-taste>。本机上述插件安装源码尚未推送到公开仓，README 展示制作也处于暂停状态；不要假定从公开仓重新下载即可复现本机这次插件安装。
