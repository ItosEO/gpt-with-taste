# Install GPT with Taste in Codex

Run the installer from your clone with Node.js 22 or newer. No npm packages are needed. Codex must support the top-level `model_instructions_file` setting; the installer keeps your selected model and provider.

```sh
node scripts/install.mjs --home "/absolute/path/to/.codex" --dry-run
node scripts/install.mjs --home "/absolute/path/to/.codex"
node scripts/install.mjs --check --home "/absolute/path/to/.codex"
```

On Windows, use a quoted absolute path such as `"C:/Users/you/.codex"`. If you omit `--home`, the installer uses `CODEX_HOME` when set, otherwise your home directory's `.codex`. Open a new Codex session after installing; no custom launcher or profile flag is required.

## What the default installs

| Source in this clone | Installed in `CODEX_HOME` |
| --- | --- |
| `prompts/main.md` | `prompts/gpt-with-taste/main.md` |
| `prompts/sub.md` | `prompts/gpt-with-taste/sub.md` |

The installer points the top-level `model_instructions_file` in `config.toml` to the installed `main.md`. This replaces Codex's built-in model instructions for the active model. Any previous value is recorded for recovery; its referenced file is left in place.

Other configuration stays unchanged: model, effort, provider, catalog, authentication, permissions, skills, MCP, concurrency, roles and `AGENTS.md`. Existing neutral and Nia prompts stay where they are. The default neither reads nor writes `hooks.json`.

`sub.md` is included for roles you choose, not attached to every agent. To use it for an existing Codex role, set `model_instructions_file = "/absolute/path/to/.codex/prompts/gpt-with-taste/sub.md"` in that role's existing config file. Keep its model and other settings. Current Codex registers role config files under `[agents.<role>]` with `config_file`; this installer does not create or edit those registrations. Your manual role edits are outside installer recovery.

## Add optional per-turn steering

If your Codex version supports `UserPromptSubmit` hooks and `hooks.json`, opt in explicitly:

```sh
node scripts/install.mjs --home "/absolute/path/to/.codex" --hooks
node scripts/install.mjs --check --home "/absolute/path/to/.codex"
```

This also deploys `hooks/steer.mjs` and `prompts/user-steer.md` under `CODEX_HOME/gpt-with-taste/`, preserving their relative layout. It adds one `UserPromptSubmit` group to `hooks.json`, with a 15-second timeout and a command using this installation's absolute Node executable and script path. Other groups and events remain in place. `SubagentStart` is not installed.

Review and approve that command through your Codex version's hook-trust flow. Installing the files does not grant trust: the installer writes no trust key and enables no trust bypass. Keep Node at the recorded executable path. If you move Node, restore this installation and reinstall using the new executable.

## Update or resolve a conflict

Update this clone with Git, then rerun the same install command. Include `--hooks` to update the optional hook files. A later prompt-only install leaves previously opted-in hooks alone. Repeated installs retain the original recovery baseline, including across source updates.

If an unknown file already occupies a managed target and differs from the bundled source, installation stops before writing. Review the file; if you want to replace it, rerun with `--replace-managed`. Its original bytes are retained in the recovery receipt. That flag does not override edits made after an installation: reconcile reported drift first.

The installer stores one machine-local receipt at `.gpt-with-taste/install-receipt.json` in this clone. Keep this clone and receipt until you no longer need [recovery](recovery.md). The receipt holds only the managed config line, managed file bytes and optional hook-group state—not a copy of your full configuration or authentication files. Use a separate clone for another Codex home.

## Check compatibility without a model request

`--check` compares the installed managed state against the receipt; it does not call Codex or a model. For a local config-loading check, run `codex features list` with `CODEX_HOME` set to an isolated test home, if your CLI provides that command. This is not strict schema validation; the tested CLI rejects `--strict-config` on `features`. Do not copy your real authentication into a test home.

The installation contract was checked against the [official Codex schema](https://github.com/openai/codex/blob/main/codex-rs/core/config.schema.json) and local CLI help. Hooks are a separate compatibility requirement; they are never required for prompt-only installation.
