// Vue Router 路由配置文件：定义所有页面路由规则
import { createRouter, createWebHashHistory } from 'vue-router'
// 从 vue-router 导入路由创建函数和 Hash 模式历史管理
import HomePage from '../views/HomePage.vue'
// 导入首页组件：展示四本书的总览和学习路径
import LearningPath from '../views/LearningPath.vue'
// 导入学习路径图组件：知识点依赖关系可视化
import TopicPage from '../views/TopicPage.vue'
// 导入知识点详情页组件：展示单个知识点的完整内容
import { allTopics } from '../data/topics.js'
// 导入所有知识点数据，用于动态生成路由

const routes = [
  // 路由配置数组：定义 URL 路径与组件的映射关系
  { path: '/', name: 'home', component: HomePage },
  // 首页路由：根路径 '/' 显示 HomePage 组件
  { path: '/path', name: 'learning-path', component: LearningPath },
  // 学习路径图路由：'/path' 显示知识点依赖关系图
  ...allTopics.map(t => ({
    // 使用展开运算符将所有知识点映射为路由配置
    path: `/topic/${t.id}`,
    // 每个知识点的路径格式：/topic/知识点ID
    name: `topic-${t.id}`,
    // 路由名称格式：topic-知识点ID，用于编程式导航
    component: TopicPage,
    // 所有知识点共用 TopicPage 组件，通过 props 区分内容
    props: { topicId: t.id }
    // 将知识点 ID 作为 prop 传递给 TopicPage 组件
  })),
  { path: '/:pathMatch(.*)*', redirect: '/' }
  // 通配符路由：所有未匹配的路径重定向到首页
]

const router = createRouter({
  // 创建路由实例
  history: createWebHashHistory(),
  // 使用 Hash 模式（URL 带 # 号），兼容静态文件部署
  routes,
  // 注册路由配置
  scrollBehavior() {
    // 路由切换时的滚动行为
    return { top: 0 }
    // 每次切换页面自动滚动到顶部
  }
})

export default router
// 导出路由实例供 main.js 使用
