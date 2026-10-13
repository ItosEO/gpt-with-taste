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

Default installation copies `main.md` and `sub.md` to managed locations. It does **not** write `config.toml`, set `model_instructions_file`, edit `developer_instructions`, or inject either source into Codex. The user adds any selected Taste behavior to their developer instructions **manually**. Never silently replace or merge a pre-existing `developer_instructions` key.

## Hooks are independent

When requested, install the existing three source-aware routes without altering the base instructions:

```sh
node scripts/install.mjs --hooks --home "/absolute/path/to/.codex" --dry-run
node scripts/install.mjs --hooks --home "/absolute/path/to/.codex"
node scripts/install.mjs --check --home "/absolute/path/to/.codex"
```

The plugin wires `UserPromptSubmit`, `SubagentStart` and completed local `wait_agent` `PostToolUse`. Do not change their matcher or narrow their trigger conditions. They inject `user-steer.md`, `sub-steer.md` or `agent-steer.md` as additional context. The compact `sub-steer.md` focuses on task evidence and result handoff; it deliberately does not repeat read-only or no-delegation restrictions. Such restrictions belong in the selected subagent's role instructions, not the Hook.

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

Rerun the same mode to update managed sources. An active override requires `--override-base` on updates, or `--restore` before switching to native mode. Keep the clone and `.gpt-with-taste/install-receipt.json`, which preserves previous managed state.

```sh
node scripts/install.mjs --restore --home "/absolute/path/to/.codex" --dry-run
node scripts/install.mjs --restore --home "/absolute/path/to/.codex"
```

Native/Hook-only recovery never touches user configuration. Explicit override recovery restores the prior `model_instructions_file` setting. Plugin recovery requires a working Codex CLI. Respect drift checks and do not force a conflict; see [recovery](recovery.md).
