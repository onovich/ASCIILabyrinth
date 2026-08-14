# ASCIILabyrinth

[English](README.md)

[在线试玩](https://blog.onovich.com/ASCIILabyrinth/)

ASCIILabyrinth 是一个可以游玩的第一人称迷宫射击游戏，整个画面由 ASCII 字符呈现。

![ASCIILabyrinth 封面](docs/cover.png)

## 关于

探索程序化生成的设施、应对敌人、找到钥匙与密码，并抵达出口。游戏底层仍然运行真实 3D 场景，再通过 WebGL 后处理把最终画面转换成终端式 ASCII 输出。

## 玩法

- 点击游戏画面以锁定鼠标指针。
- 使用 `WASD` 移动，移动鼠标观察四周。
- 使用鼠标左键射击。
- 根据 HUD 与无线电信息寻找钥匙和密码，最后找到出口。

## 主要特点

- 完整的钥匙、密码与出口目标循环。
- 程序化设施生成和两种武器。
- ASCII WebGL 渲染，以及与画面一致的终端式 HUD。
- Web Audio 反馈与本地游戏资源。
- 地编和模型编辑器数据可以通过共享 Schema 转换成运行时内容。

## 开发

安装依赖并启动 Vite：

```bash
npm install
npm run dev
```

运行主要构建与 Smoke 检查：

```bash
npm run validate
npm run visual-smoke
```

`npm run verify` 会依次运行构建、逻辑 Smoke 和视觉 Smoke。

## 项目结构

- `origin/index.html` 是当前玩法运行时的权威来源。
- `origin/shared/` 保存游戏与编辑器共用的数据和 UI 契约。
- `scripts/sync-runtime.mjs` 会在开发和生产构建前把运行时复制到 `public/runtime/`。
- `src/` 保存运行时外层的 Vite 与 React 应用壳。

## 当前状态

游戏已经可以游玩，并拥有较完整的构建、Smoke 和视觉 Smoke 检查。玩法运行时仍主要集中在 `origin/index.html`；后续可以继续拆分，但应优先保护当前可玩的游戏与编辑器契约。

## 许可证

当前仓库尚未包含开源许可证。
