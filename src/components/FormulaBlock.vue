<!--
  FormulaBlock.vue — 数学公式渲染组件
  功能：使用 KaTeX 渲染 LaTeX 数学公式
  设计：学术笔记本风格，靛青装饰条，衬线标签
-->
<script setup>
// 从 Vue 导入工具函数
import { ref, onMounted, watch } from 'vue'
// 导入 KaTeX 库：高质量数学公式渲染引擎
import katex from 'katex'

// 定义组件接收的属性
const props = defineProps({
  tex: {
    // LaTeX 公式字符串
    type: String,
    required: true
    // 必填
  },
  label: {
    // 公式标签/说明文字
    type: String,
    default: ''
    // 默认为空
  },
  explanation: {
    // 公式的通俗解释
    type: String,
    default: ''
    // 默认为空
  },
  displayMode: {
    // 是否为块级显示模式
    type: Boolean,
    default: true
    // 默认块级显示
  }
})

// 存储渲染后的 HTML 字符串
const renderedHtml = ref('')
// 存储可能的渲染错误信息
const errorMsg = ref('')

// 渲染公式的函数
function renderFormula() {
  try {
    // 调用 KaTeX 渲染 LaTeX 为 HTML
    renderedHtml.value = katex.renderToString(props.tex, {
      displayMode: props.displayMode,
      // 块级模式：居中、独立一行
      throwOnError: false,
      // 渲染出错时不抛异常
      output: 'html',
      // 输出 HTML 格式
      strict: false
      // 允许非标准 LaTeX 语法
    })
    // 清除之前的错误
    errorMsg.value = ''
  } catch (e) {
    // 渲染失败时记录错误信息
    errorMsg.value = e.message
    // 清空渲染结果
    renderedHtml.value = ''
  }
}

// 组件挂载后首次渲染公式
onMounted(() => {
  renderFormula()
})

// 监听公式内容变化，自动重新渲染
watch(() => props.tex, () => {
  renderFormula()
})
</script>

<template>
  <!-- 公式容器：学术笔记本风格 -->
  <div class="formula-block">
    <!-- 公式标签：衬线字体，学术感 -->
    <div v-if="label" class="formula-label">{{ label }}</div>
    <!-- 公式内容区域：通过 v-html 渲染 KaTeX 生成的 HTML -->
    <div class="formula-content" v-html="renderedHtml"></div>
    <!-- 公式通俗解释：详细注释每个符号 -->
    <div v-if="explanation" class="formula-explanation">
      <span class="explanation-icon">💡</span>
      <span class="explanation-text">{{ explanation }}</span>
    </div>
    <!-- 错误提示：渲染失败时显示 -->
    <div v-if="errorMsg" class="formula-error">
      渲染错误：{{ errorMsg }}
    </div>
  </div>
</template>

<style scoped>
/* 公式块容器 */
.formula-block {
  background: var(--paper-soft);
  /* 柔和纸张背景（略深米白） */
  border-left: 3px solid var(--accent);
  /* 左侧靛青装饰条：学术批注感 */
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  /* 右侧小圆角，左侧平（配合装饰条） */
  padding: var(--space-4) var(--space-5);
  /* 内边距 */
  margin: var(--space-5) 0;
  /* 外边距 */
  position: relative;
  /* 相对定位 */
}

/* 公式标签 */
.formula-label {
  font-family: var(--font-sans);
  /* 无衬线字体：标签感 */
  font-size: 0.72rem;
  /* 小字号 */
  font-weight: 600;
  /* 加粗 */
  color: var(--accent);
  /* 靛青色 */
  text-transform: uppercase;
  /* 大写字母 */
  letter-spacing: 0.8px;
  /* 字间距 */
  margin-bottom: var(--space-2);
  /* 下方间距 */
}

/* 公式内容区域 */
.formula-content {
  display: flex;
  /* flex 布局 */
  justify-content: center;
  /* 水平居中 */
  padding: var(--space-2) 0;
  /* 上下内边距 */
  overflow-x: auto;
  /* 公式过长时水平滚动 */
}

/* 公式通俗解释 */
.formula-explanation {
  display: flex;
  /* 水平排列 */
  align-items: flex-start;
  /* 顶部对齐 */
  gap: var(--space-2);
  /* 图标与文字间距 */
  margin-top: var(--space-3);
  /* 上方间距 */
  padding-top: var(--space-3);
  /* 上方内边距 */
  border-top: 1px dashed var(--rule-soft);
  /* 虚线分隔线 */
}

/* 解释图标 */
.explanation-icon {
  font-size: 0.85rem;
  /* 图标大小 */
  flex-shrink: 0;
  /* 不缩小 */
  margin-top: 1px;
  /* 微调对齐 */
}

/* 解释文字 */
.explanation-text {
  font-family: var(--font-sans);
  /* 无衬线字体：解释文字用无衬线更易读 */
  font-size: 0.82rem;
  /* 字号 */
  color: var(--ink-3);
  /* 三级墨色 */
  line-height: 1.6;
  /* 行高 */
}

/* 渲染错误提示 */
.formula-error {
  font-family: var(--font-mono);
  /* 等宽字体 */
  font-size: 0.8rem;
  /* 小字号 */
  color: var(--rust);
  /* 锈红色 */
  margin-top: var(--space-2);
  /* 上方间距 */
}
</style>
