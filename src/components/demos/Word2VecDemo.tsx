import React, { useMemo, useState } from 'react'
import { animated, useSpring } from '@react-spring/web'
import { scaleLinear } from '@visx/scale'

/**
 * Word2Vec：词向量的几何意义 —— 语义相似度 = 向量距离。
 * 点击词语，最近邻连线与类比向量(king-man+woman≈queen)由 react-spring 平滑过渡。
 * 坐标由 visx scale 真实映射，无硬编码像素。
 */
const words = [
  { w: 'king', x: 1.5, y: 1.3, group: 'royal' },
  { w: 'queen', x: 1.2, y: 1.6, group: 'royal' },
  { w: 'man', x: 0.4, y: 0.9, group: 'person' },
  { w: 'woman', x: 0.1, y: 1.2, group: 'person' },
  { w: 'apple', x: -1.4, y: -0.4, group: 'food' },
  { w: 'orange', x: -1.1, y: -0.7, group: 'food' },
  { w: 'river', x: -0.7, y: 1.6, group: 'nature' },
  { w: 'mountain', x: -1.5, y: 1.2, group: 'nature' }
]

const x = scaleLinear({ domain: [-2, 2], range: [50, 670] })
const y = scaleLinear({ domain: [-1.2, 2], range: [290, 40] })

export default function Word2VecDemo() {
  const [focus, setFocus] = useState('king')
  const selected = words.find(d => d.w === focus)!
  const neighbors = useMemo(() =>
    words.map(d => ({ ...d, dist: Math.hypot(d.x - selected.x, d.y - selected.y) })).sort((a, b) => a.dist - b.dist),
    [selected])

  return (
    <section className="w2v-demo">
      <style>{`
        .w2v-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden;box-shadow:var(--shadow-sm)}
        .w2v-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:linear-gradient(180deg,#fff,var(--paper))}
        .w2v-title{font-family:var(--font-serif);font-size:18px;font-weight:700;margin:0;color:var(--ink)}
        .w2v-note{font-size:12px;color:var(--ink-3);margin-top:2px}
        .w2v-controls{display:flex;gap:6px;flex-wrap:wrap;max-width:340px}
        .w2v-controls button{border:1px solid var(--rule);background:#fff;border-radius:5px;padding:5px 8px;cursor:pointer;font-size:11px;transition:all .15s ease}
        .w2v-controls button.active{background:var(--accent);color:#fff;border-color:var(--accent)}
        .w2v-svg{display:block;width:calc(100% - 28px);margin:14px;background:#fff;border:1px solid var(--rule-soft);border-radius:6px}
      `}</style>

      <div className="w2v-head">
        <div>
          <h3 className="w2v-title">Word2Vec：语义相似度就是向量距离</h3>
          <div className="w2v-note">点击词语，连线展示最近邻；红色箭头演示类比 king − man + woman ≈ queen。</div>
        </div>
        <div className="w2v-controls">
          {words.map(d => <button key={d.w} className={focus === d.w ? 'active' : ''} onClick={() => setFocus(d.w)}>{d.w}</button>)}
        </div>
      </div>

      <svg className="w2v-svg" viewBox="0 0 720 340">
        <defs>
          <marker id="w2v-arrow" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="var(--rust)" />
          </marker>
        </defs>
        {/* 最近邻连线：透明度随距离平滑过渡 */}
        {neighbors.slice(1, 4).map(n => {
          const closeness = 1 / (1 + n.dist)
          return (
            <Edge key={n.w}
              x1={x(selected.x)} y1={y(selected.y)}
              x2={x(n.x)} y2={y(n.y)}
              closeness={closeness}
            />
          )
        })}
        {/* 类比向量（始终展示 king-man+woman≈queen） */}
        <line x1={x(0.4)} y1={y(0.9)} x2={x(1.5)} y2={y(1.3)} stroke="var(--rust)" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#w2v-arrow)" />
        <line x1={x(0.1)} y1={y(1.2)} x2={x(1.2)} y2={y(1.6)} stroke="var(--rust)" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#w2v-arrow)" />
        <text x={(x(0.4) + x(1.5)) / 2} y={(y(0.9) + y(1.3)) / 2 - 8} fontSize="10" fill="var(--rust)" textAnchor="middle">+king−man</text>

        {words.map(d => (
          <WordDot key={d.w} d={d} focus={focus} setFocus={setFocus} selectedGroup={selected.group} />
        ))}
      </svg>
    </section>
  )
}

// 词点：半径与填充随选中态平滑过渡
function WordDot({ d, focus, setFocus, selectedGroup }: {
  d: typeof words[0]; focus: string; setFocus: (w: string) => void; selectedGroup: string
}) {
  const isFocus = focus === d.w
  const sameGroup = d.group === selectedGroup
  const { r } = useSpring({
    r: isFocus ? 15 : 9,
    config: { tension: 220, friction: 20 }
  })
  return (
    <g onClick={() => setFocus(d.w)} style={{ cursor: 'pointer' }}>
      <animated.circle
        cx={x(d.x)} cy={y(d.y)}
        r={r}
        fill={isFocus ? 'var(--accent)' : sameGroup ? 'var(--accent-soft)' : '#fff'}
        stroke={sameGroup ? 'var(--accent)' : 'var(--rule)'}
        strokeWidth={2}
      />
      <text x={x(d.x)} y={y(d.y) - 20} textAnchor="middle" fontSize="12"
        fill="var(--ink)" fontWeight={isFocus ? 700 : 400}>{d.w}</text>
    </g>
  )
}

// 连线：透明度随相似度平滑过渡
function Edge({ x1, y1, x2, y2, closeness }: { x1: number; y1: number; x2: number; y2: number; closeness: number }) {
  const { op } = useSpring({
    op: 0.2 + closeness * 0.6,
    config: { tension: 200, friction: 22 }
  })
  return <animated.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--accent)" strokeWidth={2} opacity={op} />
}
