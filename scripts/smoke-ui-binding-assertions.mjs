import { createDomElement } from './smoke-environment.mjs';

export function assertSharedUiBindingBehavior(ui, elements, assert) {
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
  return { smokePanel };
}
