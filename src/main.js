// Vue 应用入口文件：创建并挂载 Vue 应用实例
import { createApp } from 'vue'
// 从 vue 核心库导入 createApp 工厂函数，用于创建应用实例
import App from './App.vue'
// 导入根组件 App.vue，这是整个应用的顶层组件
import router from './router'
// 导入 Vue Router 路由配置，实现页面导航
import './assets/main.css'
// 导入全局样式表，定义整体视觉风格

const app = createApp(App)
// 使用 App 组件创建 Vue 应用实例
app.use(router)
// 注册路由插件，使整个应用支持页面路由功能
app.mount('#app')
// 将 Vue 应用挂载到 index.html 中 id="app" 的 DOM 元素上
