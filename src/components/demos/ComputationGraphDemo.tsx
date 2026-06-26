import React, { useMemo, useState } from 'react'
import { animated, useSpring } from '@react-spring/web'

export default function ComputationGraphDemo() {
  const [x, setX] = useState(1.4)
  const [w, setW] = useState(0.8)
  const [target, setTarget] = useState(1.0)
  const values = useMemo(() => {
    const mul = x * w
    const y = 1 / (1 + Math.exp(-mul))
    const loss = 0.5 * (y - target) ** 2
    return { mul, y, loss, grad: (y - target) * y * (1 - y) * x }
  }, [x, w, target])

  const nodes = [
    { id: 'x', x: 80, y: 105, label: `x=${x.toFixed(2)}` },
    { id: 'w', x: 80, y: 225, label: `w=${w.toFixed(2)}` },
    { id: '*', x: 260, y: 165, label: `xw=${values.mul.toFixed(2)}` },
    { id: 'sigmoid', x: 440, y: 165, label: `y=${values.y.toFixed(2)}` },
    { id: 'loss', x: 620, y: 165, label: `L=${values.loss.toFixed(3)}` }
  ]

  return (
    <section className="graph-demo">
      <style>{`
        .graph-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden}
        .graph-head{display:flex;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:var(--paper)}
        .graph-title{font-family:var(--font-serif);font-size:18px;font-weight:700;margin:0}.graph-note{font-size:12px;color:var(--ink-3)}
        .graph-controls{display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-size:12px}.graph-controls input{width:110px}
        .graph-svg{width:calc(100% - 28px);margin:14px;background:#fff;border:1px solid var(--rule-soft);border-radius:6px}
      `}</style>
      <div className="graph-head">
        <div><h3 className="graph-title">计算图：前向值与局部梯度</h3><div className="graph-note">调节输入和权重，损失与 dL/dw 自动联动。</div></div>
        <div className="graph-controls">
          <label>x {x.toFixed(1)}<input type="range" min="-3" max="3" step="0.1" value={x} onChange={e => setX(Number(e.target.value))} /></label>
          <label>w {w.toFixed(1)}<input type="range" min="-3" max="3" step="0.1" value={w} onChange={e => setW(Number(e.target.value))} /></label>
          <label>t {target.toFixed(1)}<input type="range" min="0" max="1" step="0.1" value={target} onChange={e => setTarget(Number(e.target.value))} /></label>
        </div>
      </div>
      <svg className="graph-svg" viewBox="0 0 720 330">
        <defs><marker id="graph-arrow" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="var(--accent)" /></marker></defs>
        <path d="M110 105 C170 105 190 165 225 165" stroke="var(--accent)" fill="none" strokeWidth="2" markerEnd="url(#graph-arrow)" />
        <path d="M110 225 C170 225 190 165 225 165" stroke="var(--accent)" fill="none" strokeWidth="2" markerEnd="url(#graph-arrow)" />
        <path d="M295 165 L395 165" stroke="var(--accent)" fill="none" strokeWidth="2" markerEnd="url(#graph-arrow)" />
        <path d="M485 165 L575 165" stroke="var(--accent)" fill="none" strokeWidth="2" markerEnd="url(#graph-arrow)" />
        {nodes.map(n => <g key={n.id}><rect x={n.x - 48} y={n.y - 22} width="96" height="44" rx="6" fill={n.id === 'loss' ? 'var(--accent-soft)' : '#fff'} stroke={n.id === 'loss' ? 'var(--accent)' : 'var(--rule)'} /><text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="12" fill="var(--ink)">{n.label}</text></g>)}
        <AnimatedGrad value={values.grad} />
      </svg>
    </section>
  )
}

// 梯度数值的动画文本
function AnimatedGrad({ value }: { value: number }) {
  const s = useSpring({ val: value, config: { tension: 180, friction: 22 } })
  return (
    <animated.text x="360" y="292" textAnchor="middle" fontSize="13" fill="var(--rust)">
      {s.val.to(v => `dL/dw = ${v.toFixed(4)}`)}
    </animated.text>
  )
}
