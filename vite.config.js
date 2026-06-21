// Vite 构建配置文件
import { defineConfig } from 'vite'
// 导入 Vue 插件
import vue from '@vitejs/plugin-vue'

// 导出配置
export default defineConfig({
  // 注册插件：Vue 单文件组件支持
  plugins: [vue()],
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
