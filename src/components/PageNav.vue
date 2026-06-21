<!--
  PageNav.vue — 上/下一页导航组件
  功能：显示上一个/下一个知识点的链接，实现"翻页"体验
  设计：学术笔记本风格，衬线字体
-->
<script setup>
// 从 Vue 导入工具
import { computed } from 'vue'
// 导入知识点数据
import { allTopics } from '../data/topics.js'

// 定义组件接收的属性
const props = defineProps({
  currentTopicId: {
    // 当前知识点 ID
    type: String,
    required: true
  }
})

// 计算当前知识点在数组中的索引
const currentIndex = computed(() => {
  return allTopics.findIndex(t => t.id === props.currentTopicId)
})

// 上一个知识点对象
const prevTopic = computed(() => {
  // 如果是第一个知识点，没有上一个
  if (currentIndex.value <= 0) return null
  return allTopics[currentIndex.value - 1]
})

// 下一个知识点对象
const nextTopic = computed(() => {
  // 如果是最后一个知识点，没有下一个
  if (currentIndex.value >= allTopics.length - 1) return null
  return allTopics[currentIndex.value + 1]
})
</script>

<template>
  <!-- 导航容器 -->
  <nav class="page-nav">
    <!-- 上一个知识点链接 -->
    <router-link
      v-if="prevTopic"
      :to="`/topic/${prevTopic.id}`"
      class="nav-link prev"
    >
      <!-- 方向标识 -->
      <span class="nav-arrow">←</span>
      <!-- 链接内容 -->
      <div class="nav-content">
        <span class="nav-label">上一篇</span>
        <span class="nav-title">{{ prevTopic.title }}</span>
      </div>
    </router-link>
    <!-- 占位：没有上一个时保持布局 -->
    <div v-else class="nav-link placeholder"></div>

    <!-- 下一个知识点链接 -->
    <router-link
      v-if="nextTopic"
      :to="`/topic/${nextTopic.id}`"
      class="nav-link next"
    >
      <!-- 链接内容 -->
      <div class="nav-content">
        <span class="nav-label">下一篇</span>
        <span class="nav-title">{{ nextTopic.title }}</span>
      </div>
      <!-- 方向标识 -->
      <span class="nav-arrow">→</span>
    </router-link>
    <!-- 占位：没有下一个时保持布局 -->
    <div v-else class="nav-link placeholder"></div>
  </nav>
</template>

<style scoped>
/* 导航容器 */
.page-nav {
  display: flex;
  /* 水平排列 */
  gap: var(--space-4);
  /* 元素间距 */
  margin-top: var(--space-10);
  /* 上方大间距 */
  padding-top: var(--space-6);
  /* 上方内边距 */
  border-top: 1px solid var(--rule);
  /* 顶部分隔线 */
}

/* 导航链接 */
.nav-link {
  flex: 1;
  /* 各占一半 */
  display: flex;
  /* flex 布局 */
  align-items: center;
  /* 垂直居中 */
  gap: var(--space-3);
  /* 元素间距 */
  padding: var(--space-4) var(--space-5);
  /* 内边距 */
  border: 1px solid var(--rule);
  /* 暖灰边框 */
  border-radius: var(--radius-md);
  /* 中等圆角 */
  text-decoration: none;
  /* 去掉下划线 */
  color: var(--ink-2);
  /* 二级墨色 */
  transition: all var(--transition-fast);
  /* 过渡动画 */
}

/* 下一篇：右对齐 */
.nav-link.next {
  justify-content: flex-end;
  /* 内容右对齐 */
  text-align: right;
  /* 文字右对齐 */
}

/* 占位元素 */
.nav-link.placeholder {
  border: none;
  /* 无边框 */
}

/* 悬停效果 */
.nav-link:not(.placeholder):hover {
  border-color: var(--accent);
  /* 靛青边框 */
  background: var(--accent-soft);
  /* 靛青浅底 */
}

/* 方向箭头 */
.nav-arrow {
  font-family: var(--font-serif);
  /* 衬线字体 */
  font-size: 1.2rem;
  /* 字号 */
  color: var(--ink-3);
  /* 三级墨色 */
  flex-shrink: 0;
  /* 不缩小 */
}

/* 内容区域 */
.nav-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

/* 标签 */
.nav-label {
  font-family: var(--font-sans);
  /* 无衬线字体 */
  font-size: 0.7rem;
  /* 小字号 */
  color: var(--ink-3);
  /* 三级墨色 */
  text-transform: uppercase;
  /* 大写 */
  letter-spacing: 1px;
  /* 字间距 */
}

/* 标题 */
.nav-title {
  font-family: var(--font-serif);
  /* 衬线字体 */
  font-size: 0.92rem;
  /* 字号 */
  font-weight: 600;
  /* 加粗 */
  color: var(--ink);
  /* 墨黑 */
}

/* 响应式：手机端 */
@media (max-width: 768px) {
  .page-nav {
    flex-direction: column;
    /* 纵向排列 */
  }
}
</style>
