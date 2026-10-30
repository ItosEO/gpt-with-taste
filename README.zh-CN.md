<p align="right">
  <a href="README.md">English</a> · <strong>简体中文</strong>
</p>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/hero-banner-zh-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/hero-banner-zh-light.svg">
  <img alt="GPT with Taste — 敢做判断。保有审美。少些繁文礼节。" src="assets/hero-banner-zh-light.svg" width="100%">
</picture>

<p align="center">
  一套跨宿主、即装即用的 GPT 行为配方：作出常规判断、消化复杂度，并以工程与视觉审美交付工作。<br>
  面向 GPT 推理家族，尤其是 GPT-6.1 Sol 与 GPT-6 Astra；回复跟随你使用的语言。<br>
  <em>Better judgment. Better taste. Less ceremony.</em>
</p>

<p align="center">
  <a href="#harnesses">宿主适配</a> ·
  <a href="#install">安装 Codex</a> ·
  <a href="#what-changes">改变什么</a> ·
  <a href="#featured-case">对照示例</a> ·
  <a href="#how-it-works">工作机制</a> ·
  <a href="#research">研究依据</a>
</p>

---

<a id="harnesses"></a>

## 宿主适配

GPT with Taste 由单一行为配方源编译生成，为各支持宿主提供原生指令与事件提醒：

| 宿主 | 接入形式 | 配置说明 |
| --- | --- | --- |
| **OpenAI Codex** | 原生模型指令与 hooks 叠加层 | [docs/install.md](docs/install.md)（或见下方快速安装） |
| **Claude Code** | Main 指令追加与原生插件（Sub + 3 路 Steer） | [docs/harnesses/claude.md](docs/harnesses/claude.md) |
| **Kiki** | 原生 Recipe（通用包与 Sol/Astra 兼容包） | [docs/harnesses/kiki.md](docs/harnesses/kiki.md) |
| **Pi** | 带 payload 防护的请求级扩展 | [docs/harnesses/pi.md](docs/harnesses/pi.md) |
| **Oh My Pi (OMP)** | 原生身份感知扩展 | [docs/harnesses/omp.md](docs/harnesses/omp.md) |
| **DeepSeek Harness (dsh)** | 原生 Cordis 插件与请求级提醒 | [docs/harnesses/dsh.md](docs/harnesses/dsh.md) |

要在其他宿主中使用？参考 [docs/harnesses/porting.md](docs/harnesses/porting.md)。维护者在 `recipe/` 中维护统一源，通过编译器适配各个目标。本 Fork 保留中文精简只读子代理及其任务提醒，其他提示词为英文。详见 [docs/authoring.md](docs/authoring.md)。

---

<a id="install"></a>

## 安装 · Codex

需要 Node.js **22 或更高版本**。默认只把提示词文件复制到当前 `CODEX_HOME`（未设置时为 `~/.codex`）。**不会修改** `config.toml`、`model_instructions_file` 或 `developer_instructions`。

```sh
git clone https://github.com/ItosEO/gpt-with-taste.git
cd gpt-with-taste
node scripts/install.mjs
```

需要事件提醒时，执行 `node scripts/install.mjs --hooks`。该模式也**保留 Codex 原生基础指令**。在 Codex Desktop 的 **设置 → 钩子**（或终端 `/hooks`）中审核并信任三个 Hook，然后新开一个会话。

运行 `node scripts/check-updates.mjs` 可手动检查更新。安装前也会查询上游公开元数据；离线安装加 `--skip-update-check`。检查只报告结果，不会执行 Git 拉取或安装。详见[更新说明](docs/install.md#update-conflicts-and-restore)。

需要 Taste 的长期行为规则时，由用户手动向 `~/.codex/config.toml` 顶层的 `developer_instructions` 添加选定规则；如该键已经存在，应编辑原值，不要写第二个同名键。例如：

```toml
developer_instructions = """
Make ordinary decisions independently within the user's authorization.
Prefer maintainable code, meaningful checks and clear, direct explanations.
Preserve material uncertainty, evidence and important limitations.
"""
```

如确实需要**完整替换**原生基础指令，显式执行 `node scripts/install.mjs --override-base`（可以同时使用 `--hooks`）。已有旧版覆盖安装若要改用原生模式，应先执行 `--restore`，然后重新安装且不带 `--override-base`。

可用 `--dry-run` 预览、`--check` 检查、`--restore` 恢复。保留克隆目录及其私有的 `.gpt-with-taste/install-receipt.json` 恢复记录。用户已有的权限、MCP、角色和 `AGENTS.md` 不受影响。

详细说明：[安装](docs/install.md)、[恢复](docs/recovery.md)、[提示词分层](docs/prompt-map.md)。

---

<a id="what-changes"></a>

## 改变什么

GPT with Taste 把判断力用在结果上：作出合理选择、保留有据主张、消化有用的协作结果，并认真完成工作。

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/comparison-diagram-zh-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="assets/comparison-diagram-zh-light.svg">
  <img alt="默认行为与 GPT with Taste 的五组日常对照" src="assets/comparison-diagram-zh-light.svg" width="100%">
</picture>

这套配方结合了判断、连续执行、协作、工程与视觉审美。在[研究依据](docs/research.md)中了解设计原则；在[案例索引](docs/cases.md)与[网页版对比展示](https://nb-corp.github.io/gpt-with-taste/)中查阅完整任务输入与实际对照输出。

---

<a id="featured-case"></a>

## 对照示例 · 从安装记录到上手说明

> **同题请求**：根据 notes.md，给刚装好的同事写一份中文上手说明，放 START_HERE.md。

可见的改善很直接：先让读者开始，安装证明与过程自证退出主线。

[![Codex 默认与 GPT with Taste 的代表片段对照，原版多余的自证句已高亮](assets/case-first-use.png)](https://nb-corp.github.io/gpt-with-taste/)

查阅完整输入、生成文档与运行条件：[同题任务与运行记录](docs/cases/codex-first-use/input.md) · [网页版对比展示](https://nb-corp.github.io/gpt-with-taste/) · [案例索引](docs/cases.md)。

---

<a id="how-it-works"></a>

## 工作机制

1. **完整主提示词改为可选。** 默认保留 Codex 原生指令；用户可手动追加 Developer Instructions，或显式使用 `--override-base` 完整替换。
2. **Steer 在受支持的事件处重新强调对应行为。** 本地插件把用户提醒交给主控，把任务提醒交给子 Agent，并在主控收到完成回执或邮箱唤醒后提醒其处理输入。邮箱唤醒不代表任务已完成。配对启动事件只注入一份提醒。后续输入覆盖取决于[客户端入口](docs/install.md#runtime-coverage)。

`prompts/sub.md` 是供指定角色使用的精简只读规则。Hooks 只提供任务提醒，不决定子代理权限；`--hooks` 安装三条提醒路线，但不修改模型基础指令。

---

<a id="research"></a>

## 研究依据

[docs/research.md](docs/research.md) 梳理了配方背后的研究发现、提示词架构与迭代方法：防御性写作如何影响阅读体验、为何给模型保留常规判断空间，以及如何将协作与审查反馈直接转化为行动。

---

<p align="center">
  <a href="LICENSE">MIT 许可证</a> · 致谢：<a href="https://github.com/SpadeLushen/pi-gpt-with-taste">SpadeLushen/pi-gpt-with-taste</a> · 社区友链：<a href="https://linux.do/">Linux DO</a>
</p>

## Advisor 与保留模式更新

默认安装会增加 `agents/advisor.toml` 和 `prompts/developer.zh-CN.toml`。前者安装到 Codex Home 的 `agents/advisor.toml`，用于独立、只读的技术决策审查；后者安装到 `prompts/gpt-with-taste/developer.zh-CN.toml`，供用户手动合并到现有顶层 `developer_instructions`。安装器不会自动修改该指令。

取得并审查新版源码后，运行 `node scripts/install.mjs --update`。该命令保留收据中的 Hooks 和基础指令覆盖模式，并更新 Advisor、模板及其他受管理文件。它不拉取 Git。已有覆盖安装仍保留覆盖；切回原生模式需先恢复，再重装。

同名 Advisor 文件内容不同时，安装器会中止。确认替换时可使用 `--replace-managed`，原文件会保存在恢复记录中。
