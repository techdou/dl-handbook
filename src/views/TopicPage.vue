<!--
  TopicPage.vue — 知识点详情页
  功能：展示单个知识点的完整内容（介绍、公式、演示、测验）
  设计：学术笔记本风格，衬线正文，靛青强调
-->
<script setup>
// 从 Vue 导入工具
import { ref, computed, onMounted, onUnmounted } from 'vue'
// 导入 marked 库：Markdown 转 HTML 渲染器
import { marked } from 'marked'
// 导入组件
import FormulaBlock from '../components/handbook/FormulaBlock.vue'
// 公式渲染组件
import ReactDemoHost from '../components/handbook/ReactDemoHost.vue'
// React/visx 交互演示承载组件
import QuizModal from '../components/handbook/QuizModal.vue'
// 测验弹窗组件
import PageNav from '../components/handbook/PageNav.vue'
// 上/下一页导航组件
import AudioPlayer from '../components/handbook/AudioPlayer.vue'
// 音频播报播放器组件
import TermPopover from '../components/handbook/TermPopover.vue'
// 术语解释气泡组件
// 导入术语表数据
import glossary from '../data/glossary.js'
// 导入书籍图片映射数据
import bookImages from '../data/bookImages.js'
// 书籍插图展示组件
import BookFigure from '../components/handbook/BookFigure.vue'
// 导入知识点数据
import { allTopics } from '../data/topics.js'

// 定义组件接收的属性
const props = defineProps({
  topicId: {
    // 知识点 ID
    type: String,
    required: true
  }
})

// 测验弹窗是否可见
const quizVisible = ref(false)

// 当前知识点对象
const topic = computed(() => {
  // 在所有知识点中查找匹配 ID 的
  return allTopics.find(t => t.id === props.topicId)
})

// 是否已完成该知识点的学习（答对测验）
const isCompleted = computed(() => {
  return localStorage.getItem(`dl-completed-${props.topicId}`) === 'true'
})

// 获取当前知识点所属书籍的信息
const bookInfo = computed(() => {
  // 根据 book 属性判断
  if (!topic.value) return null
  // 书籍标题映射
  const bookMap = {
    'book1': { label: '第一本', title: '《深度学习入门1》' },
    'book2': { label: '第二本', title: '《深度学习入门2》' },
    'book3': { label: '第三本', title: '《深度学习进阶》' },
    'book4': { label: '第四本', title: '《深度学习入门4》' }
  }
  return bookMap[topic.value.book] || null
})

// 配置 marked 渲染器：禁用标题 ID（避免路由冲突）
marked.setOptions({
  breaks: true,
  // 支持换行符转 <br>
  gfm: true
  // 支持 GitHub 风格 Markdown
})

// 使用 marked 将 Markdown 转换为 HTML，并标记术语
function renderMarkdown(text) {
  if (!text) return ''
  // 调用 marked.parse 渲染完整 Markdown
  let html = marked.parse(text)
  // 将术语表中的术语替换为带标记的可点击 span
  // 按术语长度降序排列，避免短术语覆盖长术语
  const sortedTerms = Object.keys(glossary).sort((a, b) => b.length - a.length)
  for (const term of sortedTerms) {
    // 只替换不在 HTML 标签内的文本
    // 使用正则匹配：不在 < 和 > 之间的术语
    const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(?<![<\\/\\w])${escapedTerm}(?![\\w>])`, 'g')
    html = html.replace(regex,
      `<span class="term-highlight" data-term="${term}">${term}</span>`
    )
  }
  return html
}

// 当前显示的术语弹窗信息
const activeTerm = ref(null)
// 弹窗位置
const termPosition = ref({ top: 0, left: 0 })

// 处理内容区域的点击事件（事件委托）
function onContentClick(event) {
  // 查找被点击的术语元素
  const termEl = event.target.closest('.term-highlight')
  if (termEl) {
    // 阻止冒泡到 document，避免弹窗被立即关闭
    event.stopPropagation()
    // 获取术语名称
    const term = termEl.dataset.term
    // 获取解释
    const explanation = glossary[term]
    if (!explanation) return

    // 如果点击的是同一个术语，关闭弹窗
    if (activeTerm.value && activeTerm.value.term === term) {
      activeTerm.value = null
      return
    }

    // 计算弹窗位置
    const rect = termEl.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

    termPosition.value = {
      top: rect.bottom + scrollTop + 8,
      left: rect.left + scrollLeft
    }
    // 设置激活的术语
    activeTerm.value = { term, explanation }
  }
}

// 关闭术语弹窗
function closeTermPopover() {
  activeTerm.value = null
}

// 点击页面其他区域关闭弹窗
function onDocClick(event) {
  // 如果点击的不是术语弹窗内部，关闭
  if (activeTerm.value && !event.target.closest('.term-popover') && !event.target.closest('.term-highlight')) {
    activeTerm.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
})

// 测验通过回调
function onQuizPassed() {
  // 将完成状态存入 localStorage
  localStorage.setItem(`dl-completed-${props.topicId}`, 'true')
}

// 打开测验弹窗
function openQuiz() {
  quizVisible.value = true
}
</script>

<template>
  <!-- 知识点详情页容器 -->
  <div class="topic-page" v-if="topic">
    <!-- 顶部：面包屑导航 -->
    <div class="breadcrumb">
      <!-- 首页链接 -->
      <router-link to="/" class="home-link">首页</router-link>
      <!-- 分隔符 -->
      <span class="sep">·</span>
      <!-- 所属书籍标签 -->
      <router-link class="book-tag" :style="{ color: topic.bookColor }" to="/">
        {{ topic.bookTitle }}
      </router-link>
      <!-- 分隔符 -->
      <span class="sep">·</span>
      <!-- 知识点标题 -->
      <span class="topic-name">{{ topic.title }}</span>
    </div>

    <!-- 标题区域 -->
    <header class="topic-header">
      <!-- 知识点图标 -->
      <span class="topic-icon">{{ topic.icon }}</span>
      <!-- 主标题 -->
      <h1 class="topic-title">{{ topic.title }}</h1>
      <!-- 副标题 -->
      <p class="topic-subtitle">{{ topic.subtitle }}</p>
    </header>

    <!-- 音频播报播放器 -->
    <AudioPlayer :topicId="topicId" :title="topic.title" />

    <!-- 内容章节（点击术语触发解释弹窗） -->
    <section
      v-for="(section, idx) in topic.sections"
      :key="idx"
      class="content-section"
      @click="onContentClick"
    >
      <!-- 章节标题 -->
      <h2 class="section-title">{{ section.title }}</h2>
      <!-- 章节内容：通过 v-html 渲染 Markdown，术语自动标记 -->
      <div
        class="section-content"
        v-html="renderMarkdown(section.content)"
      ></div>
    </section>

    <!-- 引言区域也支持术语点击 -->
    <section class="intro-section" @click="onContentClick">
      <!-- 引言文字（衬线字体，大字号） -->
      <p class="intro-text">{{ topic.intro }}</p>
    </section>

    <!-- 书籍插图区域：展示对应书籍章节的示意图 -->
    <section v-if="bookImages[topicId]" class="figures-section">
      <!-- 区域标题 -->
      <h2 class="section-title">🖼️ 书籍插图</h2>
      <!-- 图片网格 -->
      <div class="figures-grid">
        <!-- 遍历该知识点的图片 -->
        <BookFigure
          v-for="(img, idx) in bookImages[topicId]"
          :key="idx"
          :src="img.src"
          :caption="img.caption"
        />
      </div>
    </section>

    <!-- 公式区域 -->
    <section v-if="topic.formulas && topic.formulas.length" class="formulas-section">
      <!-- 区域标题 -->
      <h2 class="section-title">📐 核心公式</h2>
      <!-- 公式列表 -->
      <div class="formulas-grid">
        <!-- 遍历公式 -->
        <FormulaBlock
          v-for="(formula, idx) in topic.formulas"
          :key="idx"
          :label="formula.label"
          :tex="formula.tex"
          :explanation="formula.explanation"
        />
      </div>
    </section>

    <!-- 交互演示区域 -->
    <section v-if="topic.demoId" class="demo-section">
      <!-- 区域标题 -->
      <h2 class="section-title">🔬 交互演示</h2>
      <!-- D3 演示组件 -->
      <ReactDemoHost :demoId="topic.demoId" />
    </section>

    <!-- 测验浮窗按钮（固定在右下角） -->
    <button class="quiz-fab" @click="openQuiz">
      <!-- 按钮图标 -->
      <span class="fab-icon">📝</span>
      <!-- 按钮文字 -->
      <span class="fab-text">{{ isCompleted ? '重新测验' : '开始测验' }}</span>
    </button>

    <!-- 测验弹窗组件 -->
    <QuizModal
      :visible="quizVisible"
      :quiz="topic.quiz"
      :topicTitle="topic.title"
      @close="quizVisible = false"
      @passed="onQuizPassed"
    />

    <!-- 上/下一页导航 -->
    <PageNav :currentTopicId="topicId" />

    <!-- 术语解释气泡（Teleport 到 body） -->
    <Teleport to="body">
      <transition name="popover">
        <div
          v-if="activeTerm"
          class="term-popover"
          :style="{ top: termPosition.top + 'px', left: termPosition.left + 'px' }"
        >
          <!-- 气泡头部 -->
          <div class="popover-header">
            <span class="popover-term">{{ activeTerm.term }}</span>
            <button class="popover-close" @click.stop="activeTerm = null">&times;</button>
          </div>
          <!-- 解释内容 -->
          <div class="popover-body">{{ activeTerm.explanation }}</div>
        </div>
      </transition>
    </Teleport>
  </div>

  <!-- 找不到知识点时的提示 -->
  <div v-else class="not-found">
    <p>知识点不存在</p>
  </div>
</template>

<style scoped>
/* 知识点详情页容器 */
.topic-page {
  max-width: var(--content-max-width);
  /* 最大宽度限制 */
  margin: 0 auto;
  /* 水平居中 */
  padding: var(--space-8) var(--space-6);
  /* 内边距 */
  padding-bottom: var(--space-16);
  /* 底部大间距（留出悬浮按钮空间） */
}

/* 面包屑导航 */
.breadcrumb {
  display: flex;
  /* 水平排列 */
  align-items: center;
  /* 垂直居中 */
  gap: var(--space-2);
  /* 间距 */
  margin-bottom: var(--space-6);
  /* 下方间距 */
  font-family: var(--font-sans);
  /* 无衬线字体 */
  font-size: 0.78rem;
  /* 小字号 */
}

/* 书籍标签 */
.book-tag {
  font-weight: 600;
  /* 加粗 */
  text-decoration: none;
}

/* 首页链接 */
.home-link {
  font-weight: 600;
  color: var(--accent);
  text-decoration: none;
}
.home-link:hover {
  color: var(--accent-dark);
}

/* 分隔符 */
.sep {
  color: var(--rule);
  /* 暖灰 */
}

/* 面包屑中的知识点名称 */
.breadcrumb .topic-name {
  color: var(--ink-3);
  /* 三级墨色 */
}

/* 标题区域 */
.topic-header {
  margin-bottom: var(--space-8);
  /* 下方大间距 */
}

/* 知识点图标 */
.topic-icon {
  font-size: 2.5rem;
  /* 大号图标 */
  display: block;
  /* 块级显示 */
  margin-bottom: var(--space-3);
}

/* 主标题 */
.topic-title {
  font-family: var(--font-serif);
  /* 衬线字体：教科书标题感 */
  font-size: 2rem;
  /* 大字号 */
  font-weight: 700;
  /* 加粗 */
  color: var(--ink);
  /* 墨黑 */
  margin: 0 0 var(--space-2);
  /* 下方间距 */
  letter-spacing: -0.3px;
  /* 微负字间距 */
  line-height: 1.3;
}

/* 副标题 */
.topic-subtitle {
  font-family: var(--font-serif);
  /* 衬线字体 */
  font-size: 1.1rem;
  /* 字号 */
  color: var(--ink-3);
  /* 三级墨色 */
  font-style: italic;
  /* 斜体 */
  margin: 0;
}

/* 引言区域 */
.intro-section {
  margin-bottom: var(--space-10);
  /* 下方大间距 */
  padding: var(--space-6);
  /* 内边距 */
  border-left: 3px solid var(--accent);
  /* 左侧靛青装饰条 */
  background: var(--accent-soft);
  /* 靛青浅底 */
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  /* 右侧小圆角 */
}

/* 引言文字 */
.intro-text {
  font-family: var(--font-serif);
  /* 衬线字体 */
  font-size: 1.05rem;
  /* 字号 */
  color: var(--ink-2);
  /* 二级墨色 */
  line-height: 1.9;
  /* 大行高，舒适阅读 */
  margin: 0;
}

/* 内容章节 */
.content-section {
  margin-bottom: var(--space-8);
  /* 章节间距 */
}

/* 章节标题 */
.section-title {
  font-family: var(--font-serif);
  /* 衬线字体 */
  font-size: 1.2rem;
  /* 字号 */
  font-weight: 700;
  /* 加粗 */
  color: var(--ink);
  /* 墨黑 */
  margin: 0 0 var(--space-4);
  /* 下方间距 */
  padding-bottom: var(--space-2);
  /* 下方内边距 */
  border-bottom: 1px solid var(--rule-soft);
  /* 底部浅分隔线 */
}

/* 章节内容 */
.section-content {
  font-family: var(--font-serif);
  /* 衬线字体：教科书正文感 */
  font-size: 1rem;
  /* 字号 */
  color: var(--ink-2);
  /* 二级墨色 */
  line-height: 1.9;
  /* 大行高 */
}

/* 内容区域的段落 */
.section-content :deep(p) {
  margin-bottom: 0.6em;
  /* 段落间距 */
}

/* 内容区域的粗体 */
.section-content :deep(strong) {
  color: var(--ink);
  /* 墨黑 */
  font-weight: 700;
}

/* 内容区域的列表 */
.section-content :deep(ul) {
  padding-left: 1.5em;
  /* 缩进 */
  margin: 0.5em 0;
}

.section-content :deep(li) {
  margin-bottom: 0.3em;
  /* 列表项间距 */
}

/* 公式区域 */
.formulas-section {
  margin-bottom: var(--space-8);
}

/* 公式网格 */
.formulas-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

/* 演示区域 */
.demo-section {
  margin-bottom: var(--space-8);
}

/* 书籍插图区域 */
.figures-section {
  margin-bottom: var(--space-8);
  /* 下方间距 */
}

/* 图片网格 */
.figures-grid {
  display: grid;
  /* 网格布局 */
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  /* 自适应列 */
  gap: var(--space-4);
  /* 间距 */
  align-items: start;
  /* 顶部对齐 */
}

/* 测验悬浮按钮 */
.quiz-fab {
  position: fixed;
  /* 固定定位 */
  bottom: var(--space-8);
  /* 距底部 */
  right: var(--space-8);
  /* 距右侧 */
  display: flex;
  /* flex 布局 */
  align-items: center;
  /* 垂直居中 */
  gap: var(--space-2);
  /* 间距 */
  padding: var(--space-3) var(--space-5);
  /* 内边距 */
  background: var(--accent);
  /* 靛青色 */
  color: var(--paper-card);
  /* 白色文字 */
  border: none;
  /* 无边框 */
  border-radius: var(--radius-md);
  /* 中等圆角 */
  font-family: var(--font-sans);
  /* 无衬线字体 */
  font-size: 0.85rem;
  /* 字号 */
  font-weight: 600;
  /* 加粗 */
  cursor: pointer;
  /* 手型指针 */
  box-shadow: var(--shadow-lg);
  /* 大阴影 */
  transition: all var(--transition-fast);
  /* 过渡动画 */
  z-index: 100;
  /* 确保在上层 */
}

/* 悬浮按钮悬停效果 */
.quiz-fab:hover {
  background: var(--accent-dark);
  /* 深靛青 */
  transform: translateY(-2px);
  /* 微微上移 */
}

/* 按钮图标 */
.fab-icon {
  font-size: 1rem;
}

/* 未找到提示 */
.not-found {
  text-align: center;
  padding: var(--space-16);
  font-family: var(--font-serif);
  color: var(--ink-3);
}

/* 响应式：手机端 */
@media (max-width: 768px) {
  .topic-page {
    padding: var(--space-5) var(--space-4);
  }

  .topic-title {
    font-size: 1.5rem;
  }

  .quiz-fab {
    bottom: var(--space-4);
    right: var(--space-4);
  }

  .fab-text {
    display: none;
    /* 手机端只显示图标 */
  }
}

/* 术语高亮样式（通过 :deep 穿透 scoped） */
.section-content :deep(.term-highlight),
.intro-text :deep(.term-highlight) {
  color: var(--accent);
  /* 靛青色文字 */
  border-bottom: 1px dashed var(--accent);
  /* 虚线下划线 */
  cursor: pointer;
  /* 手型指针 */
  font-weight: 500;
  /* 中等字重 */
  transition: all var(--transition-fast);
  /* 过渡动画 */
  padding: 0 2px;
  /* 微内边距 */
}

/* 术语悬停效果 */
.section-content :deep(.term-highlight:hover),
.intro-text :deep(.term-highlight:hover) {
  background: var(--accent-soft);
  /* 靛青浅底 */
  border-bottom-style: solid;
  /* 实线下划线 */
}
</style>

<!-- 术语弹窗样式（非 scoped，因为 Teleport 到 body） -->
<style>
/* 术语解释气泡 */
.term-popover {
  position: absolute;
  /* 绝对定位 */
  z-index: 2000;
  /* 确保在最上层 */
  width: 340px;
  /* 固定宽度 */
  max-width: calc(100vw - 32px);
  /* 不超出屏幕 */
  background: var(--paper-card, #ffffff);
  /* 纯白背景 */
  border: 1px solid var(--rule, #d8d4c8);
  /* 暖灰边框 */
  border-left: 3px solid var(--accent, #2c5282);
  /* 左侧靛青装饰条 */
  border-radius: 0 6px 6px 0;
  /* 右侧圆角 */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  /* 阴影 */
  overflow: hidden;
  /* 隐藏溢出 */
}

/* 弹窗头部 */
.term-popover .popover-header {
  display: flex;
  /* 水平排列 */
  justify-content: space-between;
  /* 两端对齐 */
  align-items: center;
  /* 垂直居中 */
  padding: 10px 14px;
  /* 内边距 */
  background: var(--accent-soft, #ebf0f7);
  /* 靛青浅底 */
  border-bottom: 1px solid var(--rule-soft, #e8e4d8);
  /* 底部分隔线 */
}

/* 术语名称 */
.term-popover .popover-term {
  font-family: var(--font-serif, Georgia, serif);
  /* 衬线字体 */
  font-size: 0.92rem;
  /* 字号 */
  font-weight: 700;
  /* 加粗 */
  color: var(--ink, #1a1a1a);
  /* 墨黑 */
}

/* 关闭按钮 */
.term-popover .popover-close {
  background: none;
  border: none;
  font-size: 1.3rem;
  cursor: pointer;
  color: var(--ink-3, #6b6b6b);
  padding: 0 4px;
  line-height: 1;
  transition: color 0.15s;
}

.term-popover .popover-close:hover {
  color: var(--ink, #1a1a1a);
}

/* 解释内容 */
.term-popover .popover-body {
  padding: 12px 14px;
  /* 内边距 */
  font-family: var(--font-sans, -apple-system, sans-serif);
  /* 无衬线字体 */
  font-size: 0.82rem;
  /* 字号 */
  color: var(--ink-2, #3d3d3d);
  /* 二级墨色 */
  line-height: 1.75;
  /* 行高 */
}

/* 弹窗进入/离开动画 */
.popover-enter-active,
.popover-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
