<!--
  AudioPlayer.vue — 音频播报播放器组件
  功能：播放当前知识点的 TTS 播报音频
  设计：学术笔记本风格，靛青色，简洁控制条
-->
<script setup>
// 从 Vue 导入工具
import { ref, computed, onUnmounted } from 'vue'

// 定义组件接收的属性
const props = defineProps({
  topicId: {
    // 知识点 ID，用于匹配音频文件名
    type: String,
    required: true
  },
  title: {
    // 播报标题
    type: String,
    default: '播报'
  }
})

// 音频播放状态
const isPlaying = ref(false)
// 当前播放进度（0~1）
const progress = ref(0)
// 当前时间（秒）
const currentTime = ref(0)
// 总时长（秒）
const duration = ref(0)
// 音频元素引用
const audioRef = ref(null)
// 是否加载完成
const isLoaded = ref(false)
// 音量（0~1）
const volume = ref(0.8)
// 是否静音
const isMuted = ref(false)

// 音频文件路径映射：知识点 ID → 文件名
const audioMap = {
  'perceptron': '01_perceptron.mp3',
  'neural-network': '02_neural_network.mp3',
  'backpropagation': '03_backpropagation.mp3',
  'training': '04_training.mp3',
  'cnn': '05_cnn.mp3',
  'mnist': '06_mnist.mp3',
  'computation-graph': '07_computation_graph.mp3',
  'autograd': '08_autograd.mp3',
  'layers': '09_layers.mp3',
  'optimizer': '10_optimizer.mp3',
  'word2vec': '11_word2vec.mp3',
  'rnn': '12_rnn.mp3',
  'lstm': '13_lstm.mp3',
  'seq2seq': '14_seq2seq.mp3',
  'attention': '15_attention.mp3',
  'rl-basics': '16_rl_basics.mp3',
  'mdp': '17_mdp.mp3',
  'q-learning': '18_q_learning.mp3',
  'dqn': '19_dqn.mp3'
}

// 计算音频文件路径
const audioSrc = computed(() => {
  const filename = audioMap[props.topicId]
  // 如果没有对应的音频文件，返回空
  if (!filename) return ''
  // 拼接 import.meta.env.BASE_URL，适配 GitHub Pages 子路径部署，避免音频 404
  return `${import.meta.env.BASE_URL}audio/${filename}`
})

// 是否有对应的音频文件
const hasAudio = computed(() => !!audioMap[props.topicId])

// 格式化时间为 mm:ss
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 切换播放/暂停
function togglePlay() {
  if (!audioRef.value) return
  if (isPlaying.value) {
    // 暂停播放
    audioRef.value.pause()
  } else {
    // 开始播放
    audioRef.value.play()
  }
}

// 音频加载完成
function onLoaded() {
  isLoaded.value = true
  duration.value = audioRef.value?.duration || 0
  // 应用初始音量设置
  if (audioRef.value) {
    audioRef.value.volume = volume.value
    audioRef.value.muted = isMuted.value
  }
}

// 音频播放中（更新进度）
function onTimeUpdate() {
  if (!audioRef.value) return
  currentTime.value = audioRef.value.currentTime
  duration.value = audioRef.value.duration || 0
  progress.value = duration.value > 0 ? currentTime.value / duration.value : 0
}

// 音频播放开始
function onPlay() {
  isPlaying.value = true
}

// 音频播放暂停
function onPause() {
  isPlaying.value = false
}

// 音频播放结束
function onEnded() {
  isPlaying.value = false
  progress.value = 0
  currentTime.value = 0
}

// 点击进度条跳转
function onSeek(event) {
  if (!audioRef.value || !duration.value) return
  // 获取点击位置相对于进度条的比例
  const rect = event.currentTarget.getBoundingClientRect()
  const ratio = (event.clientX - rect.left) / rect.width
  // 跳转到对应时间
  audioRef.value.currentTime = ratio * duration.value
}

// 切换静音
function toggleMute() {
  isMuted.value = !isMuted.value
  if (audioRef.value) {
    audioRef.value.muted = isMuted.value
  }
}

// 音量滑块变化
function onVolumeChange(event) {
  const val = parseFloat(event.target.value)
  volume.value = val
  isMuted.value = val === 0
  if (audioRef.value) {
    audioRef.value.volume = val
    audioRef.value.muted = isMuted.value
  }
}

// 组件卸载时停止播放
onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value = null
  }
})
</script>

<template>
  <!-- 播放器容器（仅有音频文件时显示） -->
  <div v-if="hasAudio" class="audio-player">
    <!-- 隐藏的 audio 元素 -->
    <audio
      ref="audioRef"
      :src="audioSrc"
      preload="metadata"
      @loadedmetadata="onLoaded"
      @timeupdate="onTimeUpdate"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
    ></audio>

    <!-- 播放器界面 -->
    <div class="player-bar">
      <!-- 播放/暂停按钮 -->
      <button class="play-btn" @click="togglePlay" :title="isPlaying ? '暂停' : '播放'">
        <!-- 播放图标 -->
        <span v-if="!isPlaying" class="play-icon">▶</span>
        <!-- 暂停图标 -->
        <span v-else class="pause-icon">❚❚</span>
      </button>

      <!-- 进度条区域 -->
      <div class="progress-area" @click="onSeek">
        <!-- 进度条轨道 -->
        <div class="progress-track">
          <!-- 已播放进度 -->
          <div class="progress-played" :style="{ width: (progress * 100) + '%' }"></div>
        </div>
      </div>

      <!-- 时间显示 -->
      <span class="time-display">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </span>

      <!-- 音量控制 -->
      <div class="volume-control">
        <button class="volume-btn" @click="toggleMute" :title="isMuted ? '取消静音' : '静音'">
          <span v-if="isMuted || volume === 0" class="vol-icon">🔇</span>
          <span v-else-if="volume < 0.5" class="vol-icon">🔉</span>
          <span v-else class="vol-icon">🔊</span>
        </button>
        <input
          type="range"
          class="volume-slider"
          min="0"
          max="1"
          step="0.05"
          :value="isMuted ? 0 : volume"
          @input="onVolumeChange"
        />
      </div>

      <!-- 标题 -->
      <span class="player-title">📢 {{ title }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 播放器容器 */
.audio-player {
  background: var(--accent-soft);
  /* 靛青浅底 */
  border: 1px solid rgba(44, 82, 130, 0.15);
  /* 靛青淡边框 */
  border-radius: var(--radius-md);
  /* 中等圆角 */
  padding: var(--space-3) var(--space-4);
  /* 内边距 */
  margin: var(--space-5) 0;
  /* 外边距 */
}

/* 播放器控制条 */
.player-bar {
  display: flex;
  /* 水平排列 */
  align-items: center;
  /* 垂直居中 */
  gap: var(--space-3);
  /* 元素间距 */
}

/* 播放/暂停按钮 */
.play-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--accent);
  /* 靛青色 */
  color: white;
  border: none;
  border-radius: 50%;
  /* 圆形 */
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.play-btn:hover {
  background: var(--accent-dark);
  /* 悬停变深 */
  transform: scale(1.05);
}

/* 播放图标 */
.play-icon {
  font-size: 0.7rem;
  margin-left: 2px;
  /* 微调居中 */
}

/* 暂停图标 */
.pause-icon {
  font-size: 0.6rem;
  letter-spacing: -2px;
}

/* 进度条区域 */
.progress-area {
  flex: 1;
  /* 占据剩余空间 */
  cursor: pointer;
  /* 手型指针 */
  padding: var(--space-2) 0;
  /* 增大点击热区 */
}

/* 进度条轨道 */
.progress-track {
  height: 4px;
  background: var(--rule);
  /* 暖灰轨道 */
  border-radius: 2px;
  overflow: hidden;
}

/* 已播放进度 */
.progress-played {
  height: 100%;
  background: var(--accent);
  /* 靛青色 */
  border-radius: 2px;
  transition: width 0.1s linear;
  /* 平滑更新 */
}

/* 时间显示 */
.time-display {
  font-family: var(--font-mono);
  /* 等宽字体 */
  font-size: 0.7rem;
  color: var(--ink-3);
  white-space: nowrap;
  /* 不换行 */
  flex-shrink: 0;
}

/* 标题 */
.player-title {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  color: var(--ink-2);
  white-space: nowrap;
  flex-shrink: 0;
}

/* 响应式：手机端 */
@media (max-width: 768px) {
  .player-title {
    display: none;
    /* 手机端隐藏标题节省空间 */
  }

  .time-display {
    font-size: 0.65rem;
  }

  .volume-slider {
    width: 0;
    /* 手机端隐藏滑块，只保留按钮 */
  }

  .volume-control {
    gap: 0;
  }
}

/* 音量控制容器 */
.volume-control {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-shrink: 0;
}

/* 音量按钮 */
.volume-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: transparent;
  border: 1px solid var(--rule);
  border-radius: 50%;
  /* 小圆形 */
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.volume-btn:hover {
  background: var(--paper-soft);
  border-color: var(--accent);
}

.vol-icon {
  font-size: 0.6rem;
}

/* 音量滑块 */
.volume-slider {
  width: 60px;
  /* 窄条 */
  height: 3px;
  appearance: none;
  -webkit-appearance: none;
  background: var(--rule);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 10px;
  height: 10px;
  background: var(--accent);
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
</style>
