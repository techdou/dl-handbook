<!--
  TermPopover.vue — 术语解释气泡卡片组件
  功能：点击术语时弹出解释气泡，点击外部关闭
  设计：学术笔记本风格，靛青装饰条，衬线标题
-->
<script setup>
// 从 Vue 导入工具
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// 定义组件接收的属性
const props = defineProps({
  term: {
    // 术语名称
    type: String,
    required: true
  },
  explanation: {
    // 术语解释
    type: String,
    required: true
  }
})

// 气泡是否可见
const visible = ref(false)
// 气泡位置
const position = ref({ top: 0, left: 0 })
// 触发元素引用
const triggerRef = ref(null)
// 气泡元素引用
const popoverRef = ref(null)

// 切换气泡显示
function togglePopover(event) {
  // 阻止事件冒泡，避免立即被 document 点击关闭
  event.stopPropagation()

  if (visible.value) {
    // 如果已显示，关闭
    visible.value = false
    return
  }

  // 计算气泡位置
  const rect = event.currentTarget.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

  // 气泡显示在术语下方
  position.value = {
    top: rect.bottom + scrollTop + 8,
    // 术语底部 + 8px 间距
    left: rect.left + scrollLeft
    // 与术语左对齐
  }

  // 显示气泡
  visible.value = true

  // 下一帧调整位置，确保不超出屏幕
  nextTick(() => {
    if (!popoverRef.value) return
    const popRect = popoverRef.value.getBoundingClientRect()
    const viewportW = window.innerWidth

    // 如果气泡超出右边界，向左移动
    if (popRect.right > viewportW - 16) {
      position.value.left = viewportW - popRect.width - 16 + scrollLeft
    }
    // 如果气泡超出左边界，向右移动
    if (popRect.left < 16) {
      position.value.left = 16 + scrollLeft
    }
  })
}

// 点击外部关闭气泡
function onClickOutside(event) {
  if (visible.value && popoverRef.value) {
    // 如果点击的不是气泡内部，关闭
    if (!popoverRef.value.contains(event.target)) {
      visible.value = false
    }
  }
}

// 组件挂载时监听全局点击
onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

// 组件卸载时移除监听
onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})
</script>

<template>
  <!-- 术语触发器：可点击的带下划线文字 -->
  <span
    ref="triggerRef"
    class="term-trigger"
    @click="togglePopover"
    :title="'点击查看「' + term + '」的解释'"
  >
    <!-- 术语文字 -->
    <slot>{{ term }}</slot>
    <!-- 术语标记图标 -->
    <span class="term-marker">📖</span>
  </span>

  <!-- 气泡卡片：通过 Teleport 挂载到 body -->
  <Teleport to="body">
    <transition name="popover">
      <!-- 气泡容器 -->
      <div
        v-if="visible"
        ref="popoverRef"
        class="term-popover"
        :style="{ top: position.top + 'px', left: position.left + 'px' }"
      >
        <!-- 气泡头部 -->
        <div class="popover-header">
          <!-- 术语名称 -->
          <span class="popover-term">{{ term }}</span>
          <!-- 关闭按钮 -->
          <button class="popover-close" @click.stop="visible = false">&times;</button>
        </div>
        <!-- 解释内容 -->
        <div class="popover-content">{{ explanation }}</div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
/* 术语触发器 */
.term-trigger {
  color: var(--accent);
  /* 靛青色文字 */
  border-bottom: 1px dashed var(--accent);
  /* 虚线下划线 */
  cursor: pointer;
  /* 手型指针 */
  transition: all var(--transition-fast);
  /* 过渡动画 */
  position: relative;
  /* 相对定位 */
  font-weight: 500;
  /* 中等字重 */
}

/* 术语触发器悬停效果 */
.term-trigger:hover {
  background: var(--accent-soft);
  /* 靛青浅底 */
  border-bottom-style: solid;
  /* 实线下划线 */
}

/* 术语标记图标 */
.term-marker {
  font-size: 0.7em;
  /* 小字号 */
  vertical-align: super;
  /* 上标 */
  margin-left: 1px;
  /* 微间距 */
}
</style>

<style>
/* 气泡卡片样式（非 scoped，因为 Teleport 到 body） */
.term-popover {
  position: absolute;
  /* 绝对定位 */
  z-index: 2000;
  /* 确保在最上层 */
  width: 320px;
  /* 固定宽度 */
  max-width: calc(100vw - 32px);
  /* 不超出屏幕 */
  background: var(--paper-card, #ffffff);
  /* 纯白背景 */
  border: 1px solid var(--rule, #d8d4c8);
  /* 暖灰边框 */
  border-radius: var(--radius-md, 6px);
  /* 中等圆角 */
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  /* 阴影 */
  overflow: hidden;
  /* 隐藏溢出 */
}

/* 气泡头部 */
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
  font-size: 0.9rem;
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
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--ink-3, #6b6b6b);
  padding: 0 4px;
  line-height: 1;
}

.term-popover .popover-close:hover {
  color: var(--ink, #1a1a1a);
}

/* 解释内容 */
.term-popover .popover-content {
  padding: 12px 14px;
  /* 内边距 */
  font-family: var(--font-sans, -apple-system, sans-serif);
  /* 无衬线字体 */
  font-size: 0.82rem;
  /* 字号 */
  color: var(--ink-2, #3d3d3d);
  /* 二级墨色 */
  line-height: 1.7;
  /* 行高 */
}

/* 气泡进入/离开动画 */
.popover-enter-active,
.popover-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.popover-enter-from,
.popover-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
