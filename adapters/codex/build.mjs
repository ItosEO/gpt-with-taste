import {markdown, TEXT_KEYS} from '../../src/build.mjs';

export async function render({meta, texts}) {
  return new Map(TEXT_KEYS.map(key => [meta.texts[key], markdown(meta, texts, 'codex', key)]));
}
