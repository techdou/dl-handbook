import React, { useMemo, useState } from 'react'
import { Group } from '@visx/group'
import { animated, useSpring } from '@react-spring/web'

const W = 720
const H = 360

export default function NeuralNetworkDemo() {
  const [hidden, setHidden] = useState(2)
  const [width, setWidth] = useState(5)
  const [active, setActive] = useState(0)
  const glow = useSpring({ opacity: 0.35 + active * 0.16, config: { tension: 160, friction: 20 } })
  const layers = useMemo(() => [3, ...Array.from({ length: hidden }, () => width), 2], [hidden, width])
  const layerX = layers.map((_, i) => 70 + i * ((W - 140) / (layers.length - 1)))

  const nodes = layers.map((count, layer) =>
    Array.from({ length: count }, (_, i) => ({
      layer,
      i,
      x: layerX[layer],
      y: H / 2 + (i - (count - 1) / 2) * Math.min(44, 230 / count)
    }))
  )

  return (
    <section className="nn-demo">
      <style>{`
        .nn-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden}
        .nn-top{display:flex;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:var(--paper)}
        .nn-title{font-family:var(--font-serif);font-weight:700;font-size:18px;margin:0;color:var(--ink)}
        .nn-note{font-size:12px;color:var(--ink-3)}
        .nn-controls{display:flex;gap:14px;align-items:center;flex-wrap:wrap;font-size:12px;color:var(--ink-2)}
        .nn-controls input{width:120px}
        .nn-body{padding:14px}
        .nn-svg{width:100%;background:#fff;border:1px solid var(--rule-soft);border-radius:6px}
        .nn-btn{border:1px solid var(--accent);border-radius:5px;background:var(--accent);color:white;padding:7px 10px;cursor:pointer}
      `}</style>
      <div className="nn-top">
        <div>
          <h3 className="nn-title">神经网络：层数、宽度与信息流</h3>
          <div className="nn-note">改变隐藏层数量和每层神经元数量，观察连接规模如何增长。</div>
        </div>
        <div className="nn-controls">
          <label>隐藏层 {hidden}<input type="range" min="1" max="4" value={hidden} onChange={e => setHidden(Number(e.target.value))} /></label>
          <label>宽度 {width}<input type="range" min="2" max="8" value={width} onChange={e => setWidth(Number(e.target.value))} /></label>
          <button className="nn-btn" onClick={() => setActive(v => (v + 1) % layers.length)}>前进一步</button>
        </div>
      </div>
      <div className="nn-body">
        <svg className="nn-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="neural network layers">
          {nodes.slice(1).map((layer, li) =>
            nodes[li].flatMap(from =>
              layer.map(to => (
                <line key={`${from.layer}-${from.i}-${to.layer}-${to.i}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--rule)" strokeWidth={0.7} opacity={to.layer <= active ? 0.65 : 0.28} />
              ))
            )
          )}
          {nodes.map((layer, li) => (
            <Group key={li}>
              <text x={layerX[li]} y={H - 20} textAnchor="middle" fontSize={12} fill="var(--ink-3)">
                {li === 0 ? '输入层' : li === layers.length - 1 ? '输出层' : `隐藏层 ${li}`}
              </text>
              {layer.map(n => (
                <Group key={`${n.layer}-${n.i}`}>
                  {n.layer === active && <animated.circle cx={n.x} cy={n.y} r={20} fill="var(--accent-soft)" style={glow} />}
                  <circle cx={n.x} cy={n.y} r={13} fill="#fff" stroke={n.layer <= active ? 'var(--accent)' : 'var(--rule)'} strokeWidth={2} />
                </Group>
              ))}
            </Group>
          ))}
        </svg>
      </div>
    </section>
  )
}
