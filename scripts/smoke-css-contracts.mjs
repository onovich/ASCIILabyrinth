export const sharedCssContract = {
  files: [
    'origin/shared/ui-system.css',
    'public/runtime/shared/ui-system.css'
  ],
  requiredSelectors: [
    '.al-panel',
    '.al-modal',
    '.al-hidden',
    '.al-mt-2',
    '.al-tool-page',
    '.al-tool-page :where(.app)',
    '.al-tool-page :where(.swatch)',
    '.al-tool-page :where(.palette-icon)',
    '.al-tool-page :where(.workspace)',
    '.al-tool-page :where(.canvas-shell, .preview-shell)',
    '.al-tool-page :where(.palette-item, .model-row, .part-row)'
  ]
};
