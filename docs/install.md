# Install GPT with Taste in Codex

The default installation **keeps Codex's built-in model instructions**. It copies the two prompt sources into the active Codex home; it does not change `config.toml`, `model_instructions_file`, or `developer_instructions`. Enable Hooks independently, or explicitly request a full base-instruction override.

## Install, preview and check

Node.js **22+** is required. No npm dependencies are installed.

```sh
git clone https://github.com/ItosEO/gpt-with-taste.git
cd gpt-with-taste
node scripts/install.mjs --dry-run
node scripts/install.mjs
node scripts/install.mjs --check
```

Pass `--home "/absolute/path/to/.codex"` to use a specific Codex home. Without it, the installer selects `CODEX_HOME` or `~/.codex`. Use the same `--home` for every install, check and restore command.

Default managed sources:

| Source | Installed destination |
| --- | --- |
| `prompts/main.md` | `CODEX_HOME/prompts/gpt-with-taste/main.md` |
| `prompts/sub.md` | `CODEX_HOME/prompts/gpt-with-taste/sub.md` |

Both files are **inert** unless explicitly configured. `main.md` is the complete replacement prompt; `sub.md` is a compact read-only role prompt. Installation leaves model, provider, reasoning effort, permissions, authentication, MCP servers, existing roles, skills, AGENTS.md and user Hooks untouched.

## Add developer instructions manually

For native Codex behavior with selected Taste guidance, edit the top-level `developer_instructions` in your own `config.toml`. For example:

```toml
developer_instructions = """
Make routine decisions independently within existing authorization.
Prefer maintainable solutions, useful verification and readable output.
Remove redundant disclaimers while retaining material uncertainty.
"""
```

If `developer_instructions` is already present, merge the new rules into its existing value; TOML must not contain duplicate keys. **The installer never creates or edits this field.** The complete `main.md` is intended for the explicit replacement mode, not for indiscriminate appending to developer instructions.

## Add optional per-turn steering

Use `--hooks` to install the local Codex marketplace/plugin. This does **not** set `model_instructions_file`.

```sh
node scripts/install.mjs --hooks --dry-run
node scripts/install.mjs --hooks
node scripts/install.mjs --check
```

The three event routes are unchanged:

| Event | Reminder |
| --- | --- |
| `UserPromptSubmit` | `user-steer.md` for main; later identified child turns receive `sub-steer.md` |
| `SubagentStart` | `sub-steer.md` for a newly started child; paired initial user event is deduplicated |
| `PostToolUse` | `agent-steer.md` for main only after local `wait_agent` reports completed results without timeout |

The `PostToolUse` matcher recognizes `wait_agent`, `multi_agent_v1.wait_agent` and `multi_agent_v1wait_agent`. The original task and tool result stay intact. These are additional context reminders; they do not change agent roles or tool permissions. In particular, `sub-steer.md` does not impose read-only restrictions; the chosen role's instructions do.

The plugin is `gpt-with-taste@gpt-with-taste-local`. Codex plugin commands must be available for `--hooks`. If `codex` is not on PATH, use `--codex "/absolute/path/to/codex"`. Open **Settings → Hooks** in Codex Desktop, or run `/hooks`, to inspect and trust the three definitions. An approved definition that changes requires review again. Open a new Codex session.

The previously tested Codex `0.162.0-alpha.17.2` `exec resume` entry did not dispatch plugin events. `--check` confirms managed files and plugin state, **not** actual event delivery or user trust. Runtime verification must use a Codex entry point that dispatches the intended events.

## Optional: replace the model's base instructions

Full replacement is available only when explicitly requested:

```sh
node scripts/install.mjs --override-base --dry-run
node scripts/install.mjs --override-base
node scripts/install.mjs --check
```

You can combine `--override-base --hooks`. The override sets top-level `model_instructions_file` to the installed main prompt. It replaces Codex's model-specific built-in instructions and may affect native agent behavior.

A receipt from an older GPT with Taste installation may still manage `model_instructions_file`. To move an **existing override installation** to the native default, run `--restore` first, then reinstall without `--override-base`. The installer deliberately refuses to silently switch an active override install into native mode. To keep the existing override, supply `--override-base` on subsequent install/update calls.

## Use the compact subagent role prompt

`prompts/sub.md` contains the complete read-only research role instructions. It is intentionally short (379 Unicode characters against the 329-character reference; below the 2× limit). The installer copies this file but does not register new roles or replace existing ones.

For a selected custom agent, include the prompt through the supported role `developer_instructions` configuration, alongside any existing role contract. The separate Hook reminder carries only task and evidence guidance. It does not establish the role's read-only permissions.

The tested `exec resume` workflow inherited the main base instructions even when a role-level `model_instructions_file` was set. Do not assume that role-level base replacement is effective; verify the child agent's actual instruction context. See the [Codex custom agent documentation](https://developers.openai.com/codex/multi-agent).

## Update, conflicts and restore

Update this clone and rerun your chosen command. Include `--hooks` when you want to update installed Hook sources; plain installation does not inspect the plugin. Repeated installs keep the first recovery baseline until restored.

The installer records state in `.gpt-with-taste/install-receipt.json` inside the clone. For existing managed destination files with unknown different content, review the conflict before using `--replace-managed`; this flag preserves the original bytes for recovery and does not override post-install drift.

Preview and restore from the **same clone** and **same Codex home**:

```sh
node scripts/install.mjs --restore --dry-run
node scripts/install.mjs --restore
```

A native or Hook-only installation restores only files and plugin state that it managed; it **never restores or changes user-edited developer instructions or config.toml**. An installation made with `--override-base` restores its prior `model_instructions_file` value. Plugin restoration requires the recorded Codex CLI (or an explicit `--codex`).

For interrupted operations, local conflicts and earlier receipt formats, see [recovery](recovery.md).
