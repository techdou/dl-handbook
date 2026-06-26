<!--
  App.vue — 应用根组件
  功能：整体布局（侧边栏 + 主内容区），路由视图容器
  设计：学术笔记本风格，衬线字体，暖白纸张
-->
<script setup>
// 从 Vue 导入响应式工具函数
import { ref, provide } from 'vue'
// 从 Vue Router 导入路由相关工具
import { useRouter } from 'vue-router'
// 导入侧边栏导航组件
import AppSidebar from './components/handbook/AppSidebar.vue'

// 获取路由实例，用于编程式导航
const router = useRouter()

// 侧边栏是否展开（移动端使用）
const sidebarOpen = ref(false)
// 用 provide/inject 让子组件也能控制侧边栏
provide('sidebarOpen', sidebarOpen)

// 切换侧边栏的显示状态
function toggleSidebar() {
  // 取反当前状态
  sidebarOpen.value = !sidebarOpen.value
}

// 关闭侧边栏（点击遮罩层时触发）
function closeSidebar() {
  // 设为关闭
  sidebarOpen.value = false
}
</script>

<template>
  <!-- 应用根容器：flex 布局，左侧边栏 + 右内容区 -->
  <div class="app-layout">
    <!-- 移动端顶部导航栏 -->
    <header class="mobile-header">
      <!-- 汉堡菜单按钮：点击展开侧边栏 -->
      <button class="menu-btn" @click="toggleSidebar" aria-label="打开菜单">
        <!-- 汉堡图标（三条横线） -->
        <span></span>
        <span></span>
        <span></span>
      </button>
      <!-- 移动端标题：学术风格 -->
      <h1 class="mobile-title">DL Handbook</h1>
    </header>

    <!-- 移动端侧边栏遮罩层：点击关闭侧边栏 -->
    <div
      class="sidebar-overlay"
      :class="{ active: sidebarOpen }"
      @click="closeSidebar"
    ></div>

    <!-- 侧边栏组件：桌面端始终显示，移动端滑出 -->
    <AppSidebar
      :class="{ open: sidebarOpen }"
      @navigate="closeSidebar"
    />

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 简单 router-view 测试 -->
      <router-view />
    </main>
  </div>
</template>

<style scoped>
/* 应用根布局：flex 水平排列 */
.app-layout {
  display: flex;
  /* 水平排列：侧边栏 + 内容区 */
  min-height: 100vh;
  /* 最小高度占满视口 */
}

/* 移动端顶部栏：桌面端隐藏 */
.mobile-header {
  display: none;
  /* 默认隐藏 */
  position: fixed;
  /* 固定定位 */
  top: 0;
  left: 0;
  right: 0;
  /* 贴满顶部 */
  height: 52px;
  /* 高度 52px */
  background: var(--paper-card);
  /* 纯白背景 */
  border-bottom: 1px solid var(--rule);
  /* 暖灰底部分隔线 */
  /* 高于侧边栏（z-index 200），保证汉堡按钮在侧边栏展开时也始终可点 */
  z-index: 201;
  /* 确保在最上层 */
  align-items: center;
  /* 垂直居中 */
  padding: 0 var(--space-4);
  /* 左右内边距 */
  gap: var(--space-3);
  /* 元素间距 */
}

/* 汉堡菜单按钮 */
.menu-btn {
  display: flex;
  /* flex 布局 */
  flex-direction: column;
  /* 纵向排列三条线 */
  gap: 5px;
  /* 线条间距 */
  padding: 8px;
  /* 点击热区 */
  background: none;
  /* 无背景 */
  border: none;
  /* 无边框 */
  cursor: pointer;
  /* 手型指针 */
}

/* 汉堡菜单的三条横线 */
.menu-btn span {
  display: block;
  /* 块级元素 */
  width: 20px;
  /* 线条宽度 */
  height: 1.5px;
  /* 线条高度（细线，学术感） */
  background: var(--ink);
  /* 墨黑色 */
  border-radius: 1px;
  /* 微圆角 */
  transition: var(--transition-fast);
  /* 过渡动画 */
}

/* 移动端标题 */
.mobile-title {
  font-family: var(--font-serif);
  /* 衬线字体 */
  font-size: 1rem;
  /* 字号 */
  font-weight: 700;
  /* 加粗 */
  color: var(--ink);
  /* 墨黑 */
  letter-spacing: 0.5px;
  /* 字间距 */
}

/* 遮罩层：默认透明不可见 */
.sidebar-overlay {
  display: none;
  /* 默认隐藏 */
  position: fixed;
  /* 固定定位 */
  inset: 0;
  /* 覆盖全屏 */
  background: rgba(26, 26, 26, 0.25);
  /* 墨黑色半透明 */
  z-index: 199;
  /* 在侧边栏下方 */
  opacity: 0;
  /* 默认透明 */
  transition: opacity var(--transition-normal);
  /* 透明度过渡 */
  /* 关键：透明状态下不拦截触摸/点击，否则移动端会盖在内容上导致所有点击失效 */
  pointer-events: none;
}

/* 遮罩层激活状态 */
.sidebar-overlay.active {
  opacity: 1;
  /* 显示 */
  /* 激活时才允许接收点击（点击空白处关闭侧边栏） */
  pointer-events: auto;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  /* 占据剩余空间 */
  margin-left: var(--sidebar-width);
  /* 为侧边栏留出空间 */
  min-height: 100vh;
  /* 最小高度占满视口 */
  background: var(--paper);
  /* 暖白纸张背景 */
}

/* 页面切换过渡动画：淡入淡出 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease;
  /* 透明度过渡（稍快，学术感） */
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
  /* 进入前和离开后透明 */
}

/* 响应式：手机端（768px 以下） */
@media (max-width: 768px) {
  /* 显示移动端顶部栏 */
  .mobile-header {
    display: flex;
    /* iPhone 刘海屏安全区 */
    padding-top: env(safe-area-inset-top, 0px);
    height: calc(52px + env(safe-area-inset-top, 0px));
  }

  /* 遮罩层在移动端可显示 */
  .sidebar-overlay {
    display: block;
  }

  /* 主内容区域不需要左边距 */
  .main-content {
    margin-left: 0;
    /* 顶部栏留空（含安全区） */
    padding-top: calc(52px + env(safe-area-inset-top, 0px));
    /* 底部安全区（iPhone 底部横条） */
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
}
</style>
