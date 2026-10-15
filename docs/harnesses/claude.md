# Claude Code

Add GPT with Taste to Claude Code without replacing its built-in instructions or your `CLAUDE.md`. Choose prompt-only guidance or enable Steer reminders as well. Both options preserve your existing roles, model choices, permissions, skills, and plugins.

You need Node.js 22+ on `PATH` and Claude Code with `--append-system-prompt-file`, `--plugin-dir`, and exec-form hook arguments (available in 2.1.296).

## Start with Steer

From this repository, build the generated files:

```sh
node scripts/build.mjs --target claude
```

Then start a **new session** in the project you want to work on. Set the absolute checkout path below; the command works in PowerShell and Bash with forward-slash paths:

```sh
claude --append-system-prompt-file "C:/path/to/gpt-with-taste/dist/claude/main.md" --plugin-dir "C:/path/to/gpt-with-taste/dist/claude/plugin"
```

On macOS or Linux, use your checkout's absolute path instead of `C:/path/to/gpt-with-taste`.

Load only a checkout you trust. Plugin hooks execute local Node.js code with your user privileges and receive session, prompt, and tool metadata. This adapter reads its bundled text files and returns additional context; it does not write session state or send network requests. Managed policy can prevent local plugin hooks from running; check `/hooks` and `/plugin` if reminders are absent.

The append file supplies the complete **Main** instructions once. The plugin supplies **Sub** instructions at child start, three targeted Steer reminders, and an optional `gpt-with-taste:taste-worker` agent. Ask Claude to use that worker for a bounded task when appropriate. Its Markdown body contains the complete Sub instructions, it inherits the session's model and permissions, and its `disallowedTools: [Agent]` makes that new worker a leaf. Existing roles retain their own tool restrictions and receive Sub as start context instead.

Use the specific `plugin` directory, not `dist/claude`: the latter also contains the alternative prompt-only plugin. Do not load both variants or append Main through another entry point in the same session.

## Use prompts without Steer

Choose the alternative plugin directory:

```sh
claude --append-system-prompt-file "C:/path/to/gpt-with-taste/dist/claude/main.md" --plugin-dir "C:/path/to/gpt-with-taste/dist/claude/prompt-only"
```

This keeps Main and Sub guidance, including the optional native worker, but sends no User, Sub, or Agent Steer reminders. Its only hook delivers complete Sub to existing roles at child start. For Main alone, omit `--plugin-dir`.

## Run an independent session

Start a new session with the Independent append file and the **prompt-only** plugin:

```sh
claude --append-system-prompt-file "C:/path/to/gpt-with-taste/dist/claude/independent.md" --plugin-dir "C:/path/to/gpt-with-taste/dist/claude/prompt-only"
```

This keeps the independent root free of User and Agent Steer while providing complete Sub instructions to its children. Do not use the Steer `plugin` directory with Independent. For Independent alone, omit `--plugin-dir`. Append `independent.md` instead of `main.md`, not both.

## What each event delivers

Steer entries below apply only to the `plugin` variant, not `prompt-only`.

| Entry point | Consumer | Added text |
| --- | --- | --- |
| `--append-system-prompt-file main.md` | Main session | Complete Main |
| Native `gpt-with-taste:taste-worker` Markdown body | That child | Complete Sub |
| `SubagentStart`, other roles | Starting or resumed child | Complete Sub; plus Sub Steer in the Steer variant |
| `SubagentStart`, native taste worker | Starting or resumed child | Sub Steer only in the Steer variant; Sub is already in the role body |
| `UserPromptSubmit`, main session | Current main session | User Steer |
| `UserPromptSubmit`, child identity, if emitted by the host | Current child | Sub Steer |
| `PostToolUse`, `Agent` with `tool_response.status: "completed"`, main caller | Main session that called Agent | Agent Steer |
| `PostToolUse`, `Agent` with `tool_response.status: "completed"`, child caller | Child session that called Agent | Sub Steer |

Hooks return only `hookSpecificOutput.additionalContext`, with the matching `hookEventName`. They leave the original tool result intact. Agent Steer asks the caller to consume the returned work; a returned result can still be partial and needs the caller's judgment.

A background Agent call returns `async_launched`, not a completed report. Launch handles, remote launches, ordinary tools, and errors receive no Agent Steer. Claude Code delivers background reports through its own later notification; when that invokes the main session's `UserPromptSubmit`, this adapter supplies User Steer. It does not monitor background work or classify notification text as a completion.

The normal CLI child-start path does not submit a child user prompt. Sub and Sub Steer therefore use the official `SubagentStart` context path. Claude Code deduplicates that start context on resume while the earlier copy remains in the child context. The adapter needs no transcript inspection or turn-state files. `agent_id` or `caller_session_id` identifies a child in `UserPromptSubmit` and `PostToolUse`; `agent_type` alone can also name a top-level `--agent` session.

Hook commands use `node` with an argument array and `${CLAUDE_PLUGIN_ROOT}`. Claude resolves the plugin path and starts Node directly, so paths with spaces stay one argument on Windows, macOS, and Linux; no shell quoting or Git Bash dependency is involved.

## Switch or remove it

Start a new session with `prompt-only` to remove Steer while retaining Main and Sub. To remove all GPT with Taste guidance, start a new session without these append and plugin flags. Session-local `--plugin-dir` loading requires no global installation or settings-file edit.

Already injected instructions remain in an existing conversation. A resumed session can also reuse its recorded system prompt. Start a new session when changing variants, removing the adapter, or applying rebuilt prompt text; for prompt development, Claude Code also offers `--system-prompt-snapshot off`.

## Check the local files without a model request

From the repository:

```sh
node --test adapters/claude/claude.test.mjs
claude plugin validate ./dist/claude/plugin --strict --json
claude plugin validate ./dist/claude/prompt-only --strict --json
```

If a hook reports a missing bundled file, rebuild and start a new session with the matching plugin directory. Malformed hook input or missing files produce a non-blocking hook error rather than rejecting the user's prompt or changing a tool result.

## Claude Code interfaces

- [Plugin manifest and standard layout](https://code.claude.com/docs/en/plugins-reference#standard-layout)
- [Plugin path variables](https://code.claude.com/docs/en/plugins-reference#environment-variables)
- [Exec-form hooks and shell behavior](https://code.claude.com/docs/en/hooks#exec-form-and-shell-form)
- [Agent results: completed and background launch](https://code.claude.com/docs/en/hooks#agent)
- [Child-start context](https://code.claude.com/docs/en/hooks#subagentstart) and [caller context after a tool](https://code.claude.com/docs/en/hooks#posttooluse)
- [User-prompt events, including background reports](https://code.claude.com/docs/en/hooks#userpromptsubmit)
- [Agent Markdown and frontmatter](https://code.claude.com/docs/en/sub-agents#write-subagent-files)
- [System-prompt CLI flags](https://code.claude.com/docs/en/cli-reference#system-prompt-flags)
