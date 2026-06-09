# ASCII Labyrinth

ASCII Labyrinth is a deployable Vite wrapper that launches the playable ASCII FPS runtime directly.<br/>**ASCII Labyrinth 是一个可部署的 Vite 包装项目，会直接启动可玩的 ASCII FPS 运行时。**

## Overview

The gameplay runtime lives in origin/index.html and is automatically synchronized into public/runtime before development and production builds.<br/>**玩法运行时保存在 origin/index.html 中，并会在开发与生产构建前自动同步到 public/runtime。**

The root page redirects into the runtime so pointer-lock mouse controls work as a top-level document while still keeping GitHub Pages-safe Vite routing.<br/>**根页面会直接进入运行时，使鼠标锁定控制以顶层文档方式工作，同时保留适配 GitHub Pages 的 Vite 路由。**

## Highlights

- Keeps the original Three.js gameplay loop playable while the ASCII output is now handled by a WebGL post-processing shader.<br/>**保留原始 Three.js 玩法循环的可玩状态，同时将 ASCII 输出改为 WebGL 后处理 Shader。**
- Adds a Vite build pipeline with a verified production build and repository-name-aware base routing for GitHub Pages.<br/>**新增 Vite 构建流水线，并已验证生产构建通过，同时为 GitHub Pages 配置了与仓库名一致的 base 路由。**
- Adds procedural facility generation, two weapons, Web Audio event sounds, and a key-code-exit escape objective.<br/>**新增程序化设施生成、两种武器、Web Audio 事件音效，以及钥匙、密码、出口组成的逃生目标。**
- Uses TUI-style HUD, mission, radio, password, and ending panels so the interface matches the ASCII terminal scene.<br/>**使用 TUI 风格的 HUD、任务、无线电、密码和结局面板，让界面与 ASCII 终端场景保持统一。**

## Architecture

- origin/index.html is the authoritative runtime source for gameplay, rendering, controls, HUD, and objective flow.<br/>**origin/index.html 是玩法、渲染、控制、HUD 和目标流程的权威运行时来源。**
- origin/shared/game-schema.js defines shared editor/model/runtime contracts and converts saved editor projects into runtime tile maps.<br/>**origin/shared/game-schema.js 定义地编、模型编辑器与运行时共享的契约，并把地编保存的项目转换为运行时 tile map。**
- Model editor projects marked with the current runtime model schema can be converted into runtime enemy profiles; stale unmarked local model saves are ignored by the game.<br/>**带有当前运行时模型 schema 标记的模型编辑器项目可以转换为运行时敌人配置；未标记的旧本地模型存档会被游戏忽略。**
- scripts/sync-runtime.mjs copies the runtime and audio assets into public/runtime before dev and production builds.<br/>**scripts/sync-runtime.mjs 会在开发和生产构建前把运行时与音频资源复制到 public/runtime。**
- index.html is intentionally tiny: it redirects to runtime/index.html so the game runs as the top-level page instead of inside an iframe.<br/>**index.html 有意保持很小：它会跳转到 runtime/index.html，让游戏作为顶层页面运行，而不是放在 iframe 中。**

## Getting Started

- Install dependencies with npm install.<br/>**使用 npm install 安装依赖。**
- Start the local Vite server with npm run dev.<br/>**使用 npm run dev 启动本地 Vite 开发服务。**
- Create a production build with npm run build.<br/>**使用 npm run build 生成生产构建。**
- Run the low-cost refactor guard with npm run smoke, or run npm run validate for build plus smoke checks.<br/>**使用 npm run smoke 运行低成本重构守卫，或使用 npm run validate 串联构建与 smoke 检查。**
- With the dev server running, run npm run visual-smoke to check the runtime, level editor, and model editor DOM markers and write screenshots to .codex-artifacts/visual-smoke/.<br/>**开发服务器运行时，可用 npm run visual-smoke 检查运行时、地编、模型编辑器的 DOM 标记，并把截图写入 .codex-artifacts/visual-smoke/。**
- Preview the built site with npm run preview.<br/>**使用 npm run preview 预览构建产物。**

## Deployment

- GitHub Pages deployment is handled by .github/workflows/deploy.yml through the official GitHub Actions Pages flow.<br/>**GitHub Pages 部署通过 .github/workflows/deploy.yml 使用官方 GitHub Actions Pages 流程完成。**
- Because this is a Vite repository hosted under a project path, the build base is configured as /ASCIILabyrinth/.<br/>**由于这是部署在项目子路径下的 Vite 仓库，构建 base 已配置为 /ASCIILabyrinth/。**
- After the workflow is pushed, set the repository Pages source to GitHub Actions in Settings -> Pages.<br/>**推送 workflow 后，请在 Settings -> Pages 中把仓库的 Pages Source 切换为 GitHub Actions。**

## Status

This repository is runtime-first: the playable game is concentrated in origin/index.html and synchronized for deployment.<br/>**当前仓库以运行时为中心：可玩的游戏集中在 origin/index.html，并会被同步用于部署。**

Future cleanup can continue extracting gameplay systems from the runtime now that editor data can feed the game through the shared schema.<br/>**现在地编数据已经可以通过共享契约进入游戏，后续清理可以继续从运行时中抽离玩法系统。**
