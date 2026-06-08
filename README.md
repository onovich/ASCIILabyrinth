# ASCII Labyrinth

ASCII Labyrinth is a deployable Vite + React shell around a preserved single-file ASCII FPS prototype.<br/>**ASCII Labyrinth 是一个围绕保留版单文件 ASCII FPS 原型构建的可部署 Vite + React 外壳。**

## Overview

The original gameplay runtime still lives in origin/index.html and is automatically synchronized into public/runtime before development and production builds.<br/>**原始玩法运行时仍保存在 origin/index.html 中，并会在开发与生产构建前自动同步到 public/runtime。**

This repository now provides a standard frontend entry, GitHub Pages-safe Vite routing, and a React presentation layer for delivery and future migration work.<br/>**当前仓库已经提供标准前端入口、适配 GitHub Pages 的 Vite 路由，以及用于交付和后续迁移的 React 表现层。**

## Highlights

- Keeps the original Three.js plus Canvas ASCII renderer playable without rewriting the prototype first.<br/>**在不先重写原型的前提下，保留原始 Three.js 与 Canvas ASCII 渲染器的可玩状态。**
- Adds a Vite build pipeline with a verified production build and repository-name-aware base routing for GitHub Pages.<br/>**新增 Vite 构建流水线，并已验证生产构建通过，同时为 GitHub Pages 配置了与仓库名一致的 base 路由。**
- Establishes src/data, src/logic/engine, src/logic/hooks, src/view/screens, and src/view/components as the migration baseline.<br/>**建立了 src/data、src/logic/engine、src/logic/hooks、src/view/screens 和 src/view/components 作为迁移基线。**
- Ships a React shell that hosts the preserved runtime while exposing the current architecture status honestly.<br/>**提供一个托管保留运行时的 React 外壳，并如实展示当前架构状态。**

## Architecture

- src/data stores repository-level content and migration-facing project facts that should continue absorbing extracted gameplay constants and maps.<br/>**src/data 用于存放仓库级内容和迁移导向的项目信息，后续应继续吸收被抽离出的玩法常量与地图数据。**
- src/logic/engine currently isolates runtime addressing and marks the boundary where collision, AI, combat, and update loops should move next.<br/>**src/logic/engine 当前隔离了运行时接入边界，并标记出下一步应迁入的碰撞、AI、战斗与更新循环逻辑。**
- src/logic/hooks contains React-only orchestration such as runtime reload state and Pages-safe iframe URLs.<br/>**src/logic/hooks 负责仅属于 React 的编排逻辑，例如运行时重载状态和适配 Pages 的 iframe 地址。**
- src/view renders the repository shell, status panels, and the gameplay viewport without interfering with the original high-frequency runtime loop.<br/>**src/view 负责渲染仓库壳层、状态面板和玩法视口，同时不干扰原始高频运行时循环。**

## Getting Started

- Install dependencies with npm install.<br/>**使用 npm install 安装依赖。**
- Start the local Vite server with npm run dev.<br/>**使用 npm run dev 启动本地 Vite 开发服务。**
- Create a production build with npm run build.<br/>**使用 npm run build 生成生产构建。**
- Preview the built site with npm run preview.<br/>**使用 npm run preview 预览构建产物。**

## Deployment

- GitHub Pages deployment is handled by .github/workflows/deploy.yml through the official GitHub Actions Pages flow.<br/>**GitHub Pages 部署通过 .github/workflows/deploy.yml 使用官方 GitHub Actions Pages 流程完成。**
- Because this is a Vite repository hosted under a project path, the build base is configured as /ASCIILabyrinth/.<br/>**由于这是部署在项目子路径下的 Vite 仓库，构建 base 已配置为 /ASCIILabyrinth/。**
- After the workflow is pushed, set the repository Pages source to GitHub Actions in Settings -> Pages.<br/>**推送 workflow 后，请在 Settings -> Pages 中把仓库的 Pages Source 切换为 GitHub Actions。**

## Status

This repository is migration-ready, not fully refactored: the gameplay engine, AI, collision, ASCII sampling, and effect systems still remain inside the preserved single-file runtime.<br/>**当前仓库处于迁移就绪状态，而不是完全重构完成：玩法引擎、AI、碰撞、ASCII 采样和特效系统仍保留在单文件运行时中。**

The next extraction targets are map data, gameplay constants, enemy and pickup updates, combat resolution, and the ASCII render pipeline.<br/>**下一步优先抽离的对象包括地图数据、玩法常量、敌人与补给更新、战斗结算，以及 ASCII 渲染管线。**
