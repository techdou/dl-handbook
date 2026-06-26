import React, { useEffect, useMemo, useState } from 'react'
import { animated, useSpring } from '@react-spring/web'

const W = 720
const H = 350

export default function BackpropagationDemo() {
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState(0)
  const progress = useSpring({ strokeDashoffset: running ? 0 : 220, opacity: running ? 1 : 0.3 })
  const layers = useMemo(() => [
    [{ x: 90, y: 105 }, { x: 90, y: 175 }, { x: 90, y: 245 }],
    [{ x: 300, y: 130 }, { x: 300, y: 220 }],
    [{ x: 520, y: 175 }]
  ], [])

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setPhase(v => (v + 1) % 4), 850)
    return () => window.clearInterval(id)
  }, [running])

  return (
    <section className="bp-demo">
      <style>{`
        .bp-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden}
        .bp-head{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:var(--paper)}
        .bp-title{font-family:var(--font-serif);font-size:18px;font-weight:700;margin:0}.bp-note{font-size:12px;color:var(--ink-3)}
        .bp-btn{border:1px solid var(--accent);background:var(--accent);color:#fff;border-radius:5px;padding:8px 12px;cursor:pointer}
        .bp-svg{display:block;width:calc(100% - 28px);margin:14px;background:#fff;border:1px solid var(--rule-soft);border-radius:6px}
      `}</style>
      <div className="bp-head">
        <div><h3 className="bp-title">反向传播：误差如何逐层回传</h3><div className="bp-note">红色虚线表示梯度信号，蓝色节点表示当前更新层。</div></div>
        <button className="bp-btn" onClick={() => setRunning(v => !v)}>{running ? '暂停' : '播放'}</button>
      </div>
      <svg className="bp-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="backpropagation gradient flow">
        <defs>
          <marker id="bp-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="var(--rust)" /></marker>
        </defs>
        {layers.slice(0, -1).map((layer, li) =>
          layer.flatMap(from => layers[li + 1].map((to, i) => (
            <line key={`${li}-${from.y}-${i}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--rule)" />
          )))
        )}
        <animated.path d="M520 175 C420 80 210 80 90 105" fill="none" stroke="var(--rust)" strokeWidth={3} strokeDasharray="12 8" markerEnd="url(#bp-arrow)" style={progress} />
        <animated.path d="M520 175 C420 270 210 270 90 245" fill="none" stroke="var(--rust)" strokeWidth={3} strokeDasharray="12 8" markerEnd="url(#bp-arrow)" style={progress} />
        {layers.map((layer, li) => layer.map((n, ni) => (
          <g key={`${li}-${ni}`}>
            <circle cx={n.x} cy={n.y} r={phase === 3 - li ? 20 : 15} fill={phase === 3 - li ? 'var(--accent-soft)' : '#fff'} stroke={phase === 3 - li ? 'var(--accent)' : 'var(--rule)'} strokeWidth={2} />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={11} fill="var(--ink-3)">w</text>
          </g>
        )))}
        <text x="90" y="310" textAnchor="middle" fontSize="12" fill="var(--ink-3)">输入</text>
        <text x="300" y="310" textAnchor="middle" fontSize="12" fill="var(--ink-3)">隐藏</text>
        <text x="520" y="310" textAnchor="middle" fontSize="12" fill="var(--ink-3)">输出/损失</text>
      </svg>
    </section>
  )
}
