# Cases

These cases keep the request, run conditions, source material, and outputs together. A comparison is **verified** only when the original input and complete assistant output are archived; a candidate that lacks either is labeled **draft / unverified**.

<a id="featured-case"></a>

## Featured case · clsx onboarding

**Status: draft / unverified.** This is the preferred case because it is a general documentation task: the same open-source project and request, written for a new user. It is not yet evidence of a complete builtin-vs-Taste model comparison.

The archived material includes the same request, a byte-exact `clsx` 2.1.1 source snapshot, and two generated guide artifacts:

- [Task, run conditions, and source map](cases/clsx-onboarding/input.md)
- [Builtin candidate guide](cases/clsx-onboarding/builtin.md)
- [Taste candidate guide](cases/clsx-onboarding/taste.md)
- [Archived reply notes](cases/clsx-onboarding/builtin-reply.md) · [Taste reply notes](cases/clsx-onboarding/taste-reply.md)

Both runs are described as GPT-6.1 Sol at high reasoning effort in native Codex 0.162.0-alpha.17.2, with the same input, source files, local instructions, and skills. The baseline source is the Codex model-catalog Sol instruction with the legacy `{{ personality }}` placeholder removed; the Taste source is the frozen `prompts/main.md`. Hooks were configured but produced zero Steer messages.

The missing evidence is specific: the original full assistant messages are not archived. The two Markdown files are candidate document artifacts, not proof of complete model responses. The [static comparison page](../site/index.html) therefore shows this case as a draft and does not call its excerpts verified or verbatim model output.

<a id="verified-evidence"></a>

## Verified evidence · Button class overrides

**Status: verified comparison.** This earlier case remains the current evidence while the featured documentation case is completed.

Two fresh native Codex 0.162.0-alpha.17.2 sessions received the same [request and starting document](cases/button-overrides/input.md). Both ran GPT-6.1 Sol at high reasoning effort with Hooks disabled. The baseline used the original Codex model-catalog Sol instructions exported by `codex debug models` (not a user override), with the legacy literal `{{ personality }}` placeholder removed. The Taste side used `prompts/main.md` from commit `1499070`. Both retained the same local AGENTS instructions and skills; the user's custom instruction file was excluded from the baseline.

- [Complete builtin output](cases/button-overrides/builtin.md)
- [Complete GPT with Taste output](cases/button-overrides/taste.md)
- [Static excerpt with highlights](../site/index.html#verified-evidence)

The task was to update a component guide so callers could safely override Tailwind utility classes. Both outputs use `clsx` with `tailwind-merge` and keep the caller's `className` last. The useful difference is instructional: the builtin output explains the mechanism first, while Taste leads with the helper and adds runnable examples for modifier-scoped overrides. Both retain the caveat about custom utilities.

This case is evidence about the writing decision visible in those complete documents, not a performance score or a claim that one answer is universally better.
