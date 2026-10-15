# Adapter provenance

Behavior is generated from recipe/ (gpt-with-taste 0.1.0). Runtime reads texts.json and its six generated Markdown files.

The OpenAI payload guard and request-local unanswered-input approach adapt [SpadeLushen/pi-gpt-with-taste](https://github.com/SpadeLushen/pi-gpt-with-taste/tree/07013409c19fe307d0a951ef5f2b3f72f4c837b3), MIT. THIRD_PARTY_LICENSE preserves its full license. The guard is compiled from the same source as the Pi adapter.

OMP-specific code uses 18.11.0 native ctx.agent.kind, before_agent_start system-block augmentation, task SingleResult exitCode/error/aborted, async-result jobs type/status, and tool_result.additionalContext. It does not replace the bundled instruction template or copy OMP's system prompt.
