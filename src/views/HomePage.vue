<!--
  HomePage.vue — 学习总览首页
  功能：展示四本书的学习路径、知识点卡片、整体进度
  设计：学术笔记本风格，衬线标题，暖白纸张
-->
<script setup>
// 从 Vue 导入工具
import { computed } from 'vue'
// 从 Vue Router 导入路由
import { useRouter } from 'vue-router'
// 导入书籍和知识点数据
import { books, allTopics } from '../data/topics.js'

// 获取路由实例
const router = useRouter()

// 判断知识点是否已完成
function isCompleted(topicId) {
  return localStorage.getItem(`dl-completed-${topicId}`) === 'true'
}

// 计算总学习进度
const overallProgress = computed(() => {
  // 已完成的知识点数量
  const completed = allTopics.filter(t => isCompleted(t.id)).length
  // 返回百分比
  return Math.round((completed / allTopics.length) * 100)
})

// 导航到知识点页面
function goToTopic(topicId) {
  router.push(`/topic/${topicId}`)
}
</script>

<template>
  <!-- 首页容器 -->
  <div class="home-page">
    <!-- 页面头部：标题区域 -->
    <header class="hero">
      <!-- 顶部装饰线 -->
      <div class="hero-rule"></div>
      <!-- 主标题 -->
      <h1 class="hero-title">深度学习入门 Handbook</h1>
      <!-- 副标题 -->
      <p class="hero-subtitle">
        从感知机到强化学习，四本书 · {{ allTopics.length }} 个知识点 · 升级打怪式学习
      </p>
      <!-- 总进度 -->
      <div class="overall-progress">
        <!-- 进度条容器 -->
        <div class="progress-track">
          <!-- 进度条填充 -->
          <div class="progress-fill" :style="{ width: overallProgress + '%' }"></div>
        </div>
        <!-- 进度文字 -->
        <span class="progress-label">{{ overallProgress }}% 完成</span>
      </div>
    </header>

    <!-- 书籍卡片列表 -->
    <section class="books-section">
      <!-- 遍历四本书 -->
      <article
        v-for="(book, bookIdx) in books"
        :key="book.id"
        class="book-card"
      >
        <!-- 书籍头部 -->
        <div class="book-header" :style="{ borderColor: book.color }">
          <!-- 书籍序号（罗马数字风格） -->
          <span class="book-idx">{{ ['I', 'II', 'III', 'IV'][bookIdx] }}</span>
          <!-- 书籍标题 -->
          <h2 class="book-title">{{ book.title }}</h2>
          <!-- 书籍描述 -->
          <p class="book-desc">{{ book.description }}</p>
        </div>

        <!-- 知识点网格 -->
        <div class="topics-grid">
          <!-- 遍历该书的知识点 -->
          <div
            v-for="(topic, idx) in book.topics"
            :key="topic.id"
            class="topic-card"
            :class="{ completed: isCompleted(topic.id) }"
            @click="goToTopic(topic.id)"
          >
            <!-- 知识点序号 -->
            <span class="topic-idx">{{ bookIdx + 1 }}.{{ idx + 1 }}</span>
            <!-- 知识点图标 -->
            <span class="topic-icon">{{ topic.icon }}</span>
            <!-- 知识点标题 -->
            <h3 class="topic-name">{{ topic.title }}</h3>
            <!-- 知识点副标题 -->
            <p class="topic-sub">{{ topic.subtitle }}</p>
            <!-- 完成状态 -->
            <span v-if="isCompleted(topic.id)" class="done-badge">✓ 已完成</span>
          </div>
        </div>
      </article>
    </section>

    <!-- 底部说明 -->
    <footer class="home-footer">
      <p>建议按照 I → II → III → IV 的顺序学习，每一本都建立在前一本的基础上。</p>
    </footer>
  </div>
</template>

<style scoped>
/* 首页容器 */
.home-page {
  max-width: var(--content-max-width);
  /* 最大宽度限制（Tufte 原则） */
  margin: 0 auto;
  /* 水平居中 */
  padding: var(--space-8) var(--space-6);
  /* 内边距 */
}

/* 头部区域 */
.hero {
  text-align: center;
  /* 居中 */
  margin-bottom: var(--space-12);
  /* 下方大间距 */
}

/* 顶部装饰线 */
.hero-rule {
  width: 60px;
  /* 短横线 */
  height: 2px;
  /* 高度 */
  background: var(--accent);
  /* 靛青色 */
  margin: 0 auto var(--space-6);
  /* 居中 + 下方间距 */
}

/* 主标题 */
.hero-title {
  font-family: var(--font-serif);
  /* 衬线字体：教科书标题感 */
  font-size: 2.2rem;
  /* 大字号 */
  font-weight: 700;
  /* 加粗 */
  color: var(--ink);
  /* 墨黑 */
  margin: 0 0 var(--space-3);
  /* 下方间距 */
  letter-spacing: -0.5px;
  /* 微负字间距（大标题更紧凑） */
}

/* 副标题 */
.hero-subtitle {
  font-family: var(--font-sans);
  /* 无衬线字体 */
  font-size: 0.95rem;
  /* 字号 */
  color: var(--ink-3);
  /* 三级墨色 */
  margin: 0 0 var(--space-8);
  /* 下方间距 */
  line-height: 1.6;
}

/* 总进度区域 */
.overall-progress {
  display: flex;
  /* 水平排列 */
  align-items: center;
  /* 垂直居中 */
  gap: var(--space-3);
  /* 间距 */
  max-width: 300px;
  /* 最大宽度 */
  margin: 0 auto;
  /* 居中 */
}

/* 进度条轨道 */
.progress-track {
  flex: 1;
  /* 占据剩余空间 */
  height: 4px;
  /* 高度 */
  background: var(--rule-soft);
  /* 浅分隔线背景 */
  border-radius: 2px;
  /* 圆角 */
  overflow: hidden;
  /* 隐藏溢出 */
}

/* 进度条填充 */
.progress-fill {
  height: 100%;
  /* 高度占满 */
  background: var(--accent);
  /* 靛青色 */
  border-radius: 2px;
  /* 圆角 */
  transition: width var(--transition-normal);
  /* 宽度过渡 */
}

/* 进度标签 */
.progress-label {
  font-family: var(--font-mono);
  /* 等宽字体 */
  font-size: 0.72rem;
  /* 小字号 */
  color: var(--ink-3);
  /* 三级墨色 */
  white-space: nowrap;
  /* 不换行 */
}

/* 书籍区域 */
.books-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
  /* 书籍间距 */
}

/* 书籍卡片 */
.book-card {
  background: var(--paper-card);
  /* 纯白背景 */
  border: 1px solid var(--rule);
  /* 暖灰边框 */
  border-radius: var(--radius-md);
  /* 中等圆角 */
  overflow: hidden;
  /* 隐藏溢出 */
}

/* 书籍头部 */
.book-header {
  padding: var(--space-6) var(--space-6) var(--space-4);
  /* 内边距 */
  border-left: 4px solid;
  /* 左侧彩色装饰条（颜色由 book.color 决定） */
}

/* 书籍序号 */
.book-idx {
  font-family: var(--font-serif);
  /* 衬线字体 */
  font-size: 0.75rem;
  /* 小字号 */
  font-weight: 700;
  /* 加粗 */
  color: var(--ink-3);
  /* 三级墨色 */
  letter-spacing: 2px;
  /* 字间距 */
  display: block;
  /* 块级显示 */
  margin-bottom: var(--space-2);
}

/* 书籍标题 */
.book-title {
  font-family: var(--font-serif);
  /* 衬线字体 */
  font-size: 1.15rem;
  /* 字号 */
  font-weight: 700;
  /* 加粗 */
  color: var(--ink);
  /* 墨黑 */
  margin: 0 0 var(--space-2);
  /* 下方间距 */
  line-height: 1.4;
}

/* 书籍描述 */
.book-desc {
  font-family: var(--font-sans);
  /* 无衬线字体 */
  font-size: 0.85rem;
  /* 字号 */
  color: var(--ink-3);
  /* 三级墨色 */
  margin: 0;
}

/* 知识点网格 */
.topics-grid {
  display: grid;
  /* 网格布局 */
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  /* 自适应列：最小 200px */
  gap: 1px;
  /* 间距 1px（模拟表格线） */
  background: var(--rule-soft);
  /* 间距颜色（浅分隔线） */
}

/* 知识点卡片 */
.topic-card {
  background: var(--paper-card);
  /* 纯白背景 */
  padding: var(--space-5);
  /* 内边距 */
  cursor: pointer;
  /* 手型指针 */
  transition: background var(--transition-fast);
  /* 背景过渡 */
  position: relative;
  /* 相对定位 */
}

/* 知识点悬停效果 */
.topic-card:hover {
  background: var(--accent-soft);
  /* 靛青浅底 */
}

/* 已完成状态 */
.topic-card.completed {
  background: var(--paper-soft);
  /* 柔和纸张背景 */
}

/* 知识点序号 */
.topic-idx {
  font-family: var(--font-mono);
  /* 等宽字体 */
  font-size: 0.68rem;
  /* 小字号 */
  color: var(--ink-3);
  /* 三级墨色 */
  display: block;
  /* 块级显示 */
  margin-bottom: var(--space-2);
}

/* 知识点图标 */
.topic-icon {
  font-size: 1.3rem;
  /* 图标大小 */
  display: block;
  /* 块级显示 */
  margin-bottom: var(--space-2);
}

/* 知识点标题 */
.topic-name {
  font-family: var(--font-serif);
  /* 衬线字体 */
  font-size: 0.95rem;
  /* 字号 */
  font-weight: 600;
  /* 加粗 */
  color: var(--ink);
  /* 墨黑 */
  margin: 0 0 var(--space-1);
  /* 下方间距 */
  line-height: 1.3;
}

/* 知识点副标题 */
.topic-sub {
  font-family: var(--font-sans);
  /* 无衬线字体 */
  font-size: 0.75rem;
  /* 小字号 */
  color: var(--ink-3);
  /* 三级墨色 */
  margin: 0;
  font-style: italic;
  /* 斜体 */
}

/* 完成徽章 */
.done-badge {
  display: inline-block;
  /* 行内块 */
  margin-top: var(--space-2);
  /* 上方间距 */
  font-family: var(--font-sans);
  font-size: 0.68rem;
  color: var(--book2-color);
  /* 松绿色 */
  font-weight: 600;
}

/* 底部说明 */
.home-footer {
  margin-top: var(--space-12);
  padding-top: var(--space-6);
  border-top: 1px solid var(--rule);
  text-align: center;
}

.home-footer p {
  font-family: var(--font-serif);
  font-size: 0.88rem;
  color: var(--ink-3);
  font-style: italic;
}

/* 响应式：手机端 */
@media (max-width: 768px) {
  .home-page {
    padding: var(--space-6) var(--space-4);
  }

  .hero-title {
    font-size: 1.6rem;
  }

  .topics-grid {
    grid-template-columns: repeat(2, 1fr);
    /* 手机端两列 */
  }
}
</style>
