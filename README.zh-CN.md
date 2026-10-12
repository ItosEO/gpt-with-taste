<p align="right">
  <a href="README.md">English</a> · <strong>简体中文</strong>
</p>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/hero-banner-zh-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/hero-banner-zh-light.svg">
  <img alt="GPT with Taste — 敢做判断。保有审美。少些繁文礼节。" src="assets/hero-banner-zh-light.svg" width="100%">
</picture>

<p align="center">
  一套即装即用的行为配方，让 Codex 不再像战战兢兢的外包。<br>
  它敢做常规判断、替你消化复杂度，并以工程与视觉审美交付工作。<br>
  面向整个 GPT 推理家族——尤其 GPT-6.1 Sol 与 GPT-6 Astra；回复始终跟随你使用的语言。
</p>

<p align="center">
  <a href="#安装">安装</a> ·
  <a href="#改变什么">改变什么</a> ·
  <a href="#工作机制">工作机制</a> ·
  <a href="#研究依据">研究依据</a> ·
  <a href="docs/cases.md">案例</a>
</p>

---

## 安装

需要 Node.js 22 或更高版本，以及本仓库的一份本地克隆；不依赖任何 npm 包。

```sh
node scripts/install.mjs --hooks   # 推荐：提示词 + 每轮转向提醒
node scripts/install.mjs           # 纯提示词，同样是完整安装
```

推荐为多轮任务安装 Hooks：每条用户消息后，重新将关键行为送到当前上下文。偏好只用系统提示词，就选第二条路线。

两条路线都装入当前生效的 `CODEX_HOME`（未设置时为 `~/.codex`），写入两个受管提示词文件，并把顶层 `model_instructions_file` 指向 main。你的模型、provider、effort、认证、权限、MCP、角色与 `AGENTS.md` 全部原样保留。要装到别处，追加 `--home` 与带引号的绝对路径，如 `--home "C:/Users/you/.codex"`。

使用 `--hooks` 时，打开 Codex 的 `/hooks` 界面，审查并信任安装写入的命令。

装完**新开一个 Codex 会话**，即可使用已安装的提示词。

想省事，就把本仓库连同 [docs/install-for-ai.md](docs/install-for-ai.md) 直接交给你的编程助手代办。要恢复原状，[docs/recovery.md](docs/recovery.md) 一条命令只回退受管状态。完整安装说明见 [docs/install.md](docs/install.md)。

---

## 改变什么

GPT with Taste 把判断力用在你的结果上：作出合理选择、保留有据主张、消化协作结果、完成有审美的工作。它针对这些日常习惯作出调整：

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/comparison-diagram-zh-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/comparison-diagram-zh-light.svg">
  <img alt="默认行为与 GPT with Taste 的五组日常对照" src="assets/comparison-diagram-zh-light.svg" width="100%">
</picture>

判断、连续执行、协作、工程与视觉审美都是这套配方的组成部分。真实任务切片与 Codex 内置提示词的对照，见 [docs/cases.md](docs/cases.md)。

---

## 工作机制

1. **系统提示词承担主要工作。** 它为判断、执行、协作与审美建立长期指令。提示词本体为英文；实际回复跟随用户最新使用的语言。
2. **Steer 在每轮重新强调关键行为。** 启用 `--hooks` 后，`UserPromptSubmit` 在用户消息提交后、模型请求前运行。本地脚本将一条聚焦的提醒作为 developer context 返回：作出普通选择、消化复杂度、选择性路由、删掉无用小字。这样，关键行为就贴近当前轮次的具体任务。

`prompts/sub.md` 留给你指定的角色使用。安装器接入用户轮次的 Steer；`sub-steer.md` 与 `agent-steer.md` 是分别面向子任务输入、主控消费协作回执的作者源，供独立事件集成使用。main 与 sub 提示词各自包含完整行为。

---

## 研究依据

[docs/research.md](docs/research.md) 将公开研究的发现与配方设计联系起来。其中一项对照实验很说明问题：面向审稿人改写的文本在 AI 评审那里得分更高，人类读者却觉得更难读。

---

## 许可证

[MIT](LICENSE)。
