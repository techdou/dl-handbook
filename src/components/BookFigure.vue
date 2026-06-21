<!--
  BookFigure.vue — 书籍插图展示组件
  功能：展示对应书籍章节的插图，带图注和放大查看
  设计：学术笔记本风格，图注用衬线字体
-->
<script setup>
// 从 Vue 导入工具
import { ref } from 'vue'

// 定义组件接收的属性
const props = defineProps({
  src: {
    // 图片路径
    type: String,
    required: true
  },
  caption: {
    // 图注文字
    type: String,
    default: ''
  }
})

// 是否放大查看
const enlarged = ref(false)

// 切换放大状态
function toggleEnlarge() {
  enlarged.value = !enlarged.value
}
</script>

<template>
  <!-- 图片容器 -->
  <figure class="book-figure" @click="toggleEnlarge">
    <!-- 图片 -->
    <img
      :src="src"
      :alt="caption"
      class="figure-img"
      loading="lazy"
    />
    <!-- 图注 -->
    <figcaption v-if="caption" class="figure-caption">
      <span class="caption-icon">📐</span>
      {{ caption }}
    </figcaption>
    <!-- 放大提示 -->
    <div class="zoom-hint">点击放大</div>
  </figure>

  <!-- 放大弹窗 -->
  <Teleport to="body">
    <transition name="fade">
      <div v-if="enlarged" class="enlarged-overlay" @click="enlarged = false">
        <div class="enlarged-container">
          <img :src="src" :alt="caption" class="enlarged-img" />
          <p v-if="caption" class="enlarged-caption">{{ caption }}</p>
          <button class="enlarged-close" @click.stop="enlarged = false">&times;</button>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
/* 图片容器 — 统一卡片 */
.book-figure {
  display: block;
  /* 块级，便于统一宽度 */
  margin: var(--space-4) 0;
  /* 外边距 */
  cursor: pointer;
  /* 手型指针 */
  position: relative;
  /* 相对定位 */
  max-width: 100%;
  /* 不超出容器 */
  background: var(--paper-soft, #faf8f5);
  /* 暖白纸张底色 */
  border: 1px solid var(--rule);
  /* 暖灰边框 */
  border-radius: var(--radius-sm, 6px);
  /* 微圆角 */
  overflow: hidden;
  /* 圆角裁切 */
  transition: transform var(--transition-fast),
              box-shadow var(--transition-fast);
}

/* 卡片悬停：微上移 + 阴影 */
.book-figure:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

/* 图片 — 统一尺寸 */
.figure-img {
  display: block;
  width: 100%;
  /* 撑满容器 */
  height: 200px;
  /* 固定高度，统一大小 */
  object-fit: contain;
  /* 保持比例，居中显示 */
  padding: var(--space-3, 12px);
  /* 统一内边距 */
  box-sizing: border-box;
  /* 内边距计入宽度 */
  background: var(--paper-soft, #faf8f5);
  /* 暖白底色 */
  border: none;
  /* 边框由容器统一控制 */
  border-radius: 0;
  /* 圆角由容器统一控制 */
}

/* 图注 */
.figure-caption {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  color: var(--ink-3);
  margin: 0;
  padding: var(--space-2, 8px) var(--space-3, 12px);
  text-align: center;
  line-height: 1.5;
  max-width: 100%;
  /* 不超出容器 */
  box-sizing: border-box;
  border-top: 1px solid var(--rule);
  /* 与图片区域分隔 */
}

/* 图注图标 */
.caption-icon {
  font-size: 0.7rem;
  margin-right: 2px;
}

/* 放大提示 */
.zoom-hint {
  position: absolute;
  /* 绝对定位 */
  bottom: 30px;
  /* 底部 */
  right: 8px;
  /* 右侧 */
  font-family: var(--font-sans);
  font-size: 0.65rem;
  color: var(--paper-card);
  /* 白色文字 */
  background: rgba(26, 26, 26, 0.6);
  /* 半透明黑色背景 */
  padding: 2px 6px;
  border-radius: 3px;
  opacity: 0;
  /* 默认透明 */
  transition: opacity var(--transition-fast);
  /* 过渡动画 */
}

/* 悬停显示放大提示 */
.book-figure:hover .zoom-hint {
  opacity: 1;
  /* 显示 */
}
</style>

<style>
/* 放大弹窗样式（非 scoped） */
.enlarged-overlay {
  position: fixed;
  /* 固定定位 */
  inset: 0;
  /* 覆盖全屏 */
  background: rgba(26, 26, 26, 0.85);
  /* 深色半透明 */
  z-index: 3000;
  /* 确保在最上层 */
  display: flex;
  /* flex 布局 */
  align-items: center;
  /* 垂直居中 */
  justify-content: center;
  /* 水平居中 */
  cursor: pointer;
  /* 手型指针 */
  padding: var(--space-6);
  /* 内边距 */
}

/* 放大容器 */
.enlarged-container {
  position: relative;
  /* 相对定位 */
  max-width: 90vw;
  /* 最大宽度 */
  max-height: 85vh;
  /* 最大高度 */
}

/* 放大图片 */
.enlarged-img {
  max-width: 100%;
  /* 最大宽度 */
  max-height: 80vh;
  /* 最大高度 */
  object-fit: contain;
  /* 保持比例 */
  border-radius: var(--radius-sm);
  /* 小圆角 */
}

/* 放大图注 */
.enlarged-caption {
  text-align: center;
  /* 居中 */
  font-family: var(--font-sans);
  font-size: 0.9rem;
  color: #ccc;
  /* 浅灰色 */
  margin-top: var(--space-3);
}

/* 关闭按钮 */
.enlarged-close {
  position: absolute;
  /* 绝对定位 */
  top: -40px;
  /* 上方 */
  right: 0;
  /* 右侧 */
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #ccc;
  transition: color 0.15s;
}

.enlarged-close:hover {
  color: #fff;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
