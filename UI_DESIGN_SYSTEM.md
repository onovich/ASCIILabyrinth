# ASCII Labyrinth UI Design System

This project uses a small shared UI system for runtime HUD, editor tools, and future in-game panels.

## Goals

- Keep all UI visually consistent with the indoor terminal-horror theme.
- Avoid text-drawn window borders for mixed Chinese and English content.
- Make new UI cheap to add: use shared tokens, shared panel styles, and shared render helpers.
- Keep gameplay UI readable without covering the ASCII scene.

## Source Of Truth

- `origin/shared/ui-system.css`: shared design tokens and reusable classes.
- `origin/shared/ui-system.js`: small DOM helpers for panels, meters, element visibility, and snapshot state.
- `scripts/sync-runtime.mjs`: copies shared assets into `public/shared` and `public/runtime/shared`.

Runtime pages load shared assets from `./shared/`.
Editor pages load shared assets from `../shared/`.

## Tokens

Use shared tokens instead of ad hoc colors:

- Background: `--al-color-bg`, `--al-color-bg-deep`
- Surfaces: `--al-color-surface`, `--al-color-surface-strong`
- Lines: `--al-color-line`, `--al-color-line-soft`
- Text: `--al-color-text`, `--al-color-muted`
- Accents: `--al-color-green`, `--al-color-cyan`, `--al-color-amber`, `--al-color-danger`
- Fonts: `--al-font-ui`, `--al-font-mono`
- Spacing: `--al-space-1` through `--al-space-4`
- Radius: `--al-radius-xs`, `--al-radius-sm`, `--al-radius-md`

## Runtime HUD Panels

Use CSS borders and `ASCIIUI.renderPanel`; do not draw boxes with text characters.

```js
ASCIIUI.renderPanel('mission-layer', {
  title: 'MISSION / LINK',
  tone: 'cyan',
  lines: [
    gameState.objective,
    gameState.nearbyAction || 'WASD move | mouse look | LMB fire'
  ]
});
```

Required classes for runtime HUD panels:

```html
<div id="mission-layer" class="al-hud al-panel" data-title="MISSION / LINK"></div>
```

Use `data-tone` or the `tone` option for standard panel accents:

- Default/green: status and system health.
- `cyan`: mission, navigation, and interaction hints.
- `amber`: logs, warnings, collected information.
- `danger`: death, failure, damage, destructive actions.

## Tool UI

Level editor and model editor should use the shared CSS tokens when adding new controls.

Preferred local patterns:

- Panels use `.section` and `.section-title`, backed by shared colors.
- Tool-page aliases such as `--bg`, `--panel`, `--line`, and `--text` should resolve to `--al-*` tokens.
- Tool pages should put `.al-tool-page` on `<body>` so base form controls, buttons, labels, and focus states come from shared CSS.
- Shared tool-page primitives include `.section`, `.section-title`, `.stack`, `.grid-two`, `.grid-three`, `.pill`, `.empty`, `.statusbar`, and `.file-input`.
- Shared header primitives include `.app`, `.topbar`, `.brand`, `.mark`, and `.toolbar`; keep page-specific grid columns local.
- Shared shell primitives include `.workspace`, `.sidebar`, and `.inspector`; keep page-specific column and mobile row sizes local.
- Shared work-area primitives include `.canvas-shell`, `.preview-shell`, `.scene-strip`, `.preview-strip`, `.canvas-wrap`, and `.preview-wrap`; keep page-specific heights, padding, and canvas behavior local.
- Shared utility primitives include `.row`, `.palette`, `.model-list`, `.part-list`, `.swatch`, `.tiny`, and `.muted`; override with CSS variables for page-specific sizing.
- Shared utility classes include `.al-hidden` for static hidden DOM and `.al-mt-2` for standard small vertical offsets.
- Shared list-item primitives include `.palette-item`, `.model-row`, `.part-row`, and their compact title overflow rules; keep page-specific columns, padding, and active colors local.
- Use `ASCIIUI.bindElements([...])` for top-level page DOM bindings when keys match element IDs.
- Use `ASCIIUI.importTextFile(event, onText)` for hidden file-input text imports before page-specific JSON parsing.
- Use `ASCIIUI.swatchHtml(color)` and `--al-swatch-color` for palette/model color chips instead of hand-writing `style="background:..."`.
- Use `ASCII_LABYRINTH_DATA.createJsonDownloadPayload()` to prepare editor JSON export payloads.
- Use `ASCII_LABYRINTH_DATA.saveStorageJson()` / `readStorageText()` / `readStorageJson()` / `hasStorageText()` for editor local saves.
- Use `ASCIIUI.downloadTextFile()` for editor JSON exports so Blob/link cleanup remains shared.
- Use named shared UI snapshots such as `ASCIIUI.getContractState('runtime')` instead of repeating `typeof ASCIIUI.*` checks.
- Use named shared schema snapshots such as `ASCII_LABYRINTH_DATA.getContractState('editor')` instead of repeating `typeof SHARED_DATA.*` checks.
- Visual smoke should assert named contract snapshots are non-empty and all true instead of keeping duplicate key lists.
- Repeated command buttons should use familiar icon text or concise labels.
- New major panel surfaces should be implemented with shared `--al-*` tokens first.

## Rules

- Do not create one-off UI colors unless the color becomes a shared token.
- Do not create text-box borders for any UI that may contain Chinese, Japanese, emoji, or mixed-width text.
- Do not append HTML strings into existing panels for state such as pause, damage, or alerts. Re-render through the shared component helper.
- Use `ASCIIUI.setElementVisible` for runtime modal visibility instead of writing one-off `style.display` code.
- Keep HUD panels fixed to viewport corners and let them wrap text. Avoid placing gameplay instructions in floating cards over the center of the view.
- Prefer adding a shared primitive to `origin/shared/ui-system.css` over copying CSS between runtime, editor, and model editor.

## Adding New UI

1. Check whether `origin/shared/ui-system.css` already has the needed primitive.
2. If not, add a small reusable class or token there.
3. Use `ASCIIUI.renderPanel` for runtime HUD text panels and `ASCIIUI.setElementVisible` for modals.
4. Build with `npm run build`.
5. Verify at least the runtime page and the page you touched in the browser.
