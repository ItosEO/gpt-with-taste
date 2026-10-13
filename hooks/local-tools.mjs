// The local function contract carries a namespace and a function name.
// App hooks flatten that pair; retain the bare name for the original entry.
const wait = {namespace: 'multi_agent_v1', name: 'wait_agent'};
const forms = [wait.name, `${wait.namespace}.${wait.name}`, `${wait.namespace}${wait.name}`];
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const WAIT_TOOL_MATCHER = `^(?:${forms.map(escapeRegex).join('|')})$`;
export function normalizeLocalTool(name) {
  return forms.includes(name) ? wait.name : null;
}
