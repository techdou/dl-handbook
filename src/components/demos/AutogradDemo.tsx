import React, { useMemo, useState } from 'react'

export default function AutogradDemo() {
  const [x, setX] = useState(1.2)
  const [w, setW] = useState(0.7)
  const v = useMemo(() => {
    const z = x * w
    const a = Math.tanh(z)
    const loss = (a - 0.5) ** 2
    const dLossDa = 2 * (a - 0.5)
    const daDz = 1 - a * a
    return { z, a, loss, dx: dLossDa * daDz * w, dw: dLossDa * daDz * x }
  }, [x, w])
  const boxes = [
    { x: 70, y: 120, title: '输入', text: `x=${x.toFixed(2)}`, grad: `grad=${v.dx.toFixed(3)}` },
    { x: 230, y: 120, title: '乘法', text: `z=xw=${v.z.toFixed(2)}`, grad: `w.grad=${v.dw.toFixed(3)}` },
    { x: 390, y: 120, title: 'tanh', text: `a=${v.a.toFixed(2)}`, grad: `da/dz=${(1 - v.a * v.a).toFixed(2)}` },
    { x: 550, y: 120, title: '损失', text: `L=${v.loss.toFixed(3)}`, grad: '反向起点' }
  ]

  return (
    <section className="auto-demo">
      <style>{`
        .auto-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden}
        .auto-head{display:flex;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:var(--paper)}
        .auto-title{font-family:var(--font-serif);font-size:18px;font-weight:700;margin:0}.auto-note{font-size:12px;color:var(--ink-3)}
        .auto-controls{display:flex;gap:12px;flex-wrap:wrap;font-size:12px}.auto-controls input{width:120px}.auto-svg{width:calc(100% - 28px);margin:14px;background:#fff;border:1px solid var(--rule-soft);border-radius:6px}
      `}</style>
      <div className="auto-head">
        <div><h3 className="auto-title">自动微分：保存计算图，再反向求梯度</h3><div className="auto-note">每个节点保存前向值和局部导数，最终用链式法则回传。</div></div>
        <div className="auto-controls">
          <label>x {x.toFixed(1)}<input type="range" min="-2" max="2" step="0.1" value={x} onChange={e => setX(Number(e.target.value))} /></label>
          <label>w {w.toFixed(1)}<input type="range" min="-2" max="2" step="0.1" value={w} onChange={e => setW(Number(e.target.value))} /></label>
        </div>
      </div>
      <svg className="auto-svg" viewBox="0 0 720 280">
        <defs><marker id="auto-a" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="var(--accent)" /></marker><marker id="auto-b" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="var(--rust)" /></marker></defs>
        {[0, 1, 2].map(i => <line key={i} x1={boxes[i].x + 54} y1="120" x2={boxes[i + 1].x - 54} y2="120" stroke="var(--accent)" strokeWidth="2" markerEnd="url(#auto-a)" />)}
        {[0, 1, 2].map(i => <line key={`b${i}`} x1={boxes[3 - i].x - 54} y1="170" x2={boxes[2 - i].x + 54} y2="170" stroke="var(--rust)" strokeWidth="2" strokeDasharray="8 5" markerEnd="url(#auto-b)" />)}
        {boxes.map(b => <g key={b.title}><rect x={b.x - 58} y={b.y - 45} width="116" height="90" rx="6" fill="#fff" stroke="var(--rule)" /><text x={b.x} y={b.y - 18} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">{b.title}</text><text x={b.x} y={b.y + 4} textAnchor="middle" fontSize="12" fill="var(--accent)">{b.text}</text><text x={b.x} y={b.y + 27} textAnchor="middle" fontSize="11" fill="var(--rust)">{b.grad}</text></g>)}
      </svg>
    </section>
  )
}
