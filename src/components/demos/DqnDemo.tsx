import React, { useEffect, useMemo, useRef, useState } from 'react'
import { scaleSequential } from '@visx/scale'
import { LinePath } from '@visx/shape'

/**
 * DQN 演示：在一个 4x4 网格世界（含陷阱）中用 Q-Learning 真实训练，
 * 展示 Q 值热力图随训练更新、累计奖励曲线、目标网络同步频率。
 * 所有数值由真实 Q-Learning 迭代生成，无硬编码。
 */

const ROWS = 4
const COLS = 4
const N_STATE = ROWS * COLS
const ACTIONS = 4 // 0:上 1:右 2:下 3:左
const DR = [-1, 0, 1, 0]
const DC = [0, 1, 0, -1]
const GOAL = 0 * COLS + 3 // 右上角 (3,0)
const TRAP = 1 * COLS + 1 // (1,1)
const START = 2 * COLS + 0 // (0,2)

type Pt = { x: number; y: number }

// 一步环境交互：(状态,动作) -> (下一状态,奖励,是否终止)
function envStep(s: number, a: number): [number, number, boolean] {
  const r = Math.floor(s / COLS) + DR[a]
  const c = (s % COLS) + DC[a]
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return [s, -0.6, false] // 撞墙
  const ns = r * COLS + c
  if (ns === GOAL) return [ns, 1, true]
  if (ns === TRAP) return [ns, -1, true]
  return [ns, -0.04, false]
}

// 贪心策略下从 START 走到终点/陷阱的最优路径
function greedyPath(Q: number[][]): number[] {
  const path = [START]
  let s = START
  for (let i = 0; i < ROWS * COLS; i++) {
    if (s === GOAL || s === TRAP) break
    let best = 0
    for (let a = 1; a < ACTIONS; a++) if (Q[s][a] > Q[s][best]) best = a
    const [ns] = envStep(s, best)
    if (ns === s) break
    s = ns
    path.push(s)
  }
  return path
}

export default function DqnDemo() {
  const [gamma, setGamma] = useState(0.9)
  const [lr, setLr] = useState(0.2)
  const [syncEvery, setSyncEvery] = useState(20)
  const [running, setRunning] = useState(false)
  const [episode, setEpisode] = useState(0)

  // Q 表（主网络）与目标网络，用 ref 持有训练状态，避免重渲染累积
  const Q = useRef<number[][]>(Array.from({ length: N_STATE }, () => [0, 0, 0, 0]))
  const Qt = useRef<number[][]>(Array.from({ length: N_STATE }, () => [0, 0, 0, 0]))
  const [tick, setTick] = useState(0) // 触发热力图/曲线重绘
  const episodes = useRef<Array<{ x: number; y: number }>>([])

  // 训练循环：每帧执行一个 episode
  useEffect(() => {
    if (!running) return
    let raf = 0
    let counter = episode
    const run = () => {
      let s = START
      let total = 0
      let steps = 0
      let done = false
      while (!done && steps < 30) {
        const eps = Math.max(0.05, 0.4 - counter * 0.004)
        const a = Math.random() < eps ? Math.floor(Math.random() * ACTIONS)
          : Q.current[s].reduce((bi, v, i, arr) => v > arr[bi] ? i : bi, 0)
        const [ns, r, terminal] = envStep(s, a)
        // Q-Learning 更新：Q ← Q + α[r + γ max Q_target(s') - Q]
        const maxNext = terminal ? 0 : Math.max(...Qt.current[ns])
        Q.current[s][a] += lr * (r + gamma * maxNext - Q.current[s][a])
        total += r
        steps++
        s = ns
        done = terminal
      }
      // 目标网络周期同步
      if (counter % syncEvery === 0) Qt.current = Q.current.map(row => row.slice())
      episodes.current.push({ x: counter, y: total })
      counter++
      setEpisode(counter)
      setTick(t => t + 1)
      raf = requestAnimationFrame(run)
    }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, gamma, lr, syncEvery])

  function reset() {
    setRunning(false)
    Q.current = Array.from({ length: N_STATE }, () => [0, 0, 0, 0])
    Qt.current = Array.from({ length: N_STATE }, () => [0, 0, 0, 0])
    episodes.current = []
    setEpisode(0)
    setTick(t => t + 1)
  }

  // 热力图取每个状态的最大 Q 值
  const vMax = useMemo(() => {
    let m = 0
    for (let s = 0; s < N_STATE; s++) m = Math.max(m, Math.max(...Q.current[s].map(Math.abs)))
    return m || 1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  const heat = (v: number) => {
    const t = (v + vMax) / (2 * vMax) // 0..1
    if (t > 0.5) {
      const k = (t - 0.5) * 2
      return `rgb(${Math.round(255 - k * 211)},${Math.round(255 - k * 173)},${Math.round(255 - k * 125)})`
    }
    const k = t * 2
    return `rgb(${Math.round(255 - (1 - k) * 159)},${Math.round(255 - (1 - k) * 189)},${Math.round(255 - (1 - k) * 227)})`
  }

  const path = useMemo(() => greedyPath(Q.current), [tick])

  // 奖励曲线最近 80 个 episode
  const curve = useMemo(() => episodes.current.slice(-80), [tick])
  const movingAvg = useMemo(() => {
    if (!curve.length) return [] as Pt[]
    return curve.map((d, i) => {
      const win = curve.slice(Math.max(0, i - 9), i + 1)
      return { x: d.x, y: win.reduce((s, w) => s + w.y, 0) / win.length }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  const lastReward = episodes.current.length ? episodes.current[episodes.current.length - 1].y : 0

  return (
    <section className="dqn-demo">
      <style>{`
        .dqn-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden;box-shadow:var(--shadow-sm)}
        .dqn-head{display:flex;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:linear-gradient(180deg,#fff,var(--paper))}
        .dqn-title{font-family:var(--font-serif);font-size:18px;font-weight:700;color:var(--ink);margin:0}
        .dqn-note{font-size:12px;color:var(--ink-3);margin-top:2px}
        .dqn-controls{display:flex;gap:12px;flex-wrap:wrap;font-size:12px;align-items:center}
        .dqn-controls input{width:100px}
        .dqn-metrics{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
        .metric{border:1px solid var(--rule);background:#fff;padding:4px 8px;border-radius:5px;font-size:12px;color:var(--ink-2)}
        .dqn-body{display:grid;grid-template-columns:300px 1fr;gap:16px;padding:16px}
        .grid{display:grid;grid-template-columns:repeat(${COLS},1fr);gap:4px;max-width:260px}
        .tile{aspect-ratio:1;border-radius:5px;display:grid;place-items:center;position:relative;overflow:hidden;border:1px solid var(--rule-soft);transition:background .25s ease}
        .tile-q{font-family:var(--font-mono);font-size:10px;color:var(--ink-2);text-shadow:0 0 4px #fff}
        .agent{position:absolute;width:20px;height:20px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-size:11px;font-weight:700;border:1.5px solid #fff}
        .curve-box{border:1px solid var(--rule-soft);border-radius:6px;background:#fff;padding:12px}
        .dqn-btn{border:1px solid var(--accent);background:var(--accent);color:#fff;border-radius:5px;padding:7px 12px;font-size:12px;cursor:pointer}
        .dqn-btn.ghost{background:#fff;color:var(--accent)}
        .legend{font-size:11px;color:var(--ink-3);display:flex;gap:10px;flex-wrap:wrap;margin-top:6px}
        @media(max-width:760px){.dqn-body{grid-template-columns:1fr}}
      `}</style>

      <div className="dqn-head">
        <div>
          <h3 className="dqn-title">DQN：网格世界中的 Q 学习与目标网络</h3>
          <div className="dqn-note">真实 Q-Learning 训练：每个格子按 max|Q| 着色，曲线为累计奖励滑动均值，每 {syncEvery} 步同步目标网络。</div>
          <div className="dqn-metrics">
            <span className="metric">episode {episode}</span>
            <span className="metric">最近奖励 {lastReward.toFixed(2)}</span>
            <span className="metric">最优路径 {path.length} 步</span>
          </div>
        </div>
        <div className="dqn-controls">
          <label>γ {gamma.toFixed(2)}<input type="range" min="0.5" max="0.99" step="0.01" value={gamma} onChange={e => setGamma(Number(e.target.value))} /></label>
          <label>lr {lr.toFixed(2)}<input type="range" min="0.05" max="0.5" step="0.05" value={lr} onChange={e => setLr(Number(e.target.value))} /></label>
          <label>同步 {syncEvery}<input type="range" min="5" max="50" step="5" value={syncEvery} onChange={e => setSyncEvery(Number(e.target.value))} /></label>
          <button className="dqn-btn" onClick={() => setRunning(v => !v)}>{running ? '暂停' : '训练'}</button>
          <button className="dqn-btn ghost" onClick={reset}>重置</button>
        </div>
      </div>

      <div className="dqn-body">
        <div>
          <div className="grid">
            {Array.from({ length: N_STATE }, (_, s) => {
              const maxQ = Math.max(...Q.current[s])
              const isGoal = s === GOAL
              const isTrap = s === TRAP
              const isStart = s === START
              const onPath = path.includes(s)
              return (
                <div key={s} className="tile" style={{
                  background: isGoal ? '#cbe6cb' : isTrap ? '#f3d4cc' : heat(maxQ)
                }}>
                  {isGoal ? <span style={{ color: 'var(--book2-color)', fontWeight: 700 }}>G</span> :
                   isTrap ? <span style={{ color: 'var(--rust)', fontWeight: 700 }}>✕</span> :
                   <span className="tile-q">{maxQ.toFixed(2)}</span>}
                  {isStart && <span style={{ position: 'absolute', bottom: 2, left: 3, fontSize: 9, color: 'var(--ink-3)' }}>S</span>}
                  {onPath && !isGoal && !isTrap && <span className="agent">·</span>}
                </div>
              )
            })}
          </div>
          <div className="legend">
            <span>■ max Q 值</span>
            <span>● 贪心路径</span>
            <span>G 目标(+1)</span>
            <span>✕ 陷阱(−1)</span>
          </div>
        </div>

        <div className="curve-box">
          <b style={{ fontSize: 13, color: 'var(--ink)' }}>累计奖励曲线（滑动均值）</b>
          <svg viewBox="0 0 380 200" style={{ width: '100%', marginTop: 8 }}>
            <line x1="36" x2="374" y1="100" y2="100" stroke="var(--rule-soft)" />
            {(() => {
              const xs = curve.map(d => d.x)
              if (xs.length < 2) return <text x="190" y="100" textAnchor="middle" fontSize="12" fill="var(--ink-3)">点击「训练」开始</text>
              const x0 = xs[0], x1 = xs[xs.length - 1]
              const sx = (x: number) => 36 + (x - x0) / Math.max(1, x1 - x0) * 338
              const sy = (y: number) => 180 - ((y + 1.2) / 2.4) * 160
              return (
                <>
                  <LinePath data={curve} x={(d: Pt) => sx(d.x)} y={(d: Pt) => sy(d.y)} stroke="var(--rule)" strokeWidth={1.5} strokeOpacity={0.5} />
                  <LinePath data={movingAvg} x={(d: Pt) => sx(d.x)} y={(d: Pt) => sy(d.y)} stroke="var(--accent)" strokeWidth={2.5} />
                  <text x="36" y="192" fontSize="10" fill="var(--ink-3)">episode</text>
                  <text x="6" y="20" fontSize="10" fill="var(--rust)">+1</text>
                  <text x="6" y="182" fontSize="10" fill="var(--ink-3)">−1.2</text>
                </>
              )
            })()}
          </svg>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>
            浅线=单 episode 奖励，深线=近 10 episode 均值。曲线上升至接近 +1 表示学会到达目标。
          </div>
        </div>
      </div>
    </section>
  )
}
