import { createDomElement } from './smoke-environment.mjs';

export async function assertSharedUiBehavior(ui, elements, assert, assertNamedContract) {
  const smokePanel = createDomElement('div');
  smokePanel.className = 'al-hud al-panel';
  elements.set('smoke-panel', smokePanel);
  const smokeSecondary = createDomElement('div');
  elements.set('smoke-secondary', smokeSecondary);
  const smokeInput = createDomElement('input');
  const boundElements = ui.bindElements(['smoke-panel', 'smoke-secondary']);
  const namedBoundElements = ui.bindElements({ panel: 'smoke-panel' });
  assert(boundElements['smoke-panel'] === smokePanel && boundElements['smoke-secondary'] === smokeSecondary && namedBoundElements.panel === smokePanel, 'shared UI element binder should resolve arrays and named id maps');
  const clickBindings = ui.bindClickHandlers({ smokePanel }, { smokePanel: () => {} });
  assert(clickBindings.smokePanel === true && smokePanel.listeners.click.length === 1, 'shared UI click binder should attach named click handlers');
  let directChangeCount = 0;
  const directChangeBindings = ui.bindChangeHandlers({ smokeInput }, { smokeInput: () => { directChangeCount += 1; } });
  smokeInput.listeners.change.at(-1)({});
  assert(directChangeBindings.smokeInput === true && directChangeCount === 1, 'shared UI change binder should attach named change handlers');
  let delegatedClickTarget = null;
  const delegatedClickMatch = {};
  const delegatedClickBindings = ui.bindDelegatedClickHandlers({ smokePanel }, { smokePanel: ['[data-click-smoke]', (target) => (delegatedClickTarget = target)] });
  smokePanel.listeners.click.at(-1)({ target: { closest: (selector) => (selector === '[data-click-smoke]' ? delegatedClickMatch : null) } });
  assert(delegatedClickBindings.smokePanel === true && delegatedClickTarget === delegatedClickMatch, 'shared UI delegated click binder should pass closest matches to handlers');
  let delegatedTarget = null;
  const changeBindings = ui.bindDelegatedChangeHandlers({ smokePanel }, { smokePanel: ['[data-smoke]', (target) => (delegatedTarget = target)] });
  const delegatedInput = { matches: (selector) => selector === '[data-smoke]' };
  smokePanel.listeners.change.at(-1)({ target: delegatedInput });
  assert(changeBindings.smokePanel === true && delegatedTarget === delegatedInput, 'shared UI delegated change binder should pass matching targets to handlers');
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
