# Install GPT with Taste in Codex

Start with the default prompt-only installation. It replaces Codex's built-in model instructions while keeping your selected model, provider and other settings. Hooks are optional.

## Install and start a new session

1. Install Node.js **22 or newer**, then open a terminal in this clone's root directory. No npm packages are needed. Codex must support `model_instructions_file`.
2. Use the absolute Codex home you already use, such as `"C:/Users/you/.codex"` on Windows. Use the same path in every command.
3. Preview, install and check:

   ```sh
   node scripts/install.mjs --home "/absolute/path/to/.codex" --dry-run
   node scripts/install.mjs --home "/absolute/path/to/.codex"
   node scripts/install.mjs --check --home "/absolute/path/to/.codex"
   ```

   If a command reports a conflict, follow [Update or resolve a conflict](#update-or-resolve-a-conflict).
4. Open a **new Codex session**. No custom launcher or profile flag is needed.

If you omit `--home`, the installer uses `CODEX_HOME` when set, otherwise `~/.codex`. Keep this clone and its private `.gpt-with-taste/install-receipt.json` for recovery. The receipt records previous managed state, not your full configuration or authentication files.

## What the default installs

| Source | Installed in `CODEX_HOME` |
| --- | --- |
| `prompts/main.md` | `prompts/gpt-with-taste/main.md` |
| `prompts/sub.md` | `prompts/gpt-with-taste/sub.md` |

The top-level `model_instructions_file` in `config.toml` points to the installed `main.md`. Its previous value remains recoverable; the file it referenced is left in place. Model, effort, provider/catalog, authentication, permissions, skills, MCP, concurrency, roles, `AGENTS.md`, existing neutral/Nia files and user Hooks stay unchanged. Prompt-only installation does not require the Codex plugin CLI.

## Add optional per-turn steering

**On the tested Codex `0.162.0-alpha.17.2` `exec resume` workflow, this plugin's user, subagent and completed-result reminders were not delivered. Use the complete main prompt for that workflow; do not rely on the optional reminders.** Codex documents the required [Hook events](https://learn.chatgpt.com/docs/hooks); verify delivery in your chosen client before relying on these routes.

To install the definitions, use a Codex CLI supporting local marketplace/plugin install, list and remove commands:

```sh
node scripts/install.mjs --home "/absolute/path/to/.codex" --hooks --dry-run
node scripts/install.mjs --home "/absolute/path/to/.codex" --hooks
node scripts/install.mjs --check --home "/absolute/path/to/.codex"
```

If `codex` is not on PATH, add `--codex "/absolute/path/to/codex"` to these commands. Its executable is recorded for later checks and recovery; `--codex` can override it if it moves.

The installer assembles author sources into `CODEX_HOME/gpt-with-taste/marketplace/`, then runs the normal Codex marketplace and plugin CLI to install `gpt-with-taste@gpt-with-taste-local`. Codex owns the registry and installed cache. The configured routes are:

| Event | Intended consumer |
| --- | --- |
| `UserPromptSubmit` | Main receives `user-steer.md`; a subagent-identified event selects `sub-steer.md`. |
| `SubagentStart` | The new delegated agent receives `sub-steer.md`. |
| `PostToolUse`, matcher `^wait_agent$` | Main receives `agent-steer.md` only for a completed agent receipt. Running, empty/time-out, error and child-session results are excluded. |

The Node command uses the recorded executable and `${PLUGIN_ROOT}/hooks/steer.mjs`, with a 15-second timeout. The script reads adjacent `prompts/` files. It adds developer context without rewriting the task, tool arguments or result; shell/MCP output is not a reminder channel.

Open Codex's interactive terminal UI with the same `CODEX_HOME`, then use `/hooks`. Review and trust only the `UserPromptSubmit`, `SubagentStart` and `PostToolUse` definitions from `gpt-with-taste@gpt-with-taste-local`, each pointing to this plugin's `hooks/steer.mjs`. Installation enables the plugin but does not approve its commands. Codex records approval for the exact current definition; changed definitions need review again. Keep Node at its recorded path; if it moves, restore and reinstall with the new Node executable.

`--check` verifies managed files, registration/enabled state and recorded cache bytes. It does not verify trust approval or event delivery, and it sends no model request.

## Use the complete subagent prompt for a selected role

`sub.md` is a complete instruction source. The plugin's `sub-steer.md` is only a reminder, and this installer does not register or replace roles.

Codex's [custom-agent contract](https://developers.openai.com/codex/multi-agent) provides `developer_instructions` for a role's instructions. To use the complete Sub source in a chosen role, include it alongside that role's existing instructions, preserving its leaf, tool and permission boundaries. This role composition is separate from plugin installation and outside installer recovery.

Do not assume a role-level `model_instructions_file` replaces inherited Main: on the tested `exec resume` workflow, the selected role's developer instructions were delivered, but its Sub instruction-file setting was not consumed as base instructions. Check the chosen child's effective context before relying on complete Sub coverage.

## Update or resolve a conflict

Update this clone, then rerun the same install command. Include `--hooks` to refresh the assembled plugin and Codex cache. A later prompt-only install leaves the optional layer alone and does not invoke Codex. Repeated installs retain the first installation's recovery baseline.

Migration from an older receipt-managed Hook installation removes only its recorded event-and-exact-command groups before enabling the plugin. Their original values remain recoverable, and other Hooks remain in place. An old receipt can also be restored directly without new plugin sources or the plugin CLI.

An existing same-name marketplace/plugin without this receipt's ownership is not adopted. Recover it with its original installer, or explicitly remove it before proceeding. For an unknown differing managed file, review it before using `--replace-managed`; its original bytes are preserved. That flag does not override post-install drift.

Use a separate clone for a different Codex home.

## Undo the installation

From the **same clone** and **same Codex home**, preview and restore:

```sh
node scripts/install.mjs --restore --home "/absolute/path/to/.codex" --dry-run
node scripts/install.mjs --restore --home "/absolute/path/to/.codex"
```

Plugin recovery needs a working Codex CLI, including for the preview. If its recorded executable moved, add `--codex "/absolute/path/to/codex"` to both commands. Recovery restores the original managed instruction setting and file bytes, and removes this installation's optional plugin and marketplace. It preserves unrelated configuration and Hooks.

For interrupted operations, drift or lost receipts, follow [the recovery guide](recovery.md).
