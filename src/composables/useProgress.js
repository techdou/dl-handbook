// ============================================
// 学习进度共享状态
// 把 localStorage 里的知识点完成状态变成 Vue 响应式数据：
// 测验通过后，首页进度、侧边栏、学习路径图、测验按钮全部立即刷新，
// 不再需要重进页面才能看到变化。
// ============================================

import { ref } from 'vue'

// localStorage 键名前缀：dl-completed-<topicId> = 'true'
const STORAGE_PREFIX = 'dl-completed-'

// 启动时从 localStorage 加载已完成的知识点 ID
function loadCompletedIds() {
  const ids = new Set()
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(STORAGE_PREFIX) && localStorage.getItem(key) === 'true') {
      ids.add(key.slice(STORAGE_PREFIX.length))
    }
  }
  return ids
}

// 全站共享的响应式完成集合：整体替换 Set 以触发依赖更新
const completedIds = ref(loadCompletedIds())

// 判断某个知识点是否已完成学习
export function isCompleted(topicId) {
  return completedIds.value.has(topicId)
}

// 标记知识点为已完成：同步写 localStorage 并更新响应式状态
export function markCompleted(topicId) {
  localStorage.setItem(STORAGE_PREFIX + topicId, 'true')
  const next = new Set(completedIds.value)
  next.add(topicId)
  completedIds.value = next
}

// 获取响应式完成集合（供学习路径图等命令式渲染场景 watch）
export function useCompletedIds() {
  return completedIds
}
