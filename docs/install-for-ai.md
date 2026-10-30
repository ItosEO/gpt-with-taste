# Install GPT with Taste for a user or coding assistant

Use the repository's own installer with Node.js 22+. Preserve existing Codex model instructions by default. Do not create an alternate loader, copy somebody else's Codex config, or install npm dependencies.

## Native default

1. Identify the active absolute Codex home: `CODEX_HOME` or `~/.codex`. Reuse that exact path for all operations.
2. Read `prompts/main.md`, `prompts/sub.md`, and the [installation contract](install.md).
3. Preview, install and check:

   ```sh
   node scripts/install.mjs --home "/absolute/path/to/.codex" --dry-run
   node scripts/install.mjs --home "/absolute/path/to/.codex"
   node scripts/install.mjs --check --home "/absolute/path/to/.codex"
   ```

Installation checks public upstream metadata with a five-second total network deadline. Add `--skip-update-check` for offline installation. Keep the user's selected local source; an update report does not authorize replacing a fork with upstream.

Default installation copies `main.md` and `sub.md` to managed locations. It does **not** write `config.toml`, set `model_instructions_file`, edit `developer_instructions`, or inject either source into Codex. The user adds any selected Taste behavior to their developer instructions **manually**. Never silently replace or merge a pre-existing `developer_instructions` key.

## Hooks are independent

When requested, install the existing three source-aware routes without altering the base instructions:

```sh
node scripts/install.mjs --hooks --home "/absolute/path/to/.codex" --dry-run
node scripts/install.mjs --hooks --home "/absolute/path/to/.codex"
node scripts/install.mjs --check --home "/absolute/path/to/.codex"
```

The plugin wires `UserPromptSubmit`, `SubagentStart` and supported local `wait_agent` `PostToolUse`. The matcher accepts bare, dotted and flattened `multi_agent_v1` / `collaboration` names. Completion receipts and non-timeout mailbox wakes select the Main reminder; a mailbox wake does not prove completion. Retained child identity routes dispatched child inputs, even without `agent_id`. Paired initial inputs are deduplicated once. The reminders do not set role permissions.

Upstream's Codex `0.162.1` probe found that native `followup_task` did not dispatch child `UserPromptSubmit`. Do not claim per-input coverage for that path. See [runtime coverage](install.md#runtime-coverage).

Use `--codex "/absolute/path/to/codex"` if the executable is not on PATH. Have the user review and trust the plugin commands in Codex Desktop **Settings → Hooks** or `/hooks`. `--check` does not confirm trust or runtime event delivery. The tested `0.162.0-alpha.17.2` `exec resume` entry did not dispatch Hook events.

## Explicit full replacement

Only use `--override-base` when the user explicitly asks to replace the Codex model-specific base instructions:

```sh
node scripts/install.mjs --override-base --home "/absolute/path/to/.codex" --dry-run
node scripts/install.mjs --override-base --home "/absolute/path/to/.codex"
```

Combine it with `--hooks` only when both features are requested. A prior installation that already manages a base override must first be restored before starting a new default/native installation, so that no stale override remains active. Older receipts without `config.managed` are treated as managed for recovery compatibility.

## Selected read-only subagent

`prompts/sub.md` is the complete compact read-only role, kept below twice the length of the user's original instructions. The installer does not attach it to every child. To use it, include it in the selected role's supported `developer_instructions` together with the role's existing contract. Preserve the agent's actual tool permissions and boundaries. Do not rely on role-level `model_instructions_file` without verifying the effective child context; the tested `exec resume` path inherited the main instructions.

## Check, update and recover

Run `node scripts/check-updates.mjs --home "/absolute/path/to/.codex"` from the existing clone for a read-only provenance and update report. It does not fetch, pull or install. For a fork or local changes, merge reviewed upstream changes into the selected source first. Prompt-only refreshes retain the old Hooks and their provenance; include `--hooks` to update both components.

Rerun the same mode to update managed sources. An active override requires `--override-base` on updates, or `--restore` before switching to native mode. Keep the clone and `.gpt-with-taste/install-receipt.json`, which preserves previous managed state.

```sh
node scripts/install.mjs --restore --home "/absolute/path/to/.codex" --dry-run
node scripts/install.mjs --restore --home "/absolute/path/to/.codex"
```

Native/Hook-only recovery never touches user configuration. Explicit override recovery restores the prior `model_instructions_file` setting. Plugin recovery requires a working Codex CLI. Respect drift checks and do not force a conflict; see [recovery](recovery.md).
