export const heroContent = {
  eyebrow: 'ASCII 3D FPS / Legacy Runtime Preserved',
  title: 'ASCII Labyrinth',
  description:
    'A chromatic terminal shooter preserved from the original single-file prototype and wrapped in a Vite + React delivery shell.',
  detail:
    '当前仓库已经具备可构建、可部署的标准前端入口；核心玩法仍由 origin/index.html 中的 Three.js + Canvas ASCII 运行时驱动，后续可以按 data / logic / view 边界继续拆分。',
};

export const runtimePills = [
  'Three.js ASCII renderer',
  'Legacy runtime auto-synced',
  'GitHub Pages ready',
];

export const featureCards = [
  {
    title: 'Survive the maze',
    body: '在迷宫里搜索补给、保持弹药，并在自动追踪敌人的夹击下尽量活得更久。',
  },
  {
    title: 'Chromatic ASCII output',
    body: '原型保留了彩色 ASCII 渲染、动态光照、雾效和开发者调参面板，不在初始化阶段牺牲现有表现。',
  },
  {
    title: 'Migration-ready shell',
    body: '新结构先把部署、视图包装和后续引擎抽离边界建立出来，避免继续把所有变更压回单 HTML 文件。',
  },
];

export const controlGroups = [
  {
    title: 'Desktop',
    items: [
      'W A S D 移动',
      '点击画面后启用鼠标视角',
      '左键射击',
      'P 键暂停并切换开发者调参面板',
    ],
  },
  {
    title: 'Mobile',
    items: [
      '左半屏拖拽控制移动',
      '右半屏拖拽控制视角',
      '右半屏短按开火',
      '建议横屏游玩以获得更稳定视野',
    ],
  },
];

export const architectureSlices = [
  {
    title: 'Data',
    body: '项目说明、控制提示、迁移状态等仓库级数据已抽到 src/data，后续可以继续把地图、参数和实体配置从 legacy runtime 中分离。',
  },
  {
    title: 'Logic',
    body: 'src/logic 现在承载 legacy runtime 接入逻辑，并明确了后续应优先抽离的引擎入口，而不是继续把托管逻辑写死在视图层。',
  },
  {
    title: 'View',
    body: 'src/view 负责仓库壳层、信息面板和游戏视口；React 只管理展示与宿主页面，不干扰原型的高频实时循环。',
  },
];

export const migrationStatus = {
  title: 'Current migration status',
  bullets: [
    '已建立标准前端入口、构建脚本与 GitHub Pages 所需 base 配置。',
    '已保留 origin/index.html 作为单一 legacy 运行时来源，并在 dev/build 前自动同步到 public/legacy。',
    '已建立 src/data、src/logic/engine、src/logic/hooks、src/view/screens、src/view/components 目录与最小实现。',
    '尚未把敌人 AI、碰撞、ASCII 采样和更新循环完整拆出单文件原型；当前阶段属于迁移准备完成，而非全量逻辑重构完成。',
  ],
};

export const nextExtractionTargets = [
  'checkWallCollision 与移动推进',
  '敌人追踪和命中判定',
  'ASCII 像素采样与字符映射',
  '物资刷新、子弹生命周期与粒子效果',
];