<!--
  D3Demo.vue — D3.js 交互式演示组件
  功能：根据 demoId 渲染对应的 D3.js 可视化演示
  设计：学术笔记本风格，墨黑线条，靛青高亮
-->
<script setup>
// 从 Vue 导入工具函数
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
// 导入 D3.js 数据可视化库
import * as d3 from 'd3'

// 定义组件接收的属性
const props = defineProps({
  demoId: {
    // 演示 ID，决定渲染哪种可视化
    type: String,
    required: true
  }
})

// SVG 容器的 DOM 引用
const svgContainer = ref(null)
// 交互控件配置（滑块等）
const controls = ref([])
// 演示的宽度
const width = ref(600)
// 演示的高度
const height = ref(300)
// 动画运行状态
const isRunning = ref(false)
// 当前步数
const step = ref(0)
// 动画定时器
let timer = null

// 清除 SVG 容器中的所有内容
function clearSvg() {
  // 如果容器存在，清空内部 HTML
  if (svgContainer.value) {
    svgContainer.value.innerHTML = ''
  }
  // 停止正在进行的动画
  stopAnimation()
}

// 停止动画定时器和 requestAnimationFrame
function stopAnimation() {
  // 如果定时器存在，清除它
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  // 清理 requestAnimationFrame 动画
  if (svgContainer.value?.__backpropRAF) {
    cancelAnimationFrame(svgContainer.value.__backpropRAF)
    svgContainer.value.__backpropRAF = null
  }
  // 更新运行状态
  isRunning.value = false
}

// 根据 demoId 渲染对应的可视化
function renderDemo() {
  // 先清除旧内容
  clearSvg()
  // 如果容器不存在则返回
  if (!svgContainer.value) return

  // 根据演示 ID 分发到对应的渲染函数
  switch (props.demoId) {
    case 'perceptron':       renderPerceptronDemo(); break    // 感知机演示
    case 'neural-network':   renderNeuralNetDemo(); break     // 神经网络演示
    case 'backpropagation':  renderBackpropDemo(); break      // 反向传播演示
    case 'training':         renderTrainingDemo(); break      // 训练演示
    case 'cnn':              renderCNNDemo(); break            // CNN 演示
    case 'mnist':            renderMNISTDemo(); break          // MNIST 演示
    case 'computation-graph': renderCompGraphDemo(); break     // 计算图演示
    case 'autograd':         renderAutogradDemo(); break       // 自动微分演示
    case 'layers':           renderLayersDemo(); break         // 层演示
    case 'optimizer':        renderOptimizerDemo(); break      // 优化器演示
    case 'word2vec':         renderWord2VecDemo(); break       // Word2Vec 演示
    case 'rnn':              renderRNNDemo(); break             // RNN 演示
    case 'lstm':             renderLSTMDemo(); break            // LSTM 演示
    case 'seq2seq':          renderSeq2SeqDemo(); break         // Seq2Seq 演示
    case 'attention':        renderAttentionDemo(); break       // Attention 演示
    case 'rl-basics':        renderRLBasicsDemo(); break        // RL 基础演示
    case 'mdp':              renderMDPDemo(); break              // MDP 演示
    case 'q-learning':       renderQLearningDemo(); break       // Q-Learning 演示
    case 'dqn':              renderDQNDemo(); break              // DQN 演示
    default:                 renderDefaultDemo()                // 默认演示
  }
}

// --- 感知机交互演示 ---
// 展示二维空间中的分类决策边界
function renderPerceptronDemo() {
  controls.value = [
    { type: 'button', label: '重新生成数据', key: 'regen', action: 'regenerate' },
    { type: 'button', label: '隐藏决策边界', key: 'boundary', action: 'boundary' }
  ]
  // 设置 SVG 尺寸
  const w = width.value, h = height.value
  // 创建 SVG 元素并设置尺寸
  const svg = d3.select(svgContainer.value)
    .append('svg')           // 添加 SVG 元素
    .attr('width', w)        // 设置宽度
    .attr('height', h)       // 设置高度
    .attr('viewBox', `0 0 ${w} ${h}`)
    // 设置视口，支持响应式缩放
    .style('max-width', '100%')
    // 最大宽度 100%
    .style('height', 'auto')
    // 高度自适应

  // 边距设置（Tufte 风格：留白适度）
  const margin = { top: 30, right: 30, bottom: 40, left: 40 }
  // 绘图区域宽度
  const plotW = w - margin.left - margin.right
  // 绘图区域高度
  const plotH = h - margin.top - margin.bottom

  // 创建绘图区域组，应用边距变换
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // X 轴比例尺：输入 x₁ 的范围 [-2, 2]
  const xScale = d3.scaleLinear().domain([-2, 2]).range([0, plotW])
  // Y 轴比例尺：输入 x₂ 的范围 [-2, 2]
  const yScale = d3.scaleLinear().domain([-2, 2]).range([plotH, 0])

  // X 轴
  g.append('g')
    .attr('transform', `translate(0,${plotH})`)  // 放在底部
    .call(d3.axisBottom(xScale).ticks(5))        // 调用 D3 轴生成器
    .selectAll('text')                           // 选择所有刻度文字
    .style('font-family', 'var(--font-mono)')    // 等宽字体
    .style('font-size', '10px')                  // 小字号

  // Y 轴
  g.append('g')
    .call(d3.axisLeft(yScale).ticks(5))          // 调用 D3 轴生成器
    .selectAll('text')
    .style('font-family', 'var(--font-mono)')
    .style('font-size', '10px')

  // 生成随机训练数据点（两类数据）
  const points = []
  // 生成 30 个数据点
  for (let i = 0; i < 30; i++) {
    // 随机 x₁ 坐标
    const x1 = (Math.random() - 0.5) * 3
    // 随机 x₂ 坐标
    const x2 = (Math.random() - 0.5) * 3
    // 分类标签：x₁ + x₂ > 0 为类别 1，否则为类别 0
    const label = (x1 + x2 > 0) ? 1 : 0
    // 添加到数据数组
    points.push({ x1, x2, label })
  }

  // 绘制决策边界线：x₁ + x₂ = 0 即 x₂ = -x₁（可通过按钮切换显示/隐藏）
  const boundaryLine = g.append('line')
    .attr('class', 'decision-boundary')
    .attr('x1', xScale(-2))               // 起点 x
    .attr('y1', yScale(2))                // 起点 y
    .attr('x2', xScale(2))                // 终点 x
    .attr('y2', yScale(-2))               // 终点 y
    .attr('stroke', 'var(--accent)')       // 靛青色线条
    .attr('stroke-width', 1.5)             // 线条宽度
    .attr('stroke-dasharray', '6,4')       // 虚线样式
    .attr('opacity', 0.7)                  // 半透明

  // 存储边界引用供按钮控制
  svgContainer.value.__boundaryVisible = true
  svgContainer.value.__boundaryLine = boundaryLine

  // 绘制数据点
  g.selectAll('.point')
    .data(points)                          // 绑定数据
    .enter()                               // 进入选择
    .append('circle')                      // 绘制圆点
    .attr('cx', d => xScale(d.x1))        // x 坐标
    .attr('cy', d => yScale(d.x2))        // y 坐标
    .attr('r', 4)                          // 半径
    .attr('fill', d => d.label === 1 ? 'var(--accent)' : 'var(--rust)')
    // 类别 1 用靛青，类别 0 用锈红
    .attr('stroke', '#fff')                // 白色描边
    .attr('stroke-width', 1)               // 描边宽度
    .attr('opacity', 0)                    // 初始透明
    .transition()                          // 添加过渡动画
    .delay((d, i) => i * 50)               // 每个点延迟 50ms
    .duration(300)                         // 动画持续 300ms
    .attr('opacity', 0.85)                 // 最终不透明度

  // 标题
  svg.append('text')
    .attr('x', w / 2)                      // 水平居中
    .attr('y', 18)                         // 距顶部 18px
    .attr('text-anchor', 'middle')         // 文字居中
    .style('font-family', 'var(--font-serif)')  // 衬线字体
    .style('font-size', '13px')            // 字号
    .style('fill', 'var(--ink-2)')         // 二级墨色
    .text('感知机分类：靛青 vs 锈红')
    // 标题文字

  // 图例
  const legend = svg.append('g')
    .attr('transform', `translate(${w - 120}, ${h - 25})`)
    // 放在右下角

  // 类别 1 图例
  legend.append('circle').attr('r', 4).attr('cx', 0).attr('cy', 0)
    .attr('fill', 'var(--accent)')
  legend.append('text').attr('x', 10).attr('y', 4)
    .style('font-family', 'var(--font-sans)')
    .style('font-size', '11px')
    .style('fill', 'var(--ink-3)')
    .text('类别 1 (y=1)')

  // 类别 0 图例
  legend.append('circle').attr('r', 4).attr('cx', 0).attr('cy', 16)
    .attr('fill', 'var(--rust)')
  legend.append('text').attr('x', 10).attr('y', 20)
    .style('font-family', 'var(--font-sans)')
    .style('font-size', '11px')
    .style('fill', 'var(--ink-3)')
    .text('类别 0 (y=0)')
}

// --- 神经网络结构演示 ---
function renderNeuralNetDemo() {
  controls.value = [
    { type: 'button', label: '重新生成', key: 'regen', action: 'regenerate' }
  ]
  const w = width.value, h = height.value
  // 创建 SVG
  const svg = d3.select(svgContainer.value)
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%')
    .style('height', 'auto')

  // 定义网络结构：每层的节点数
  const layers = [3, 5, 5, 2]
  // 层名称标签
  const layerLabels = ['输入层', '隐藏层 1', '隐藏层 2', '输出层']
  // 每层的水平位置
  const layerX = layers.map((_, i) => 60 + i * ((w - 120) / (layers.length - 1)))

  // 遍历每一层，计算节点的垂直位置
  layers.forEach((count, layerIdx) => {
    // 当前层的所有节点
    const nodes = d3.range(count).map(i => ({
      x: layerX[layerIdx],                              // x 坐标
      y: h / 2 + (i - (count - 1) / 2) * 40            // y 坐标（居中分布）
    }))

    // 如果不是第一层，绘制连接线到上一层
    if (layerIdx > 0) {
      // 上一层的节点
      const prevNodes = d3.range(layers[layerIdx - 1]).map(i => ({
        x: layerX[layerIdx - 1],
        y: h / 2 + (i - (layers[layerIdx - 1] - 1) / 2) * 40
      }))
      // 绘制所有连接线
      prevNodes.forEach(pn => {
        nodes.forEach((n, ni) => {
          svg.append('line')
            .attr('x1', pn.x).attr('y1', pn.y)
            .attr('x2', n.x).attr('y2', n.y)
            .attr('stroke', 'var(--rule)')
            // 暖灰线条
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.6)
        })
      })
    }

    // 绘制节点
    svg.selectAll(null)
      .data(nodes)
      .enter()
      .append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 12)
      .attr('fill', 'var(--paper-card)')
      // 纯白填充
      .attr('stroke', 'var(--accent)')
      // 靛青描边
      .attr('stroke-width', 1.5)
      .attr('opacity', 0)
      // 初始透明
      .transition()
      .delay(layerIdx * 200)
      // 每层延迟 200ms
      .duration(400)
      .attr('opacity', 1)

    // 层标签
    svg.append('text')
      .attr('x', layerX[layerIdx])
      .attr('y', h - 10)
      .attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-sans)')
      .style('font-size', '10px')
      .style('fill', 'var(--ink-3)')
      .text(layerLabels[layerIdx])
  })

  // 标题
  svg.append('text')
    .attr('x', w / 2).attr('y', 18)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)')
    .style('font-size', '13px')
    .style('fill', 'var(--ink-2)')
    .text('多层神经网络结构')
}

// --- 反向传播梯度流动演示 ---
function renderBackpropDemo() {
  controls.value = [
    { type: 'button', label: isRunning.value ? '暂停' : '播放', key: 'toggle', action: 'toggle' }
  ]
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg')
    .attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  // 三层网络节点位置
  const nodes = [
    // 输入层
    [{ x: 80, y: 80 }, { x: 80, y: 150 }, { x: 80, y: 220 }],
    // 隐藏层
    [{ x: 280, y: 100 }, { x: 280, y: 200 }],
    // 输出层
    [{ x: 480, y: 150 }]
  ]

  // 层标签
  const layerNames = ['输入', '隐藏', '输出']

  // 绘制连接线（前向：从左到右）
  nodes.forEach((layer, li) => {
    if (li < nodes.length - 1) {
      // 当前层与下一层之间的连接
      layer.forEach(from => {
        nodes[li + 1].forEach(to => {
          svg.append('line')
            .attr('x1', from.x).attr('y1', from.y)
            .attr('x2', to.x).attr('y2', to.y)
            .attr('stroke', 'var(--rule-soft)')
            .attr('stroke-width', 1)
        })
      })
    }
  })

  // 绘制反向传播箭头（从右到左的红色虚线）
  const arrowLine = svg.append('line')
    .attr('x1', 480).attr('y1', 150)
    .attr('x2', 480).attr('y2', 150)
    .attr('stroke', 'var(--rust)')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '8,4')

  // 反向传播文字标签
  const backLabel = svg.append('text')
    .attr('x', 280).attr('y', 60)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)')
    .style('font-size', '12px')
    .style('fill', 'var(--rust)')
    .style('font-weight', '600')
    .text('← 梯度反向传播')
    .attr('opacity', 0)

  // 绘制节点（带脉冲动画）
  nodes.forEach((layer, li) => {
    layer.forEach((node, ni) => {
      svg.append('circle')
        .attr('cx', node.x).attr('cy', node.y)
        .attr('r', 14)
        .attr('fill', 'var(--paper-card)')
        .attr('stroke', 'var(--accent)')
        .attr('stroke-width', 1.5)

      // 层标签
      if (ni === 0) {
        svg.append('text')
          .attr('x', node.x).attr('y', h - 15)
          .attr('text-anchor', 'middle')
          .style('font-family', 'var(--font-sans)')
          .style('font-size', '10px')
          .style('fill', 'var(--ink-3)')
          .text(layerNames[li])
      }
    })
  })

  // 动画：梯度从右向左流动（使用 requestAnimationFrame 替代 setInterval）
  let animStep = 0
  let animFrame = null
  let lastAnimTime = 0
  const animInterval = 1500

  function animLoop(timestamp) {
    if (!isRunning.value) return
    if (timestamp - lastAnimTime >= animInterval) {
      animStep++
      // 交替显示前向和反向
      if (animStep % 2 === 1) {
        // 显示反向传播箭头（平滑过渡）
        arrowLine.transition().duration(800).ease(d3.easeCubicOut)
          .attr('x2', 80)
        backLabel.transition().duration(300).attr('opacity', 1)
      } else {
        // 隐藏反向箭头
        arrowLine.transition().duration(600).ease(d3.easeCubicOut)
          .attr('x2', 480)
        backLabel.transition().duration(300).attr('opacity', 0)
      }
      lastAnimTime = timestamp
    }
    animFrame = requestAnimationFrame(animLoop)
  }

  // 存储动画控制
  isRunning.value = true
  animFrame = requestAnimationFrame(animLoop)
  // 存储 rAF handle 供 stopAnimation 清理
  svgContainer.value.__backpropRAF = animFrame

  // 标题
  svg.append('text')
    .attr('x', w / 2).attr('y', 18)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)')
    .style('font-size', '13px')
    .style('fill', 'var(--ink-2)')
    .text('误差反向传播：梯度逐层回传')
}

// --- 训练过程演示（损失曲线下降，带学习率滑块）---
function renderTrainingDemo() {
  const w = width.value, h = height.value
  controls.value = [
    { type: 'button', label: '重新训练', key: 'retrain', action: 'regenerate' },
    { type: 'slider', label: '学习率', key: 'lr', min: 0.01, max: 0.3, step: 0.01, value: 0.08 }
  ]
  renderTrainingWithParams(0.08)
}

// 根据学习率参数渲染训练演示
function renderTrainingWithParams(lr) {
  clearSvg()
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg')
    .attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  const margin = { top: 30, right: 30, bottom: 40, left: 50 }
  const plotW = w - margin.left - margin.right
  const plotH = h - margin.top - margin.bottom
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // 模拟损失下降数据（学习率越大下降越快但可能震荡）
  const baseDecay = lr * 5  // 学习率影响衰减速度
  const noise = lr * 1.5    // 大学习率带来更多噪声
  const data = d3.range(50).map(i => ({
    epoch: i,
    loss: 2 * Math.exp(-i * baseDecay) + 0.1 + Math.random() * noise
  }))

  // X 轴：训练轮次
  const xScale = d3.scaleLinear().domain([0, 49]).range([0, plotW])
  // Y 轴：损失值
  const yScale = d3.scaleLinear().domain([0, 2.2]).range([plotH, 0])

  // X 轴
  g.append('g')
    .attr('transform', `translate(0,${plotH})`)
    .call(d3.axisBottom(xScale).ticks(5))
    .selectAll('text')
    .style('font-family', 'var(--font-mono)')
    .style('font-size', '10px')

  // Y 轴
  g.append('g')
    .call(d3.axisLeft(yScale).ticks(5))
    .selectAll('text')
    .style('font-family', 'var(--font-mono)')
    .style('font-size', '10px')

  // 轴标签
  g.append('text')
    .attr('x', plotW / 2).attr('y', plotH + 35)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)')
    .style('font-size', '11px')
    .style('fill', 'var(--ink-3)')
    .text('训练轮次 (Epoch)')

  g.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -plotH / 2).attr('y', -35)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)')
    .style('font-size', '11px')
    .style('fill', 'var(--ink-3)')
    .text('损失 (Loss)')

  // 损失曲线路径生成器
  const line = d3.line()
    .x(d => xScale(d.epoch))
    .y(d => yScale(d.loss))
    .curve(d3.curveMonotoneX)
    // 平滑曲线

  // 绘制损失曲线（带逐步动画，使用 easeCubicOut 缓动）
  const path = g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', 'var(--accent)')
    .attr('stroke-width', 2)
    .attr('d', line)

  // 获取路径总长度
  const totalLength = path.node().getTotalLength()
  // 设置初始状态：路径完全隐藏
  path.attr('stroke-dasharray', totalLength)
    .attr('stroke-dashoffset', totalLength)
    // 逐步显示动画（使用 easeCubicOut 缓动）
    .transition()
    .duration(2500)
    .ease(d3.easeCubicOut)
    .attr('stroke-dashoffset', 0)

  // 标题（显示当前学习率）
  svg.append('text')
    .attr('x', w / 2).attr('y', 18)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)')
    .style('font-size', '13px')
    .style('fill', 'var(--ink-2)')
    .text(`训练损失曲线：lr=${lr.toFixed(2)}，逐步下降收敛`)
}

// --- CNN 卷积操作演示 ---
function renderCNNDemo() {
  controls.value = [
    { type: 'button', label: '重新生成', key: 'regen', action: 'regenerate' }
  ]
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg')
    .attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  // 输入特征图（5×5 网格）
  const gridSize = 5
  const cellSize = 32
  const startX = 40
  const startY = 50

  // 生成随机输入值
  const gridData = d3.range(gridSize).flatMap(row =>
    d3.range(gridSize).map(col => ({
      row, col,
      val: Math.round(Math.random() * 10)
    }))
  )

  // 绘制输入网格
  const gridGroup = svg.append('g')
  gridData.forEach(d => {
    gridGroup.append('rect')
      .attr('x', startX + d.col * cellSize)
      .attr('y', startY + d.row * cellSize)
      .attr('width', cellSize - 1)
      .attr('height', cellSize - 1)
      .attr('fill', 'var(--paper-card)')
      .attr('stroke', 'var(--rule)')
      .attr('stroke-width', 0.5)

    gridGroup.append('text')
      .attr('x', startX + d.col * cellSize + cellSize / 2)
      .attr('y', startY + d.row * cellSize + cellSize / 2 + 4)
      .attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-mono)')
      .style('font-size', '10px')
      .style('fill', 'var(--ink-2)')
      .text(d.val)
  })

  // 3×3 卷积核（高亮区域）
  const kernelGroup = svg.append('g')
  const kernelStartRow = 1, kernelStartCol = 1
  // 卷积核位置指示
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      kernelGroup.append('rect')
        .attr('x', startX + (kernelStartCol + c) * cellSize)
        .attr('y', startY + (kernelStartRow + r) * cellSize)
        .attr('width', cellSize - 1)
        .attr('height', cellSize - 1)
        .attr('fill', 'var(--accent-soft)')
        .attr('stroke', 'var(--accent)')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.6)
    }
  }

  // 箭头指向输出
  svg.append('text')
    .attr('x', startX + gridSize * cellSize + 30)
    .attr('y', startY + gridSize * cellSize / 2)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)')
    .style('font-size', '18px')
    .style('fill', 'var(--ink-3)')
    .text('→')

  // 输出特征图（3×3）
  const outStartX = startX + gridSize * cellSize + 60
  const outSize = 3
  for (let r = 0; r < outSize; r++) {
    for (let c = 0; c < outSize; c++) {
      svg.append('rect')
        .attr('x', outStartX + c * cellSize)
        .attr('y', startY + 32 + r * cellSize)
        .attr('width', cellSize - 1)
        .attr('height', cellSize - 1)
        .attr('fill', 'var(--accent-soft)')
        .attr('stroke', 'var(--accent)')
        .attr('stroke-width', 1)
    }
  }

  // 标签
  svg.append('text')
    .attr('x', startX + gridSize * cellSize / 2).attr('y', h - 12)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)')
    .style('font-size', '10px')
    .style('fill', 'var(--ink-3)')
    .text('输入 5×5')

  svg.append('text')
    .attr('x', outStartX + outSize * cellSize / 2).attr('y', h - 12)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)')
    .style('font-size', '10px')
    .style('fill', 'var(--ink-3)')
    .text('输出 3×3')

  // 标题
  svg.append('text')
    .attr('x', w / 2).attr('y', 18)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)')
    .style('font-size', '13px')
    .style('fill', 'var(--ink-2)')
    .text('卷积操作：3×3 卷积核滑动提取特征')
}

// --- 优化器对比演示（带学习率滑块）---
function renderOptimizerDemo() {
  const w = width.value, h = height.value
  // 清除旧控件
  controls.value = [
    { type: 'slider', label: '学习率', key: 'lr', min: 0.01, max: 0.5, step: 0.01, value: 0.1 }
  ]
  renderOptimizerWithParams(0.1)
}

// 根据参数渲染优化器演示
function renderOptimizerWithParams(lr) {
  clearSvg()
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg').attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  const margin = { top: 35, right: 30, bottom: 40, left: 50 }
  const pw = w - margin.left - margin.right
  const ph = h - margin.top - margin.bottom
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

  // 损失函数：f(x) = x² + 0.5*sin(3x)（有多个局部最小值）
  const lossFn = x => x * x + 0.5 * Math.sin(3 * x)
  const gradFn = x => 2 * x + 1.5 * Math.cos(3 * x)

  const xScale = d3.scaleLinear().domain([-3, 3]).range([0, pw])
  const yScale = d3.scaleLinear().domain([0, 10]).range([ph, 0])

  // 绘制损失函数曲线
  const curveData = d3.range(-3, 3.01, 0.05).map(x => ({ x, y: lossFn(x) }))
  const line = d3.line().x(d => xScale(d.x)).y(d => yScale(d.y)).curve(d3.curveMonotoneX)
  g.append('path').datum(curveData).attr('fill', 'none')
    .attr('stroke', 'var(--rule)').attr('stroke-width', 1.5).attr('d', line)

  // 坐标轴
  g.append('g').attr('transform', `translate(0,${ph})`)
    .call(d3.axisBottom(xScale).ticks(6))
    .selectAll('text').style('font-family', 'var(--font-mono)').style('font-size', '9px')
  g.append('g').call(d3.axisLeft(yScale).ticks(5))
    .selectAll('text').style('font-family', 'var(--font-mono)').style('font-size', '9px')

  // 三种优化器的轨迹
  const optimizers = [
    { name: 'SGD', color: 'var(--rust)', mu: 0 },
    { name: 'Momentum', color: 'var(--ochre)', mu: 0.9 },
    { name: 'Adam', color: 'var(--accent)', mu: 0.9 }
  ]

  optimizers.forEach(opt => {
    let x = -2.5, v = 0, m = 0, step = 0
    const beta1 = 0.9, beta2 = 0.999, eps = 1e-8
    const points = [{ x, y: lossFn(x) }]

    for (let i = 0; i < 30; i++) {
      const grad = gradFn(x)
      if (opt.name === 'SGD') {
        x = x - lr * grad
      } else if (opt.name === 'Momentum') {
        v = opt.mu * v - lr * grad
        x = x + v
      } else {
        step++
        m = beta1 * m + (1 - beta1) * grad
        const vAdam = beta2 * v + (1 - beta2) * grad * grad
        v = vAdam
        const mHat = m / (1 - Math.pow(beta1, step))
        const vHat = vAdam / (1 - Math.pow(beta2, step))
        x = x - lr * mHat / (Math.sqrt(vHat) + eps)
      }
      x = Math.max(-3, Math.min(3, x))
      points.push({ x, y: lossFn(x) })
    }

    // 绘制轨迹点和连线
    const trajLine = d3.line().x(d => xScale(d.x)).y(d => yScale(d.y))
    g.append('path').datum(points).attr('fill', 'none')
      .attr('stroke', opt.color).attr('stroke-width', 1.5).attr('stroke-dasharray', '4,2').attr('d', trajLine)

    g.selectAll(null).data(points).enter().append('circle')
      .attr('cx', d => xScale(d.x)).attr('cy', d => yScale(d.y))
      .attr('r', 3).attr('fill', opt.color).attr('stroke', '#fff').attr('stroke-width', 0.5)

    // 起点标记
    g.append('circle').attr('cx', xScale(points[0].x)).attr('cy', yScale(points[0].y))
      .attr('r', 5).attr('fill', opt.color).attr('stroke', '#fff').attr('stroke-width', 1.5)
  })

  // 图例
  optimizers.forEach((opt, i) => {
    const lg = svg.append('g').attr('transform', `translate(${w - 120}, ${35 + i * 18})`)
    lg.append('line').attr('x1', 0).attr('y1', 0).attr('x2', 16).attr('y2', 0)
      .attr('stroke', opt.color).attr('stroke-width', 2).attr('stroke-dasharray', '4,2')
    lg.append('text').attr('x', 22).attr('y', 4)
      .style('font-family', 'var(--font-sans)').style('font-size', '11px').style('fill', 'var(--ink-2)')
      .text(opt.name)
  })

  svg.append('text').attr('x', w / 2).attr('y', 18).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '13px').style('fill', 'var(--ink-2)')
    .text('优化器对比：调整学习率观察收敛差异')
}

// --- Word2Vec 词向量演示（2D 散点图，带语义连线）---
function renderWord2VecDemo() {
  controls.value = [
    { type: 'button', label: '重新布局', key: 'relayout', action: 'regenerate' },
    { type: 'button', label: '隐藏语义连线', key: 'connections', action: 'connections' }
  ]
  clearSvg()
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg').attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  // 模拟词向量数据（语义相近的词聚在一起）
  const words = [
    { word: '国王', x: 0.8, y: 0.7, group: 'royalty' },
    { word: '王后', x: 0.75, y: 0.65, group: 'royalty' },
    { word: '王子', x: 0.82, y: 0.72, group: 'royalty' },
    { word: '男人', x: 0.3, y: 0.6, group: 'gender' },
    { word: '女人', x: 0.25, y: 0.55, group: 'gender' },
    { word: '男孩', x: 0.32, y: 0.62, group: 'gender' },
    { word: '女孩', x: 0.27, y: 0.57, group: 'gender' },
    { word: '巴黎', x: 0.6, y: 0.2, group: 'city' },
    { word: '法国', x: 0.55, y: 0.25, group: 'country' },
    { word: '东京', x: 0.62, y: 0.15, group: 'city' },
    { word: '日本', x: 0.57, y: 0.2, group: 'country' },
    { word: '北京', x: 0.64, y: 0.18, group: 'city' },
    { word: '中国', x: 0.59, y: 0.23, group: 'country' },
    { word: '猫', x: 0.15, y: 0.85, group: 'animal' },
    { word: '狗', x: 0.18, y: 0.82, group: 'animal' },
    { word: '鱼', x: 0.12, y: 0.88, group: 'animal' }
  ]

  const margin = { top: 30, right: 20, bottom: 20, left: 20 }
  const xScale = d3.scaleLinear().domain([0, 1]).range([margin.left, w - margin.right])
  const yScale = d3.scaleLinear().domain([0, 1]).range([h - margin.bottom, margin.top])

  const colors = { royalty: 'var(--accent)', gender: 'var(--ochre)', city: 'var(--rust)', country: 'var(--book2-color)', animal: 'var(--book3-color)' }

  // 绘制语义相近词之间的连线（初始显示）
  const connectionGroup = svg.append('g').attr('class', 'word-connections')
  const groups = {}
  words.forEach(w => {
    if (!groups[w.group]) groups[w.group] = []
    groups[w.group].push(w)
  })
  // 对每个语义组内的词两两连线
  Object.values(groups).forEach(groupWords => {
    for (let i = 0; i < groupWords.length; i++) {
      for (let j = i + 1; j < groupWords.length; j++) {
        const a = groupWords[i], b = groupWords[j]
        connectionGroup.append('line')
          .attr('x1', xScale(a.x)).attr('y1', yScale(a.y))
          .attr('x2', xScale(b.x)).attr('y2', yScale(b.y))
          .attr('stroke', colors[a.group] || 'var(--ink-3)')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3')
          .attr('opacity', 0.4)
      }
    }
  })

  // 存储连线引用供按钮控制
  svgContainer.value.__connectionsVisible = true
  svgContainer.value.__connectionGroup = connectionGroup

  // 绘制词向量点
  const dots = g => {
    g.append('circle').attr('r', 5)
      .attr('fill', d => colors[d.group] || 'var(--ink-3)')
      .attr('stroke', '#fff').attr('stroke-width', 1)
    g.append('text').attr('x', 0).attr('y', -10).attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-sans)').style('font-size', '11px').style('fill', 'var(--ink-2)')
      .text(d => d.word)
  }

  svg.selectAll('.word-dot').data(words).enter().append('g')
    .attr('class', 'word-dot')
    .attr('transform', d => `translate(${xScale(d.x)},${yScale(d.y)})`)
    .call(dots)

  // 图例
  const legendData = [
    { label: '皇室', color: colors.royalty },
    { label: '性别', color: colors.gender },
    { label: '城市', color: colors.city },
    { label: '国家', color: colors.country },
    { label: '动物', color: colors.animal }
  ]
  legendData.forEach((lg, i) => {
    const g = svg.append('g').attr('transform', `translate(${w - 80}, ${30 + i * 16})`)
    g.append('circle').attr('r', 4).attr('fill', lg.color)
    g.append('text').attr('x', 12).attr('y', 4)
      .style('font-family', 'var(--font-sans)').style('font-size', '10px').style('fill', 'var(--ink-3)').text(lg.label)
  })

  svg.append('text').attr('x', w / 2).attr('y', 16).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '13px').style('fill', 'var(--ink-2)')
    .text('Word2Vec：语义相近的词在向量空间中距离也近')
}

// --- Attention 注意力权重热力图 ---
function renderAttentionDemo() {
  controls.value = [
    { type: 'button', label: '重新生成', key: 'regen', action: 'regenerate' }
  ]
  clearSvg()
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg').attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  // 源语言和目标语言词序列
  const src = ['我', '喜欢', '深度', '学习']
  const tgt = ['I', 'like', 'deep', 'learning']
  const cellSize = 40
  const startX = 70, startY = 60

  // 模拟注意力权重矩阵
  const weights = [
    [0.7, 0.1, 0.1, 0.1],  // I → 我
    [0.1, 0.6, 0.2, 0.1],  // like → 喜欢
    [0.1, 0.1, 0.5, 0.3],  // deep → 深度
    [0.1, 0.1, 0.2, 0.6]   // learning → 学习
  ]

  // 颜色比例尺
  const colorScale = d3.scaleLinear().domain([0, 0.7])
    .range(['var(--paper-card)', 'var(--accent)'])

  // 绘制热力图
  for (let r = 0; r < tgt.length; r++) {
    for (let c = 0; c < src.length; c++) {
      svg.append('rect')
        .attr('x', startX + c * cellSize).attr('y', startY + r * cellSize)
        .attr('width', cellSize - 2).attr('height', cellSize - 2)
        .attr('fill', colorScale(weights[r][c]))
        .attr('stroke', 'var(--rule)').attr('stroke-width', 0.5)
        .attr('rx', 2)
      svg.append('text')
        .attr('x', startX + c * cellSize + cellSize / 2)
        .attr('y', startY + r * cellSize + cellSize / 2 + 4)
        .attr('text-anchor', 'middle')
        .style('font-family', 'var(--font-mono)').style('font-size', '10px')
        .style('fill', weights[r][c] > 0.4 ? '#fff' : 'var(--ink-2)')
        .text(weights[r][c].toFixed(1))
    }
  }

  // 源语言标签（底部）
  src.forEach((word, i) => {
    svg.append('text')
      .attr('x', startX + i * cellSize + cellSize / 2)
      .attr('y', startY + tgt.length * cellSize + 18)
      .attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-sans)').style('font-size', '11px').style('fill', 'var(--ink-2)')
      .text(word)
  })

  // 目标语言标签（左侧）
  tgt.forEach((word, i) => {
    svg.append('text')
      .attr('x', startX - 10)
      .attr('y', startY + i * cellSize + cellSize / 2 + 4)
      .attr('text-anchor', 'end')
      .style('font-family', 'var(--font-sans)').style('font-size', '11px').style('fill', 'var(--ink-2)')
      .text(word)
  })

  // 轴标签
  svg.append('text').attr('x', startX + src.length * cellSize / 2).attr('y', startY - 15)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)').style('font-size', '10px').style('fill', 'var(--ink-3)')
    .text('← 源语言（中文）')

  svg.append('text').attr('transform', `rotate(-90)`)
    .attr('x', -(startY + tgt.length * cellSize / 2)).attr('y', 18)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)').style('font-size', '10px').style('fill', 'var(--ink-3)')
    .text('目标语言（英文）→')

  svg.append('text').attr('x', w / 2).attr('y', 18).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '13px').style('fill', 'var(--ink-2)')
    .text('Attention 权重：每个目标词关注源词的分布')
}

// --- Q-Learning 网格世界演示（带探索率滑块）---
function renderQLearningDemo() {
  const w = width.value, h = height.value
  controls.value = [
    { type: 'slider', label: '探索率 ε', key: 'epsilon', min: 0, max: 1, step: 0.05, value: 0.3 }
  ]
  renderQLearningWithParams(0.3)
}

function renderQLearningWithParams(epsilon) {
  clearSvg()
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg').attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  // 4×4 网格世界
  const gridSize = 4
  const cellSize = 50
  const startX = (w - gridSize * cellSize) / 2
  const startY = 50

  // Q 表（每个格子的最优动作价值）
  const qTable = d3.range(gridSize).map(() => d3.range(gridSize).map(() => 0))
  // 目标位置
  const goal = { r: 3, c: 3 }
  // 障碍物
  const walls = [{ r: 1, c: 1 }, { r: 2, c: 1 }]

  // 绘制网格
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const isGoal = r === goal.r && c === goal.c
      const isWall = walls.some(w => w.r === r && w.c === c)
      svg.append('rect')
        .attr('x', startX + c * cellSize).attr('y', startY + r * cellSize)
        .attr('width', cellSize - 2).attr('height', cellSize - 2)
        .attr('fill', isGoal ? 'var(--accent-soft)' : isWall ? 'var(--rule)' : 'var(--paper-card)')
        .attr('stroke', 'var(--rule)').attr('stroke-width', 1).attr('rx', 3)

      if (isGoal) {
        svg.append('text')
          .attr('x', startX + c * cellSize + cellSize / 2)
          .attr('y', startY + r * cellSize + cellSize / 2 + 5)
          .attr('text-anchor', 'middle')
          .style('font-size', '18px').text('🎯')
      }
      if (isWall) {
        svg.append('text')
          .attr('x', startX + c * cellSize + cellSize / 2)
          .attr('y', startY + r * cellSize + cellSize / 2 + 5)
          .attr('text-anchor', 'middle')
          .style('font-size', '16px').text('🧱')
      }
    }
  }

  // 网格标签
  svg.append('text').attr('x', w / 2).attr('y', 18).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '13px').style('fill', 'var(--ink-2)')
    .text('Q-Learning 网格世界：调整探索率观察学习策略')

  // 说明文字
  svg.append('text').attr('x', w / 2).attr('y', startY + gridSize * cellSize + 25)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)').style('font-size', '11px').style('fill', 'var(--ink-3)')
    .text(`ε = ${epsilon.toFixed(2)}：${epsilon > 0.5 ? '偏探索，路径不稳定' : epsilon < 0.1 ? '偏利用，路径最优' : '探索与利用平衡'}`)

  // 最优路径箭头（根据 Q 值推导）
  const policy = [
    ['→', '→', '→', '↓'],
    ['↑', '🧱', '→', '↓'],
    ['→', '🧱', '→', '↓'],
    ['→', '→', '→', '🎯']
  ]

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (walls.some(w => w.r === r && w.c === c)) continue
      if (r === goal.r && c === goal.c) continue
      svg.append('text')
        .attr('x', startX + c * cellSize + cellSize / 2)
        .attr('y', startY + r * cellSize + cellSize / 2 + 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px').style('fill', 'var(--accent)')
        .text(policy[r][c])
    }
  }
}

// --- RNN 序列处理演示 ---
function renderRNNDemo() {
  controls.value = [
    { type: 'button', label: isRunning.value ? '暂停' : '播放', key: 'toggle', action: 'toggle' }
  ]
  clearSvg()
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg').attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  // 输入序列
  const seq = ['我', '喜欢', '深度', '学习']
  const cellW = 80, cellH = 50
  const startX = 40, startY = 100

  seq.forEach((word, i) => {
    const x = startX + i * (cellW + 20)
    // RNN 单元
    svg.append('rect').attr('x', x).attr('y', startY)
      .attr('width', cellW).attr('height', cellH)
      .attr('fill', 'var(--paper-card)').attr('stroke', 'var(--accent)').attr('stroke-width', 1.5).attr('rx', 6)
    svg.append('text').attr('x', x + cellW / 2).attr('y', startY + cellH / 2 + 5)
      .attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-mono)').style('font-size', '11px').style('fill', 'var(--accent)')
      .text(`h${i + 1}`)

    // 输入标签
    svg.append('text').attr('x', x + cellW / 2).attr('y', startY + cellH + 20)
      .attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-sans)').style('font-size', '11px').style('fill', 'var(--ink-2)')
      .text(word)

    // 输入箭头
    svg.append('line').attr('x1', x + cellW / 2).attr('y1', startY + cellH + 5)
      .attr('x2', x + cellW / 2).attr('y2', startY + cellH)
      .attr('stroke', 'var(--rule)').attr('stroke-width', 1).attr('marker-end', 'url(#arrow)')

    // 隐藏状态传递箭头
    if (i > 0) {
      svg.append('line').attr('x1', x - 20).attr('y1', startY + cellH / 2)
        .attr('x2', x).attr('y2', startY + cellH / 2)
        .attr('stroke', 'var(--rust)').attr('stroke-width', 1.5)
        .attr('stroke-dasharray', '4,2')
    }

    // 时间步标签
    svg.append('text').attr('x', x + cellW / 2).attr('y', startY - 15)
      .attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-mono)').style('font-size', '10px').style('fill', 'var(--ink-3)')
      .text(`t=${i + 1}`)
  })

  // 标题
  svg.append('text').attr('x', w / 2).attr('y', 18).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '13px').style('fill', 'var(--ink-2)')
    .text('RNN：隐藏状态逐时间步传递（虚线箭头）')

  // 图例
  svg.append('line').attr('x1', startX).attr('y1', h - 25).attr('x2', startX + 30).attr('y2', h - 25)
    .attr('stroke', 'var(--rust)').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,2')
  svg.append('text').attr('x', startX + 35).attr('y', h - 21)
    .style('font-family', 'var(--font-sans)').style('font-size', '10px').style('fill', 'var(--ink-3)')
    .text('隐藏状态 hₜ 传递')
}

// --- LSTM 门控机制演示 ---
function renderLSTMDemo() {
  const w = width.value, h = height.value
  controls.value = [
    { type: 'slider', label: '遗忘门', key: 'forget', min: 0, max: 1, step: 0.05, value: 0.8 },
    { type: 'slider', label: '输入门', key: 'input', min: 0, max: 1, step: 0.05, value: 0.6 }
  ]
  renderLSTMWithParams(0.8, 0.6)
}

function renderLSTMWithParams(forgetGate, inputGate) {
  clearSvg()
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg').attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  const gates = [
    { name: '遗忘门', value: forgetGate, color: 'var(--rust)', desc: `保留 ${(forgetGate * 100).toFixed(0)}% 旧记忆` },
    { name: '输入门', value: inputGate, color: 'var(--accent)', desc: `写入 ${(inputGate * 100).toFixed(0)}% 新信息` },
    { name: '输出门', value: 0.7, color: 'var(--book2-color)', desc: '输出 70% 细胞状态' }
  ]

  const barW = 200, barH = 28
  const startX = 60, startY = 55

  gates.forEach((gate, i) => {
    const y = startY + i * (barH + 30)
    // 门名称
    svg.append('text').attr('x', startX).attr('y', y + barH / 2 + 4)
      .style('font-family', 'var(--font-sans)').style('font-size', '12px')
      .style('font-weight', '600').style('fill', 'var(--ink-2)')
      .text(gate.name)

    // 背景条
    svg.append('rect').attr('x', startX + 60).attr('y', y)
      .attr('width', barW).attr('height', barH)
      .attr('fill', 'var(--rule-soft)').attr('rx', 4)

    // 填充条
    svg.append('rect').attr('x', startX + 60).attr('y', y)
      .attr('width', barW * gate.value).attr('height', barH)
      .attr('fill', gate.color).attr('opacity', 0.7).attr('rx', 4)

    // 数值标签
    svg.append('text').attr('x', startX + 65 + barW * gate.value).attr('y', y + barH / 2 + 4)
      .style('font-family', 'var(--font-mono)').style('font-size', '11px').style('fill', 'var(--ink)')
      .text(gate.value.toFixed(2))

    // 描述
    svg.append('text').attr('x', startX + 60).attr('y', y + barH + 14)
      .style('font-family', 'var(--font-sans)').style('font-size', '10px').style('fill', 'var(--ink-3)')
      .text(gate.desc)
  })

  // 细胞状态计算
  const cellState = forgetGate * 0.8 + inputGate * 0.6
  svg.append('text').attr('x', w / 2).attr('y', startY + 3 * (barH + 30) + 10)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '12px').style('fill', 'var(--ink)')
    .text(`细胞状态 = 遗忘(${forgetGate.toFixed(2)}) × 旧记忆 + 输入(${inputGate.toFixed(2)}) × 新信息`)

  svg.append('text').attr('x', w / 2).attr('y', startY + 3 * (barH + 30) + 30)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-mono)').style('font-size', '13px').style('font-weight', '700')
    .style('fill', 'var(--accent)')
    .text(`= ${cellState.toFixed(2)}`)

  svg.append('text').attr('x', w / 2).attr('y', 18).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '13px').style('fill', 'var(--ink-2)')
    .text('LSTM 门控机制：调整滑块观察细胞状态变化')
}

// --- 计算图演示（带逐步前向传播动画）---
function renderCompGraphDemo() {
  controls.value = [
    { type: 'button', label: '播放前向传播', key: 'forward', action: 'toggle' }
  ]
  clearSvg()
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg').attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  // 计算图：y = (x1 * x2) + x3
  const nodes = [
    { id: 'x1', label: 'x₁=2', x: 60, y: 80, type: 'input' },
    { id: 'x2', label: 'x₂=3', x: 60, y: 200, type: 'input' },
    { id: 'x3', label: 'x₃=4', x: 60, y: 280, type: 'input' },
    { id: 'mul', label: '×', x: 220, y: 140, type: 'op' },
    { id: 'add', label: '+', x: 380, y: 180, type: 'op' },
    { id: 'y', label: 'y=10', x: 500, y: 180, type: 'output' }
  ]
  // 前向传播顺序（按拓扑排序）
  const forwardOrder = ['x1', 'x2', 'x3', 'mul', 'add', 'y']
  const edges = [
    { from: 'x1', to: 'mul' }, { from: 'x2', to: 'mul' },
    { from: 'mul', to: 'add' }, { from: 'x3', to: 'add' },
    { from: 'add', to: 'y' }
  ]

  const nodeMap = {}
  nodes.forEach(n => nodeMap[n.id] = n)

  // 绘制边
  const edgeEls = {}
  edges.forEach(e => {
    const from = nodeMap[e.from], to = nodeMap[e.to]
    edgeEls[e.from + '-' + e.to] = svg.append('line')
      .attr('x1', from.x).attr('y1', from.y)
      .attr('x2', to.x).attr('y2', to.y)
      .attr('stroke', 'var(--rule)').attr('stroke-width', 1.5)
      .attr('opacity', 0.4)
  })

  // 绘制节点
  const nodeEls = {}
  nodes.forEach(n => {
    const r = n.type === 'op' ? 20 : 14
    const g = svg.append('g')
    g.append('circle').attr('cx', n.x).attr('cy', n.y).attr('r', r)
      .attr('fill', n.type === 'op' ? 'var(--accent-soft)' : 'var(--paper-card)')
      .attr('stroke', n.type === 'output' ? 'var(--rust)' : 'var(--accent)')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.4)
    g.append('text').attr('x', n.x).attr('y', n.y + 4)
      .attr('text-anchor', 'middle')
      .style('font-family', n.type === 'op' ? 'var(--font-serif)' : 'var(--font-mono)')
      .style('font-size', n.type === 'op' ? '16px' : '11px')
      .style('font-weight', n.type === 'op' ? '700' : '400')
      .style('fill', 'var(--ink)')
      .attr('opacity', 0.4)
    nodeEls[n.id] = g
  })

  // 梯度标注（初始隐藏）
  const grads = [
    { x: 140, y: 105, text: '∂y/∂x₁=3' },
    { x: 140, y: 175, text: '∂y/∂x₂=2' },
    { x: 300, y: 230, text: '∂y/∂x₃=1' }
  ]
  const gradEls = grads.map(g => {
    return svg.append('text').attr('x', g.x).attr('y', g.y)
      .style('font-family', 'var(--font-mono)').style('font-size', '9px').style('fill', 'var(--rust)')
      .text(g.text).attr('opacity', 0)
  })

  // 状态：当前已点亮到哪一步
  let currentStep = -1

  // 点亮一个节点及其入边
  function activateNode(nodeId) {
    const el = nodeEls[nodeId]
    if (!el) return
    el.selectAll('*').transition().duration(400).ease(d3.easeCubicOut).attr('opacity', 1)
    // 点亮入边
    edges.filter(e => e.to === nodeId).forEach(e => {
      const edgeEl = edgeEls[e.from + '-' + e.to]
      if (edgeEl) edgeEl.transition().duration(400).ease(d3.easeCubicOut)
        .attr('stroke', 'var(--accent)').attr('opacity', 1).attr('stroke-width', 2)
    })
  }

  // 前向传播一步动画
  function stepForward() {
    currentStep++
    if (currentStep >= forwardOrder.length) {
      currentStep = forwardOrder.length - 1
      // 显示梯度
      gradEls.forEach(el => el.transition().duration(500).attr('opacity', 1))
      isRunning.value = false
      const ctrl = controls.value.find(c => c.key === 'forward')
      if (ctrl) ctrl.label = '重播前向传播'
      return
    }
    activateNode(forwardOrder[currentStep])
  }

  // 动画循环（使用 requestAnimationFrame）
  let animFrame = null
  let lastStepTime = 0
  const stepInterval = 800 // 每步间隔 800ms

  function animLoop(timestamp) {
    if (!isRunning.value) return
    if (timestamp - lastStepTime >= stepInterval) {
      stepForward()
      lastStepTime = timestamp
      if (currentStep >= forwardOrder.length - 1) return
    }
    animFrame = requestAnimationFrame(animLoop)
  }

  // 覆盖 toggle 行为：播放前向传播动画
  const originalOnButtonClick = window.__compGraphClickHandler

  svg.append('text').attr('x', w / 2).attr('y', 18).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '13px').style('fill', 'var(--ink-2)')
    .text('计算图：y = (x₁ × x₂) + x₃，逐步前向传播')

  // 存储动画控制函数供 toggle 调用
  svgContainer.value.__compGraphPlay = function() {
    // 重置所有节点
    currentStep = -1
    Object.values(nodeEls).forEach(g => g.selectAll('*').transition().duration(200).attr('opacity', 0.4))
    Object.values(edgeEls).forEach(el => el.transition().duration(200)
      .attr('stroke', 'var(--rule)').attr('opacity', 0.4).attr('stroke-width', 1.5))
    gradEls.forEach(el => el.attr('opacity', 0))
    isRunning.value = true
    lastStepTime = 0
    animFrame = requestAnimationFrame(animLoop)
  }
  svgContainer.value.__compGraphStop = function() {
    isRunning.value = false
    if (animFrame) cancelAnimationFrame(animFrame)
  }
}

// --- 自动微分演示（带逐步动画）---
function renderAutogradDemo() {
  controls.value = [
    { type: 'button', label: '播放动画', key: 'autograd', action: 'toggle' }
  ]
  clearSvg()
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg').attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  // 自动微分步骤展示
  const steps = [
    { op: '前向', formula: 'z = x × y', result: 'z = 2 × 3 = 6', color: 'var(--accent)' },
    { op: '局部梯度', formula: '∂z/∂x = y = 3', result: '∂z/∂y = x = 2', color: 'var(--ochre)' },
    { op: '反向', formula: '∂L/∂x = ∂L/∂z × 3', result: '∂L/∂y = ∂L/∂z × 2', color: 'var(--rust)' }
  ]

  const stepEls = []
  steps.forEach((step, i) => {
    const y = 50 + i * 75
    const g = svg.append('g').attr('opacity', 0)

    g.append('rect').attr('x', 40).attr('y', y)
      .attr('width', w - 80).attr('height', 60)
      .attr('fill', 'var(--paper-card)').attr('stroke', step.color).attr('stroke-width', 1.5)
      .attr('rx', 6).attr('stroke-dasharray', i === 2 ? '6,3' : 'none')

    g.append('text').attr('x', 60).attr('y', y + 22)
      .style('font-family', 'var(--font-sans)').style('font-size', '11px')
      .style('font-weight', '600').style('fill', step.color)
      .text(step.op)

    g.append('text').attr('x', 60).attr('y', y + 42)
      .style('font-family', 'var(--font-mono)').style('font-size', '12px').style('fill', 'var(--ink-2)')
      .text(step.formula + '  →  ' + step.result)

    // 步骤连接箭头
    if (i < steps.length - 1) {
      g.append('text').attr('x', w / 2).attr('y', y + 68)
        .attr('text-anchor', 'middle')
        .style('font-family', 'var(--font-serif)').style('font-size', '16px').style('fill', 'var(--ink-3)')
        .text('↓')
    }

    stepEls.push(g)
  })

  // 动画控制
  let currentStep = -1
  let animFrame = null
  let lastStepTime = 0
  const stepInterval = 1000

  function showStep(idx) {
    if (idx < 0 || idx >= stepEls.length) return
    stepEls[idx].transition().duration(500).ease(d3.easeCubicOut).attr('opacity', 1)
  }

  function animLoop(timestamp) {
    if (!isRunning.value) return
    if (timestamp - lastStepTime >= stepInterval) {
      currentStep++
      if (currentStep >= stepEls.length) {
        isRunning.value = false
        const ctrl = controls.value.find(c => c.key === 'autograd')
        if (ctrl) ctrl.label = '重播动画'
        return
      }
      showStep(currentStep)
      lastStepTime = timestamp
    }
    animFrame = requestAnimationFrame(animLoop)
  }

  svg.append('text').attr('x', w / 2).attr('y', 18).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '13px').style('fill', 'var(--ink-2)')
    .text('自动微分：前向计算值，反向计算梯度')

  // 存储动画控制函数
  svgContainer.value.__autogradPlay = function() {
    currentStep = -1
    stepEls.forEach(g => g.attr('opacity', 0))
    isRunning.value = true
    lastStepTime = 0
    animFrame = requestAnimationFrame(animLoop)
  }
  svgContainer.value.__autogradStop = function() {
    isRunning.value = false
    if (animFrame) cancelAnimationFrame(animFrame)
  }
}

// --- 层的实现演示 ---
function renderLayersDemo() {
  renderSimpleDemo('层的实现', '每一层 = forward() + backward()')
  // 在简单演示基础上添加 forward/backward 动画
  const svg = d3.select(svgContainer.value).select('svg')
  if (svg.empty()) return

  // 添加前向/反向箭头动画
  svg.append('text').attr('x', 150).attr('y', 130)
    .style('font-family', 'var(--font-sans)').style('font-size', '11px').style('fill', 'var(--accent)')
    .text('forward() →').attr('opacity', 0.8)
  svg.append('text').attr('x', 300).attr('y', 170)
    .style('font-family', 'var(--font-sans)').style('font-size', '11px').style('fill', 'var(--rust)')
    .text('← backward()').attr('opacity', 0.8)
}

// --- MNIST 演示 ---
function renderMNISTDemo() {
  clearSvg()
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg').attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  // 模拟 8×8 数字网格（简化版 MNIST）
  const grid = [
    [0,0,1,1,1,1,0,0],
    [0,1,1,0,0,1,1,0],
    [1,1,0,0,0,0,1,1],
    [1,1,0,0,0,0,1,1],
    [1,1,0,0,0,0,1,1],
    [1,1,0,0,0,0,1,1],
    [0,1,1,0,0,1,1,0],
    [0,0,1,1,1,1,0,0]
  ]
  const cellSize = 28
  const startX = (w - 8 * cellSize) / 2
  const startY = 50

  grid.forEach((row, r) => {
    row.forEach((val, c) => {
      svg.append('rect')
        .attr('x', startX + c * cellSize).attr('y', startY + r * cellSize)
        .attr('width', cellSize - 1).attr('height', cellSize - 1)
        .attr('fill', val ? `rgba(26,26,26,${0.3 + val * 0.7})` : 'var(--paper-card)')
        .attr('stroke', 'var(--rule-soft)').attr('stroke-width', 0.3)
        .attr('rx', 1)
    })
  })

  svg.append('text').attr('x', w / 2).attr('y', startY + 8 * cellSize + 25)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-mono)').style('font-size', '20px')
    .style('font-weight', '700').style('fill', 'var(--accent)')
    .text('→ 预测：0（置信度 98.7%）')

  svg.append('text').attr('x', w / 2).attr('y', 18).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '13px').style('fill', 'var(--ink-2)')
    .text('MNIST 手写数字识别：8×8 简化版')
}

// --- Seq2Seq 演示（带编码器->上下文->解码器流动动画）---
function renderSeq2SeqDemo() {
  controls.value = [
    { type: 'button', label: '播放流动动画', key: 'seq2seq', action: 'toggle' }
  ]
  clearSvg()
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg').attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  // 编码器
  const encX = 60, decX = 360
  const cellW = 60, cellH = 40
  const y = 130

  // 编码器单元（初始半透明）
  const encEls = []
  ;['我', '喜欢', '学习'].forEach((word, i) => {
    const x = encX + i * (cellW + 10)
    const g = svg.append('g').attr('class', 'enc-cell').attr('opacity', 0.3)
    g.append('rect').attr('x', x).attr('y', y)
      .attr('width', cellW).attr('height', cellH)
      .attr('fill', 'var(--accent-soft)').attr('stroke', 'var(--accent)').attr('stroke-width', 1).attr('rx', 4)
    g.append('text').attr('x', x + cellW / 2).attr('y', y + cellH / 2 + 4)
      .attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-sans)').style('font-size', '11px').style('fill', 'var(--accent)')
      .text(word)
    g.append('text').attr('x', x + cellW / 2).attr('y', y - 10)
      .attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-mono)').style('font-size', '9px').style('fill', 'var(--ink-3)')
      .text(`h${i + 1}`)
    encEls.push(g)
  })

  // 上下文向量
  const ctxG = svg.append('g').attr('class', 'ctx-vector').attr('opacity', 0.3)
  ctxG.append('rect').attr('x', 260).attr('y', y + 5)
    .attr('width', 50).attr('height', 30)
    .attr('fill', 'var(--rust)').attr('opacity', 0.2).attr('stroke', 'var(--rust)').attr('rx', 4)
  ctxG.append('text').attr('x', 285).attr('y', y + 24)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-mono)').style('font-size', '10px').style('fill', 'var(--rust)')
    .text('c')

  // 流动箭头（初始隐藏）
  const flowArrow = svg.append('text').attr('x', 330).attr('y', y + 24)
    .style('font-family', 'var(--font-serif)').style('font-size', '16px').style('fill', 'var(--ink-3)')
    .text('→').attr('opacity', 0)

  // 解码器单元（初始半透明）
  const decEls = []
  ;['I', 'like', 'learning'].forEach((word, i) => {
    const x = decX + i * (cellW + 10)
    const g = svg.append('g').attr('class', 'dec-cell').attr('opacity', 0.3)
    g.append('rect').attr('x', x).attr('y', y)
      .attr('width', cellW).attr('height', cellH)
      .attr('fill', 'var(--paper-card)').attr('stroke', 'var(--ochre)').attr('stroke-width', 1).attr('rx', 4)
    g.append('text').attr('x', x + cellW / 2).attr('y', y + cellH / 2 + 4)
      .attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-sans)').style('font-size', '11px').style('fill', 'var(--ochre)')
      .text(word)
    decEls.push(g)
  })

  // 标签
  svg.append('text').attr('x', encX + 95).attr('y', y + cellH + 25)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)').style('font-size', '11px').style('fill', 'var(--ink-3)')
    .text('编码器')

  svg.append('text').attr('x', decX + 95).attr('y', y + cellH + 25)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)').style('font-size', '11px').style('fill', 'var(--ink-3)')
    .text('解码器')

  svg.append('text').attr('x', w / 2).attr('y', 18).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '13px').style('fill', 'var(--ink-2)')
    .text('Seq2Seq：编码器压缩 → 上下文向量 c → 解码器生成')

  // 动画控制：分3阶段，编码器逐步点亮 -> 上下文向量 -> 解码器逐步点亮
  let animFrame = null
  let lastStepTime = 0
  const stepInterval = 600
  let animPhase = 0 // 0=encoder, 1=context, 2=decoder
  let animIdx = 0

  function animLoop(timestamp) {
    if (!isRunning.value) return
    if (timestamp - lastStepTime < stepInterval) {
      animFrame = requestAnimationFrame(animLoop)
      return
    }
    lastStepTime = timestamp

    if (animPhase === 0) {
      // 编码器逐步点亮
      if (animIdx < encEls.length) {
        encEls[animIdx].transition().duration(400).ease(d3.easeCubicOut).attr('opacity', 1)
        animIdx++
      } else {
        animPhase = 1
        animIdx = 0
      }
    } else if (animPhase === 1) {
      // 上下文向量和箭头
      ctxG.transition().duration(500).ease(d3.easeCubicOut).attr('opacity', 1)
      flowArrow.transition().duration(500).ease(d3.easeCubicOut).attr('opacity', 1)
      animPhase = 2
    } else if (animPhase === 2) {
      // 解码器逐步点亮
      if (animIdx < decEls.length) {
        decEls[animIdx].transition().duration(400).ease(d3.easeCubicOut).attr('opacity', 1)
        animIdx++
      } else {
        isRunning.value = false
        const ctrl = controls.value.find(c => c.key === 'seq2seq')
        if (ctrl) ctrl.label = '重播流动动画'
        return
      }
    }
    animFrame = requestAnimationFrame(animLoop)
  }

  // 存储动画控制函数
  svgContainer.value.__seq2seqPlay = function() {
    // 重置所有元素
    encEls.forEach(g => g.attr('opacity', 0.3))
    decEls.forEach(g => g.attr('opacity', 0.3))
    ctxG.attr('opacity', 0.3)
    flowArrow.attr('opacity', 0)
    animPhase = 0
    animIdx = 0
    isRunning.value = true
    lastStepTime = 0
    animFrame = requestAnimationFrame(animLoop)
  }
  svgContainer.value.__seq2seqStop = function() {
    isRunning.value = false
    if (animFrame) cancelAnimationFrame(animFrame)
  }
}

// --- RL 基础演示 ---
function renderRLBasicsDemo() {
  controls.value = [
    { type: 'button', label: '播放动画', key: 'play', action: 'toggle' }
  ]
  clearSvg()
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg').attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  // 智能体-环境交互循环
  const cx = w / 2, cy = h / 2
  const r = 80

  // 环境圆
  svg.append('circle').attr('cx', cx).attr('cy', cy).attr('r', r)
    .attr('fill', 'none').attr('stroke', 'var(--accent)').attr('stroke-width', 2)
  svg.append('text').attr('x', cx).attr('y', cy - 20)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '14px')
    .style('font-weight', '700').style('fill', 'var(--accent)')
    .text('环境')
  svg.append('text').attr('x', cx).attr('y', cy + 5)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)').style('font-size', '11px').style('fill', 'var(--ink-3)')
    .text('状态 s\'')

  // 智能体（左侧）
  svg.append('rect').attr('x', cx - r - 100).attr('y', cy - 20)
    .attr('width', 80).attr('height', 40)
    .attr('fill', 'var(--accent-soft)').attr('stroke', 'var(--accent)').attr('stroke-width', 1.5).attr('rx', 6)
  svg.append('text').attr('x', cx - r - 60).attr('y', cy + 4)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '13px')
    .style('font-weight', '700').style('fill', 'var(--accent)')
    .text('智能体')

  // 箭头：动作
  svg.append('line').attr('x1', cx - r - 20).attr('y1', cy - 5)
    .attr('x2', cx - r - 5).attr('y2', cy - 5)
    .attr('stroke', 'var(--accent)').attr('stroke-width', 2)
  svg.append('text').attr('x', cx - r - 12).attr('y', cy - 12)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)').style('font-size', '10px').style('fill', 'var(--accent)')
    .text('动作 a')

  // 箭头：奖励+状态
  svg.append('line').attr('x1', cx - r + 5).attr('y1', cy + 10)
    .attr('x2', cx - r - 5).attr('y2', cy + 10)
    .attr('stroke', 'var(--rust)').attr('stroke-width', 2)
  svg.append('text').attr('x', cx - r + 15).attr('y', cy + 25)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)').style('font-size', '10px').style('fill', 'var(--rust)')
    .text('奖励 r, 状态 s\'')

  // 奖励标签（右侧）
  svg.append('text').attr('x', cx + r + 40).attr('y', cy)
    .style('font-family', 'var(--font-sans)').style('font-size', '12px').style('fill', 'var(--ochre)')
    .text('奖励 r')

  svg.append('text').attr('x', w / 2).attr('y', 18).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '13px').style('fill', 'var(--ink-2)')
    .text('强化学习：智能体与环境的交互循环')
}

// --- MDP 演示 ---
function renderMDPDemo() {
  controls.value = [
    { type: 'button', label: '重新计算', key: 'recalc', action: 'regenerate' }
  ]
  clearSvg()
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg').attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  // 状态转移图
  const states = [
    { id: 'S1', label: 'S₁', x: 100, y: 150, v: '0.4' },
    { id: 'S2', label: 'S₂', x: 260, y: 80, v: '0.7' },
    { id: 'S3', label: 'S₃', x: 260, y: 220, v: '0.5' },
    { id: 'S4', label: 'S₄(终)', x: 420, y: 150, v: '1.0' }
  ]

  // 状态转移边
  const transitions = [
    { from: 'S1', to: 'S2', prob: '0.6', reward: '+1' },
    { from: 'S1', to: 'S3', prob: '0.4', reward: '+0' },
    { from: 'S2', to: 'S4', prob: '0.8', reward: '+5' },
    { from: 'S3', to: 'S4', prob: '0.7', reward: '+3' }
  ]

  const nodeMap = {}
  states.forEach(s => nodeMap[s.id] = s)

  // 绘制转移边
  transitions.forEach(t => {
    const from = nodeMap[t.from], to = nodeMap[t.to]
    const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2
    svg.append('line').attr('x1', from.x).attr('y1', from.y)
      .attr('x2', to.x).attr('y2', to.y)
      .attr('stroke', 'var(--rule)').attr('stroke-width', 1.5)
    svg.append('text').attr('x', mx).attr('y', my - 8)
      .attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-mono)').style('font-size', '10px').style('fill', 'var(--ink-3)')
      .text(`p=${t.prob}, r=${t.reward}`)
  })

  // 绘制状态节点
  states.forEach(s => {
    svg.append('circle').attr('cx', s.x).attr('cy', s.y).attr('r', 28)
      .attr('fill', s.id === 'S4' ? 'var(--accent-soft)' : 'var(--paper-card)')
      .attr('stroke', 'var(--accent)').attr('stroke-width', 1.5)
    svg.append('text').attr('x', s.x).attr('y', s.y - 5)
      .attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-serif)').style('font-size', '13px')
      .style('font-weight', '700').style('fill', 'var(--ink)')
      .text(s.label)
    svg.append('text').attr('x', s.x).attr('y', s.y + 12)
      .attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-mono)').style('font-size', '10px').style('fill', 'var(--accent)')
      .text(`V=${s.v}`)
  })

  svg.append('text').attr('x', w / 2).attr('y', 18).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '13px').style('fill', 'var(--ink-2)')
    .text('MDP 状态转移图：转移概率 + 奖励 + 状态价值')
}

// --- DQN 演示 ---
function renderDQNDemo() {
  clearSvg()
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg').attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  // DQN 架构图
  // 输入层（状态）
  svg.append('rect').attr('x', 30).attr('y', 80).attr('width', 100).attr('height', 140)
    .attr('fill', 'var(--accent-soft)').attr('stroke', 'var(--accent)').attr('stroke-width', 1).attr('rx', 6)
  svg.append('text').attr('x', 80).attr('y', 155).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)').style('font-size', '11px').style('fill', 'var(--accent)')
    .text('状态 s')
  svg.append('text').attr('x', 80).attr('y', 240).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)').style('font-size', '10px').style('fill', 'var(--ink-3)')
    .text('（游戏画面）')

  // 神经网络
  svg.append('rect').attr('x', 180).attr('y', 70).attr('width', 160).attr('height', 160)
    .attr('fill', 'none').attr('stroke', 'var(--ink-3)').attr('stroke-width', 1)
    .attr('stroke-dasharray', '6,3').attr('rx', 8)
  svg.append('text').attr('x', 260).attr('y', 95).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '12px')
    .style('font-weight', '600').style('fill', 'var(--ink-2)')
    .text('Q 网络')

  // 隐藏层
  ;[120, 150, 180, 210].forEach(y => {
    svg.append('line').attr('x1', 200).attr('y1', y).attr('x2', 320).attr('y2', y)
      .attr('stroke', 'var(--rule-soft)').attr('stroke-width', 0.5)
  })
  svg.append('text').attr('x', 260).attr('y', 160).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-mono)').style('font-size', '10px').style('fill', 'var(--ink-3)')
    .text('θ 参数')

  // 输出层（Q 值）
  const actions = ['← Q=0.3', '→ Q=0.8', '↑ Q=0.5', '↓ Q=0.2']
  actions.forEach((a, i) => {
    const y = 85 + i * 35
    svg.append('rect').attr('x', 390).attr('y', y).attr('width', 110).attr('height', 28)
      .attr('fill', i === 1 ? 'var(--accent-soft)' : 'var(--paper-card)')
      .attr('stroke', i === 1 ? 'var(--accent)' : 'var(--rule)').attr('stroke-width', 1).attr('rx', 3)
    svg.append('text').attr('x', 445).attr('y', y + 18).attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-mono)').style('font-size', '10px')
      .style('fill', i === 1 ? 'var(--accent)' : 'var(--ink-3)')
      .text(a)
  })

  // 最优动作标记
  svg.append('text').attr('x', 445).attr('y', 70).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)').style('font-size', '10px')
    .style('font-weight', '600').style('fill', 'var(--accent)')
    .text('← argmax')

  svg.append('text').attr('x', w / 2).attr('y', 18).attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '13px').style('fill', 'var(--ink-2)')
    .text('DQN：神经网络近似 Q(s,a)，输出每个动作的价值')
}

// --- 默认演示 ---
function renderDefaultDemo() {
  renderSimpleDemo('交互演示', 'D3.js 可视化即将加载')
}

// 通用简化演示渲染函数（用于 layers 等）
function renderSimpleDemo(title, desc) {
  const w = width.value, h = height.value
  const svg = d3.select(svgContainer.value)
    .append('svg').attr('width', w).attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%').style('height', 'auto')

  // 装饰性网格背景
  const gridSpacing = 30
  for (let x = 0; x < w; x += gridSpacing) {
    svg.append('line').attr('x1', x).attr('y1', 0).attr('x2', x).attr('y2', h)
      .attr('stroke', 'var(--rule-soft)').attr('stroke-width', 0.3)
  }
  for (let y = 0; y < h; y += gridSpacing) {
    svg.append('line').attr('x1', 0).attr('y1', y).attr('x2', w).attr('y2', y)
      .attr('stroke', 'var(--rule-soft)').attr('stroke-width', 0.3)
  }

  svg.append('text').attr('x', w / 2).attr('y', h / 2 - 15)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-serif)').style('font-size', '16px')
    .style('font-weight', '600').style('fill', 'var(--ink)').text(title)

  svg.append('text').attr('x', w / 2).attr('y', h / 2 + 15)
    .attr('text-anchor', 'middle')
    .style('font-family', 'var(--font-sans)').style('font-size', '12px')
    .style('fill', 'var(--ink-3)').text(desc)

  svg.append('rect').attr('x', 20).attr('y', 25)
    .attr('width', w - 40).attr('height', h - 50)
    .attr('fill', 'none').attr('stroke', 'var(--rule)')
    .attr('stroke-width', 1).attr('stroke-dasharray', '4,4')
}

// 处理滑块值变化
function onControlChange(key, value) {
  // 更新控件值
  const ctrl = controls.value.find(c => c.key === key)
  if (ctrl) ctrl.value = parseFloat(value)
  // 根据 demoId 重新渲染对应的演示
  switch (props.demoId) {
    case 'optimizer': renderOptimizerWithParams(ctrl?.value || 0.1); break
    case 'q-learning': renderQLearningWithParams(ctrl?.value || 0.3); break
    case 'lstm': {
      const forget = controls.value.find(c => c.key === 'forget')?.value || 0.8
      const input = controls.value.find(c => c.key === 'input')?.value || 0.6
      renderLSTMWithParams(forget, input)
      break
    }
    case 'training': {
      renderTrainingWithParams(ctrl?.value || 0.08)
      break
    }
  }
}

// 处理按钮点击事件
function onButtonClick(key) {
  const ctrl = controls.value.find(c => c.key === key)
  if (!ctrl) return
  if (ctrl.action === 'regenerate') {
    // 重新渲染当前演示
    renderDemo()
  } else if (ctrl.action === 'toggle') {
    // 切换播放/暂停（支持各演示的动画控制）
    if (isRunning.value) {
      // 停止动画
      isRunning.value = false
      if (svgContainer.value?.__compGraphStop) svgContainer.value.__compGraphStop()
      if (svgContainer.value?.__autogradStop) svgContainer.value.__autogradStop()
      if (svgContainer.value?.__seq2seqStop) svgContainer.value.__seq2seqStop()
      stopAnimation()
      ctrl.label = '播放'
    } else {
      // 启动动画
      if (props.demoId === 'computation-graph' && svgContainer.value?.__compGraphPlay) {
        svgContainer.value.__compGraphPlay()
        ctrl.label = '暂停'
      } else if (props.demoId === 'autograd' && svgContainer.value?.__autogradPlay) {
        svgContainer.value.__autogradPlay()
        ctrl.label = '暂停'
      } else if (props.demoId === 'seq2seq' && svgContainer.value?.__seq2seqPlay) {
        svgContainer.value.__seq2seqPlay()
        ctrl.label = '暂停'
      } else {
        isRunning.value = true
        ctrl.label = '暂停'
      }
    }
  } else if (ctrl.action === 'boundary') {
    // 切换决策边界显示/隐藏
    if (svgContainer.value?.__boundaryLine) {
      svgContainer.value.__boundaryVisible = !svgContainer.value.__boundaryVisible
      const line = svgContainer.value.__boundaryLine
      if (svgContainer.value.__boundaryVisible) {
        line.transition().duration(300).attr('opacity', 0.7)
        ctrl.label = '隐藏决策边界'
      } else {
        line.transition().duration(300).attr('opacity', 0)
        ctrl.label = '显示决策边界'
      }
    }
  } else if (ctrl.action === 'connections') {
    // 切换语义连线显示/隐藏
    if (svgContainer.value?.__connectionGroup) {
      svgContainer.value.__connectionsVisible = !svgContainer.value.__connectionsVisible
      const group = svgContainer.value.__connectionGroup
      if (svgContainer.value.__connectionsVisible) {
        group.transition().duration(400).attr('opacity', 1)
        ctrl.label = '隐藏语义连线'
      } else {
        group.transition().duration(400).attr('opacity', 0)
        ctrl.label = '显示语义连线'
      }
    }
  }
}

// 组件挂载后渲染演示
onMounted(() => {
  // 计算容器宽度
  if (svgContainer.value) {
    width.value = svgContainer.value.clientWidth || 600
  }
  // 渲染演示
  renderDemo()
  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
onUnmounted(() => {
  // 停止动画
  stopAnimation()
  // 移除事件监听
  window.removeEventListener('resize', handleResize)
})

// 监听 demoId 变化，重新渲染
watch(() => props.demoId, () => {
  nextTick(() => renderDemo())
})

// 窗口大小变化处理
function handleResize() {
  if (svgContainer.value) {
    width.value = svgContainer.value.clientWidth || 600
    renderDemo()
  }
}
</script>

<template>
  <!-- D3 演示容器 -->
  <div class="d3-demo">
    <!-- 交互控件面板（当有滑块或按钮时显示） -->
    <div v-if="controls.length" class="controls-panel">
      <!-- 遍历控件配置，渲染滑块或按钮 -->
      <div v-for="ctrl in controls" :key="ctrl.key" class="control-item">
        <!-- 按钮类型控件 -->
        <button v-if="ctrl.type === 'button'" class="control-btn" @click="onButtonClick(ctrl.key)">
          {{ ctrl.label }}
        </button>
        <!-- 滑块类型控件 -->
        <template v-else>
          <!-- 控件标签 -->
          <label class="control-label">{{ ctrl.label }}: {{ ctrl.value.toFixed(2) }}</label>
          <!-- 范围滑块 -->
          <input
            type="range"
            class="control-slider"
            :min="ctrl.min"
            :max="ctrl.max"
            :step="ctrl.step"
            :value="ctrl.value"
            @input="onControlChange(ctrl.key, $event.target.value)"
          />
          <!-- 最小值和最大值标签 -->
          <div class="control-range">
            <span>{{ ctrl.min }}</span>
            <span>{{ ctrl.max }}</span>
          </div>
        </template>
      </div>
    </div>
    <!-- SVG 挂载点 -->
    <div ref="svgContainer" class="svg-container"></div>
  </div>
</template>

<style scoped>
/* D3 演示容器 */
.d3-demo {
  background: var(--paper-card);
  /* 纯白纸张背景 */
  border: 1px solid var(--rule);
  /* 暖灰边框 */
  border-radius: var(--radius-md);
  /* 中等圆角 */
  padding: var(--space-4);
  /* 内边距 */
  margin: var(--space-5) 0;
  /* 外边距 */
  overflow: hidden;
  /* 隐藏溢出 */
}

/* 交互控件面板 */
.controls-panel {
  display: flex;
  /* 水平排列 */
  flex-wrap: wrap;
  /* 允许换行 */
  gap: var(--space-5);
  /* 控件间距 */
  padding: var(--space-3) var(--space-4);
  /* 内边距 */
  margin-bottom: var(--space-3);
  /* 下方间距 */
  border-bottom: 1px solid var(--rule-soft);
  /* 底部分隔线 */
}

/* 单个控件 */
.control-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 150px;
  /* 最小宽度 */
}

/* 控件标签 */
.control-label {
  font-family: var(--font-sans);
  /* 无衬线字体 */
  font-size: 0.75rem;
  /* 小字号 */
  font-weight: 600;
  /* 加粗 */
  color: var(--ink-2);
  /* 二级墨色 */
}

/* 范围滑块 */
.control-slider {
  -webkit-appearance: none;
  /* 去掉默认样式 */
  appearance: none;
  width: 100%;
  /* 宽度占满 */
  height: 4px;
  /* 高度 */
  background: var(--rule-soft);
  /* 轨道背景 */
  border-radius: 2px;
  /* 圆角 */
  outline: none;
  /* 去掉焦点轮廓 */
  cursor: pointer;
  /* 手型指针 */
}

/* 滑块滑块手柄 */
.control-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  /* 宽度 */
  height: 14px;
  /* 高度 */
  background: var(--accent);
  /* 靛青色 */
  border-radius: 50%;
  /* 圆形 */
  cursor: pointer;
  /* 手型指针 */
}

/* 滑块范围标签 */
.control-range {
  display: flex;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--ink-3);
}

/* 交互按钮 */
.control-btn {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  padding: var(--space-1) var(--space-3);
  background: var(--accent-soft);
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  align-self: flex-end;
}
.control-btn:hover {
  background: var(--accent);
  color: white;
}

/* SVG 容器 */
.svg-container {
  width: 100%;
  /* 宽度占满 */
  display: flex;
  /* flex 布局 */
  justify-content: center;
  /* 水平居中 */
}

/* SVG 内部元素样式 */
.svg-container :deep(svg) {
  max-width: 100%;
  /* 最大宽度 */
  height: auto;
  /* 高度自适应 */
}

/* 响应式：手机端 */
@media (max-width: 768px) {
  /* 增大控件面板触控热区 */
  .controls-panel {
    padding: var(--space-4) var(--space-4);
    gap: var(--space-3);
  }

  /* 增大按钮触控热区 */
  .control-btn {
    padding: var(--space-2) var(--space-4);
    min-height: 44px;
    font-size: 0.85rem;
  }

  /* 增大滑块触控热区 */
  .control-slider {
    height: 6px;
  }

  .control-slider::-webkit-slider-thumb {
    width: 20px;
    height: 20px;
  }

  /* 确保 SVG 容器不溢出 */
  .svg-container {
    overflow: hidden;
  }

  .svg-container :deep(svg) {
    max-width: 100%;
  }
}
</style>
