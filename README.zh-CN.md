<p align="right">
  <a href="README.md">English</a> · <strong>简体中文</strong>
</p>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/hero-banner-zh-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/hero-banner-zh-light.svg">
  <img alt="GPT with Taste — 敢做判断。保有审美。少些繁文礼节。" src="assets/hero-banner-zh-light.svg" width="100%">
</picture>

<p align="center">
  一套即装即用的 Codex 行为配方：作出常规判断、消化复杂度，并以工程与视觉审美交付工作。<br>
  面向 GPT 推理家族，尤其是 GPT-6.1 Sol 与 GPT-6 Astra；回复跟随你使用的语言。<br>
  <em>Better judgment. Better taste. Less ceremony.</em>
</p>

<p align="center">
  <a href="#install">安装</a> ·
  <a href="#what-changes">改变什么</a> ·
  <a href="#featured-case">首选案例</a> ·
  <a href="#how-it-works">工作机制</a> ·
  <a href="#research">研究依据</a>
</p>

---

<a id="install"></a>

## 安装

先安装 Node.js 22 或更高版本，然后运行：

```sh
git clone https://github.com/NB-Corp/gpt-with-taste.git
cd gpt-with-taste
node scripts/install.mjs --hooks
```

推荐在 Codex Desktop 的多轮工作中安装 Hooks：用户发消息、子 Agent 收到输入、主控取回完成结果时，各自收到对应提醒。只安装提示词则运行 `node scripts/install.mjs`。两条路线都不需要 npm 包。

两条路线都安装到当前生效的 `CODEX_HOME`（未设置时为 `~/.codex`），写入两个受管提示词文件，并把 `model_instructions_file` 指向 main。你的模型、provider、effort、认证、权限、MCP、角色与 `AGENTS.md` 保持不变。要指定其他位置，追加带引号的绝对路径，例如 `--home "C:/Users/you/.codex"`。

使用 `--hooks` 时，在 Codex Desktop 的**设置 → 钩子**中审查并信任这三个定义，也可以在交互终端输入 `/hooks`。只开启你需要的事件。安装后请**新开一个 Codex 会话**。

想交给编程助手代办，可把本仓库与 [docs/install-for-ai.md](docs/install-for-ai.md) 一起交给它。要恢复受管状态，使用 [docs/recovery.md](docs/recovery.md)；完整安装契约见 [docs/install.md](docs/install.md)。

---

<a id="what-changes"></a>

## 改变什么

GPT with Taste 把判断力用在结果上：作出合理选择、保留有据主张、消化有用的协作结果，并认真完成工作。

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/comparison-diagram-zh-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/comparison-diagram-zh-light.svg">
  <img alt="默认行为与 GPT with Taste 的五组日常对照" src="assets/comparison-diagram-zh-light.svg" width="100%">
</picture>

这套配方结合了判断、连续执行、协作、工程与视觉审美。[研究依据](docs/research.md)解释原则；[案例索引](docs/cases.md)把底层输入、输出与草稿材料分开保存。

---

<a id="featured-case"></a>

## 首选案例 · clsx 中文上手

**草稿 / 未核实。** 首选案例是一项更通用的文档任务：为刚接触开源项目 [`lukeed/clsx`](https://github.com/lukeed/clsx) 的前端同事写中文上手指南。

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/case-clsx-onboarding-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/case-clsx-onboarding-light.svg">
  <img alt="草稿、未核实的 clsx 上手文档候选对照" src="assets/case-clsx-onboarding-light.svg" width="100%">
</picture>

归档记录了同一份请求、GPT-6.1 Sol 高 effort、原生 Codex 0.162.0-alpha.17.2、Codex 模型目录内置提示词与冻结版 Taste 提示词的来源对照，以及已配置但未触发的 Hooks。仓库还保存了源文件快照与两份生成的指南文档。

原始完整 assistant 消息尚未归档，因此这些文档不会被呈现为已核实或逐字的模型输出对照。请阅读[案例记录](docs/cases.md#featured-case)，或打开[静态对照页](site/index.html)；页面会保留这一状态和证据缺口说明。

当前可用的核实证据是次要的 [Button 工具类覆盖对照](docs/cases.md#verified-evidence)，它保留了完整输入与输出，可作为方法参考，而不是性能评分。

---

<a id="how-it-works"></a>

## 工作机制

1. **系统提示词设定长期优先级。** 它覆盖判断、执行、协作与审美；提示词本体为英文，回复跟随你最新使用的语言。
2. **Steer 在输入附近重新强调对应行为。** 本地插件把用户提醒交给主控，把范围内执行提醒交给子 Agent，并在主控取回完成回执后送入成果消费提醒。子 Agent 配对的启动事件只注入一份提醒。具体事件和客户端入口见[安装说明](docs/install.md#add-optional-per-turn-steering)。

`prompts/sub.md` 留给你指定的角色使用。main 与 sub 提示词各自包含完整行为；`--hooks` 安装这三条提醒路线。

---

<a id="research"></a>

## 研究依据

[docs/research.md](docs/research.md) 将公开研究与配方设计联系起来，并记录开发循环。文档明确区分已核实案例证据与 clsx 草稿，不把“文件存在”当作行为证据。

---

<p align="center">
  <a href="LICENSE">MIT 许可证</a> · 社区友链：<a href="https://linux.do/">Linux DO</a>
</p>
