import {
  loadSharedData,
  loadSharedUi
} from './smoke-environment.mjs';
import {
  assertRuntimeConversions,
  assertSharedSchemaBehavior
} from './smoke-schema-assertions.mjs';
import { assertRuntimeMouseLookBehavior } from './smoke-runtime-mouse-look-assertions.mjs';
import { assertSmokeSourceContracts } from './smoke-source-assertions.mjs';
import { assertSharedUiBehavior } from './smoke-ui-assertions.mjs';

await import('./sync-runtime.mjs');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertNamedContract(contract, message) {
  const values = Object.values(contract || {});
  assert(values.length > 0 && values.every(Boolean), message);
}

async function main() {
  const schema = await loadSharedData();
  const { ui, elements } = await loadSharedUi();
  await assertSharedUiBehavior(ui, elements, assert, assertNamedContract);
  assertSharedSchemaBehavior(schema, assert, assertNamedContract);
  assertRuntimeConversions(schema, assert);
  await assertRuntimeMouseLookBehavior(assert);

  await assertSmokeSourceContracts(assert);

  console.log('smoke ok: shared schema, runtime conversion, model conversion, shared UI CSS, runtime/tool shared UI, synced assets');
}

await main();
