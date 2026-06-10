import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  runtimeSharedUiContracts,
  sharedCssContract,
  toolPageSharedUiContracts
} from './smoke-contracts.mjs';

const projectRoot = resolve(import.meta.dirname, '..');

async function assertSyncedFiles(assert) {
  const files = [
    'public/runtime/index.html',
    'public/runtime/runtime/audio.js',
    'public/runtime/runtime/debug-snapshot.js',
    'public/runtime/runtime/effects.js',
    'public/runtime/runtime/enemy-models.js',
    'public/runtime/runtime/enemy-profiles.js',
    'public/runtime/runtime/hud.js',
    'public/runtime/runtime/level-source.js',
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

async function assertTextContract(files, { required = [], forbidden = [], requiredLabel, forbiddenLabel }, assert) {
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

async function assertSharedCssContract(assert) {
  await assertTextContract(sharedCssContract.files, {
    required: sharedCssContract.requiredSelectors,
    requiredLabel: 'should include shared UI selector'
  }, assert);
}

async function assertRuntimeSharedUiContract(assert) {
  for (const contract of runtimeSharedUiContracts) {
    await assertTextContract(contract.files, {
      required: contract.required,
      forbidden: contract.forbidden,
      requiredLabel: 'should call shared runtime UI helper',
      forbiddenLabel: 'should not keep runtime UI fallback'
    }, assert);
  }
}

async function assertToolPageSharedUiContract(assert) {
  for (const contract of toolPageSharedUiContracts) {
    await assertTextContract(contract.files, {
      required: contract.required,
      forbidden: contract.forbidden,
      requiredLabel: 'should call shared tool UI helper',
      forbiddenLabel: 'should not keep tool UI fallback'
    }, assert);
  }
}

export async function assertSmokeSourceContracts(assert) {
  await assertSyncedFiles(assert);
  await assertSharedCssContract(assert);
  await assertRuntimeSharedUiContract(assert);
  await assertToolPageSharedUiContract(assert);
}
