import {markdown, TEXT_KEYS} from '../../src/build.mjs';

const quote = value => JSON.stringify(value);
function recipe(meta, {id, name, version, main, sub, independent, userSteer, subSteer, agentSteer}) {
  return `schema_version = 1
id = ${quote(id)}
name = ${quote(name)}
version = ${quote(version)}
description = ${quote(meta.description)}

[prompts]
system = { file = ${quote(sub)} }
steering = { file = ${quote(subSteer)} }
steering_on_turn = true
steering_on_input = true
steering_interval_steps = 0

[prompts.steering_sources.agent]
mode = "inherit"

[prompts.main]
system = { file = ${quote(main)} }
steering = { file = ${quote(userSteer)} }
steering_on_turn = true
steering_on_input = true
steering_interval_steps = 0

[prompts.main.steering_sources.agent]
mode = "custom"
custom = { steering = { file = ${quote(agentSteer)} }, steering_on_turn = true, steering_on_input = true, steering_interval_steps = 0 }

[prompts.main.steering_sources.task]
mode = "custom"
custom = { steering = { file = ${quote(agentSteer)} }, steering_on_turn = true, steering_on_input = true, steering_interval_steps = 0 }

[prompts.independent]
system = { file = ${quote(independent)} }
steering = "off"
steering_on_turn = false
steering_on_input = false
steering_interval_steps = 0

[prompts.independent.steering_sources.agent]
mode = "off"

[prompts.independent.steering_sources.task]
mode = "off"
`;
}

export async function render({meta, texts}) {
  const files = new Map(TEXT_KEYS.map(key => [meta.texts[key], markdown(meta, texts, 'kiki', key)]));
  files.set('recipe.toml', recipe(meta, {id: meta.id, name: meta.name, version: meta.version, ...meta.texts}));

  const legacy = meta.compatibility.kiki;
  const common = {sub: 'sol-astra-sub.md', userSteer: 'sol-astra-main-steering.md',
    subSteer: 'sol-astra-sub-steering.md', agentSteer: 'sol-astra-main-agent-steering.md'};
  for (const [key, file] of Object.entries(common))
    files.set(`sol-astra/${file}`, markdown(meta, texts, 'kiki', key));
  const models = {};
  for (const pack of legacy.packages) {
    for (const key of ['main', 'independent'])
      files.set(`sol-astra/${pack[key]}`, markdown(meta, texts, 'kiki', key));
    files.set(`sol-astra/${pack.file}`, recipe(meta, {...pack, ...common, version: legacy.version}));
    for (const alias of pack.aliases) models[alias] = pack.file;
  }
  files.set('sol-astra/mapping.json', JSON.stringify({schema: 1, models}, null, 2) + '\n');
  return files;
}
