# Use GPT with Taste in another harness

Start with the complete behavior for the agent you are running. Add event-driven Steer when the harness exposes the right consumer and timing.

The portable generated files live in `dist/codex/`:

```text
main.md
sub.md
independent.md
user-steer.md
sub-steer.md
agent-steer.md
```

These are English instructions. Their language rule follows the user's latest message; it does not force English conversation.

## Place the standing behavior

Use the harness's documented system-instruction or recipe entry. Append the complete `main.md` behavior when replacing its system prompt would remove built-in tools or environment instructions. Keep its existing project rules, skills, memory, and explicit persona in their own native layers.

For a delegated agent, combine `sub.md` with that role's existing instructions. Preserve its tool access, leaf status, write area, and task. For an independent host invocation without a parent, use `independent.md`. Give each agent one standing behavior source.

If the harness only supports an instruction file such as `AGENTS.md`, integrate the chosen behavior into the existing file's applicable section. Keep repository-specific rules in place. For maintainers supporting repeated installations, add a compiler adapter rather than maintaining a manually copied fork of these files.

## Connect the reminders

Map native events by their **consumer**, not by their names:

| Incoming input | Consumer | Reminder |
| --- | --- | --- |
| A direct user message | Main | `user-steer.md` |
| A task or follow-up sent to a child | That child | `sub-steer.md` |
| A collaborator message or result | Main | `agent-steer.md` |
| An agent message received within delegated work | That child | `sub-steer.md` |

Place the reminder in the harness's supported instruction-context channel after the relevant input and before the next model request. Keep the actual input or tool result intact. A paired child-start and initial-input event should produce one initial reminder; a later input should receive its own reminder.

Use the native result status for a receipt-specific trigger. Background launch handles, timeouts, and errors have their own statuses. A notification that wakes Main is input to consume, not evidence that every child completed.

When no source identity is available, expose an explicit Main/Sub selection for the integration instead of guessing from message text. When no per-input event is available, the complete standing prompt remains the entry point; use the harness's own supported extension API to add reminders.

## Check the receiving context

Build the files and run the harness's prompt inspection, plugin validation, or extension consumer fixture. Confirm the standing text appears once, the role matches, the reminder reaches its intended agent, and ordinary tool continuation does not keep accumulating reminders. Inspect the actual receiving request when using the adapter in a natural task.

Keep an original configuration reference and a precise removal step before changing a persistent instruction setting. Session-local loading is often the simplest first installation: stop passing the added file or extension when starting a new session to remove it.

[Add a maintained compiler target](../authoring.md#add-a-harness) when this route becomes a regular part of your workflow.
