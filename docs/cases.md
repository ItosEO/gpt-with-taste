# Real tasks that shaped the prompt

A useful case makes a decision visible. These are development examples from ordinary tasks, with the resulting prompt changes explained beside them. The Map request is translated from Chinese; the Codex comparison uses its original English request. Code and diagnostics are preserved.

## Add a feature without charging old users a new prerequisite

We asked GPT-6.1 Sol to extend a local copy of [`lukeed/clsx`](https://github.com/lukeed/clsx) 2.1.1:

> We sometimes store class-name conditions in a `Map<string, boolean>`. Let us pass it directly to clsx, like an object selecting the true keys. Add the types and README too. Keep the existing usage.

The first implementation supported Maps and passed the runtime tests. Its declarations also added this dependency:

```ts
type ClassMap = Map<string, any>;
```

Old projects that only passed strings, objects, and arrays now failed under their existing ES5 TypeScript configuration: `Cannot find name 'Map'`. The feature worked, but its prerequisite leaked into the old API.

A short follow-up led Sol to replace the global `Map` reference with a structural interface. We then refined the prompt's existing compatibility paragraph:

> Preserve the original entry points, data meaning, and usage conditions. Prerequisites for a new capability apply to the new usage; existing callers continue under their original contract.

We returned to the untouched original source and sent only the original request. With that revision, Sol chose a structural `ClassMap` in its first implementation:

```ts
interface ClassMap {
  readonly size: number;
  forEach(callbackfn: (value: any, key: string) => void): void;
}
```

It also guarded runtime Map access so old environments could still use the original inputs. The same ES5 call that exposed the first regression compiled with the new declaration; native Map input remained supported.

**What this taught us:** “Preserve existing behavior” should include the conditions under which users already use it. More checks are useful only when they inspect that actual contract.

## Same Sol, same task: built-in instructions vs. GPT with Taste

Two fresh native Codex 0.162.0-alpha.17.2 sessions received the same [starting document and request](cases/button-overrides/input.md):

> Please inspect BUTTON_GUIDE.md and update it so callers can safely override Tailwind utility classes without conflicts, showing the recommended helper and usage pattern.

Both ran GPT-6.1 Sol at high reasoning effort, with Hooks disabled. The baseline used the Sol instructions exported by `codex debug models`, with the legacy literal `{{ personality }}` placeholder removed; our side used `prompts/main.md` from commit `1499070`. Both retained the same local AGENTS instructions and skills. The user's custom instruction file was excluded from the baseline.

Read the complete generated documents: [Codex built-in instructions](cases/button-overrides/builtin.md) · [GPT with Taste](cases/button-overrides/taste.md).

Both chose `tailwind-merge` with `clsx`, put the caller's `className` last, and explained why concatenating classes alone fails. The useful differences are in how the guide teaches that choice:

| Detail | Built-in instructions | GPT with Taste |
| --- | --- | --- |
| Opening | Introduces the two helpers, then explains CSS precedence. | Gives the helper and caller-last rule first, then explains CSS precedence. |
| Component example | Keeps the original untyped parameters. | Adds a small `ButtonProps` definition. |
| Modifier behavior | Explains a hover override in prose. | Shows hover replacement and responsive coexistence as two executable examples. |
| Custom utilities | Places setup guidance before the helper. | Places setup guidance after modifier examples. |

The built-in answer is already useful and shorter. We keep Taste's action-first opening and concrete modifier examples; they make the technique easier to apply. The extra props type is useful for a TypeScript guide, while a narrower class-merging example can omit it.

A remaining habit appears in both closing replies. Taste adds “`.codex/` remains untouched”; the built-in answer adds “working tree is clean.” Those status lines answer no question in this documentation request. The next refinement is to finish with the usable result and its relevant checks, leaving routine preservation reports in the work record.

**What this taught us:** inspect the actual passage rather than awarding a blanket win. Keep the explanation and examples that help the reader; remove the extra bookkeeping that does not.

## Keep the explanation, remove the self-defense

In a multi-head attention article, Sol explained that the main matrix-multiplication budget can remain similar as head count rises, while softmax work and explicitly stored attention matrices grow. Those mechanisms help a reader reason about implementation cost.

It then added a sentence backing its wording with the original paper's description of the costs as “similar.” That sentence supplied no new mechanism or decision.

Gemini and K3 both favored preserving the cost explanation and deleting the wording endorsement. We integrated that distinction into the prompt and Steer:

> Decide whether the information answers a concrete question for this reader before polishing its wording. Delete useless self-justification entirely; do not preserve it under a more positive phrase or move it into a footnote.

**What this taught us:** being less defensive is not the same as saying less about the subject. Keep useful mechanisms, evidence, and interpretations. Remove the sentences whose only job is to defend the author.

## Bring a case worth changing the prompt for

A helpful report includes the user's request, the necessary source material, the actual answer or change, and the decision that went wrong. One small excerpt with a clear consequence is often more useful than a long scorecard.

Good next cases include an unnecessary clarification, a forwarded receipt that gives its reader no useful action, a fix that changes an existing contract, or a page whose extra small print makes the main operation harder to see.
