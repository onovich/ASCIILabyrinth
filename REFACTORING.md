# Refactoring Workflow

This project is moving from prototype-heavy HTML pages toward shared runtime, editor, model-editor, and verification contracts. Keep changes small, verify each slice, then push.

## Source Map

- `origin/index.html`: authoritative playable runtime.
- `origin/runtime/audio.js`: runtime BGM and SFX controller.
- `origin/runtime/debug-snapshot.js`: runtime debug snapshot publisher used by visual smoke.
- `origin/runtime/effects.js`: runtime projectile and explosion spawn factory.
- `origin/runtime/enemy-models.js`: runtime enemy model geometry and flash-state factory.
- `origin/runtime/enemy-profiles.js`: built-in runtime enemy profile catalog and model-editor profile merge.
- `origin/runtime/hud.js`: runtime HUD, mission, and radio log rendering controller.
- `origin/runtime/level-source.js`: runtime editor-level loading and procedural fallback generation.
- `origin/editor/index.html`: authoritative level editor.
- `origin/editor/starter-project.js`: editor starter project, level, and object factory.
- `origin/model-editor/index.html`: authoritative model editor.
- `origin/model-editor/preview-factory.js`: model editor Three.js part object and geometry factory.
- `origin/shared/game-schema.js`: shared data contracts, editor/runtime conversion, model/runtime conversion, storage helpers, and schema contract snapshots.
- `origin/shared/ui-system.js`: shared DOM helpers, HUD panels, visibility helpers, event binding helpers, file import/export helpers, and UI contract snapshots.
- `origin/shared/ui-system.css`: shared design tokens and reusable runtime/tool UI primitives.
- `public/`: generated sync target. Do not make authoritative edits here unless the same change is also made in `origin/`.

## Script Map

- `scripts/sync-runtime.mjs`: task-driven sync from `origin/` and `bgm/` into `public/`.
- `scripts/smoke.mjs`: low-cost behavioral and contract guard.
- `scripts/smoke-contracts.mjs`: required/forbidden source fragments and shared CSS selectors used by `smoke.mjs`.
- `scripts/smoke-css-contracts.mjs`: shared UI CSS selector contract used by smoke source assertions.
- `scripts/smoke-schema-core-assertions.mjs`: core shared schema helper, contract, floor, tile, and path assertions.
- `scripts/smoke-schema-editor-assertions.mjs`: editor object, level, floor visibility, and editor project schema assertions.
- `scripts/smoke-environment.mjs`: project paths and file readers used by smoke guards.
- `scripts/smoke-fixtures.mjs`: low-cost runtime/model conversion fixtures.
- `scripts/smoke-schema-model-assertions.mjs`: model part and model project schema assertions.
- `scripts/smoke-runtime-contracts.mjs`: runtime page required/forbidden shared UI and schema source fragments.
- `scripts/smoke-runtime-conversion-assertions.mjs`: editor-level and model-project conversion assertions used by smoke.
- `scripts/smoke-schema-persistence-assertions.mjs`: JSON, storage, timestamp, and project touch schema assertions.
- `scripts/smoke-schema-assertions.mjs`: shared schema and conversion assertions.
- `scripts/smoke-source-assertions.mjs`: source text guards for runtime/editor/model-editor shared-helper dependencies.
- `scripts/smoke-tool-contracts.mjs`: editor and model-editor required/forbidden shared UI and schema source fragments.
- `scripts/smoke-ui-binding-assertions.mjs`: shared UI element, direct handler, and delegated handler binding assertions.
- `scripts/smoke-ui-assertions.mjs`: shared UI CSS and page-level UI contract checks.
- `scripts/visual-smoke.mjs`: visual smoke orchestrator for DOM dumps, screenshots, and per-page assertions.
- `scripts/visual-smoke-browser.mjs`: Chrome/Edge discovery and browser process cleanup helpers.
- `scripts/visual-smoke-capture.mjs`: Chrome DOM dump and screenshot capture helpers.
- `scripts/visual-smoke-contracts.mjs`: visual smoke page list and snapshot checks.
- `scripts/visual-smoke-dev-server.mjs`: dev-server readiness checks, startup, log capture, and cleanup.
- `scripts/visual-smoke-environment.mjs`: visual smoke env var parsing, paths, and browser discovery.
- `scripts/visual-smoke-page-assertions.mjs`: DOM marker, snapshot extraction, and snapshot comparison helpers.
- `scripts/visual-smoke-page-runner.mjs`: per-page DOM retry, snapshot assertion, screenshot capture, and result formatting.

## Slice Loop

1. Check status: `git -c safe.directory=D:/WebProjects/ASCIILabyrinth status --short --branch`.
2. Pick one boundary: shared data, shared UI, sync workflow, smoke contracts, visual smoke contracts, or a narrow page wrapper.
3. Edit only the authoritative source and its guard when possible.
4. Run a cheap focused check first, usually `npm run smoke` or `npm run visual-smoke`.
5. Run `npm run verify` before committing.
6. Inspect the screenshots under `.codex-artifacts/visual-smoke/`.
7. Commit and push through the project git workflow wrapper.

## Refactor Rules

- Prefer moving repeated constants and contracts into shared modules over copying fallback code.
- Avoid optional legacy fallbacks for shared UI/schema helpers; smoke contracts should fail if a page stops requiring the shared helper.
- Keep `origin/` authoritative and let `scripts/sync-runtime.mjs` update `public/`.
- Preserve pointer, mouse-look, keyboard, touch, drag, save/load, import/export, and undo behavior when touching page code.
- Add or update a smoke/visual-smoke guard when a refactor changes a cross-page contract.
- Treat green tests as necessary, not sufficient: look at screenshots after visual changes or workflow changes that touch page routing.

## Current Next Targets

- Continue extracting small shared helpers from tool/runtime pages only when smoke can prove the dependency.
- Keep reducing verifier duplication so future agents can find contracts in one file per guard.
- Move gameplay runtime systems out of `origin/index.html` only after a narrow guard exists for the behavior being extracted.
