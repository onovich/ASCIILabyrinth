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

  function escapeAttr(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[char]);
  }

  function normalizeHexColor(value, fallback = '#777777') {
    const color = String(value || '').trim();
    return /^#[0-9a-f]{3,8}$/i.test(color) ? color : fallback;
  }

  function formatMeter(value, max, { width = 12, filledChar = '\u2588', emptyChar = '\u2591' } = {}) {
    const safeWidth = Math.max(0, Math.floor(Number.isFinite(Number(width)) ? Number(width) : 12));
    const safeMax = Number(max);
    const ratio = safeMax > 0 ? Number(value) / safeMax : 0;
    const filled = clampNumber(Math.round(ratio * safeWidth), 0, safeWidth);
    return `${String(filledChar).repeat(filled)}${String(emptyChar).repeat(safeWidth - filled)}`;
  }

  function colorVarStyle(color, variable = '--al-swatch-color') {
    const safeVariable = /^--[a-z0-9-]+$/i.test(String(variable)) ? String(variable) : '--al-swatch-color';
    return `${safeVariable}:${normalizeHexColor(color)}`;
  }

  function swatchHtml(color, { className = 'swatch', title = '' } = {}) {
    const classes = String(className || 'swatch')
      .split(/\s+/)
      .filter(Boolean)
      .map((name) => name.replace(/[^a-z0-9_-]/gi, ''))
      .filter(Boolean)
      .join(' ') || 'swatch';
    const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
    return `<span class="${escapeAttr(classes)}" style="${colorVarStyle(color)}"${titleAttr}></span>`;
  }

  function downloadTextFile({ text = '', fileName = 'download.txt', mimeType = 'text/plain;charset=utf-8' } = {}) {
    const safeText = String(text ?? '');
    const safeName = String(fileName || 'download.txt');
    const safeType = String(mimeType || 'text/plain;charset=utf-8');
    const blob = new Blob([safeText], { type: safeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeName;
    const result = { fileName: safeName, mimeType: safeType, size: blob.size ?? safeText.length };
    try {
      link.click();
      return result;
    } finally {
      URL.revokeObjectURL(url);
    }
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

  function setElementVisible(target, visible, display = 'block') {
    const element = resolveElement(target);
    if (!element) return null;
    element.style.display = visible ? display : 'none';
    element.setAttribute('aria-hidden', visible ? 'false' : 'true');
    return element;
  }

  function isElementVisible(target) {
    const element = resolveElement(target);
    if (!element) return false;
    if (element.style?.display === 'none') return false;
    if (typeof window.getComputedStyle === 'function') {
      return window.getComputedStyle(element).display !== 'none';
    }
    return element.style?.display !== 'none';
  }

  function getElementState(target, classNames = []) {
    const element = resolveElement(target);
    if (!element) return { exists: false };
    const classes = {};
    (Array.isArray(classNames) ? classNames : []).forEach((name) => {
      classes[name] = element.classList?.contains(name) === true;
    });
    return { exists: true, classes, display: element.style?.display || '', visible: isElementVisible(element) };
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
    colorVarStyle,
    swatchHtml,
    downloadTextFile,
    renderPanel,
    setPanelLines,
    setElementVisible,
    isElementVisible,
    getElementState,
    getPanelState
  });
})();
