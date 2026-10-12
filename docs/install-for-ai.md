# Install GPT with Taste for a user

Install from this independent clone with Node.js 22+. Follow the normal entry point below; do not substitute a loader, rewrite prompts, install npm dependencies, or copy another Codex setup. If the user provided a repository URL and it is not cloned yet, clone that URL into a local directory first. Do not add a remote, push or publish an existing clone.

## Select the home and install

1. Use the user's active absolute `CODEX_HOME`; otherwise use the absolute `.codex` path in their home directory. Tell them the selected path. The installer can default to `CODEX_HOME` or `~/.codex`, but pass an explicit absolute `--home` when assisting someone.
2. Read `prompts/main.md` and `prompts/sub.md`. Verify these bundled sources exist, then preview and install from the clone root:

   ```sh
   node scripts/install.mjs --home "/absolute/path/to/.codex" --dry-run
   node scripts/install.mjs --home "/absolute/path/to/.codex"
   node scripts/install.mjs --check --home "/absolute/path/to/.codex"
   ```

3. Tell the user to open a new Codex session. Report the installed `model_instructions_file` path and the recovery command. Keep the ignored `.gpt-with-taste/install-receipt.json` in this clone.

The installer changes only top-level `model_instructions_file` and its two managed prompt files by default. It keeps the user's model, effort, provider/catalog, authentication, permissions, skills, MCP, concurrency, roles, `AGENTS.md`, old neutral/Nia files and hooks. Do not print the full config: it may contain credentials. If you need to inspect it, select only the managed field. The receipt captures the old managed line and target bytes, not the full config.

An unknown differing managed file causes a conflict before writes. Review it and ask whether to replace that file. With approval, rerun using `--replace-managed`; the original bytes remain recoverable. Post-install drift requires reconciliation, not forced replacement. For a different Codex home, use another clone rather than replacing this clone's receipt.

## Hooks require a separate opt-in

Only add `--hooks` when the user requested per-turn steering and their Codex supports `UserPromptSubmit` in `hooks.json`:

```sh
node scripts/install.mjs --home "/absolute/path/to/.codex" --hooks
node scripts/install.mjs --check --home "/absolute/path/to/.codex"
```

This deploys the bundled Node hook and its user-steer prompt under `CODEX_HOME/gpt-with-taste/`, then adds one exact-command group with a 15-second timeout. It preserves other hooks. The user must review and approve the installed command through Codex's hook-trust flow. Do not write guessed trust hashes, set a global bypass, or enable `SubagentStart`. Default prompt-only installation has no hook prerequisite.

`sub.md` is a gift for user-selected roles. If the user requests it, point that role's existing config file at the installed sub prompt, following their Codex role configuration. Do not overwrite every agent profile. See [install.md](install.md) for the role setting and paths.

## Recovery and verification

```sh
node scripts/install.mjs --restore --home "/absolute/path/to/.codex" --dry-run
node scripts/install.mjs --restore --home "/absolute/path/to/.codex"
```

Recovery restores only managed state and preserves unrelated later changes. If it reports drift, preserve the receipt and reconcile the named item before retrying; details are in [recovery.md](recovery.md).

For installer changes, run `node --test scripts/install.test.mjs`. Tests use isolated homes under `.tmp/install-test`, synthetic prompts and no real authentication. `--check` verifies installed bytes and the managed field, not model behavior. Do not send model requests merely to verify installation. A separate user-authorized behavior check needs a new Codex session.
