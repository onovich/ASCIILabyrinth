import { assertSharedUiBindingBehavior } from './smoke-ui-binding-assertions.mjs';

export async function assertSharedUiBehavior(ui, elements, assert, assertNamedContract) {
  const { smokePanel } = assertSharedUiBindingBehavior(ui, elements, assert);
  const importInput = { files: [{ name: 'fixture.json', text: async () => '{"ok":true}' }], value: 'fixture.json' };
  let importedMessage = '';
  const importedFile = await ui.importTextFile({ target: importInput }, (text, message) => {
    importedMessage = `${message}:${text}`;
  });
  assert(importedFile.fileName === 'fixture.json' && importedMessage === 'fixture.json imported:{"ok":true}' && importInput.value === '', 'shared UI import helper should read text files and reset file inputs');
  ui.renderPanel('smoke-panel', {
    title: 'SMOKE',
    tone: 'cyan',
    lines: ['alpha', { text: 'beta', tone: 'amber' }]
  });
  assert(smokePanel.dataset.title === 'SMOKE' && smokePanel.dataset.tone === 'cyan', 'shared UI panel helper should set panel metadata');
  assert(ui.formatMeter(5, 10, { width: 4 }) === '\u2588\u2588\u2591\u2591', 'shared UI meter helper should format HUD bars');
  assert(ui.colorVarStyle('#aabbcc') === '--al-swatch-color:#aabbcc', 'shared UI color style helper should write swatch CSS variables');
  assert(ui.swatchHtml('bad color') === '<span class="swatch" style="--al-swatch-color:#777777"></span>', 'shared UI swatch helper should repair unsafe colors');
  const downloaded = ui.downloadTextFile({ text: 'abc', fileName: 'smoke.json', mimeType: 'application/json' });
  assert(downloaded.fileName === 'smoke.json' && downloaded.size === 3, 'shared UI download helper should create named text downloads');
  const uiContract = ui.getContractState(['formatMeter', 'downloadTextFile', 'missingHelper']);
  assert(uiContract.formatMeter && uiContract.downloadTextFile && uiContract.missingHelper === false, 'shared UI contract helper should report available functions');
  assert(ui.getContractState('runtime').renderPanel && ui.getContractState('editor').colorVarStyle && ui.getContractState('modelEditor').swatchHtml, 'shared UI contract helper should support named page specs');
  assertNamedContract(ui.getContractState('runtime'), 'runtime UI named contract should be complete');
  assertNamedContract(ui.getContractState('editor'), 'editor UI named contract should be complete');
  assertNamedContract(ui.getContractState('modelEditor'), 'model editor UI named contract should be complete');
  assert(ui.UI_CONTRACT_SPECS?.runtime?.includes('renderPanel'), 'shared UI should expose named contract specs');
  assert(ui.getElementState('smoke-panel', ['al-panel']).classes['al-panel'] === true, 'shared UI element state should report requested classes');
  assert(ui.getPanelState('smoke-panel').isPanel && ui.getPanelState('smoke-panel').lineCount === 2, 'shared UI panel state should report rendered design-system panels');
  assert(ui.setElementVisible('smoke-panel', false)?.style.display === 'none', 'shared UI visibility helper should hide elements');
  assert(ui.isElementVisible('smoke-panel') === false, 'shared UI visibility helper should report hidden elements');
  assert(ui.setElementVisible('smoke-panel', true)?.style.display === 'block', 'shared UI visibility helper should show elements');
  assert(ui.isElementVisible('smoke-panel') === true, 'shared UI visibility helper should report shown elements');
}
