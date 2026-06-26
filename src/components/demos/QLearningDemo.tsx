import React, { useState } from 'react'

const actionNames = ['↑', '→', '↓', '←']

export default function QLearningDemo() {
  const [alpha, setAlpha] = useState(0.4)
  const [q, setQ] = useState([0.1, 0.2, 0.05, -0.1])
  const reward = 1
  const gamma = 0.9
  const maxNext = 0.8
  function update(i: number) {
    setQ(prev => prev.map((v, idx) => idx === i ? v + alpha * (reward + gamma * maxNext - v) : v))
  }
  return (
    <section className="ql-demo">
      <style>{`.ql-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden}.ql-head{display:flex;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:var(--paper)}.ql-title{font-family:var(--font-serif);font-size:18px;font-weight:700;margin:0}.ql-note{font-size:12px;color:var(--ink-3)}.ql-body{padding:18px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.qcard{border:1px solid var(--rule);border-radius:6px;background:#fff;padding:14px;text-align:center;cursor:pointer}.qcard.best{border-color:var(--accent);background:var(--accent-soft)}.qact{font-size:30px;color:var(--accent)}.qval{font-family:var(--font-mono);font-size:15px}`}</style>
      <div className="ql-head"><div><h3 className="ql-title">Q-Learning：用 TD 误差更新动作价值</h3><div className="ql-note">点击一个动作，按 Q ← Q + α[r + γ max Q' - Q] 更新。</div></div><label style={{ fontSize: 12 }}>α {alpha.toFixed(2)}<input type="range" min="0.05" max="0.9" step="0.05" value={alpha} onChange={e => setAlpha(Number(e.target.value))} /></label></div>
      <div className="ql-body">{q.map((v, i) => <button key={i} className={`qcard ${v === Math.max(...q) ? 'best' : ''}`} onClick={() => update(i)}><div className="qact">{actionNames[i]}</div><div className="qval">Q={v.toFixed(3)}</div><div style={{ fontSize: 11, color: 'var(--ink-3)' }}>TD target={(reward + gamma * maxNext).toFixed(2)}</div></button>)}</div>
    </section>
  )
}
