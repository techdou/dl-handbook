// Vite 构建配置文件
import { defineConfig } from 'vite'
// 导入 Vite 配置定义函数
import vue from '@vitejs/plugin-vue'
// 导入 Vue 插件：支持单文件组件
import react from '@vitejs/plugin-react'

// GitHub Pages 部署路径：仓库为 techdou/dl-handbook
// 设为 '/dl-handbook/' 保证 /images /audio 等静态绝对路径资源在 Pages 子路径下正确加载
const ghPagesBase = '/dl-handbook/'

export default defineConfig({
  // 资源基础路径，本地开发时为 '/'，生产部署到 Pages 时为仓库子路径
  base: ghPagesBase,
  // 注册插件：Vue 单文件组件支持
  plugins: [vue(), react()],
  // 构建选项
  build: {
    // 代码分割策略：将大库拆分到独立 chunk
    rollupOptions: {
      output: {
        // 手动分块函数：根据模块路径分配 chunk
        manualChunks(id) {
          // node_modules 中的 D3.js 相关库
          if (id.includes('node_modules/d3')) {
            return 'vendor-d3'
          }
          // Vue 核心库
          if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router')) {
            return 'vendor-vue'
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/@react-spring')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/@visx')) {
            return 'vendor-visx'
          }
          // KaTeX 公式渲染库
          if (id.includes('node_modules/katex')) {
            return 'vendor-katex'
          }
          // marked Markdown 解析库
          if (id.includes('node_modules/marked')) {
            return 'vendor-marked'
          }
        }
      }
    }
  }
})
