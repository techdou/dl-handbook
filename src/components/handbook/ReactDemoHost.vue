<!--
  ReactDemoHost.vue - Vue 页面里的 React demo 挂载桥。
  Vue 只负责生命周期和容器，交互状态与 SVG 渲染完全交给 React demo。
-->
<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import DemoRegistry from '../demos/DemoRegistry.tsx'

const props = defineProps({
  demoId: {
    type: String,
    required: true
  }
})

const mountEl = ref(null)
let root = null

function renderReactDemo() {
  if (!mountEl.value) return
  if (!root) root = createRoot(mountEl.value)
  root.render(createElement(DemoRegistry, { demoId: props.demoId }))
}

onMounted(renderReactDemo)
watch(() => props.demoId, renderReactDemo)

onUnmounted(() => {
  if (root) {
    root.unmount()
    root = null
  }
})
</script>

<template>
  <div ref="mountEl" class="react-demo-host"></div>
</template>

<style scoped>
.react-demo-host {
  margin: var(--space-5) 0;
}
</style>
