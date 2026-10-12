# Install GPT with Taste for a user

Use this clone's normal installer with Node.js 22+. Do not substitute a loader, rewrite prompts, install npm dependencies or copy another Codex setup. If the supplied repository has not been cloned, clone it into a local directory first. Do not add a remote, push or publish an existing clone.

## Install the complete main prompt

1. Select the user's active absolute `CODEX_HOME`, otherwise their home directory's absolute `.codex` path. Tell them the path and pass it explicitly.
2. Read the bundled `prompts/main.md` and `prompts/sub.md`, then preview, install and check from the clone root:

   ```sh
   node scripts/install.mjs --home "/absolute/path/to/.codex" --dry-run
   node scripts/install.mjs --home "/absolute/path/to/.codex"
   node scripts/install.mjs --check --home "/absolute/path/to/.codex"
   ```

3. Tell the user to open a new Codex session. Report the installed instruction-file path and recovery command. Keep `.gpt-with-taste/install-receipt.json` in this clone.

Default installation changes only top-level `model_instructions_file` and two managed prompt files. It preserves model, effort, provider/catalog, authentication, permissions, skills, MCP, concurrency, roles, `AGENTS.md`, existing neutral/Nia files and user Hooks. It does not require the Codex CLI. Inspect only the managed field, not the full config, which may contain credentials.

For an unknown differing managed target, review it and obtain approval before using `--replace-managed`; its original bytes remain recoverable. Post-install drift requires reconciliation, not forced replacement. Use another clone for a different Codex home.

## Optional Hooks

On the tested Codex `0.162.0-alpha.17.2` `exec resume` workflow, none of this plugin's three reminders reached their consumers. Recommend prompt-only behavior for that workflow. A client must dispatch the corresponding Hook events before optional steering is usable.

If the user requests the plugin definitions and has a Codex CLI supporting local marketplace/plugin install, list and remove commands:

```sh
node scripts/install.mjs --home "/absolute/path/to/.codex" --hooks --dry-run
node scripts/install.mjs --home "/absolute/path/to/.codex" --hooks
node scripts/install.mjs --check --home "/absolute/path/to/.codex"
```

Supply `--codex "/absolute/path/to/codex"` when it is not on PATH. The installer assembles its local marketplace, then uses normal Codex CLI commands to install `gpt-with-taste@gpt-with-taste-local`. Do not replace these with hand-written registry entries or an inline Hook loader.

The three configured routes are user input to main, subagent input/startup to the child, and completed `wait_agent` receipts to main. Original tasks and tool results remain intact. Shell/MCP results, incomplete waits and `SubagentStop` are not main-result reminder channels.

Have the user open Codex's interactive terminal UI with the same `CODEX_HOME` and use `/hooks`. They should review and trust only this plugin's `UserPromptSubmit`, `SubagentStart` and `PostToolUse` definitions pointing to its `hooks/steer.mjs`; changed definitions need review again.

The tested version's public app-server schema provides `hooks/list`, not a Hook trust-approval method. Do not substitute generic command approval, invent trust hashes or set a global bypass. `--check` verifies files and plugin installation state, not trust or delivery.

Receipt-owned legacy Hook groups are migrated by exact command and event; other Hooks remain untouched. An unowned same-name marketplace/plugin is not adopted. Prompt-only updates leave the optional layer alone.

## A selected role needs its own Sub instructions

The plugin's sub reminder is not the complete Sub prompt. Do not rely on a role-level `model_instructions_file` on the tested resumed CLI workflow: the role's developer instructions loaded, but its Sub file did not replace inherited Main base instructions.

If the user requests complete Sub for a chosen role, use Codex's supported custom-role `developer_instructions` channel to include `prompts/sub.md` alongside that role's existing contract. Preserve registration, model, effort, leaf, tool and permission boundaries; do not overwrite all roles. This role composition is separate from plugin installation and outside its recovery receipt. Verify the selected child's effective instructions before reporting Sub coverage. See [role setup](install.md#use-the-complete-subagent-prompt-for-a-selected-role).

## Restore the previous installation

Use the same clone and home:

```sh
node scripts/install.mjs --restore --home "/absolute/path/to/.codex" --dry-run
node scripts/install.mjs --restore --home "/absolute/path/to/.codex"
```

Plugin recovery needs a working Codex CLI even for the preview. It uses the recorded executable unless overridden with `--codex`. Recovery removes only the owned plugin/marketplace through the CLI and restores the original managed instruction line, file bytes and legacy Hook baselines. Repeated installs preserve the first installation's baseline, not the latest update's previous state.

For an interrupted operation, rerun `--restore`. For drift, keep the receipt, preserve wanted edits and reconcile the named item before retrying; `--replace-managed` does not force recovery. See [recovery.md](recovery.md). Installation checks send no model request; runtime verification needs separate user authorization.
