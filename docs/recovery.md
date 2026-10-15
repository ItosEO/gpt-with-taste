# Restore the previous Codex instructions

Use the same clone and Codex home that performed the installation. If you installed the optional plugin, its recorded Codex CLI must be available even for the preview; otherwise add `--codex "/absolute/path/to/codex"` to both commands:

```sh
node scripts/install.mjs --restore --home "/absolute/path/to/.codex" --dry-run
node scripts/install.mjs --restore --home "/absolute/path/to/.codex"
```

The installer restores the original `model_instructions_file` assignment, retaining a line separator when later content needs one, or removes it if originally absent. It restores previous bytes at managed file targets and removes files it created. Other config keys, user Hooks and later unrelated changes remain.

Plugin recovery removes `gpt-with-taste@gpt-with-taste-local` and its owned marketplace through Codex's normal remove commands. Review any Hook trust you approved through Codex `/hooks`; the installer does not change trust records. Prompt-only and legacy-only recovery do not require the plugin CLI.

Repeated installs and source updates keep the original recovery baseline. The receipt's `source.prompts` and `source.hooks` entries describe successful component installations; recovery uses the original saved settings and bytes. Older receipts remain usable. Successful recovery marks the single `.gpt-with-taste/install-receipt.json` as restored. A later install starts a new baseline. Keep this private receipt and the clone until recovery is no longer needed. Restore runs locally, including when offline.

## Older Hook receipts

To migrate a receipt-managed user Hook installation, rerun `node scripts/install.mjs --home "/absolute/path/to/.codex" --hooks`. The installer retires only its recorded event-and-exact-command groups before enabling the plugin, preventing duplicate reminders. Their original recovery values remain in the receipt, and unrelated Hooks stay in place.

Restore returns those groups to their original pre-install values, not to the intermediate legacy installation. Any matching Hook that existed before the first installation is restored. Original managed file and instruction-line baselines are preserved across migration. You can also restore an old receipt directly without the new plugin sources or Codex plugin CLI.

## If recovery reports drift

For an applied installation, recovery checks managed files, the instruction line, receipt-owned legacy Hook groups and the plugin's registered root, enabled state and recorded cache bytes before replacing them. For an interrupted `applying` or `restoring` operation, it also accepts the recorded partial states, including a missing or disabled plugin, so recovery can finish. A conflicting user edit stops recovery; reconcile the named item before retrying.

Keep the receipt. Save wanted edits, reconcile the named item with the installed state recorded there, and rerun restore. Unrelated config lines and other Hook groups need no reconciliation. Managed source bytes are in `files[].after`; their original bytes are in `files[].before` (`null` means absent). Plugin cache bytes are recorded separately in `plugin.cacheFiles`; Codex removes its own installed cache through the CLI.

An interrupted operation remains marked `applying` or `restoring`. Rerun `--restore`; it accepts recorded original, installed and interrupted-update states, including a partially removed plugin. File replacements re-read their targets first, so concurrent file edits produce a conflict rather than a silent overwrite. CLI failures keep the recovery receipt for another attempt.

If the receipt is lost, Git can recover repository source but cannot reconstruct previous machine-local values or overwritten target bytes. Re-select the earlier instruction file manually; do not delete unrelated config, marketplaces or Hook files.
