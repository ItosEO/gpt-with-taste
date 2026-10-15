# Install GPT with Taste in Codex

Start with the default prompt-only installation. It replaces Codex's built-in model instructions while keeping your selected model, provider and other settings. Hooks are optional.

## Install and start a new session

1. Install Node.js **22 or newer**, then open a terminal in this clone's root directory. No npm packages are needed. Codex must support `model_instructions_file`.
2. Use the absolute Codex home you already use, such as `"C:/Users/you/.codex"` on Windows. Use the same path in every command.
3. Preview, install and check. Installation and its preview first query official update metadata, with a five-second total network limit. Add `--skip-update-check` to either install command for offline use:

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

We recommend Hooks for multi-turn work in Codex Desktop: they refresh the relevant behavior on user submission, child startup and supported wait results. Later child input receives a reminder only when the client dispatches its Hook event. Codex documents these [Hook events](https://learn.chatgpt.com/docs/hooks). The previously tested `0.162.0-alpha.17.2` `exec resume` entry did not dispatch the plugin events; use the complete main prompt for that entry.

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
| `UserPromptSubmit` | Main receives `user-steer.md`. Child inputs receive `sub-steer.md` when `agent_id` is present or `session_id` matches a child recorded at startup. |
| `SubagentStart` | The child receives `sub-steer.md`. A paired `UserPromptSubmit` with the same child and initial turn is suppressed once; later turns retain their reminder. |
| `PostToolUse` for local `wait_agent` | Main receives `agent-steer.md` for a completed legacy receipt or a current collaboration mailbox wake, without a timeout. Bare, dotted and flattened `multi_agent_v1` / `collaboration` names share the matcher. |

The Node command uses the recorded executable and the official `PLUGIN_ROOT` environment value, with a 15-second timeout. On Windows, the installer generates a PowerShell call with `&`, quoted executable and a `Join-Path` argument. The script reads adjacent `prompts/` files and returns developer context; the task and tool result stay intact. Incomplete, timed-out, not-found and child-session results receive no main-result reminder.

Child identity and initial-turn state live under the plugin's `PLUGIN_DATA` directory. Identity remains after startup deduplication so a later event need not repeat `agent_id`; Main keeps its own route. Open new child sessions after updating. An explicit child input can also migrate the previous parent/child-keyed start record.

Optional audit output uses `GPT_WITH_TASTE_HOOK_AUDIT` and records event IDs, route and outcome, not prompt or result bodies. `emitted` means the script returned context; the legacy `injected` field remains an alias. Receiving-agent context is the delivery evidence. An audit write failure leaves the response working; missing child-turn metadata, a missing prompt file or unusable identity state produces a named diagnostic on stderr.

In Codex Desktop, open **Settings → Hooks** with the same `CODEX_HOME`; in the interactive terminal, use `/hooks`. Review and trust only the `UserPromptSubmit`, `SubagentStart` and `PostToolUse` definitions from `gpt-with-taste@gpt-with-taste-local`, each pointing to this plugin's `hooks/steer.mjs`. Installation enables the plugin but does not approve its commands. Codex records approval for the exact current definition; changed definitions need review again. Keep Node at its recorded path; if it moves, restore and reinstall with the new Node executable.

`--check` verifies managed files, registration/enabled state and recorded cache bytes. It does not verify trust approval or event delivery, and it sends no model request.

### Runtime coverage

On Codex **0.162.1**, a Linux ARM64 runtime probe delivered the startup Sub reminder but native `followup_task` did not dispatch a child `UserPromptSubmit`. Those native follow-ups therefore do not receive a fresh per-input reminder. Use the [complete Sub source in selected roles](#use-the-complete-subagent-prompt-for-a-selected-role) for standing child behavior; the installer leaves role composition to you.

The current `collaboration` wait returns a mailbox wake (`message: "Wait completed."`, `timed_out: false`), not a completion receipt. Its reminder asks Main to reconcile pending messages; it does not mark any child complete. Timeout, incomplete/not-found status receipts, unrelated tools and child-session results receive no Main reminder.

## Use the complete subagent prompt for a selected role

`sub.md` is a complete instruction source. The plugin's `sub-steer.md` is only a reminder, and this installer does not register or replace roles.

Codex's [custom-agent contract](https://developers.openai.com/codex/multi-agent) provides `developer_instructions` for a role's instructions. To use the complete Sub source in a chosen role, include it alongside that role's existing instructions, preserving its leaf, tool and permission boundaries. This role composition is separate from plugin installation and outside installer recovery.

Do not assume a role-level `model_instructions_file` replaces inherited Main: on the tested `exec resume` workflow, the selected role's developer instructions were delivered, but its Sub instruction-file setting was not consumed as base instructions. Check the chosen child's effective context before relying on complete Sub coverage.

## Update or resolve a conflict

From the same clone, check the official source and your installed components:

```sh
node scripts/check-updates.mjs --home "/absolute/path/to/.codex"
```

`node scripts/install.mjs --check-updates --home "/absolute/path/to/.codex"` is the equivalent installer entry. Both are read-only and work without the Codex plugin CLI. Omit `--home` to use this clone's recorded installation home when `CODEX_HOME` is unset. The report separates **Checkout**, **Installed prompts** and **Installed Hooks**, and gives an install command for the recorded home and Hook selection.

The check uses the latest official GitHub release when available, otherwise a clearly labeled official default-branch revision. Source identity and revisions determine the comparison; your package version is a display label. For a fork, local edits or custom commits, review upstream changes and merge the ones you want into your own source. An archive without Git or an older receipt can show an unknown source; keep its existing recovery receipt.

Choose and obtain the source revision yourself, then rerun the install command shown by the check. In a clean official checkout, `git pull --ff-only` gets the current branch changes. Include `--hooks` to refresh the assembled plugin and Codex cache along with the prompts. A prompt-only install keeps the existing optional layer, and its recorded Hook source, unchanged. Repeated installs retain the first installation's recovery baseline.

Installation and its preview also perform the read-only metadata check before writing. Network checks have a five-second total limit; an unavailable check leaves the chosen local installation usable. To install offline:

```sh
node scripts/install.mjs --home "/absolute/path/to/.codex" --skip-update-check
```

Add `--hooks` when refreshing an existing plugin installation. `--check` remains the local installation-integrity check; `--restore` and `--help` run locally. Changed Hook definitions go through the normal Codex review step after installation. Source records advance with successful component installations.

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
