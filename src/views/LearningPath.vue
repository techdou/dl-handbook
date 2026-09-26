<!--
  LearningPath.vue — 学习路径图
  功能：用 D3.js 可视化展示 19 个知识点的依赖关系和学习路径
  设计：学术笔记本风格，节点=知识点，边=依赖关系，已完成节点高亮
-->
<script setup>
// 从 Vue 导入工具
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
// 从 Vue Router 导入
import { useRouter } from 'vue-router'
// 导入 D3.js
import * as d3 from 'd3'
// 导入知识点数据
import { books, allTopics } from '../data/topics.js'
// 导入学习进度共享状态：测验通过后路径图节点/连线立即刷新
import { isCompleted, useCompletedIds } from '../composables/useProgress.js'

// 获取路由实例
const router = useRouter()

// SVG 容器引用
const svgContainer = ref(null)
// 窗口宽度
const containerWidth = ref(900)

// 知识点依赖关系定义
// 每条边表示 [源] → [目标] 的学习依赖
const dependencies = [
  // Book 1 内部依赖链
  { source: 'perceptron', target: 'neural-network' },
  { source: 'neural-network', target: 'backpropagation' },
  { source: 'backpropagation', target: 'training' },
  { source: 'training', target: 'cnn' },
  { source: 'cnn', target: 'mnist' },
  // Book 2 依赖 Book 1
  { source: 'backpropagation', target: 'computation-graph' },
  { source: 'computation-graph', target: 'autograd' },
  { source: 'autograd', target: 'layers' },
  { source: 'layers', target: 'optimizer' },
  // Book 3 依赖 Book 1
  { source: 'neural-network', target: 'word2vec' },
  { source: 'word2vec', target: 'rnn' },
  { source: 'rnn', target: 'lstm' },
  { source: 'lstm', target: 'seq2seq' },
  { source: 'seq2seq', target: 'attention' },
  // Book 4 相对独立
  { source: 'rl-basics', target: 'mdp' },
  { source: 'mdp', target: 'q-learning' },
  { source: 'q-learning', target: 'dqn' },
  // 跨书推荐依赖
  { source: 'training', target: 'rl-basics' }
]

// 获取知识点是否已完成：isCompleted 来自响应式共享进度状态（见顶部导入）

// 计算完成统计
const stats = computed(() => {
  const total = allTopics.length
  const completed = allTopics.filter(t => isCompleted(t.id)).length
  return { total, completed, percent: Math.round((completed / total) * 100) }
})

// 进度状态变化时重绘 D3 路径图（节点填充、连线样式、勾号）
watch(useCompletedIds(), () => renderPath())

// 书籍颜色映射
const bookColors = {
  'book1': '#2c5282',
  'book2': '#276749',
  'book3': '#553c9a',
  'book4': '#9c4221'
}

// 渲染学习路径图
function renderPath() {
  if (!svgContainer.value) return
  // 清空容器
  svgContainer.value.innerHTML = ''

  const w = containerWidth.value
  const h = 600
  const margin = { top: 40, right: 40, bottom: 40, left: 40 }

  // 创建 SVG
  const svg = d3.select(svgContainer.value)
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .attr('viewBox', `0 0 ${w} ${h}`)
    .style('max-width', '100%')
    .style('height', 'auto')

  // 定义箭头标记
  svg.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 20)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'var(--rule)')

  // 完成状态的箭头
  svg.select('defs').append('marker')
    .attr('id', 'arrowhead-done')
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 20)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', 'var(--accent)')

  // 构建节点位置布局
  // 按书籍分层排列：Book1 左上，Book2 右上，Book3 左下，Book4 右下
  const topicMap = {}
  allTopics.forEach(t => topicMap[t.id] = t)

  // 手动布局节点位置（分层布局）
  const nodePositions = {
    // Book 1: 左侧纵列
    'perceptron':        { x: 100, y: 80 },
    'neural-network':    { x: 100, y: 160 },
    'backpropagation':   { x: 100, y: 240 },
    'training':          { x: 100, y: 320 },
    'cnn':               { x: 100, y: 400 },
    'mnist':             { x: 100, y: 480 },
    // Book 2: 中间偏右
    'computation-graph': { x: 320, y: 240 },
    'autograd':          { x: 320, y: 320 },
    'layers':            { x: 320, y: 400 },
    'optimizer':         { x: 320, y: 480 },
    // Book 3: 右侧纵列
    'word2vec':          { x: 540, y: 160 },
    'rnn':               { x: 540, y: 240 },
    'lstm':              { x: 540, y: 320 },
    'seq2seq':           { x: 540, y: 400 },
    'attention':         { x: 540, y: 480 },
    // Book 4: 最右侧
    'rl-basics':         { x: 740, y: 320 },
    'mdp':               { x: 740, y: 400 },
    'q-learning':        { x: 740, y: 480 },
    'dqn':               { x: 740, y: 560 }
  }

  // 书籍区域标签
  const bookLabels = [
    { label: 'Book 1 · 入门基础', x: 100, y: 40, color: bookColors.book1 },
    { label: 'Book 2 · 自制框架', x: 320, y: 40, color: bookColors.book2 },
    { label: 'Book 3 · NLP 进阶', x: 540, y: 40, color: bookColors.book3 },
    { label: 'Book 4 · 强化学习', x: 740, y: 40, color: bookColors.book4 }
  ]

  // 绘制书籍区域标签
  bookLabels.forEach(bl => {
    svg.append('text')
      .attr('x', bl.x).attr('y', bl.y)
      .attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-sans)')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('fill', bl.color)
      .text(bl.label)
  })

  // 绘制依赖关系边（连线）
  dependencies.forEach(dep => {
    const from = nodePositions[dep.source]
    const to = nodePositions[dep.target]
    if (!from || !to) return

    const bothCompleted = isCompleted(dep.source) && isCompleted(dep.target)

    // 计算控制点（贝塞尔曲线）
    const midY = (from.y + to.y) / 2

    svg.append('path')
      .attr('d', `M${from.x},${from.y + 16} C${from.x},${midY} ${to.x},${midY} ${to.x},${to.y - 16}`)
      .attr('fill', 'none')
      .attr('stroke', bothCompleted ? 'var(--accent)' : 'var(--rule-soft)')
      .attr('stroke-width', bothCompleted ? 2 : 1.2)
      .attr('stroke-dasharray', bothCompleted ? 'none' : '4,3')
      .attr('marker-end', bothCompleted ? 'url(#arrowhead-done)' : 'url(#arrowhead)')
      .attr('opacity', 0.7)
  })

  // 绘制知识点节点
  allTopics.forEach(topic => {
    const pos = nodePositions[topic.id]
    if (!pos) return

    const completed = isCompleted(topic.id)
    const color = bookColors[topic.book] || 'var(--ink-3)'
    const nodeR = 14

    const g = svg.append('g')
      .attr('transform', `translate(${pos.x},${pos.y})`)
      .style('cursor', 'pointer')
      .on('click', () => router.push(`/topic/${topic.id}`))

    // 节点圆圈
    g.append('circle')
      .attr('r', nodeR)
      .attr('fill', completed ? color : 'var(--paper-card)')
      .attr('stroke', color)
      .attr('stroke-width', completed ? 0 : 2)
      .attr('opacity', completed ? 0.9 : 1)

    // 完成勾号或序号
    if (completed) {
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-size', '12px')
        .style('fill', '#fff')
        .style('font-weight', '700')
        .text('✓')
    } else {
      // 显示知识点序号
      const idx = allTopics.findIndex(t => t.id === topic.id) + 1
      g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('font-family', 'var(--font-mono)')
        .style('font-size', '9px')
        .style('fill', color)
        .style('font-weight', '600')
        .text(idx)
    }

    // 节点标签（知识点标题）
    g.append('text')
      .attr('x', 0)
      .attr('y', nodeR + 14)
      .attr('text-anchor', 'middle')
      .style('font-family', 'var(--font-sans)')
      .style('font-size', '10px')
      .style('fill', completed ? 'var(--ink)' : 'var(--ink-3)')
      .style('font-weight', completed ? '600' : '400')
      .text(topic.title.length > 6 ? topic.title.substring(0, 6) + '…' : topic.title)

    // 悬停效果
    g.on('mouseenter', function() {
      d3.select(this).select('circle')
        .transition().duration(150)
        .attr('r', nodeR + 3)
        .attr('stroke-width', 3)
    })
    g.on('mouseleave', function() {
      d3.select(this).select('circle')
        .transition().duration(150)
        .attr('r', nodeR)
        .attr('stroke-width', completed ? 0 : 2)
    })
  })
}

// 组件挂载后渲染
onMounted(() => {
  if (svgContainer.value) {
    containerWidth.value = svgContainer.value.clientWidth || 900
  }
  renderPath()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 窗口大小变化处理
function handleResize() {
  if (svgContainer.value) {
    containerWidth.value = svgContainer.value.clientWidth || 900
    renderPath()
  }
}

// 导航到知识点
function goToTopic(id) {
  router.push(`/topic/${id}`)
}
</script>

<template>
  <!-- 学习路径图页面 -->
  <div class="path-page">
    <!-- 页面头部 -->
    <header class="path-header">
      <!-- 装饰线 -->
      <div class="header-rule"></div>
      <!-- 标题 -->
      <h1 class="path-title">学习路径图</h1>
      <!-- 描述 -->
      <p class="path-desc">
        知识点之间的依赖关系一目了然，点击节点进入学习
      </p>
      <!-- 总体进度 -->
      <div class="path-stats">
        <span class="stat-label">学习进度</span>
        <div class="stat-bar">
          <div class="stat-fill" :style="{ width: stats.percent + '%' }"></div>
        </div>
        <span class="stat-value">{{ stats.completed }} / {{ stats.total }} ({{ stats.percent }}%)</span>
      </div>
    </header>

    <!-- 图例 -->
    <div class="legend">
      <!-- 遍历四本书作为图例 -->
      <div v-for="book in books" :key="book.id" class="legend-item">
        <span class="legend-dot" :style="{ background: book.color }"></span>
        <span class="legend-label">{{ book.shortTitle }}</span>
      </div>
      <!-- 完成状态图例 -->
      <div class="legend-item">
        <span class="legend-dot completed-dot"></span>
        <span class="legend-label">已完成</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot pending-dot"></span>
        <span class="legend-label">未完成</span>
      </div>
    </div>

    <!-- SVG 挂载点 -->
    <div ref="svgContainer" class="path-container"></div>

    <!-- 提示文字 -->
    <p class="path-hint">💡 点击节点进入对应知识点学习，虚线表示推荐学习顺序</p>
  </div>
</template>

<style scoped>
/* 学习路径图页面 */
.path-page {
  max-width: var(--content-max-width);
  /* 最大宽度限制 */
  margin: 0 auto;
  /* 水平居中 */
  padding: var(--space-8) var(--space-6);
  /* 内边距 */
}

/* 页面头部 */
.path-header {
  text-align: center;
  /* 居中 */
  margin-bottom: var(--space-6);
  /* 下方间距 */
}

/* 装饰线 */
.header-rule {
  width: 60px;
  height: 2px;
  background: var(--accent);
  margin: 0 auto var(--space-5);
}

/* 标题 */
.path-title {
  font-family: var(--font-serif);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--ink);
  margin: 0 0 var(--space-2);
}

/* 描述 */
.path-desc {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  color: var(--ink-3);
  margin: 0 0 var(--space-5);
}

/* 进度统计 */
.path-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  max-width: 400px;
  margin: 0 auto;
}

.stat-label {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--ink-2);
  white-space: nowrap;
}

.stat-bar {
  flex: 1;
  height: 6px;
  background: var(--rule-soft);
  border-radius: 3px;
  overflow: hidden;
}

.stat-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--book2-color));
  border-radius: 3px;
  transition: width 0.5s ease;
}

.stat-value {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--ink-3);
  white-space: nowrap;
}

/* 图例 */
.legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--paper-card);
  border: 1px solid var(--rule-soft);
  border-radius: var(--radius-sm);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-label {
  font-family: var(--font-sans);
  font-size: 0.72rem;
  color: var(--ink-3);
}

.completed-dot {
  background: var(--accent);
}

.pending-dot {
  background: var(--paper-card);
  border: 2px solid var(--rule);
}

/* SVG 容器 */
.path-container {
  background: var(--paper-card);
  border: 1px solid var(--rule);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  overflow: hidden;
}

/* 提示文字 */
.path-hint {
  text-align: center;
  font-family: var(--font-sans);
  font-size: 0.78rem;
  color: var(--ink-3);
  margin-top: var(--space-4);
}

/* 响应式：手机端 */
@media (max-width: 768px) {
  .path-page {
    padding: var(--space-5) var(--space-3);
  }

  .path-title {
    font-size: 1.4rem;
  }

  .legend {
    gap: var(--space-2);
  }
}
</style>
