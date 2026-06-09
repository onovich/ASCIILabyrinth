(() => {
  function resolveElement(target) {
    if (typeof target === 'string') return document.getElementById(target);
    return target;
  }

  function normalizeLine(line) {
    if (line && typeof line === 'object') {
      return {
        text: String(line.text ?? ''),
        tone: line.tone || ''
      };
    }
    return { text: String(line ?? ''), tone: '' };
  }

  function clampNumber(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.max(min, Math.min(max, number));
  }

  function formatMeter(value, max, { width = 12, filledChar = '\u2588', emptyChar = '\u2591' } = {}) {
    const safeWidth = Math.max(0, Math.floor(Number.isFinite(Number(width)) ? Number(width) : 12));
    const safeMax = Number(max);
    const ratio = safeMax > 0 ? Number(value) / safeMax : 0;
    const filled = clampNumber(Math.round(ratio * safeWidth), 0, safeWidth);
    return `${String(filledChar).repeat(filled)}${String(emptyChar).repeat(safeWidth - filled)}`;
  }

  function renderPanel(target, { title = '', lines = [], tone = '' } = {}) {
    const panel = resolveElement(target);
    if (!panel) return null;

    panel.dataset.title = title;
    if (tone) panel.dataset.tone = tone;
    else panel.removeAttribute('data-tone');
    panel.replaceChildren();

    const container = document.createElement('div');
    container.className = 'al-panel-lines';
    lines.map(normalizeLine).forEach((line) => {
      const entry = document.createElement('div');
      entry.className = 'al-panel-line';
      if (line.tone) entry.dataset.tone = line.tone;
      entry.textContent = line.text;
      container.appendChild(entry);
    });

    panel.appendChild(container);
    return panel;
  }

  function setPanelLines(target, lines) {
    const panel = resolveElement(target);
    if (!panel) return null;
    return renderPanel(panel, {
      title: panel.dataset.title || '',
      tone: panel.dataset.tone || '',
      lines
    });
  }

  function getElementState(target, classNames = []) {
    const element = resolveElement(target);
    if (!element) return { exists: false };
    const classes = {};
    (Array.isArray(classNames) ? classNames : []).forEach((name) => {
      classes[name] = element.classList?.contains(name) === true;
    });
    return { exists: true, classes };
  }

  function getPanelState(target) {
    const panel = resolveElement(target);
    if (!panel) return { exists: false };
    return {
      exists: true,
      title: panel.dataset.title || '',
      tone: panel.dataset.tone || '',
      isPanel: panel.classList?.contains('al-panel') === true,
      lineCount: panel.querySelectorAll?.('.al-panel-line')?.length || 0
    };
  }

  window.ASCIIUI = Object.freeze({
    formatMeter,
    renderPanel,
    setPanelLines,
    getElementState,
    getPanelState
  });
})();
