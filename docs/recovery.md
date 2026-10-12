# Restore the previous Codex instructions

Use the same clone and Codex home that performed the installation:

```sh
node scripts/install.mjs --restore --home "/absolute/path/to/.codex" --dry-run
node scripts/install.mjs --restore --home "/absolute/path/to/.codex"
```

The installer restores the original `model_instructions_file` line, or removes it if it was absent. It restores previous bytes at managed file targets and removes files it created. If you opted into hooks, it restores only its exact `UserPromptSubmit` group and optional runtime files. Other hook groups and later unrelated config changes remain.

Repeated installs and source updates keep the original recovery baseline. A successful restore marks the single `.gpt-with-taste/install-receipt.json` receipt as restored. A later install starts a new baseline. Source history belongs in Git; the receipt is ignored machine-local state. Keep it private and keep the original clone until recovery is no longer needed.

## If recovery reports drift

Recovery checks all managed items before changing any of them. If someone edited a managed prompt, the managed config line, or the installed hook group, it stops without overwriting that change. `--replace-managed` does not bypass this protection.

Keep the receipt. Save any edits you want to retain, then reconcile the reported item with its installed state recorded in the receipt and rerun restore. Config comparison concerns only the managed line; unrelated lines need no reconciliation. Hook comparison concerns only the exact installed command group; other groups need no reconciliation. Managed file bytes are recorded as base64 in `files[].after`; original bytes are in `files[].before` (`null` means the file did not exist).

If the operation was interrupted, its receipt remains marked `applying` or `restoring`. Rerun `--restore`; it accepts items already at their recorded original, installed, or interrupted-update state. Writes re-read their targets before replacement, so concurrent changes produce a conflict rather than a silent overwrite.

If the receipt is lost, Git can recover the repository's source but cannot reconstruct this machine's previous config value or overwritten target bytes. Re-select your earlier instruction file manually; do not delete unrelated Codex config or hook files.
