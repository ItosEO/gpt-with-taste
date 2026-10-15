# GPT with Taste · 安装、更新与恢复

默认模式保留 Codex 原生基础指令，**不修改** `config.toml` 中的 `model_instructions_file` 和 `developer_instructions`。这是给现有 Codex 配置增加决策纪律、独立 Advisor 和事件提醒的组件，不是强制覆盖模型系统指令的安装器。

## 依赖与初次安装

需要 Node.js 22+。保持仓库目录不删除，因为安装记录保存在该目录的 `.gpt-with-taste/install-receipt.json`。

```sh
git clone https://github.com/ItosEO/gpt-with-taste.git
cd gpt-with-taste
npm test
node scripts/install.mjs --dry-run
node scripts/install.mjs --hooks
node scripts/install.mjs --check
```

仅执行 `node scripts/install.mjs` 会安装受管理的提示词副本及独立 Advisor 角色，不安装 Hooks。带 `--hooks` 安装已存在的三个事件提醒，其匹配规则不变。可加 `--home "/absolute/path/to/.codex"` 指定 Codex Home；默认按 `CODEX_HOME` 环境变量或 `~/.codex` 选择。

| 仓库源文件 | 默认安装到 CODEX_HOME 下 | 生效方式 |
| --- | --- | --- |
| `prompts/main.md` | `prompts/gpt-with-taste/main.md` | 仅显式 `--override-base` 时作为完整基础指令 |
| `prompts/sub.md` | `prompts/gpt-with-taste/sub.md` | 独立只读探索子代理的手动配置参考 |
| `prompts/developer.zh-CN.toml` | `prompts/gpt-with-taste/developer.zh-CN.toml` | **用户手动**复制/合并其中 `developer_instructions` |
| `agents/advisor.toml` | `agents/advisor.toml` | Codex 可发现的自定义 Advisor 子代理 |

**重要：** `agents/advisor.toml` 的名称可能与你已有的自定义代理冲突。安装器遇到未知的同名文件且内容不同会中止，不会静默覆盖。如果确实要替换，用 `--replace-managed` 显式确认，旧文件的字节会保存在恢复记录中。

## 手动开启中文 Developer Instructions

`node scripts/install.mjs --hooks` **不会自动编辑用户 Developer Instructions**。安装后编辑 `~/.codex/config.toml`，在第一个表格段 `[...]` 之前放入 `developer_instructions`：

```sh
cat ~/.codex/prompts/gpt-with-taste/developer.zh-CN.toml
nano ~/.codex/config.toml
```

模板位于仓库 [prompts/developer.zh-CN.toml](../prompts/developer.zh-CN.toml)。复制的目标是模板里的 `developer_instructions = """ ... """`，不要复制前面的注释。若配置中已存在同名字段，请合并**内部文本**，不能写两个顶层 `developer_instructions`。这是用户所有的配置；安装器的 `--update`、`--check`、`--restore` 均不维护其内容。

中文版规则要求先研究、质疑假设、验证方案、最终审查和完整 Trade-off 报告；风险越高，事前研究越充分。对重大方案应调用 Advisor，但“只读”角色指令不构成真正的沙盒隔离。

## Advisor 的反迎合审查

新角色源文件 [agents/advisor.toml](../agents/advisor.toml) 默认安装。其具体要求包括：

- 把主代理的诊断和方案当作待验证假设；必须主动尝试**反证**至少一项关键前提
- 对确有证据的严重错误敢于给出“拒绝实施”，说明具体失败场景
- 不得为了展示独立性而虚构问题；通过时也应指出核验依据、已检查的反证方向和剩余缺口
- 始终只读，不能修改文件、创建子代理或替代主代理最终决策
- 输出“通过 / 修改后再审 / 拒绝实施”，并给出阻断问题、反证检查、替代方案及下一步

Codex 自定义代理从 `~/.codex/agents/` 加载独立 TOML。其沙盒和授权规则来自父会话，不能依靠提示词保证文件系统只读。重新开启 Codex 会话后，可让主代理将架构方案交给 `advisor` 审查。是否自动触发仍取决于模型和当前多代理工具是否可用；可以在任务中显式要求先审查。

## Hooks 与默认行为

带 `--hooks` 安装三个原有事件：`UserPromptSubmit`（主代理收到消息）、`SubagentStart`（子代理开始）、`PostToolUse`（`wait_agent` 成功返回已完成结果）。Hook 仍根据原有工具名匹配，并使用已有去重逻辑；**不在 Hook 中重复只读禁止修改等角色限制**。

安装后在 Codex Desktop **Settings → Hooks** 或 CLI `/hooks` 审查并信任 `gpt-with-taste@gpt-with-taste-local` 的三个命令，再开启新会话。

`--check` 验证安装记录、受管理文件和插件注册情况，**不保证** Hook 已获得信任、实际触发，也不验证人工添加的 Developer Instructions。

## 更新现有安装

**现在支持保留安装模式的一键本地更新：**

```sh
cd /path/to/gpt-with-taste
git pull --ff-only
npm test
node scripts/install.mjs --update --dry-run
node scripts/install.mjs --update
node scripts/install.mjs --check
```

`--update` 仅从**本地当前仓库内容**更新 Codex Home，不会自动联网拉取代码。它依照原安装记录自动沿用 Hooks 是否启用和是否曾显式覆盖基础指令，刷新已受管理的文件并补齐新引入的 Advisor 与中文模板。

这也兼容上一版已经执行 `node scripts/install.mjs --hooks` 的用户：不用先卸载，不用改变 `config.toml`，直接 `git pull` 后执行 `--update`。

不要在 `--update` 后再加 `--hooks` 或 `--override-base`，这些模式由旧安装记录确定。`--update` 必须有活动的安装记录；若没有，执行初次安装命令。

如果只想更新提示词且不刷新 Hooks，可以沿用 `node scripts/install.mjs`，但完整升级推荐 `--update`。

## 显式覆盖原生基础指令（可选）

只有用户明确选择时使用：

```sh
node scripts/install.mjs --override-base
# 如需同时安装 Hooks：node scripts/install.mjs --override-base --hooks
```

该模式写入 `model_instructions_file`，替换 Codex 对应模型的内置基础指令，可能带来行为回退。新版本仍默认不覆盖。如果已有旧版覆盖安装，`--update` 保留覆盖模式；要切回原生模式，先恢复，再无覆盖标志地重装。

## 恢复与安全边界

```sh
node scripts/install.mjs --restore --dry-run
node scripts/install.mjs --restore
```

保持同一个仓库目录、`CODEX_HOME` 和恢复记录。恢复只处理安装器管理的文件、所拥有的插件与（如果曾显式覆盖）`model_instructions_file`；手动维护的 `developer_instructions` 不会被回滚。对安装后被人为改动的受管理文件，安装器会拒绝盲目覆盖，需先核对并处理冲突。

更多细节： [恢复机制](recovery.md)、[提示词分层](prompt-map.md)。
