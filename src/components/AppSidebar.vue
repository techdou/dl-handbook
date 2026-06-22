<!--
  AppSidebar.vue — 侧边栏导航组件
  功能：展示四本书目录树，知识点导航，学习进度
  设计：学术笔记本风格，暖纸张背景，衬线字体
-->
<script setup>
// 从 Vue 导入响应式工具
import { ref, computed, watch } from 'vue'
// 从 Vue Router 导入路由工具
import { useRoute, useRouter } from 'vue-router'
// 导入知识点数据
import { books, allTopics } from '../data/topics.js'

// 获取当前路由信息
const route = useRoute()
// 获取路由实例
const router = useRouter()

// 定义组件事件：导航时通知父组件关闭侧边栏
const emit = defineEmits(['navigate'])

// 当前展开的书籍 ID（默认展开第一本）
const expandedBook = ref('book1')

// 搜索关键词
const searchQuery = ref('')

// 根据搜索词过滤后的知识点列表
const filteredTopics = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return null
  return books.map(book => ({
    ...book,
    topics: book.topics.filter(t =>
      t.title.toLowerCase().includes(q) || (t.id && t.id.toLowerCase().includes(q))
    )
  })).filter(book => book.topics.length > 0)
})

// 搜索时自动展开所有有结果的书籍
watch(searchQuery, (val) => {
  if (val.trim()) {
    expandedBook.value = null
  }
})

// 当前激活的知识点 ID（从路由中获取）
const currentTopicId = computed(() => {
  // 从路由路径中提取知识点 ID
  const match = route.path.match(/\/topic\/(.+)/)
  // 如果匹配到则返回 ID，否则返回 null
  return match ? match[1] : null
})

// 切换书籍的展开/折叠状态
function toggleBook(bookId) {
  // 如果点击的是已展开的书，则折叠；否则展开新书
  expandedBook.value = expandedBook.value === bookId ? null : bookId
}

// 导航到指定知识点
function navigateToTopic(topicId) {
  // 使用路由导航到知识点页面
  router.push(`/topic/${topicId}`)
  // 触发导航事件，通知父组件关闭侧边栏（移动端）
  emit('navigate')
}

// 判断某个知识点是否是当前正在查看的
function isActive(topicId) {
  // 比较知识点 ID 与当前路由 ID
  return currentTopicId.value === topicId
}

// 判断某个知识点是否已完成学习（存储在 localStorage）
function isCompleted(topicId) {
  // 从本地存储读取完成状态
  return localStorage.getItem(`dl-completed-${topicId}`) === 'true'
}

// 计算每本书的学习进度百分比
function getBookProgress(book) {
  // 获取该书下已完成的知识点数量
  const completed = book.topics.filter(t => isCompleted(t.id)).length
  // 计算并返回百分比
  return book.topics.length > 0 ? Math.round((completed / book.topics.length) * 100) : 0
}
</script>

<template>
  <!-- 侧边栏容器 -->
  <aside class="sidebar">
    <!-- 侧边栏头部：Logo 和标题 -->
    <div class="sidebar-header">
      <!-- 标题文字区域 -->
      <div class="logo-text">
        <!-- 主标题：衬线字体，学术感 -->
        <h2>DL Handbook</h2>
        <!-- 副标题 -->
        <span class="subtitle">深度学习入门指南</span>
      </div>
    </div>

    <!-- 快捷入口：回到首页 -->
    <router-link to="/" class="home-link" @click="emit('navigate')">
      <!-- 首页图标和文字 -->
      <span class="home-icon">§</span>
      <span>学习总览</span>
    </router-link>

    <!-- 学习路径图入口 -->
    <router-link to="/path" class="home-link" @click="emit('navigate')">
      <span class="home-icon">🗺️</span>
      <span>学习路径图</span>
    </router-link>

    <!-- 搜索输入框 -->
    <div class="search-box">
      <input
        v-model="searchQuery"
        type="text"
        class="search-input"
        placeholder="搜索知识点…"
      />
    </div>

    <!-- 搜索结果：有搜索词时显示过滤后的知识点 -->
    <nav v-if="filteredTopics" class="book-list search-results">
      <div
        v-for="book in filteredTopics"
        :key="book.id"
        class="book-group"
      >
        <!-- 书籍标题（搜索结果中不可折叠） -->
        <div class="book-header expanded">
          <span class="book-number" :style="{ color: book.color }">{{ book.icon }}</span>
          <span class="book-title">{{ book.shortTitle }}</span>
          <span class="book-progress">{{ book.topics.length }} 个结果</span>
        </div>

        <!-- 匹配的知识点列表 -->
        <ul class="topic-list">
          <li
            v-for="(topic, idx) in book.topics"
            :key="topic.id"
            class="topic-item"
            :class="{
              active: isActive(topic.id),
              completed: isCompleted(topic.id)
            }"
            @click="navigateToTopic(topic.id)"
          >
            <span class="topic-number">{{ idx + 1 }}.</span>
            <span class="topic-title">{{ topic.title }}</span>
            <span v-if="isCompleted(topic.id)" class="done-mark">✓</span>
          </li>
        </ul>
      </div>
      <!-- 无搜索结果提示 -->
      <p v-if="filteredTopics.length === 0" class="no-results">无匹配知识点</p>
    </nav>

    <!-- 书籍列表：每本书可展开查看知识点（无搜索词时显示） -->
    <nav v-else class="book-list">
      <!-- 遍历四本书 -->
      <div
        v-for="book in books"
        :key="book.id"
        class="book-group"
      >
        <!-- 书籍标题栏：点击展开/折叠 -->
        <div
          class="book-header"
          :class="{ expanded: expandedBook === book.id }"
          @click="toggleBook(book.id)"
        >
          <!-- 展开/折叠指示器 -->
          <span class="expand-indicator">{{ expandedBook === book.id ? '−' : '+' }}</span>
          <!-- 书籍序号（罗马数字风格） -->
          <span class="book-number" :style="{ color: book.color }">{{ book.icon }}</span>
          <!-- 书籍短标题 -->
          <span class="book-title">{{ book.shortTitle }}</span>
          <!-- 学习进度 -->
          <span class="book-progress">{{ getBookProgress(book) }}%</span>
        </div>

        <!-- 知识点列表：展开时显示 -->
        <transition name="slide">
          <ul v-show="expandedBook === book.id" class="topic-list">
            <!-- 遍历该书的所有知识点 -->
            <li
              v-for="(topic, idx) in book.topics"
              :key="topic.id"
              class="topic-item"
              :class="{
                active: isActive(topic.id),
                completed: isCompleted(topic.id)
              }"
              @click="navigateToTopic(topic.id)"
            >
              <!-- 知识点序号 -->
              <span class="topic-number">{{ idx + 1 }}.</span>
              <!-- 知识点标题 -->
              <span class="topic-title">{{ topic.title }}</span>
              <!-- 完成状态指示 -->
              <span v-if="isCompleted(topic.id)" class="done-mark">✓</span>
            </li>
          </ul>
        </transition>
      </div>
    </nav>

    <!-- 侧边栏底部 -->
    <div class="sidebar-footer">
      <p>四本书 · {{ allTopics.length }} 个知识点</p>
      <p class="footer-note">升级打怪式学习</p>
    </div>
  </aside>
</template>

<style scoped>
/* 侧边栏容器 */
.sidebar {
  position: fixed;
  /* 固定定位，不随页面滚动 */
  top: 0;
  left: 0;
  /* 贴左上角 */
  width: var(--sidebar-width);
  /* 宽度由 CSS 变量控制 */
  height: 100vh;
  /* 高度占满视口 */
  background: var(--paper-card);
  /* 纯白纸张背景（区别于主区域暖白） */
  border-right: 1px solid var(--rule);
  /* 右侧暖灰分隔线 */
  display: flex;
  /* flex 布局 */
  flex-direction: column;
  /* 纵向排列 */
  overflow-y: auto;
  /* 内容超出时垂直滚动 */
  overscroll-behavior: contain;
  /* iOS: 阻止滚动穿透到 body */
  z-index: 200;
  /* 确保在遮罩层上方 */
  transition: transform var(--transition-normal);
  /* 平移过渡动画（移动端用） */
}

/* 侧边栏头部 */
.sidebar-header {
  padding: var(--space-6) var(--space-5) var(--space-4);
  /* 内边距：上右下左 */
  border-bottom: 1px solid var(--rule);
  /* 底部暖灰分隔线 */
}

/* Logo 文字区域 */
.logo-text h2 {
  font-family: var(--font-serif);
  /* 衬线字体：教科书标题感 */
  font-size: 1.15rem;
  /* 字号 */
  font-weight: 700;
  /* 加粗 */
  color: var(--ink);
  /* 墨黑 */
  margin: 0;
  /* 清除默认外边距 */
  line-height: 1.3;
  /* 紧凑行高 */
  letter-spacing: 0.3px;
  /* 微字间距 */
}

/* 副标题 */
.subtitle {
  font-family: var(--font-sans);
  /* 无衬线字体：UI 感 */
  font-size: 0.7rem;
  /* 小字号 */
  color: var(--ink-3);
  /* 三级墨色 */
  display: block;
  /* 块级显示 */
  margin-top: var(--space-1);
  /* 上方间距 */
  letter-spacing: 1px;
  /* 字间距 */
}

/* 首页链接 */
.home-link {
  display: flex;
  /* flex 布局 */
  align-items: center;
  /* 垂直居中 */
  gap: var(--space-2);
  /* 图标与文字间距 */
  padding: var(--space-3) var(--space-5);
  /* 内边距 */
  font-family: var(--font-sans);
  /* 无衬线字体 */
  font-size: 0.82rem;
  /* 字号 */
  font-weight: 500;
  /* 中等字重 */
  color: var(--ink-2);
  /* 二级墨色 */
  text-decoration: none;
  /* 去掉下划线 */
  border-bottom: 1px solid var(--rule-soft);
  /* 底部浅分隔线 */
  transition: background var(--transition-fast);
  /* 背景过渡 */
}

/* 首页链接悬停效果 */
.home-link:hover {
  background: var(--accent-soft);
  /* 靛青浅底 */
  color: var(--accent);
  /* 靛青文字 */
}

/* 首页图标 */
.home-icon {
  font-size: 1rem;
  /* 图标大小 */
  color: var(--ink-3);
  /* 三级墨色 */
  font-weight: 700;
}

/* 书籍列表容器 */
.book-list {
  flex: 1;
  /* 占据剩余空间 */
  padding: var(--space-2) 0;
  /* 上下内边距 */
}

/* 书籍分组 */
.book-group {
  margin-bottom: var(--space-1);
  /* 底部间距 */
}

/* 书籍标题栏 */
.book-header {
  display: flex;
  /* 水平排列 */
  align-items: center;
  /* 垂直居中 */
  gap: var(--space-2);
  /* 元素间距 */
  padding: var(--space-3) var(--space-5);
  /* 内边距 */
  cursor: pointer;
  /* 手型指针 */
  transition: background var(--transition-fast);
  /* 背景过渡 */
  user-select: none;
  /* 禁止选中文字 */
}

/* 书籍标题栏悬停效果 */
.book-header:hover {
  background: var(--paper-soft);
  /* 柔和纸张背景 */
}

/* 展开/折叠指示器 */
.expand-indicator {
  font-family: var(--font-mono);
  /* 等宽字体 */
  font-size: 0.8rem;
  /* 小字号 */
  color: var(--ink-3);
  /* 三级墨色 */
  width: 14px;
  /* 固定宽度 */
  text-align: center;
  /* 居中 */
  font-weight: 500;
}

/* 书籍图标 */
.book-number {
  font-size: 0.95rem;
  /* 图标大小 */
}

/* 书籍标题 */
.book-title {
  flex: 1;
  /* 占据剩余空间 */
  font-family: var(--font-sans);
  /* 无衬线字体 */
  font-size: 0.82rem;
  /* 字号 */
  font-weight: 600;
  /* 加粗 */
  color: var(--ink);
  /* 墨黑 */
}

/* 学习进度百分比 */
.book-progress {
  font-family: var(--font-mono);
  /* 等宽字体 */
  font-size: 0.68rem;
  /* 小字号 */
  color: var(--ink-3);
  /* 三级墨色 */
}

/* 知识点列表 */
.topic-list {
  list-style: none;
  /* 去掉默认列表样式 */
  padding: 0 0 var(--space-2) 0;
  /* 底部内边距 */
  margin: 0;
  /* 清除默认外边距 */
}

/* 知识点列表项 */
.topic-item {
  display: flex;
  /* 水平排列 */
  align-items: center;
  /* 垂直居中 */
  gap: var(--space-2);
  /* 元素间距 */
  padding: var(--space-2) var(--space-5);
  /* 内边距 */
  padding-left: calc(var(--space-5) + 18px);
  /* 左侧额外缩进 */
  cursor: pointer;
  /* 手型指针 */
  font-family: var(--font-sans);
  /* 无衬线字体 */
  font-size: 0.78rem;
  /* 字号 */
  color: var(--ink-3);
  /* 三级墨色 */
  transition: all var(--transition-fast);
  /* 所有属性过渡 */
  border-left: 2px solid transparent;
  /* 左侧指示条（默认透明） */
}

/* 知识点悬停效果 */
.topic-item:hover {
  background: var(--paper-soft);
  /* 柔和纸张背景 */
  color: var(--ink-2);
  /* 文本色变深 */
}

/* 当前激活的知识点 */
.topic-item.active {
  background: var(--accent-soft);
  /* 靛青浅底 */
  color: var(--accent);
  /* 靛青文字 */
  font-weight: 500;
  /* 中等字重 */
  border-left-color: var(--accent);
  /* 左侧指示条显示靛青 */
}

/* 已完成的知识点 */
.topic-item.completed {
  color: var(--ink-3);
  /* 弱化颜色 */
}

/* 知识点序号 */
.topic-number {
  font-family: var(--font-mono);
  /* 等宽字体 */
  font-size: 0.7rem;
  /* 小字号 */
  color: var(--ink-3);
  /* 三级墨色 */
  width: 18px;
  /* 固定宽度 */
}

/* 知识点标题 */
.topic-title {
  flex: 1;
  /* 占据剩余空间 */
  white-space: nowrap;
  /* 不换行 */
  overflow: hidden;
  /* 溢出隐藏 */
  text-overflow: ellipsis;
  /* 溢出显示省略号 */
}

/* 完成标记 */
.done-mark {
  font-size: 0.7rem;
  /* 小字号 */
  color: var(--book2-color);
  /* 松绿色 */
  font-weight: 700;
}

/* 侧边栏底部 */
.sidebar-footer {
  padding: var(--space-4) var(--space-5);
  /* 内边距 */
  border-top: 1px solid var(--rule);
  /* 顶部暖灰分隔线 */
  text-align: center;
  /* 居中对齐 */
}

.sidebar-footer p {
  font-family: var(--font-sans);
  /* 无衬线字体 */
  font-size: 0.7rem;
  /* 小字号 */
  color: var(--ink-3);
  /* 三级墨色 */
  margin: 0;
  line-height: 1.8;
}

.footer-note {
  font-style: italic;
  /* 斜体 */
}

/* 列表展开/折叠过渡动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
  /* 过渡时间和缓动函数 */
  overflow: hidden;
  /* 隐藏溢出 */
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  /* 透明 */
  max-height: 0;
  /* 高度为 0 */
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  /* 不透明 */
  max-height: 300px;
  /* 最大高度：与实际内容接近，减少动画延迟 */
}

/* 搜索输入框 */
.search-box {
  padding: var(--space-2) var(--space-5);
  border-bottom: 1px solid var(--rule-soft);
}

.search-input {
  width: 100%;
  font-family: var(--font-sans);
  /* 无衬线字体 */
  font-size: 0.75rem;
  /* 小字号 */
  color: var(--ink);
  background: var(--paper-soft);
  border: 1px solid var(--rule);
  border-color: var(--accent);
  /* 靛青边框 */
  border-radius: var(--radius-sm);
  padding: var(--space-2) var(--space-3);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search-input::placeholder {
  color: var(--ink-3);
  font-size: 0.72rem;
}

.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgba(44, 82, 130, 0.12);
}

/* 搜索无结果提示 */
.no-results {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  color: var(--ink-3);
  text-align: center;
  padding: var(--space-4) var(--space-5);
  margin: 0;
}

/* 响应式：手机端 */
@media (max-width: 768px) {
  .sidebar {
    /* 顶部留出 mobile-header 的高度（含安全区），避免被 header 遮挡 */
    top: calc(52px + env(safe-area-inset-top, 0px));
    /* 手机端按设备宽度展开，而非 0px 的 CSS 变量 */
    width: min(280px, 80vw);
    transform: translateX(-100%);
    /* 默认移出屏幕左侧（width 恢复后此位移才真正生效） */
    /* 关键：关闭状态下禁用指针事件，避免侧边栏内部溢出元素
       叠在 mobile-header 之上拦截汉堡按钮的点击。 */
    pointer-events: none;
  }

  /* 展开状态：滑入屏幕并恢复交互 */
  .sidebar.open {
    transform: translateX(0);
    pointer-events: auto;
  }
}
</style>
