# Cases

These cases keep the request, run conditions, source material, and outputs together.

## clsx onboarding · a Chinese getting-started guide

A general documentation task: the same open-source project and the same request — a getting-started guide written for a colleague new to the project.

The archived material includes the same request, a byte-exact `clsx` 2.1.1 source snapshot, both generated guides, and the complete assistant messages from both runs:

- [Task, run conditions, and source map](cases/clsx-onboarding/input.md)
- [Builtin guide](cases/clsx-onboarding/builtin.md) · [Taste guide](cases/clsx-onboarding/taste.md)
- [Builtin assistant messages](cases/clsx-onboarding/runs/2026-10-13-native-sol-high/builtin-assistant.md) · [Taste assistant messages](cases/clsx-onboarding/runs/2026-10-13-native-sol-high/taste-assistant.md)

Both runs used GPT-6.1 Sol at high reasoning effort in native Codex 0.162.0-alpha.17.2, with the same input, source files, local instructions, and skills. The baseline source is the Codex model-catalog Sol instruction with the legacy `{{ personality }}` placeholder removed; the Taste source is the frozen `prompts/main.md`, run Main-only. Hooks were configured on the Taste side but produced zero Steer messages.

The visible difference is a teaching choice. The builtin guide opens with an environment check and a separate Node verification command with expected output and failure handling; the Taste guide runs the first example in the project's existing setup and asks the reader to flip `isActive` and watch the output change. The builtin guide also keeps a troubleshooting table; the Taste guide folds the most common recovery into the `clsx/lite` section. Both guides state their real boundary — clsx does not deduplicate class names or resolve CSS conflicts — and both closing replies state plainly what was not run.

Excerpts with highlights: [comparison page](../site/index.html).

## Button class overrides

Two fresh native Codex 0.162.0-alpha.17.2 sessions received the same [request and starting document](cases/button-overrides/input.md). Both ran GPT-6.1 Sol at high reasoning effort with Hooks disabled. The baseline used the original Codex model-catalog Sol instructions exported by `codex debug models` (not a user override), with the legacy literal `{{ personality }}` placeholder removed. The Taste side used `prompts/main.md` from commit `1499070`. Both retained the same local AGENTS instructions and skills; the user's custom instruction file was excluded from the baseline.

- [Complete builtin output](cases/button-overrides/builtin.md)
- [Complete GPT with Taste output](cases/button-overrides/taste.md)

The task was to update a component guide so callers could safely override Tailwind utility classes. Both outputs use `clsx` with `tailwind-merge` and keep the caller's `className` last. The useful difference is instructional: the builtin output explains the mechanism first, while Taste leads with the helper and adds runnable examples for modifier-scoped overrides. Both retain the caveat about custom utilities.
