import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  runtimeSharedUiContract,
  sharedCssContract,
  toolPageSharedUiContracts
} from './smoke-contracts.mjs';
import {
  loadSharedData,
  loadSharedUi
} from './smoke-environment.mjs';
import {
  assertRuntimeConversions,
  assertSharedSchemaBehavior
} from './smoke-schema-assertions.mjs';
import { assertSharedUiBehavior } from './smoke-ui-assertions.mjs';

await import('./sync-runtime.mjs');

const projectRoot = resolve(import.meta.dirname, '..');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertNamedContract(contract, message) {
  const values = Object.values(contract || {});
  assert(values.length > 0 && values.every(Boolean), message);
}

async function assertSyncedFiles() {
  const files = [
    'public/runtime/index.html',
    'public/editor/index.html',
    'public/model-editor/index.html',
    'public/shared/game-schema.js',
    'public/runtime/shared/game-schema.js',
    'public/runtime/shared/ui-system.js',
    'public/runtime/shared/ui-system.css'
  ];

  for (const file of files) {
    const info = await stat(resolve(projectRoot, file));
    assert(info.size > 0, `${file} should be synced and non-empty`);
  }
}

async function assertTextContract(files, { required = [], forbidden = [], requiredLabel, forbiddenLabel }) {
  for (const file of files) {
    const source = await readFile(resolve(projectRoot, file), 'utf8');
    for (const fragment of required) {
      assert(source.includes(fragment), `${file} ${requiredLabel}: ${fragment}`);
    }
    for (const fragment of forbidden) {
      assert(!source.includes(fragment), `${file} ${forbiddenLabel}: ${fragment}`);
    }
  }
}

async function assertSharedCssContract() {
  await assertTextContract(sharedCssContract.files, {
    required: sharedCssContract.requiredSelectors,
    requiredLabel: 'should include shared UI selector'
  });
}

async function assertRuntimeSharedUiContract() {
  await assertTextContract(runtimeSharedUiContract.files, {
    required: runtimeSharedUiContract.required,
    forbidden: runtimeSharedUiContract.forbidden,
    requiredLabel: 'should call shared runtime UI helper',
    forbiddenLabel: 'should not keep runtime UI fallback'
  });
}

async function assertToolPageSharedUiContract() {
  for (const contract of toolPageSharedUiContracts) {
    await assertTextContract(contract.files, {
      required: contract.required,
      forbidden: contract.forbidden,
      requiredLabel: 'should call shared tool UI helper',
      forbiddenLabel: 'should not keep tool UI fallback'
    });
  }
}

async function main() {
  const schema = await loadSharedData();
  const { ui, elements } = await loadSharedUi();
  await assertSharedUiBehavior(ui, elements, assert, assertNamedContract);
  assertSharedSchemaBehavior(schema, assert, assertNamedContract);
  assertRuntimeConversions(schema, assert);

  await assertSyncedFiles();
  await assertSharedCssContract();
  await assertRuntimeSharedUiContract();
  await assertToolPageSharedUiContract();

  console.log('smoke ok: shared schema, runtime conversion, model conversion, shared UI CSS, runtime/tool shared UI, synced assets');
}

await main();
