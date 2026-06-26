import React, { useMemo, useState } from 'react'
import { scaleLinear } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { LinePath } from '@visx/shape'
import { Group } from '@visx/group'

const W = 720, H = 350, m = { top: 28, right: 24, bottom: 42, left: 50 }
const pw = W - m.left - m.right, ph = H - m.top - m.bottom

export default function LayersDemo() {
  const [activation, setActivation] = useState<'relu' | 'sigmoid' | 'tanh'>('relu')
  const [bias, setBias] = useState(0)
  const xs = useMemo(() => Array.from({ length: 121 }, (_, i) => -3 + i * 0.05).map(x => {
    const z = x + bias
    const y = activation === 'relu' ? Math.max(0, z) : activation === 'sigmoid' ? 1 / (1 + Math.exp(-z)) : Math.tanh(z)
    return { x, y }
  }), [activation, bias])
  const xScale = scaleLinear({ domain: [-3, 3], range: [0, pw] })
  const yScale = scaleLinear({ domain: activation === 'relu' ? [0, 4] : [-1.1, 1.1], range: [ph, 0] })

  return (
    <section className="layers-demo">
      <style>{`.layers-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden}.layers-head{display:flex;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:var(--paper)}.layers-title{font-family:var(--font-serif);font-size:18px;font-weight:700;margin:0}.layers-note{font-size:12px;color:var(--ink-3)}.layers-controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:12px}.layers-controls button{border:1px solid var(--rule);background:white;border-radius:5px;padding:7px 9px;cursor:pointer}.layers-controls button.active{background:var(--accent);color:#fff;border-color:var(--accent)}.layers-svg{width:calc(100% - 28px);margin:14px;background:#fff;border:1px solid var(--rule-soft);border-radius:6px}`}</style>
      <div className="layers-head"><div><h3 className="layers-title">层与激活函数：线性变换后的非线性</h3><div className="layers-note">偏置移动函数拐点，激活函数决定输出范围和梯度形状。</div></div><div className="layers-controls">{(['relu', 'sigmoid', 'tanh'] as const).map(a => <button key={a} className={activation === a ? 'active' : ''} onClick={() => setActivation(a)}>{a}</button>)}<label>bias {bias.toFixed(1)}<input type="range" min="-2" max="2" step="0.1" value={bias} onChange={e => setBias(Number(e.target.value))} /></label></div></div>
      <svg className="layers-svg" viewBox={`0 0 ${W} ${H}`}><Group left={m.left} top={m.top}><AxisBottom top={ph} scale={xScale} numTicks={7} tickLabelProps={() => ({ fontSize: 11, fill: 'var(--ink-3)' })} /><AxisLeft scale={yScale} numTicks={5} tickLabelProps={() => ({ fontSize: 11, fill: 'var(--ink-3)' })} /><line x1="0" x2={pw} y1={yScale(0)} y2={yScale(0)} stroke="var(--rule)" /><LinePath data={xs} x={d => xScale(d.x)} y={d => yScale(d.y)} stroke="var(--accent)" strokeWidth={3} /></Group></svg>
    </section>
  )
}
