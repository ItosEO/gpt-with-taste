# AI installation contract · ItosEO/gpt-with-taste

Node.js 22+ is required. Use only this repository's supported installer; do not copy a user's authentication, providers or MCP credentials. `CODEX_HOME` defaults to `~/.codex`, and `--home ABSOLUTE_PATH` selects an alternative.

## Default behavior

```sh
node scripts/install.mjs --dry-run
node scripts/install.mjs --hooks
node scripts/install.mjs --check
```

The default installs managed copies of `prompts/main.md`, `prompts/sub.md`, `prompts/developer.zh-CN.toml`, and `agents/advisor.toml` into Codex Home. The last becomes a discoverable custom agent named `advisor`. The Chinese Developer Instructions remain a *manual* TOML template; **never automatically edit or append to user config.toml**. No default model base override is performed.

`--hooks` adds the existing three plugin routes, without narrowing event matchers or placing read-only permissions in child Hook reminders. The user's own settings and role contracts remain in force.

## Anti-sycophancy Advisor

The advisor is a read-only BDFL-style technical critic. It must try to falsify a decisive assumption, give evidence-based blocking objections when necessary, and recommend `通过` (proceed), `修改后再审` (revise) or `拒绝实施` (reject). It must neither rubber-stamp nor fabricate objections. It cannot edit, spawn children or make final decisions. Custom agent instructions do not create an independent read-only OS sandbox.

## Manual developer instructions

Show the user the contents of `prompts/developer.zh-CN.toml` (installed under `CODEX_HOME/prompts/gpt-with-taste/`) for manual merging into the existing top-level `developer_instructions` value. If the key exists, merge the *contents* of the triple-quoted string, not a second key. The workflow emphasizes deep prerequisite understanding, design review before implementation, targeted experiments, final code review, and an exhaustive concise Trade-off report for engineering work.

## Upgrading an existing installation

Update the checked-out repository first, then use the installer to refresh local managed files and the original feature mode:

```sh
git pull --ff-only
npm test
node scripts/install.mjs --update --dry-run
node scripts/install.mjs --update
node scripts/install.mjs --check
```

`--update` reads the existing receipt; it automatically preserves whether Hooks were enabled and whether `--override-base` was used. Do **not** add `--hooks` or `--override-base` to `--update`. It does not run `git pull` for the user. Existing prior-version receipts remain compatible: newly introduced managed destinations are safely added with the same collision checks. When an `advisor.toml` file already exists and differs, the installer must fail closed rather than silently overwrite it. Only `--replace-managed` explicitly replaces unknown content, saving its original bytes.

Full base prompt replacement remains exclusively opt-in via `--override-base`. Older receipts without `config.managed` indicate a legacy overriding install, which `--update` continues to preserve. To move back to native mode, `--restore` and reinstall without that option.

## Restore

```sh
node scripts/install.mjs --restore --dry-run
node scripts/install.mjs --restore
```

Keep the original clone and `.gpt-with-taste/install-receipt.json`. Restoration returns only installer-managed destinations and plugin registration to their original state. Manually edited `developer_instructions` are user-owned and remain untouched. `--check` cannot prove plugin command trust or actual Hook event delivery; review in Codex Desktop Settings → Hooks (or `/hooks`) and verify live.
