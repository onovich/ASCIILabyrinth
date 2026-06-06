项目交接文档 (AI 接手专用)

1. 项目名称

《字符迷城：终端行动 (ASCII Labyrinth: Terminal Operation)》 (技术代号：彩色分层动态光影 ASCII 3D FPS)

2. 需求设计文档 (PRD)

2.1 核心玩法

类型: 第一人称射击 (FPS) / 迷宫生存。

目标: 在迷宫中探索，拾取补给，击杀自动追踪的敌人，获取最高分数。

循环: 探索 -> 遇敌 -> 射击 -> 负伤/消耗弹药 -> 寻找补给 -> 继续存活。

2.2 交互方式 (双端自适应)

移动端 (触控):

左半屏拖拽：虚拟摇杆，控制平移 (WASD逻辑)。

右半屏拖拽：控制相机旋转 (Yaw/Pitch)。

右半屏短按 (<300ms)：开火。

PC端 (键鼠):

键盘：W A S D 控制平移。

鼠标：点击画面触发 PointerLock (指针锁定)，鼠标物理移动控制相机旋转，左键开火。

控制台：按 P 键暂停游戏，呼出/隐藏开发者光影调参面板。

2.3 实体与 UI

UI HUD: 左上角显示生命值 (Max 100)、弹药量、分数。中心十字准星。受伤全局红屏闪烁，阵亡弹出重置面板。

补给品: 弹药 (青色立方体, +15)、医疗包 (绿色八面体, +30)。

敌人: 圆柱体身体 + 圆球头部。附带红色点光源。追踪玩家，贴身自动造成伤害。

子弹: 附带高亮动态光源，飞行时照亮环境。

3. 技术文档 (Architecture & Tech Stack)

3.1 技术栈

核心引擎: Three.js (r128) - 用于 3D 场景构建、光照计算、物理碰撞。

UI/调试: lil-gui (v0.19) - 用于开发者光影参数调节。

渲染输出: 原生 HTML5 Canvas 2D API - 用于绘制 ASCII 字符阵列。

架构形态: 单 HTML 文件 (index.html)，零构建工具，开箱即用。

3.2 核心渲染管线 (Render Pipeline)

本作采用了独特的“降维打击”渲染管线，这是接手 AI 必须深刻理解的核心：

后台 3D 渲染: Three.js 将场景渲染到内存中的低分辨率 WebGL 缓冲区 (cols x rows)。

像素采样: 每帧使用 gl.readPixels 提取缓冲区的 RGBA 原始数据。

灰度映射: 遍历像素，使用公式 0.299*R + 0.587*G + 0.114*B 计算亮度 (Luminance)。

字符提取: 根据亮度，在字符集 (ASCII_CHARS) 中按比例索引出对应的 ASCII 字符。

前台 2D 绘制: 清空 Canvas 2D，使用 WebGL 提取的真实 RGB 颜色和基于亮度的透明度 (Alpha)，将字符绘制到屏幕上。

3.3 碰撞与物理逻辑

玩家移动: 分离轴基础检测，checkWallCollision。为了防止卡墙，X轴和Z轴的移动和碰撞判定是分离计算的（允许贴墙滑行）。

射击判定: 使用 XZ 平面的 2D 距离判定 (Math.hypot(x1-x2, z1-z2))。注意：由于玩家相机高度(1.0)与敌人原点(0.0)有高度差，严禁使用 3D 欧拉距离 (distanceTo)，否则会导致贴脸打不中！

4. 美术约束 (Aesthetic & Art Guidelines)

长宽比校正 (Aspect Ratio):

等宽字体 (Courier New) 的高宽比通常为 1 : 0.6。

必须补偿: 在计算 WebGL 分辨率时，CHAR_WIDTH 必须等于 PIXEL_SIZE * 0.6。且相机的 aspect 必须强制设置为屏幕的真实比例 (window.innerWidth / window.innerHeight)，以抵消字符天然的长方形导致的画面压缩。

彩色分层与透明度 (Layering):

Canvas fillText 使用的颜色格式为 rgba(r, g, b, alpha)。

透明度算法: alpha = Math.max(0.15, luminance / 255) * alphaMultiplier。越暗的像素越透明，使其自然融入黑色背景，解决画面噪点和扁平化问题。

光照材质 (PBR):

场景物体使用 MeshStandardMaterial。必须保留 roughness 和 metalness 属性，以确保 ASCII 字符能反馈出镜面高光 (Specular) 效果。

敌人/物资使用 emissive (自发光) 属性，受击闪烁通过短暂修改 emissive 的 Hex 颜色实现。

5. 技术架构迭代构想 (For the next AI)

当前架构虽然创新，但在高分辨率下存在性能瓶颈。建议后续 AI 从以下方向进行重构：

5.1 性能优化 (Performance)

WebGL Custom Shader 重构 (最高优先级):

当前痛点: gl.readPixels 会导致 CPU 和 GPU 之间的强制同步，极其消耗性能；Canvas 2D 绘制几万个文本的开销极大。

迭代方向: 废弃 Canvas 2D。将 ASCII 映射逻辑直接写入 WebGL 后期处理着色器 (Post-Processing Fragment Shader)。将 ASCII 字符集做成一张 Texture (Atlas)，在 Shader 中根据像素亮度对这张 Texture 进行 UV 采样。此举可将帧率提升 10 倍以上。

空间分区 (Spatial Partitioning):

碰撞检测目前是遍历所有墙体 (walls)。未来需引入简单的网格划分 (Grid) 或四叉树 (QuadTree)，仅检测玩家周围的实体。

5.2 玩法扩展 (Gameplay)

武器系统: 引入武器切换机制（霰弹枪：一次发射多个带有散布角度的 PointLight 子弹）。

关卡生成: 废弃硬编码的 levelMap 数组，引入 BSP 树或元胞自动机生成随机地牢。

6. 项目 Roadmap

[x] Phase 1: MVP 构建 - 完成 3D 到 ASCII 的降维渲染，基础移动与射击，手机端适配。

[x] Phase 2: 视觉进化 - 引入彩色 Canvas 渲染，加入透明度分层，修复模型形变，增加粒子爆炸特效和光影面板。

[ ] Phase 3: 性能飞跃 - (待接手) 迁移 ASCII 渲染管线至 WebGL Shader。

[ ] Phase 4: 内容填充 - (待接手) 多种武器、随机地图生成、音效系统 (Web Audio API)。

[ ] Phase 5: 基础关卡体验 - (待接手) 设计并实现一条完整逃生流程：玩家需要在迷宫中对抗敌人、搜集弹药与医疗补给、确保存活；随后找到钥匙，解锁隐藏房间，在房间内获得密码提示；最后定位出口大门，输入密码并完成逃出生天的结局演出。

	TODO 细化:
	- 开场目标文本: 用简短 HUD 文本或无线电对白说明“活下来，找到钥匙并逃离设施”。
	- 战斗与补给节奏: 在主路径上分布基础敌人与有限补给，形成“清敌 -> 探索 -> 补给”的循环。
	- 钥匙目标: 将钥匙放在迷宫深处或一次小规模遭遇战之后，拿到时给出明确提示文本。
	- 隐藏房间: 用钥匙开启隐藏门，房间内通过终端文本、墙面字条或短对白给出密码线索。
	- 终局交互: 玩家到达出口大门后进行密码输入，成功后触发结局文本，失败则提示重新确认线索。
	- 叙事表现: 全程仅加入轻量文本和短对话，不打断当前街机式节奏。

7. 项目启动指南

环境要求: 任何支持 HTML5 Canvas 和 WebGL 的现代浏览器（Chrome/Edge/Safari/Firefox）。

运行方式:

由于代码完全包含在单一的 index.html 中，且没有加载外部跨域图片材质，直接双击 index.html 在浏览器中打开即可运行。

若未来引入了外部纹理贴图，则需要通过本地服务器运行（如使用 Python 的 python -m http.server 或 VSCode 的 Live Server 插件）。

依赖库:

Three.js (r128): 通过 CDN 引入。

lil-gui (v0.19.2): 通过 CDN 引入。如果遇到面板无法打开，请检查网络是否屏蔽了 cdn.jsdelivr.net。

END OF DOCUMENT