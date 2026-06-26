# 深度学习 Handbook · DL Handbook

一个基于四本斋藤康毅深度学习系列教材的**交互式可视化教学网站**。把书里抽象的公式和图示，变成可以拖动、调参、实时反馈的可视化演示。

🌐 **在线访问**：<https://techdou.github.io/dl-handbook/>

---

## 项目特点

- **四本书 · 19 个知识点**：感知机 → 自制框架 → NLP → 强化学习，循序渐进
- **19 个可交互演示**：每个知识点配一个 React 可视化，数学真实计算、动画平滑过渡
- **学术笔记本风格**：暖白纸张 + 衬线字体 + 靛青点缀，长时间阅读不疲劳
- **响应式设计**：桌面端侧边栏导航，移动端抽屉式菜单
- **TTS 语音讲解**：每个知识点配有 AI 生成的朗读音频（可选）

## 技术架构

### 混合技术栈：Vue 3 + React

| 层 | 技术 | 职责 |
|---|---|---|
| 页面外壳 | Vue 3 + Vue Router | 路由、布局、侧边栏、文章渲染 |
| 交互演示 | React 19 + visx + react-spring | SVG 可视化、动画、状态管理 |
| 桥接 | `ReactDemoHost.vue` | Vue 容器内挂载 React 组件 |
| 构建 | Vite 8 | `@vitejs/plugin-vue` + `@vitejs/plugin-react` 共存 |

### 架构原则

- **visx 优先**：所有 SVG 图形用 React 组件渲染，D3 仅做纯数学计算（`d3-contour`、`scale`），避免 React/D3 DOM 冲突
- **数学真实**：决策边界、损失等高线、Q-Learning 更新、softmax 权重等全部由真实算法计算，不手绘
- **react-spring 动画**：滑块调参 → 结果变化都有平滑过渡，杜绝硬切
- **自包含**：每个 Demo 单文件、样式隔离（class 前缀独立）、无外部可视化状态依赖

### 目录结构

```
src/
├── components/
│   ├── handbook/          # Vue 组件（页面骨架，不涉及演示逻辑）
│   │   ├── AppSidebar.vue       # 侧边栏导航
│   │   ├── ReactDemoHost.vue    # React 演示挂载桥
│   │   ├── AudioPlayer.vue      # 语音讲解播放器
│   │   ├── BookFigure.vue       # 书籍插图展示
│   │   ├── FormulaBlock.vue     # KaTeX 公式渲染
│   │   ├── QuizModal.vue        # 随堂测验
│   │   ├── TermPopover.vue      # 术语弹窗
│   │   └── PageNav.vue          # 页面导航
│   └── demos/             # 独立 React 交互演示组件（单文件自包含）
│       ├── DemoRegistry.tsx     # demoId → 组件 映射表
│       ├── PerceptronDemo.tsx   # 感知机：训练线性决策边界
│       ├── OptimizerDemo.tsx    # 优化器：d3-contour 等高线 + 梯度下降路径
│       ├── DqnDemo.tsx          # DQN：真实 Q-Learning 训练网格世界
│       └── ...（共 19 个）
├── views/                 # 页面
│   ├── HomePage.vue
│   ├── LearningPath.vue
│   └── TopicPage.vue
├── data/                  # 知识点内容数据
│   ├── topics.js          # 19 个知识点结构化内容
│   ├── glossary.js        # 术语表
│   └── bookImages.js      # 书籍插图映射
└── assets/
    └── main.css           # 全局设计令牌 + 样式
```

## 19 个交互演示一览

| # | 知识点 | 演示亮点 |
|---|---|---|
| 1 | 感知机 | 滑块调权重 + 真实感知机训练算法 + 决策边界动画 |
| 2 | 神经网络 | 层数/宽度动态构建 + 信息流逐层点亮 |
| 3 | 反向传播 | 梯度回传动画 + 播放控制 |
| 4 | 训练过程 | 指数衰减 + batch 噪声的真实损失曲线 |
| 5 | 卷积 | 真实 2D 卷积运算 + 卷积核/步幅切换 |
| 6 | MNIST | 像素阈值二值化 + 噪声模拟 |
| 7 | 计算图 | 前向值 + 链式法则梯度实时联动 |
| 8 | 自动微分 | 计算图节点保存前向值与局部导数 |
| 9 | 层与激活 | relu/sigmoid/tanh 真实曲线 + 偏置偏移 |
| 10 | 优化器 | d3-contour 算等高线 + 动量梯度下降路径 |
| 11 | Word2Vec | 词向量几何 + 最近邻连线 + 类比箭头 |
| 12 | RNN | 隐藏状态 tanh 累积 + 时间步展开 |
| 13 | LSTM | 四个门控 + 细胞状态真实计算 |
| 14 | Seq2Seq | 编码器/解码器 + 真实 softmax 注意力连线 |
| 15 | Attention | Q·K 相似度 + 温度调节热力图 |
| 16 | RL 基础 | 网格世界 MDP + agent 路径动画 + 累计奖励 |
| 17 | MDP | 贝尔曼方程真实求解状态价值 |
| 18 | Q-Learning | 真实 TD 更新公式 + 学习率调节 |
| 19 | DQN | 真实 Q-Learning 训练 + 热力图 + reward 曲线 |

## 本地开发

```bash
npm install      # 安装依赖
npm run dev      # 启动开发服务器（http://localhost:5173）
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

## 部署

推送到 `main` 分支即自动部署到 GitHub Pages（见 `.github/workflows/deploy.yml`）。

- 仓库：<https://github.com/techdou/dl-handbook>
- Pages：<https://techdou.github.io/dl-handbook/>

Vite 的 `base` 配置为 `/dl-handbook/`，资源路径通过 `import.meta.env.BASE_URL` 适配子路径部署。

## 致谢

内容基于斋藤康毅《深度学习》系列四本书：

1. 深度学习入门：基于 Python 的理论与实现
2. 深度学习入门 2：自制框架
3. 深度学习进阶：自然语言处理
4. 深度学习入门 4：强化学习
