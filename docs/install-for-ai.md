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

Recommend Hooks for multi-turn work in Codex Desktop. The plugin refreshes the main agent's priorities, gives delegated agents their own reminder, and guides main when it collects a completed result. The previously tested `0.162.0-alpha.17.2` `exec resume` entry did not dispatch these events; use the complete main prompt for that entry.

If the user requests the plugin definitions and has a Codex CLI supporting local marketplace/plugin install, list and remove commands:

```sh
node scripts/install.mjs --home "/absolute/path/to/.codex" --hooks --dry-run
node scripts/install.mjs --home "/absolute/path/to/.codex" --hooks
node scripts/install.mjs --check --home "/absolute/path/to/.codex"
```

Supply `--codex "/absolute/path/to/codex"` when it is not on PATH. The installer assembles its local marketplace, then uses normal Codex CLI commands to install `gpt-with-taste@gpt-with-taste-local`. Do not replace these with hand-written registry entries or an inline Hook loader.

The three routes are user input to main, child startup/later input to the child, and completed local `wait_agent` receipts to main. The child receives one initial reminder across its paired startup events. A shared finite matcher accepts bare, dotted and flattened tool names. Original tasks and results remain intact.

For manual approval, use Codex Desktop's **Settings → Hooks** with the same `CODEX_HOME`, or `/hooks` in the interactive terminal. Review this plugin's `UserPromptSubmit`, `SubagentStart` and `PostToolUse` definitions pointing to `hooks/steer.mjs`; a changed definition needs approval again.

If the user delegates these configuration edits, back up the config once and update only this plugin's exact Hook-state entries using the current client's documented schema and config API. Confirm the resulting enabled/trusted status with `hooks/list`; keep other Hook approvals and settings intact. `--check` verifies installation. Runtime acceptance requires the reminder in the receiving agent's context before its next model request. Keep a parent/child sample on one app-server instance through spawn, completion and result collection.

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
