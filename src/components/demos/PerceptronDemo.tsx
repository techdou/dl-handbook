import React, { useMemo, useState } from 'react'
import { animated, useSpring } from '@react-spring/web'
import { scaleLinear } from '@visx/scale'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { GridRows, GridColumns } from '@visx/grid'
import { Group } from '@visx/group'

type Point = { x1: number; x2: number; label: 1 | -1 }

const W = 720
const H = 390
const margin = { top: 34, right: 30, bottom: 48, left: 54 }
const plotW = W - margin.left - margin.right
const plotH = H - margin.top - margin.bottom

function makePoints(seed: number): Point[] {
  let s = seed * 9973 + 17
  const rand = () => {
    s = (s * 48271) % 2147483647
    return s / 2147483647
  }

  return Array.from({ length: 44 }, () => {
    const x1 = rand() * 4 - 2
    const x2 = rand() * 4 - 2
    const label = x2 > 0.65 * x1 - 0.2 ? 1 : -1
    return { x1, x2, label }
  })
}

function clipBoundary(w1: number, w2: number, b: number) {
  const candidates = [
    [-2, (-b - w1 * -2) / w2],
    [2, (-b - w1 * 2) / w2],
    [(-b - w2 * -2) / w1, -2],
    [(-b - w2 * 2) / w1, 2]
  ].filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y) && x >= -2 && x <= 2 && y >= -2 && y <= 2)

  return candidates.slice(0, 2)
}

export default function PerceptronDemo() {
  const [seed, setSeed] = useState(1)
  const [weights, setWeights] = useState({ w1: 0.35, w2: -0.2, b: 0 })
  const [epoch, setEpoch] = useState(0)
  const points = useMemo(() => makePoints(seed), [seed])

  const x = scaleLinear({ domain: [-2, 2], range: [0, plotW] })
  const y = scaleLinear({ domain: [-2, 2], range: [plotH, 0] })
  const boundary = clipBoundary(weights.w1, weights.w2 || 0.001, weights.b)
  const correct = points.filter(p => Math.sign(weights.w1 * p.x1 + weights.w2 * p.x2 + weights.b || -1) === p.label).length
  const accuracy = Math.round((correct / points.length) * 100)
  const lineSpring = useSpring({
    x1: boundary[0] ? x(boundary[0][0]) : 0,
    y1: boundary[0] ? y(boundary[0][1]) : plotH,
    x2: boundary[1] ? x(boundary[1][0]) : plotW,
    y2: boundary[1] ? y(boundary[1][1]) : 0,
    config: { tension: 170, friction: 24 }
  })

  function trainStep() {
    const eta = 0.18
    const miss = points.find(p => Math.sign(weights.w1 * p.x1 + weights.w2 * p.x2 + weights.b || -1) !== p.label)
    if (!miss) return
    setWeights(prev => ({
      w1: prev.w1 + eta * miss.label * miss.x1,
      w2: prev.w2 + eta * miss.label * miss.x2,
      b: prev.b + eta * miss.label
    }))
    setEpoch(v => v + 1)
  }

  function reset() {
    setSeed(v => v + 1)
    setWeights({ w1: 0.35, w2: -0.2, b: 0 })
    setEpoch(0)
  }

  return (
    <section className="demo-shell perceptron-demo">
      <style>{`
        .demo-shell{background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden;box-shadow:var(--shadow-sm);font-family:var(--font-sans);}
        .demo-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:linear-gradient(180deg,#fff,var(--paper));}
        .demo-title{font-family:var(--font-serif);font-size:18px;font-weight:700;color:var(--ink);margin:0;}
        .demo-note{font-size:12px;color:var(--ink-3);margin-top:2px;}
        .demo-metrics{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;}
        .metric{border:1px solid var(--rule);background:#fff;padding:5px 8px;border-radius:5px;font-size:12px;color:var(--ink-2);}
        .demo-body{display:grid;grid-template-columns:minmax(0,1fr) 210px;gap:12px;padding:14px;}
        .viz{min-width:0;border:1px solid var(--rule-soft);background:#fff;border-radius:6px;}
        .panel{border-left:1px solid var(--rule-soft);padding-left:14px;display:flex;flex-direction:column;gap:12px;}
        .control{display:flex;flex-direction:column;gap:4px;font-size:12px;color:var(--ink-2);}
        .control input{width:100%;}
        .btn-row{display:flex;gap:8px;flex-wrap:wrap;}
        .demo-btn{border:1px solid var(--accent);background:var(--accent);color:white;border-radius:5px;padding:7px 10px;font-size:12px;cursor:pointer;}
        .demo-btn.secondary{background:#fff;color:var(--accent);}
        .legend{display:flex;gap:10px;font-size:12px;color:var(--ink-3);align-items:center;flex-wrap:wrap;}
        .dot{width:9px;height:9px;border-radius:50%;display:inline-block;margin-right:4px;}
        @media(max-width:760px){.demo-body{grid-template-columns:1fr}.panel{border-left:0;border-top:1px solid var(--rule-soft);padding-left:0;padding-top:12px}.demo-head{flex-direction:column}.demo-metrics{justify-content:flex-start}}
      `}</style>

      <div className="demo-head">
        <div>
          <h3 className="demo-title">感知机：训练一个线性决策边界</h3>
          <div className="demo-note">滑块直接改变权重；“训练一步”按感知机更新规则修正第一个错分点。</div>
        </div>
        <div className="demo-metrics">
          <span className="metric">准确率 {accuracy}%</span>
          <span className="metric">更新 {epoch} 次</span>
        </div>
      </div>

      <div className="demo-body">
        <svg className="viz" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="perceptron decision boundary">
          <Group left={margin.left} top={margin.top}>
            <GridRows scale={y} width={plotW} stroke="var(--rule-soft)" />
            <GridColumns scale={x} height={plotH} stroke="var(--rule-soft)" />
            <AxisBottom top={plotH} scale={x} numTicks={5} tickLabelProps={() => ({ fontSize: 11, fill: 'var(--ink-3)' })} />
            <AxisLeft scale={y} numTicks={5} tickLabelProps={() => ({ fontSize: 11, fill: 'var(--ink-3)' })} />
            <animated.line {...lineSpring} stroke="var(--accent)" strokeWidth={3} strokeDasharray="8 5" />
            {points.map((p, i) => {
              const pred = Math.sign(weights.w1 * p.x1 + weights.w2 * p.x2 + weights.b || -1)
              const good = pred === p.label
              return (
                <circle
                  key={i}
                  cx={x(p.x1)}
                  cy={y(p.x2)}
                  r={good ? 5 : 7}
                  fill={p.label === 1 ? 'var(--accent)' : 'var(--rust)'}
                  opacity={good ? 0.82 : 1}
                  stroke={good ? '#fff' : '#111'}
                  strokeWidth={good ? 1 : 2}
                />
              )
            })}
          </Group>
        </svg>

        <aside className="panel">
          {(['w1', 'w2', 'b'] as const).map(key => (
            <label className="control" key={key}>
              <span>{key} = {weights[key].toFixed(2)}</span>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.01"
                value={weights[key]}
                onChange={e => setWeights(prev => ({ ...prev, [key]: Number(e.target.value) }))}
              />
            </label>
          ))}
          <div className="btn-row">
            <button className="demo-btn" onClick={trainStep}>训练一步</button>
            <button className="demo-btn secondary" onClick={reset}>重置数据</button>
          </div>
          <div className="legend">
            <span><i className="dot" style={{ background: 'var(--accent)' }} />类别 +1</span>
            <span><i className="dot" style={{ background: 'var(--rust)' }} />类别 -1</span>
          </div>
        </aside>
      </div>
    </section>
  )
}
