# Kiki

Import the generated Recipe and apply it to the GPT models you use. Kiki selects Main, Sub, or Independent from the actual binding position and refreshes the corresponding Steer near incoming messages. You can keep using the default Kiki profile.

## Import and apply

From this checkout:

```sh
node scripts/build.mjs --target kiki
```

In Kiki, open **Settings → Models & agents → Model catalog & defaults**, edit your model, and choose **Choose a Recipe → Import**. Enter the absolute path to:

```text
gpt-with-taste/dist/kiki/recipe.toml
```

Preview the package, then choose **Install and apply**. The package contains prompt text and cadence only; it leaves model routing, credentials, tools, permissions, and request parameters to your existing configuration. Apply it to each intended GPT model rather than changing the global default model.

Start a new binding to use the accepted revision. For an existing idle session, **Rebuild context** reloads its prompt sources. Running conversations keep their saved Recipe revision until an explicit rebind or rebuild.

## Bind it to a profile instead

A profile can reference the generated package directly:

```yaml
recipe: /absolute/path/to/gpt-with-taste/dist/kiki/recipe.toml
```

Add that field to the profile's existing frontmatter, preserving its body and other fields. A relative path resolves from the profile file. Local references are read at bind time; they do not install a package or download a URL.

Choose either model-level or profile-level placement for this behavior package. For model-level placement, every native profile using that model receives the appropriate behavior without a special controller profile.

## Identity and incoming messages

| Binding | Standing behavior | Near-input reminder |
| --- | --- | --- |
| Main | Complete Main | User Steer for direct input; Agent Steer for agent messages and background task results |
| Sub | Complete Sub, alongside the selected role | Sub Steer for direct and parent-agent input |
| Independent | Role-neutral work principles | Off |

The `main` and `independent` tables select whole branches; they do not inherit Sub text from the common branch. Main's `agent` and `task` sources use the same result-consumption Steer. Sub's `agent` source inherits its scoped reminder. The interval is zero: normal tool steps do not add periodic reminders. A new user input or running **Send now** takes effect at the next safe step before the next model request.

Kiki continues to supply the selected role, explicit persona, environment, project instructions, memory, skills, plugins, and delegation notices. The Recipe does not recreate those layers.

## Existing Sol/Astra installations

`dist/kiki/sol-astra/` preserves the earlier Sol and Astra package IDs, version `1.0.7`, filenames, and four-alias map. Both packages are generated from the same English author sources as the other harnesses. Use this compatibility export when updating an existing installation that tracks those manifests.

The local Kiki operations repository can regenerate its managed export with:

```sh
node scripts/build-sol-astra.mjs --source /absolute/path/to/gpt-with-taste
node scripts/build-sol-astra.mjs --source /absolute/path/to/gpt-with-taste --check
```

Run those commands in that operations repository. Its existing scoped sync and Recipe preview/install entry retains the installed IDs and model mappings. Commit the intended generated Recipe files before publishing them through that sync entry.

## Check or remove

```sh
node scripts/build.mjs --target kiki --check
```

In Kiki's **Effective prompts**, inspect the binding position, accepted Recipe revision, and expanded prompt sources. For ordinary use, the latest actual-request view shows what reached the model; checking files sends no model request.

To detach a model Recipe, choose **Restore manual settings** in that model's editor. For a profile-only reference, remove its `recipe` field or set `recipe: off`. Each removes that layer; use a new binding or idle rebuild to adopt the change.

Kiki's installed documentation is the reference for your version: `customization/prompt-fields.md` covers Recipe format, inheritance, cadence, and binding; `guides/settings.md` covers the model editor; `customization/agents.md` covers profiles and rebuilding.
