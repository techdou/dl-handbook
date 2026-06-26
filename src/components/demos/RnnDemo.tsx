import React, { useMemo, useState } from 'react'
import { animated, useSpring } from '@react-spring/web'

/**
 * RNN：隐藏状态沿时间轴传递。
 * h_t = tanh(W_x·x_t + W_h·h_{t-1})，tanh 让状态有界。
 * 时间步切换时，激活节点与连线高亮由 react-spring 平滑过渡。
 */
const tokens = ['我', '喜欢', '深度', '学习', '模型']

export default function RnnDemo() {
  const [step, setStep] = useState(2)
  // 用真实 tanh 累积模拟隐藏状态演化
  const states = useMemo(() => {
    let h = 0
    return tokens.map((_, i) => { h = Math.tanh((i + 1) * 0.42 + h * 0.5); return h })
  }, [])

  return (
    <section className="rnn-demo">
      <style>{`
        .rnn-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden;box-shadow:var(--shadow-sm)}
        .rnn-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:linear-gradient(180deg,#fff,var(--paper))}
        .rnn-title{font-family:var(--font-serif);font-size:18px;font-weight:700;margin:0;color:var(--ink)}
        .rnn-note{font-size:12px;color:var(--ink-3);margin-top:2px}
        .rnn-ctrl{font-size:12px;color:var(--ink-2);display:flex;align-items:center;gap:8px;flex-shrink:0}
        .rnn-ctrl input{width:140px}
        .rnn-svg{display:block;width:calc(100% - 28px);margin:14px;background:#fff;border:1px solid var(--rule-soft);border-radius:6px}
      `}</style>

      <div className="rnn-head">
        <div>
          <h3 className="rnn-title">RNN：隐藏状态沿时间轴传递</h3>
          <div className="rnn-note">hₜ = tanh(W·xₜ + U·hₜ₋₁)。拖动时间步，观察记忆如何累积、当前节点激活。</div>
        </div>
        <label className="rnn-ctrl">time t={step + 1}
          <input type="range" min="0" max={tokens.length - 1} value={step} onChange={e => setStep(Number(e.target.value))} />
        </label>
      </div>

      <svg className="rnn-svg" viewBox="0 0 720 300">
        <defs>
          <marker id="rnn-a" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="var(--accent)" />
          </marker>
        </defs>
        {tokens.map((tok, i) => {
          const x = 82 + i * 140
          const isActive = i === step
          const isPast = i < step
          return (
            <g key={tok}>
              {/* 横向状态传递连线 */}
              {i < tokens.length - 1 && (
                <Edge active={isPast} x1={x + 40} y1={139} x2={x + 98} y2={139} />
              )}
              {/* 输入箭头 */}
              <line x1={x} y1={60} x2={x} y2={108} stroke="var(--rule)" strokeWidth={isActive ? 2 : 1} markerEnd="url(#rnn-a)" opacity={isActive ? 1 : 0.5} />
              {/* 节点 */}
              <Node x={x} y={139} active={isActive} h={states[i]} tok={tok} />
            </g>
          )
        })}
        <text x="360" y="285" textAnchor="middle" fontSize="12" fill="var(--ink-3)">→ 时间步展开（unroll）</text>
      </svg>
    </section>
  )
}

// 节点：填充与描边随激活态平滑过渡
function Node({ x, y, active, h, tok }: { x: number; y: number; active: boolean; h: number; tok: string }) {
  const { r, sw } = useSpring({
    r: active ? 30 : 26,
    sw: active ? 2.5 : 1.5,
    config: { tension: 220, friction: 20 }
  })
  return (
    <g>
      <animated.rect
        x={r.to(rv => x - rv)}
        y={r.to(rv => y - rv)}
        width={r.to(rv => rv * 2)}
        height={r.to(rv => rv * 2)}
        rx={6}
        fill={active ? 'var(--accent-soft)' : '#fff'}
        stroke={active ? 'var(--accent)' : 'var(--rule)'}
        strokeWidth={sw}
      />
      <text x={x} y={y - 44} textAnchor="middle" fontSize="13" fill="var(--ink)">{tok}</text>
      <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fill="var(--accent)" fontFamily="var(--font-mono)">h={h.toFixed(2)}</text>
    </g>
  )
}

// 边：透明度随是否激活过渡
function Edge({ active, x1, y1, x2, y2 }: { active: boolean; x1: number; y1: number; x2: number; y2: number }) {
  const { op, sw } = useSpring({
    op: active ? 1 : 0.25,
    sw: active ? 2 : 1,
    config: { tension: 220, friction: 20 }
  })
  return <animated.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--accent)" strokeWidth={sw} opacity={op} markerEnd="url(#rnn-a)" />
}
