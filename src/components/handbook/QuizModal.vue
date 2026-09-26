<!--
  QuizModal.vue — 测试题弹窗组件
  功能：显示知识测试题，选择答案后即时反馈，全部答对才能继续
  设计：学术笔记本风格，衬线字体，克制的色彩
-->
<script setup>
// 从 Vue 导入响应式工具
import { ref, computed, watch } from 'vue'

// 定义组件接收的属性
const props = defineProps({
  visible: {
    // 弹窗是否可见
    type: Boolean,
    default: false
  },
  quiz: {
    // 测试题数组
    type: Array,
    default: () => []
  },
  topicTitle: {
    // 当前知识点标题
    type: String,
    default: ''
  }
})

// 定义组件事件
const emit = defineEmits(['close', 'passed'])

// 当前题目索引（从 0 开始）
const currentIndex = ref(0)
// 用户选择的答案索引（-1 表示未选择）
const selectedAnswer = ref(-1)
// 是否已提交答案
const answered = ref(false)
// 答对的题目数
const correctCount = ref(0)
// 是否全部答对
const allCorrect = ref(false)
// 是否已答完全部题目（允许有错题时进入重试界面）
const finished = ref(false)
// 用户的选择历史记录
const userAnswers = ref([])

// 当前题目对象
const currentQuestion = computed(() => {
  // 如果题目数组为空或索引越界，返回 null
  if (!props.quiz || currentIndex.value >= props.quiz.length) return null
  return props.quiz[currentIndex.value]
})

// 总题目数
const totalQuestions = computed(() => props.quiz?.length || 0)

// 选择一个答案选项
function selectOption(index) {
  // 如果已提交答案，不允许修改
  if (answered.value) return
  // 记录选择的答案
  selectedAnswer.value = index
}

// 提交当前题目的答案
function submitAnswer() {
  // 必须先选择一个答案
  if (selectedAnswer.value === -1) return
  // 标记为已提交
  answered.value = true
  // 记录用户答案
  userAnswers.value[currentIndex.value] = selectedAnswer.value
  // 检查是否答对
  if (selectedAnswer.value === currentQuestion.value.answer) {
    // 答对了，计数加一
    correctCount.value++
  }
}

// 前往下一题
function nextQuestion() {
  // 如果还有下一题
  if (currentIndex.value < totalQuestions.value - 1) {
    // 题号加 1
    currentIndex.value++
    // 重置选择状态
    selectedAnswer.value = -1
    // 重置提交状态
    answered.value = false
  } else {
    // 全部题目答完
    if (correctCount.value === totalQuestions.value) {
      // 全部答对
      allCorrect.value = true
      // 触发通过事件
      emit('passed')
    } else {
      // 有错题：进入重试界面（否则弹窗会卡在最后一题无法重试）
      finished.value = true
    }
  }
}

// 重新开始测试
function retryQuiz() {
  // 重置所有状态
  currentIndex.value = 0
  selectedAnswer.value = -1
  answered.value = false
  correctCount.value = 0
  allCorrect.value = false
  finished.value = false
  userAnswers.value = []
}

// 关闭弹窗
function closeModal() {
  // 触发关闭事件
  emit('close')
}

// 监听弹窗可见性变化，重置状态
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 弹窗打开时重置所有状态
    retryQuiz()
  }
})

// 判断选项是否是正确答案
function isCorrectOption(index) {
  return answered.value && index === currentQuestion.value?.answer
}

// 判断选项是否是用户选择的错误答案
function isWrongSelection(index) {
  return answered.value && index === selectedAnswer.value && index !== currentQuestion.value?.answer
}
</script>

<template>
  <!-- 弹窗通过 Teleport 挂载到 body，避免层叠上下文问题 -->
  <Teleport to="body">
    <transition name="modal">
      <!-- 遮罩层容器 -->
      <div v-if="visible" class="modal-overlay" @click.self="closeModal">
        <!-- 弹窗主体 -->
        <div class="modal-content" role="dialog" aria-modal="true">
          <!-- 弹窗头部 -->
          <div class="modal-header">
            <!-- 标题：衬线字体 -->
            <h3>测验 · {{ topicTitle }}</h3>
            <!-- 关闭按钮 -->
            <button class="close-btn" @click="closeModal">&times;</button>
          </div>

          <!-- 进度条 -->
          <div class="progress-bar">
            <!-- 已完成进度条 -->
            <div
              class="progress-fill"
              :style="{ width: ((currentIndex + 1) / totalQuestions * 100) + '%' }"
            ></div>
          </div>
          <!-- 进度文字 -->
          <div class="progress-text">
            {{ currentIndex + 1 }} / {{ totalQuestions }}
            <span v-if="answered && !allCorrect"> · {{ correctCount }} 正确</span>
          </div>

          <!-- 全部答对的恭喜页面 -->
          <div v-if="allCorrect" class="congrats">
            <!-- 恭喜标题 -->
            <h3>全部正确</h3>
            <!-- 恭喜描述 -->
            <p>你已掌握「{{ topicTitle }}」的核心知识点</p>
            <!-- 继续按钮 -->
            <button class="btn-accent" @click="closeModal">
              继续学习 →
            </button>
          </div>

          <!-- 题目内容区域（答完后切换到恭喜/重试界面） -->
          <div v-else-if="currentQuestion && !finished" class="question-area">
            <!-- 题目文字 -->
            <h4 class="question-text">{{ currentQuestion.question }}</h4>

            <!-- 选项列表 -->
            <div class="options-list" role="radiogroup">
              <!-- 遍历所有选项（tabindex + keydown 让键盘用户也能作答） -->
              <div
                v-for="(option, idx) in currentQuestion.options"
                :key="idx"
                class="option-item"
                role="radio"
                tabindex="0"
                :aria-checked="selectedAnswer === idx ? 'true' : 'false'"
                :class="{
                  selected: selectedAnswer === idx && !answered,
                  correct: isCorrectOption(idx),
                  wrong: isWrongSelection(idx)
                }"
                @click="selectOption(idx)"
                @keydown.enter.prevent="selectOption(idx)"
                @keydown.space.prevent="selectOption(idx)"
              >
                <!-- 选项字母标识 -->
                <span class="option-letter">{{ String.fromCharCode(65 + idx) }}</span>
                <!-- 选项文字 -->
                <span class="option-text">{{ option }}</span>
                <!-- 答对/答错标记 -->
                <span v-if="isCorrectOption(idx)" class="result-mark">✓</span>
                <span v-if="isWrongSelection(idx)" class="result-mark err">✗</span>
              </div>
            </div>

            <!-- 操作按钮区域 -->
            <div class="action-area">
              <!-- 提交答案按钮 -->
              <button
                v-if="!answered"
                class="btn-accent"
                :disabled="selectedAnswer === -1"
                @click="submitAnswer"
              >
                提交
              </button>
              <!-- 下一题按钮 -->
              <button v-else class="btn-accent" @click="nextQuestion">
                {{ currentIndex < totalQuestions - 1 ? '下一题' : '查看结果' }} →
              </button>
              <!-- 答错提示 -->
              <p v-if="answered && isWrongSelection(selectedAnswer)" class="wrong-hint">
                答错了，正确答案已标绿
              </p>
            </div>
          </div>

          <!-- 答完但有错题的总结页面 -->
          <div v-else-if="!allCorrect" class="retry-area">
            <h3>还差一点</h3>
            <p>{{ correctCount }} / {{ totalQuestions }} 正确，需要全部正确才能继续</p>
            <button class="btn-accent" @click="retryQuiz">重新答题</button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
/* 弹窗遮罩层 */
.modal-overlay {
  position: fixed;
  /* 固定定位 */
  inset: 0;
  /* 覆盖全屏 */
  background: rgba(26, 26, 26, 0.4);
  /* 墨黑半透明 */
  display: flex;
  /* flex 布局 */
  align-items: center;
  /* 垂直居中 */
  justify-content: center;
  /* 水平居中 */
  z-index: 1000;
  /* 确保在最上层 */
  padding: var(--space-4);
  /* 防止内容贴边 */
}

/* 弹窗主体 */
.modal-content {
  background: var(--paper-card);
  /* 纯白纸张背景 */
  border-radius: var(--radius-lg);
  /* 大圆角 */
  width: 100%;
  /* 宽度占满 */
  max-width: 500px;
  /* 最大宽度限制 */
  max-height: 90vh;
  /* 最大高度限制 */
  overflow-y: auto;
  /* 内容超出时滚动 */
  box-shadow: var(--shadow-lg);
  /* 大阴影 */
}

/* 弹窗头部 */
.modal-header {
  display: flex;
  /* 水平排列 */
  justify-content: space-between;
  /* 两端对齐 */
  align-items: center;
  /* 垂直居中 */
  padding: var(--space-5) var(--space-6);
  /* 内边距 */
  border-bottom: 1px solid var(--rule-soft);
  /* 底部浅分隔线 */
}

.modal-header h3 {
  font-family: var(--font-serif);
  /* 衬线字体 */
  font-size: 1rem;
  /* 字号 */
  font-weight: 600;
  /* 加粗 */
  color: var(--ink);
  /* 墨黑 */
  margin: 0;
}

/* 关闭按钮 */
.close-btn {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
  color: var(--ink-3);
  padding: var(--space-1);
  transition: color var(--transition-fast);
}

.close-btn:hover {
  color: var(--ink);
}

/* 进度条容器 */
.progress-bar {
  height: 2px;
  /* 极细进度条 */
  background: var(--rule-soft);
  /* 浅分隔线背景 */
}

/* 进度条填充 */
.progress-fill {
  height: 100%;
  background: var(--accent);
  /* 靛青色 */
  transition: width var(--transition-normal);
  /* 宽度过渡 */
}

/* 进度文字 */
.progress-text {
  font-family: var(--font-mono);
  /* 等宽字体 */
  font-size: 0.72rem;
  color: var(--ink-3);
  text-align: center;
  padding: var(--space-2) var(--space-6);
}

/* 题目内容区域 */
.question-area {
  padding: var(--space-5) var(--space-6);
}

/* 题目文字 */
.question-text {
  font-family: var(--font-serif);
  /* 衬线字体 */
  font-size: 1rem;
  font-weight: 600;
  color: var(--ink);
  margin-bottom: var(--space-5);
  line-height: 1.6;
}

/* 选项列表 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

/* 选项项 */
.option-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--rule);
  /* 暖灰边框 */
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

/* 选项悬停 */
.option-item:hover:not(.correct):not(.wrong) {
  border-color: var(--accent);
  background: var(--accent-soft);
}

/* 选项键盘聚焦：与悬停一致的提示，保证 Tab 作答可见 */
.option-item:focus-visible {
  border-color: var(--accent);
  background: var(--accent-soft);
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* 已选中 */
.option-item.selected {
  border-color: var(--accent);
  background: var(--accent-soft);
}

/* 正确答案 */
.option-item.correct {
  border-color: var(--book2-color);
  background: rgba(39, 103, 73, 0.06);
}

/* 错误选择 */
.option-item.wrong {
  border-color: var(--rust);
  background: rgba(156, 66, 33, 0.04);
}

/* 选项字母 */
.option-letter {
  font-family: var(--font-mono);
  /* 等宽字体 */
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--ink-3);
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

/* 选项文字 */
.option-text {
  flex: 1;
  font-family: var(--font-sans);
  font-size: 0.88rem;
  color: var(--ink-2);
}

/* 结果标记 */
.result-mark {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--book2-color);
}

.result-mark.err {
  color: var(--rust);
}

/* 操作按钮区域 */
.action-area {
  text-align: center;
}

/* 靛青主按钮 */
.btn-accent {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-3) var(--space-8);
  background: var(--accent);
  color: var(--paper-card);
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-accent:hover:not(:disabled) {
  background: var(--accent-dark);
}

.btn-accent:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 答错提示 */
.wrong-hint {
  margin-top: var(--space-3);
  font-family: var(--font-sans);
  font-size: 0.8rem;
  color: var(--rust);
}

/* 恭喜页面 */
.congrats {
  text-align: center;
  padding: var(--space-10) var(--space-6);
}

.congrats h3 {
  font-family: var(--font-serif);
  font-size: 1.3rem;
  color: var(--ink);
  margin-bottom: var(--space-2);
}

.congrats p {
  font-family: var(--font-sans);
  color: var(--ink-3);
  margin-bottom: var(--space-6);
}

/* 重新答题区域 */
.retry-area {
  text-align: center;
  padding: var(--space-10) var(--space-6);
}

.retry-area h3 {
  font-family: var(--font-serif);
  font-size: 1.2rem;
  color: var(--ink);
  margin-bottom: var(--space-2);
}

.retry-area p {
  font-family: var(--font-sans);
  color: var(--ink-3);
  margin-bottom: var(--space-6);
}

/* 弹窗过渡 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* 响应式：手机端 */
@media (max-width: 768px) {
  .modal-content {
    max-width: 100%;
    max-height: 85vh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    /* 顶部圆角，底部平 */
    margin-top: auto;
    /* 贴底部 */
    /* iPhone 底部横条安全区 */
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .modal-overlay {
    align-items: flex-end;
    /* 弹窗贴底部 */
    padding-bottom: 0;
  }
}
</style>
