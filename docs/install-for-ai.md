# Install GPT with Taste for a user

Use this clone's normal installer with Node.js 22+. Do not substitute a loader, rewrite prompts, install npm dependencies or copy another Codex setup. If the supplied repository has not been cloned, clone it into a local directory first. Do not add a remote, push or publish an existing clone.

## Install the complete main prompt

1. Select the user's active absolute `CODEX_HOME`, otherwise their home directory's absolute `.codex` path. Tell them the path and pass it explicitly.
2. Read the bundled `prompts/main.md` and `prompts/sub.md`, then preview, install and check from the clone root. Installation first performs a read-only official update check with a five-second total network limit; add `--skip-update-check` for offline installation. Keep the user's chosen local source:

   ```sh
   node scripts/install.mjs --home "/absolute/path/to/.codex" --dry-run
   node scripts/install.mjs --home "/absolute/path/to/.codex"
   node scripts/install.mjs --check --home "/absolute/path/to/.codex"
   ```

3. Tell the user to open a new Codex session. Report the installed instruction-file path and recovery command. Keep `.gpt-with-taste/install-receipt.json` in this clone.

Default installation changes only top-level `model_instructions_file` and two managed prompt files. It preserves model, effort, provider/catalog, authentication, permissions, skills, MCP, concurrency, roles, `AGENTS.md`, existing neutral/Nia files and user Hooks. It does not require the Codex CLI. Inspect only the managed field, not the full config, which may contain credentials.

For an unknown differing managed target, review it and obtain approval before using `--replace-managed`; its original bytes remain recoverable. Post-install drift requires reconciliation, not forced replacement. Use another clone for a different Codex home.

## Optional Hooks

Recommend Hooks for multi-turn work in Codex Desktop. The plugin refreshes Main on user submission, gives children a startup reminder, and guides Main on supported wait receipts or mailbox wakes. Later child inputs receive reminders only when the client dispatches their Hook event. The previously tested `0.162.0-alpha.17.2` `exec resume` entry did not dispatch these events; use the complete main prompt for that entry.

If the user requests the plugin definitions and has a Codex CLI supporting local marketplace/plugin install, list and remove commands:

```sh
node scripts/install.mjs --home "/absolute/path/to/.codex" --hooks --dry-run
node scripts/install.mjs --home "/absolute/path/to/.codex" --hooks
node scripts/install.mjs --check --home "/absolute/path/to/.codex"
```

Supply `--codex "/absolute/path/to/codex"` when it is not on PATH. The installer assembles its local marketplace, then uses normal Codex CLI commands to install `gpt-with-taste@gpt-with-taste-local`. Do not replace these with hand-written registry entries or an inline Hook loader.

The three routes are user input to Main, child startup/dispatched child input, and supported local `wait_agent` results to Main. A matching paired startup input is suppressed once; retained child identity routes later events even without `agent_id`. The shared finite matcher accepts bare, dotted and flattened `multi_agent_v1` / `collaboration` names. Current collaboration waits return a mailbox wake, not proof of completion. Original tasks and results remain intact.

In the Codex 0.162.1 runtime probe, native `followup_task` did not dispatch a child `UserPromptSubmit`. Do not report per-input reminder coverage for that path. Use the complete Sub source in selected roles for standing child instructions, preserving their existing contracts; see [runtime coverage](install.md#runtime-coverage).

For manual approval, use Codex Desktop's **Settings → Hooks** with the same `CODEX_HOME`, or `/hooks` in the interactive terminal. Review this plugin's `UserPromptSubmit`, `SubagentStart` and `PostToolUse` definitions pointing to `hooks/steer.mjs`; a changed definition needs approval again.

If the user delegates these configuration edits, back up the config once and update only this plugin's exact Hook-state entries using the current client's documented schema and config API. Confirm the resulting enabled/trusted status with `hooks/list`; keep other Hook approvals and settings intact. `--check` verifies installation. Runtime acceptance requires the reminder in the receiving agent's context before its next model request. Keep a parent/child sample on one app-server instance through spawn, completion and result collection.

Receipt-owned legacy Hook groups are migrated by exact command and event; other Hooks remain untouched. An unowned same-name marketplace/plugin is not adopted. Prompt-only updates leave the optional layer alone.

## A selected role needs its own Sub instructions

The plugin's sub reminder is not the complete Sub prompt. Do not rely on a role-level `model_instructions_file` on the tested resumed CLI workflow: the role's developer instructions loaded, but its Sub file did not replace inherited Main base instructions.

If the user requests complete Sub for a chosen role, use Codex's supported custom-role `developer_instructions` channel to include `prompts/sub.md` alongside that role's existing contract. Preserve registration, model, effort, leaf, tool and permission boundaries; do not overwrite all roles. This role composition is separate from plugin installation and outside its recovery receipt. Verify the selected child's effective instructions before reporting Sub coverage. See [role setup](install.md#use-the-complete-subagent-prompt-for-a-selected-role).

## Check updates and reinstall

For an update check, use the existing clone and selected home:

```sh
node scripts/check-updates.mjs --home "/absolute/path/to/.codex"
```

The equivalent entry is `node scripts/install.mjs --check-updates`. With no explicit `--home` or `CODEX_HOME`, manual checks use this clone's recorded installation home. Explicit home selections must match that receipt. Read **Checkout**, **Installed prompts** and **Installed Hooks** separately, and use the suggested command's recorded home and Hook selection. The check reads official GitHub metadata with a five-second network limit; `--check` remains the local integrity check. For offline installation, add `--skip-update-check`.

For a requested upgrade, obtain the user's chosen revision manually, then reinstall from that source and run `--check`. For a fork or local edits, merge the wanted upstream changes into that source first. Compare provenance and revisions rather than custom version numbers. A source archive or older receipt can have unknown provenance; retain its recovery data.

Include `--hooks` to update prompts and an installed plugin together. A prompt-only update preserves the old Hook installation and its source record. Source entries describe successful component installations; the first recovery baseline remains intact. After installation, open new sessions and review changed Hook definitions through the native Codex workflow.

## Restore the previous installation

Use the same clone and home:

```sh
node scripts/install.mjs --restore --home "/absolute/path/to/.codex" --dry-run
node scripts/install.mjs --restore --home "/absolute/path/to/.codex"
```

Plugin recovery needs a working Codex CLI even for the preview. It uses the recorded executable unless overridden with `--codex`. Recovery removes only the owned plugin/marketplace through the CLI and restores the original managed instruction line, file bytes and legacy Hook baselines. Repeated installs preserve the first installation's baseline, not the latest update's previous state.

For an interrupted operation, rerun `--restore`. For drift, keep the receipt, preserve wanted edits and reconcile the named item before retrying; `--replace-managed` does not force recovery. See [recovery.md](recovery.md). Installation checks send no model request; runtime verification needs separate user authorization.
