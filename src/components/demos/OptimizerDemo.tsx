import React, { useMemo, useState } from 'react'
import { contours } from 'd3-contour'
import { scaleLinear } from '@visx/scale'
import { Group } from '@visx/group'

const W = 720, H = 390
const margin = { top: 28, right: 24, bottom: 30, left: 42 }
const pw = W - margin.left - margin.right, ph = H - margin.top - margin.bottom

function loss(x: number, y: number) {
  return (x - 0.8) ** 2 + 0.55 * (y + 0.6) ** 2 + 0.25 * Math.sin(3 * x) * Math.cos(2 * y)
}

export default function OptimizerDemo() {
  const [lr, setLr] = useState(0.18)
  const [momentum, setMomentum] = useState(0.4)
  const path = useMemo(() => {
    let x = -1.7, y = 1.5, vx = 0, vy = 0
    return Array.from({ length: 28 }, () => {
      const gx = 2 * (x - 0.8) + 0.75 * Math.cos(3 * x) * Math.cos(2 * y)
      const gy = 1.1 * (y + 0.6) - 0.5 * Math.sin(3 * x) * Math.sin(2 * y)
      vx = momentum * vx - lr * gx
      vy = momentum * vy - lr * gy
      x += vx
      y += vy
      return { x, y, l: loss(x, y) }
    })
  }, [lr, momentum])
  const xScale = scaleLinear({ domain: [-2, 2], range: [0, pw] })
  const yScale = scaleLinear({ domain: [-2, 2], range: [ph, 0] })
  const contourPaths = useMemo(() => {
    const n = 70
    const values = Array.from({ length: n * n }, (_, i) => {
      const x = -2 + (i % n) * 4 / (n - 1)
      const y = -2 + Math.floor(i / n) * 4 / (n - 1)
      return loss(x, y)
    })
    return contours().size([n, n]).thresholds([0.4, 0.7, 1, 1.5, 2.2, 3.2, 4.4])(values)
  }, [])
  const contourPath = (coords: number[][][]) => coords.map(poly => poly.map((p, i) => `${i ? 'L' : 'M'}${p[0] / 69 * pw},${p[1] / 69 * ph}`).join(' ') + 'Z').join(' ')

  return (
    <section className="opt-demo">
      <style>{`.opt-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden}.opt-head{display:flex;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:var(--paper)}.opt-title{font-family:var(--font-serif);font-size:18px;font-weight:700;margin:0}.opt-note{font-size:12px;color:var(--ink-3)}.opt-controls{display:flex;gap:14px;flex-wrap:wrap;font-size:12px}.opt-controls input{width:120px}.opt-svg{width:calc(100% - 28px);margin:14px;background:#fff;border:1px solid var(--rule-soft);border-radius:6px}`}</style>
      <div className="opt-head"><div><h3 className="opt-title">优化器：学习率与动量如何改变下降路径</h3><div className="opt-note">等高线由损失函数采样后用 d3-contour 计算，路径由梯度下降更新生成。</div></div><div className="opt-controls"><label>lr {lr.toFixed(2)}<input type="range" min="0.03" max="0.35" step="0.01" value={lr} onChange={e => setLr(Number(e.target.value))} /></label><label>momentum {momentum.toFixed(2)}<input type="range" min="0" max="0.9" step="0.05" value={momentum} onChange={e => setMomentum(Number(e.target.value))} /></label></div></div>
      <svg className="opt-svg" viewBox={`0 0 ${W} ${H}`}><Group left={margin.left} top={margin.top}>{contourPaths.map((c, i) => <path key={i} d={contourPath(c.coordinates as number[][][])} fill="none" stroke="var(--rule)" strokeWidth="1" />)}<polyline points={path.map(p => `${xScale(p.x)},${yScale(p.y)}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth="3" /><circle cx={xScale(0.8)} cy={yScale(-0.6)} r="7" fill="var(--rust)" />{path.map((p, i) => <circle key={i} cx={xScale(p.x)} cy={yScale(p.y)} r={i === path.length - 1 ? 6 : 3} fill={i === path.length - 1 ? 'var(--accent)' : 'var(--ink-3)'} />)}</Group></svg>
    </section>
  )
}
