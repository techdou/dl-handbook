import React, { useMemo, useState } from 'react'
import { scaleLinear } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { GridRows } from '@visx/grid'
import { LinePath } from '@visx/shape'
import { Group } from '@visx/group'
import { animated, useSpring } from '@react-spring/web'

const W = 720
const H = 370
const margin = { top: 30, right: 26, bottom: 46, left: 54 }
const plotW = W - margin.left - margin.right
const plotH = H - margin.top - margin.bottom

export default function TrainingDemo() {
  const [lr, setLr] = useState(0.08)
  const [batch, setBatch] = useState(32)
  const data = useMemo(() => Array.from({ length: 60 }, (_, epoch) => {
    const decay = Math.exp(-epoch * lr * 1.5)
    const noise = (64 / batch) * 0.045 * Math.sin(epoch * 1.7)
    return { epoch, loss: Math.max(0.05, 2.2 * decay + 0.18 + noise) }
  }), [lr, batch])
  const x = scaleLinear({ domain: [0, 59], range: [0, plotW] })
  const y = scaleLinear({ domain: [0, 2.35], range: [plotH, 0] })
  const spring = useSpring({ opacity: 1, from: { opacity: 0.4 }, reset: true })

  return (
    <section className="train-demo">
      <style>{`
        .train-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden}
        .train-head{display:flex;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:var(--paper)}
        .train-title{font-family:var(--font-serif);font-size:18px;font-weight:700;margin:0}.train-note{font-size:12px;color:var(--ink-3)}
        .train-controls{display:flex;gap:14px;align-items:center;flex-wrap:wrap;font-size:12px;color:var(--ink-2)}.train-controls input{width:130px}
        .train-svg{width:calc(100% - 28px);margin:14px;background:#fff;border:1px solid var(--rule-soft);border-radius:6px}
      `}</style>
      <div className="train-head">
        <div><h3 className="train-title">训练过程：学习率影响损失下降</h3><div className="train-note">曲线由指数衰减和小批量噪声真实计算生成，不是手绘。</div></div>
        <div className="train-controls">
          <label>学习率 {lr.toFixed(2)}<input type="range" min="0.01" max="0.25" step="0.01" value={lr} onChange={e => setLr(Number(e.target.value))} /></label>
          <label>Batch {batch}<input type="range" min="8" max="128" step="8" value={batch} onChange={e => setBatch(Number(e.target.value))} /></label>
        </div>
      </div>
      <svg className="train-svg" viewBox={`0 0 ${W} ${H}`}>
        <Group left={margin.left} top={margin.top}>
          <GridRows scale={y} width={plotW} stroke="var(--rule-soft)" />
          <AxisBottom top={plotH} scale={x} numTicks={6} tickLabelProps={() => ({ fontSize: 11, fill: 'var(--ink-3)' })} />
          <AxisLeft scale={y} numTicks={5} tickLabelProps={() => ({ fontSize: 11, fill: 'var(--ink-3)' })} />
          <animated.g style={spring}>
            <LinePath data={data} x={d => x(d.epoch)} y={d => y(d.loss)} stroke="var(--accent)" strokeWidth={3} curve={undefined} />
            {data.filter((_, i) => i % 10 === 0).map(d => <circle key={d.epoch} cx={x(d.epoch)} cy={y(d.loss)} r={4} fill="var(--rust)" />)}
          </animated.g>
          <text x={plotW / 2} y={plotH + 38} textAnchor="middle" fontSize={12} fill="var(--ink-3)">Epoch</text>
          <text x={-plotH / 2} y={-38} transform="rotate(-90)" textAnchor="middle" fontSize={12} fill="var(--ink-3)">Loss</text>
        </Group>
      </svg>
    </section>
  )
}
