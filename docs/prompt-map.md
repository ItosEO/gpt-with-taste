# Prompt map

The default product is the complete main prompt. One source serves the GPT model family, including GPT-6.1 Sol and GPT-6 Astra; it does not select a provider, model, or reasoning effort. The subagent prompt is also complete on its own. The three steer files are optional reminders for particular moments, not a second layer needed to recover missing capabilities.

## Choose the source for the reader

| Source | Reader and placement | Job |
| --- | --- | --- |
| [`prompts/main.md`](../prompts/main.md) | The main Codex agent's instruction context | Own the user's result, make decisions, execute or delegate, integrate evidence, and deliver finished work. |
| [`prompts/sub.md`](../prompts/sub.md) | A delegated agent's instruction context, alongside its actual role and assignment | Own the complete scoped result while preserving role, leaf, tool, support, and write boundaries. |
| [`prompts/user-steer.md`](../prompts/user-steer.md) | Optional reminder near each submitted user request to the main agent | Reconnect the request to the current goal, make ordinary choices, preserve existing usage, and select reader-useful content. |
| [`prompts/sub-steer.md`](../prompts/sub-steer.md) | Optional reminder with input to a delegated agent | Continue the scoped assignment, finish local work, and report only real early coordination needs. |
| [`prompts/agent-steer.md`](../prompts/agent-steer.md) | Optional reminder when the main agent receives a collaborator message or task result | Reconcile evidence and decide before routing only the missing action-changing information. |

The files are literal English instruction sources. They require no base-prompt placeholder, private path, model alias, or hidden companion file. English source does not fix the response language: the main and subagent prompts explicitly follow the user's latest conversational language, including a switch, while project artifacts follow project conventions and explicit artifact requirements. An explicitly chosen persona overrides the default warm, lively, opinionated voice.

## Where the capabilities live

| Capability | Main prompt | Subagent prompt |
| --- | --- | --- |
| Full purpose, current stage, complete outcome, and few material questions | “Understand the purpose and the current assignment” | “Keep the assignment intact” |
| Decisive judgment and taste in engineering, writing, visuals, and games | Opening; “Make taste visible in the work” | Opening; “Make a clear quality judgment” |
| Continuous execution, reuse, diagnosis, and necessary adjacent repairs | “Take the shortest complete route” | “Reuse sound work and finish the implementation” |
| Existing entry points, data meaning, and conditions of use | “Take the shortest complete route” | “Reuse sound work and finish the implementation” |
| Direct work or delegation, one active owner, and actual scope limits | “Collaborate around real dependencies” | “Keep the assignment intact” |
| Synthesis before routing, stable handoffs, and early messages only for action-changing conflicts | “Collaborate around real dependencies” | “Hand back a result the parent can use” |
| Falsifiable questions, strong fair baselines, quantitative reasoning, counterevidence, and research continuation | “When the task involves research” | “When the task involves research” |
| Consequence-based verification, evidence reuse, recovery, and the ban on nonessential hashing | “Verify what determines acceptance” | “Verify the risks that determine delivery” |
| Reader First selection, whole-sentence deletion, useful explanations, and integrated revision | “Write for the reader's next action” | “Hand back a result the parent can use”; “Write for the recipient's next action” |
| Actual permission, source identity, credentials, task continuity, and appropriate memory | “Respect authority, sources, and continuity” | “Preserve authority and continuity” |

## Why the rules are grouped this way

**Purpose comes before execution.** The prompts distinguish discussing, assessing, gathering evidence, and implementing at the point where the agent interprets the assignment. Ordinary judgment is autonomous within the authorized stage. A follow-up question refines ongoing work rather than silently ending it.

**Taste is a delivery standard.** It covers choosing a worthwhile direction, economical abstractions, deliberate visual hierarchy, readable copy, and inspecting the actual result. It remains a substantive quality obligation rather than an upbeat tone or a prescribed visual theme.

**Compatibility belongs with implementation.** Preserving an old call means preserving its entry point, data meaning, and conditions of use. New prerequisites belong only to the new capability. Keeping these together prevents a new feature from quietly narrowing established usage.

**Research is conditional, not diminished.** Its own section keeps routine development from acquiring a mandatory research process. Both complete prompts retain falsifiable claims, fair baselines, traceable quantities and assumptions, original-source checks, and faithful positive and negative evidence. The main prompt also retains topic selection and cross-line synthesis. Counterevidence updates the topic, mechanism, configuration, or contribution it actually affects; a failed configuration need not end a worthwhile research goal. The subagent follows that reasoning within the parent's topic and authorization.

**Collaboration centers on ownership and decisions.** The main agent may work directly or delegate. The collaboration sections distinguish receiving a result, adopting it, delivering it, and its actual consumption. The exhibition-loan example makes recipient-specific routing concrete: a framing dimensions request and a curator's installation conclusion are different messages. The subagent has the same obligation to judge and finish local work, without inheriting the parent's coordination powers.

**Reader First is selection before phrasing.** The prompts ask whether a sentence answers the reader's present question before asking how to polish it. Useless material is deleted, not restyled or moved to small print. The matrix-multiplication example retains the cost explanation and removes an endorsement of the paper's wording. The BLEU example keeps the observed result and the authors' interpretation together. These examples distinguish useful explanation from defensive repetition without weakening supported claims.

**Verification follows the affected action.** Necessary behavioral, visual, and scientific evidence remains required. Reassurance reruns, unrelated review chains, and nonessential hashes are explicitly rejected. Recovery and permission conditions appear before the action they constrain, not as new blockers for independent ready work.

## Codex integration decisions

The sources refer to the current Codex tools, schemas, role restrictions, and event behavior rather than naming tools from another host. They do not assume a message wakes or interrupts a recipient, grants approval, or proves consumption. Notification-driven continuation applies when the runtime guarantees completion notifications; waiting follows the supported tool contract and a real dependency. A child resolves its promised dependencies before its final result.

Selecting [optional hooks](install.md#add-optional-per-turn-steering) assembles the single author sources into a local marketplace and installs `gpt-with-taste@gpt-with-taste-local` through the normal Codex plugin CLI. The plugin configures three source-specific routes:

- `UserPromptSubmit`: `user-steer.md` addresses the current main session; a subagent event carrying `agent_id` selects `sub-steer.md` instead.
- `SubagentStart`: `sub-steer.md` is developer context for the new delegated agent, alongside its actual role and task.
- `PostToolUse` with exact matcher `^wait_agent$`: `agent-steer.md` addresses main only when the result's `status` contains a completed agent receipt. The original receipt stays intact. A spawn id, incomplete/time-out wait, shell/MCP result or child-session tool result does not select this source.

`SubagentStop` controls continuation inside the delegated agent; it is not a channel for delivering a reminder to main. The Hook does not replace roles, rewrite a dispatch message, or claim that an automatic completion notification is a `PostToolUse` event. Parent follow-ups are covered only when the host emits a subagent-identified `UserPromptSubmit`; no `send_input` argument rewrite is installed. The complete `sub.md` remains available for roles the user chooses.

The plugin's three definitions are installed and discoverable, but none delivered reminders in the tested Codex `0.162.0-alpha.17.2` `exec resume` workflow. For that entry point, rely on the complete main prompt rather than optional per-turn reminders. `--check` verifies installation, not runtime dispatch.

The delegated role's developer instructions were delivered, while its Sub instruction-file setting did not replace inherited Main base instructions. Complete Sub is a source for a chosen role's instruction composition, not an automatically installed child base. Follow [role setup](install.md#use-the-complete-subagent-prompt-for-a-selected-role), preserving the role's own contract and the runtime's actual permission boundaries.
