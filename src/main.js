// Vue 应用入口文件：创建并挂载 Vue 应用实例
import { createApp } from 'vue'
// 从 vue 核心库导入 createApp 工厂函数，用于创建应用实例
import App from './App.vue'
// 导入根组件 App.vue，这是整个应用的顶层组件
import router from './router'
// 导入 Vue Router 路由配置，实现页面导航
import './assets/main.css'
// 导入全局样式表，定义整体视觉风格

// 自托管网页字体（fontsource）：替代 index.html 里的 Google Fonts CDN。
// 好处：不依赖 fonts.googleapis.com（大陆访问不可靠），woff2 与站点同源加载。
// 中文 Noto Serif SC 按 unicode-range 切成上百个子集，访客只会下载页面实际
// 用到的字形子集，不会一次性下载整包字体。
// Noto Serif SC：中文衬线体（教科书感），400/500/600/700 四个字重
import '@fontsource/noto-serif-sc/400.css'
import '@fontsource/noto-serif-sc/500.css'
import '@fontsource/noto-serif-sc/600.css'
import '@fontsource/noto-serif-sc/700.css'
// Source Serif 4：英文衬线体（学术风格），正/粗 + 斜体（副标题用）
import '@fontsource/source-serif-4/400.css'
import '@fontsource/source-serif-4/500.css'
import '@fontsource/source-serif-4/600.css'
import '@fontsource/source-serif-4/700.css'
import '@fontsource/source-serif-4/400-italic.css'
// JetBrains Mono：等宽字体（代码/数字）
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'

const app = createApp(App)
// 使用 App 组件创建 Vue 应用实例
app.use(router)
// 注册路由插件，使整个应用支持页面路由功能
app.mount('#app')
// 将 Vue 应用挂载到 index.html 中 id="app" 的 DOM 元素上
