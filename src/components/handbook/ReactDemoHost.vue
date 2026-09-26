<!--
  ReactDemoHost.vue - Vue 页面里的 React demo 挂载桥。
  Vue 只负责生命周期和容器，交互状态与 SVG 渲染完全交给 React demo。
  演示组件按需加载：滚动到演示区域附近才动态 import 对应组件，
  全部 19 个演示与 React 生态不再打进首屏 JS，且每个演示独立分包。
-->
<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { createRoot } from 'react-dom/client'
import { createElement } from 'react'

// 演示组件加载器映射：demoId → 动态 import
// 保持静态字面量写法，Vite 才能静态分析并给每个演示单独分包
const demoLoaders = {
  'perceptron': () => import('../demos/PerceptronDemo'),
  'neural-network': () => import('../demos/NeuralNetworkDemo'),
  'backpropagation': () => import('../demos/BackpropagationDemo'),
  'training': () => import('../demos/TrainingDemo'),
  'cnn': () => import('../demos/CnnDemo'),
  'mnist': () => import('../demos/MnistDemo'),
  'computation-graph': () => import('../demos/ComputationGraphDemo'),
  'autograd': () => import('../demos/AutogradDemo'),
  'layers': () => import('../demos/LayersDemo'),
  'optimizer': () => import('../demos/OptimizerDemo'),
  'word2vec': () => import('../demos/Word2VecDemo'),
  'rnn': () => import('../demos/RnnDemo'),
  'lstm': () => import('../demos/LstmDemo'),
  'seq2seq': () => import('../demos/Seq2SeqDemo'),
  'attention': () => import('../demos/AttentionDemo'),
  'rl-basics': () => import('../demos/RlBasicsDemo'),
  'mdp': () => import('../demos/MdpDemo'),
  'q-learning': () => import('../demos/QLearningDemo'),
  'dqn': () => import('../demos/DqnDemo')
}

const props = defineProps({
  demoId: {
    type: String,
    required: true
  }
})

const mountEl = ref(null)
// 外层宿主容器：始终有布局，用它做进入视口的观察目标
// （mountEl 处于 v-show 隐藏时 display:none，无法被 IntersectionObserver 观测）
const hostEl = ref(null)
// 演示是否已加载完成（控制占位符与容器显隐）
const ready = ref(false)
let root = null
// 进入视口观察器：演示区域在页面底部，无需首屏加载
let observer = null
// 加载令牌：demoId 快速切换时丢弃过期加载结果
let loadToken = 0

// 动态加载并渲染当前 demoId 对应的 React 演示
async function mountDemo() {
  const token = ++loadToken
  if (!mountEl.value) return
  const loader = demoLoaders[props.demoId]
  if (!loader) {
    mountEl.value.textContent = `未找到演示：${props.demoId}`
    ready.value = true
    return
  }
  try {
    const mod = await loader()
    // 等待加载期间已切到其他知识点/组件已卸载时，丢弃本次结果
    if (token !== loadToken || !mountEl.value) return
    if (!root) root = createRoot(mountEl.value)
    root.render(createElement(mod.default))
    ready.value = true
  } catch (err) {
    if (token !== loadToken || !mountEl.value) return
    mountEl.value.textContent = '演示加载失败，请刷新重试'
    ready.value = true
  }
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        // 进入视口附近只需加载一次
        observer.disconnect()
        observer = null
        mountDemo()
      }
    },
    // 提前 300px 开始加载，滚动到演示时基本已就绪
    { rootMargin: '300px' }
  )
  observer.observe(hostEl.value)
})

// 知识点切换时组件被复用：已加载过则直接换载新演示，
// 还没进过视口则维持观察（触发时会读取最新的 demoId）
watch(() => props.demoId, () => {
  if (observer) return
  ready.value = false
  mountDemo()
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  if (root) {
    root.unmount()
    root = null
  }
})
</script>

<template>
  <div ref="hostEl" class="react-demo-host">
    <!-- 加载占位符：进入视口前/加载期间显示，避免布局跳动 -->
    <div v-if="!ready" class="demo-loading">🔬 交互演示加载中…</div>
    <!-- React 渲染容器：用 v-show 保持 DOM 稳定，React 接管后不再改动 -->
    <div ref="mountEl" v-show="ready"></div>
  </div>
</template>

<style scoped>
.react-demo-host {
  margin: var(--space-5) 0;
}

.demo-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  border: 1px solid var(--rule, #d8d4c8);
  border-radius: var(--radius-md, 6px);
  background: var(--paper-card, #ffffff);
  color: var(--ink-3, #6b6b6b);
  font-family: var(--font-sans, -apple-system, sans-serif);
  font-size: 0.85rem;
}
</style>
