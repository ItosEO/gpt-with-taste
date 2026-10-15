> 新版安装器：默认会管理 `agents/advisor.toml` 和中文 `prompts/developer.zh-CN.toml` 模板，但不修改用户 `config.toml`。升级时先 `git pull --ff-only`，再执行 `node scripts/install.mjs --update`，保留原有 Hooks 与基础指令覆盖模式。恢复时会把 Advisor 文件恢复到安装前状态，若原本存在个人文件，则恢复原始字节。手动合并的 Developer Instructions 不在安装器恢复范围内。

# Restore the previous Codex instructions

Use the same clone and Codex home that performed the installation. If you installed the optional plugin, its recorded Codex CLI must be available even for the preview; otherwise add `--codex "/absolute/path/to/codex"` to both commands:

```sh
node scripts/install.mjs --restore --home "/absolute/path/to/.codex" --dry-run
node scripts/install.mjs --restore --home "/absolute/path/to/.codex"
```

For native/default and Hook-only installations, the installer never manages or restores `config.toml`; manual `developer_instructions` and other config changes remain untouched. The newly managed Advisor file is guarded by the same collision, drift and restoration checks as the bundled prompts. Only explicit `--override-base` installations (and earlier legacy full-replacement receipts) restore the prior `model_instructions_file` line or remove the injected line if it was absent. Managed prompt files, owned plugin files and Hook registrations are restored separately.

Plugin recovery removes `gpt-with-taste@gpt-with-taste-local` and its owned marketplace through Codex's normal remove commands. Review any Hook trust you approved through Codex `/hooks`; the installer does not change trust records. Prompt-only and legacy-only recovery do not require the plugin CLI.

Repeated installs and source updates keep the original recovery baseline. Successful recovery marks the single `.gpt-with-taste/install-receipt.json` as restored. A later install starts a new baseline. The receipt is ignored machine-local state; keep it private and keep the clone until recovery is no longer needed.

## Older Hook receipts

To migrate a receipt-managed user Hook installation, rerun `node scripts/install.mjs --home "/absolute/path/to/.codex" --hooks`. The installer retires only its recorded event-and-exact-command groups before enabling the plugin, preventing duplicate reminders. Their original recovery values remain in the receipt, and unrelated Hooks stay in place.

Restore returns those groups to their original pre-install values, not to the intermediate legacy installation. Any matching Hook that existed before the first installation is restored. Original managed file and instruction-line baselines are preserved across migration. You can also restore an old receipt directly without the new plugin sources or Codex plugin CLI.

## If recovery reports drift

For an applied installation, recovery checks managed files, the instruction line only when the installation owns a base override, receipt-owned legacy Hook groups and the plugin's registered root, enabled state and recorded cache bytes before replacing them. For an interrupted `applying` or `restoring` operation, it also accepts the recorded partial states, including a missing or disabled plugin, so recovery can finish. A conflicting user edit stops recovery; reconcile the named item before retrying.

Keep the receipt. Save wanted edits, reconcile the named item with the installed state recorded there, and rerun restore. Unrelated config lines and other Hook groups need no reconciliation. Managed source bytes are in `files[].after`; their original bytes are in `files[].before` (`null` means absent). Plugin cache bytes are recorded separately in `plugin.cacheFiles`; Codex removes its own installed cache through the CLI.

An interrupted operation remains marked `applying` or `restoring`. Rerun `--restore`; it accepts recorded original, installed and interrupted-update states, including a partially removed plugin. File replacements re-read their targets first, so concurrent file edits produce a conflict rather than a silent overwrite. CLI failures keep the recovery receipt for another attempt.

If the receipt is lost, Git can recover repository source but cannot reconstruct previous machine-local values or overwritten target bytes. Receipts from old installer versions without a `config.managed` field are interpreted as full-replacement installations for correct restoration. Re-select the earlier instruction file manually; do not delete unrelated config, marketplaces or Hook files.
