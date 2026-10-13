# Prompt map

Default installation preserves Codex's built-in model instructions and copies the bundled prompt files without activating them. Users may manually add selected Taste principles to their own `developer_instructions`; the installer never edits that key. The complete main prompt is opt-in through `--override-base`. The compact subagent role is independently usable when explicitly configured. The three Hook steer files remain optional context reminders, not new role permissions.

## Choose the source for the reader

| Source | Reader and placement | Job |
| --- | --- | --- |
| [`prompts/main.md`](../prompts/main.md) | Main base instructions, **only with `--override-base`** | Full alternative prompt for explicit replacement; not used by the native default. |
| [`prompts/sub.md`](../prompts/sub.md) | Explicitly configured read-only subagent role | Concise, evidence-first research assignment; no edits, implementation or further delegation. |
| [`prompts/user-steer.md`](../prompts/user-steer.md) | Optional reminder near each submitted user request to the main agent | Reconnect the request to the current goal, make ordinary choices, preserve existing usage, and select reader-useful content. |
| [`prompts/sub-steer.md`](../prompts/sub-steer.md) | Optional reminder with input to a delegated agent | Stay focused on the assigned question, check decisive evidence, and return useful findings. No duplicated read-only rules. |
| [`prompts/agent-steer.md`](../prompts/agent-steer.md) | Optional reminder when the main agent receives a collaborator message or task result | Reconcile evidence and decide before routing only the missing action-changing information. |

The main and user/agent steer sources use English; the compact subagent role and subagent steer use Chinese. The files require no base-prompt placeholder, private path, or hidden companion file. Languages in prompts do not override the user's requested output language. The native model prompt and role instructions remain under Codex's own control unless explicitly replaced or configured.

## Where the capabilities live

| Capability | Explicit full main prompt | Compact read-only subagent |
| --- | --- | --- |
| User goal and task continuity | Understand the purpose and the current assignment | Keep the assigned scope and follow-up context |
| Evidence and independent judgment | Research and decision sections | Critical unknowns, traceable evidence and clear uncertainty |
| Engineering quality and visual taste | Make taste visible in the work | Outside the read-only role's responsibility |
| Code editing, testing and recovery | Take the shortest complete route; verify acceptance | Investigation and preliminary verification only; no edits |
| Delegation and coordination | Collaborate around real dependencies | No new subagents; concise handoff to parent |
| Source and authorization boundaries | Respect authority, sources, and continuity | Explicit read-only role and source distinctions |

The complete main remains available for deliberate experiments with model instruction replacement. The default install does not attach any of these role sources. Use developer instructions manually for selected Taste behavior.

## Why the rules are grouped this way

**Purpose comes before execution.** The prompts distinguish discussing, assessing, gathering evidence, and implementing at the point where the agent interprets the assignment. Ordinary judgment is autonomous within the authorized stage. A follow-up question refines ongoing work rather than silently ending it.

**Taste is a delivery standard.** It covers choosing a worthwhile direction, economical abstractions, deliberate visual hierarchy, readable copy, and inspecting the actual result. It remains a substantive quality obligation rather than an upbeat tone or a prescribed visual theme.

**Compatibility belongs with implementation.** Preserving an old call means preserving its entry point, data meaning, and conditions of use. New prerequisites belong only to the new capability. Keeping these together prevents a new feature from quietly narrowing established usage.

**Research is conditional, not diminished.** Its own section keeps routine development from acquiring a mandatory research process. Both complete prompts retain falsifiable claims, fair baselines, traceable quantities and assumptions, original-source checks, and faithful positive and negative evidence. The main prompt also retains topic selection and cross-line synthesis. Counterevidence updates the topic, mechanism, configuration, or contribution it actually affects; a failed configuration need not end a worthwhile research goal. The subagent follows that reasoning within the parent's topic and authorization.

**Collaboration centers on ownership and decisions.** The main agent may work directly or delegate according to its actual permissions. The compact read-only subagent does investigation and evidence synthesis without implementation, agent creation or final decisions. The main agent owns integration, code changes, and final acceptance.

**Reader First is selection before phrasing.** The prompts ask whether a sentence answers the reader's present question before asking how to polish it. Useless material is deleted, not restyled or moved to small print. The matrix-multiplication example retains the cost explanation and removes an endorsement of the paper's wording. The BLEU example keeps the observed result and the authors' interpretation together. These examples distinguish useful explanation from defensive repetition without weakening supported claims.

**Verification follows the affected action.** The full main prompt retains risk-based verification guidance; the read-only subagent reports checkable facts, uncertainty and remaining gaps without making repository changes.

## Codex integration decisions

The sources refer to the current Codex tools, schemas, role restrictions, and event behavior rather than naming tools from another host. They do not assume a message wakes or interrupts a recipient, grants approval, or proves consumption. Notification-driven continuation applies when the runtime guarantees completion notifications; waiting follows the supported tool contract and a real dependency. A child resolves its promised dependencies before its final result.

Selecting [optional hooks](install.md#add-optional-per-turn-steering) assembles the single author sources into a local marketplace and installs `gpt-with-taste@gpt-with-taste-local` through the normal Codex plugin CLI. The plugin configures three source-specific routes:

- `UserPromptSubmit`: `user-steer.md` addresses main; a later child turn carrying `agent_id` receives `sub-steer.md`.
- `SubagentStart`: `sub-steer.md` enters the child alongside its role and task. The session, agent and initial turn IDs suppress the paired first `UserPromptSubmit`, so the child gets one initial reminder.
- `PostToolUse`: a finite shared name map recognizes `wait_agent`, `multi_agent_v1.wait_agent` and `multi_agent_v1wait_agent`. Main receives `agent-steer.md` when `timed_out` is `false` and the status map contains a `{completed: string}` receipt. The original result stays intact; incomplete, timed-out, not-found, shell/MCP and child-session results select no main reminder.

`SubagentStop` controls continuation inside the child. Parent follow-ups use the subagent-identified `UserPromptSubmit`; dispatch arguments and automatic completion notifications are left intact. The complete `sub.md` remains available for roles the user chooses.

The Windows launcher invokes Node with PowerShell's `&` call operator and reads the official `PLUGIN_ROOT` environment value. Event JSON supplies the consumer and turn identity. Named diagnostics identify missing metadata or source/state failures; optional audit logging never blocks a successful context response. See [installation](install.md#add-optional-per-turn-steering) for setup and trust.

The previously tested Codex `0.162.0-alpha.17.2` `exec resume` entry did not dispatch plugin events. `--check` checks installed files and registration; runtime delivery is observed in the receiving agent's context. Native mode does not gain Hook reminders on entry points that do not dispatch the events.

The delegated role's developer instructions were delivered, while its role-level instruction-file setting did not replace inherited main base instructions in the tested workflow. Compact Sub is a source for chosen role configuration, not an automatically installed child base. Follow [role setup](install.md#use-the-compact-subagent-role-prompt), preserving actual tool boundaries.
