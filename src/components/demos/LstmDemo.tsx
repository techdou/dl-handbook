import React, { useMemo, useState } from 'react'
import { animated, useSpring } from '@react-spring/web'

/**
 * LSTM：三个门控决定细胞状态更新。
 * 数学真实：c_t = f * c_{t-1} + i * g，h_t = o * tanh(c_t)
 * 门控条宽度与细胞状态值由 react-spring 平滑过渡。
 */
export default function LstmDemo() {
  const [forget, setForget] = useState(0.72)
  const [input, setInput] = useState(0.55)
  const [candidate, setCandidate] = useState(0.8)
  const [output, setOutput] = useState(0.6)
  const prevCell = 0.6 // 上一时刻细胞状态（固定参考值）

  const cell = useMemo(() => forget * prevCell + input * candidate, [forget, input, candidate])
  const hidden = useMemo(() => output * Math.tanh(cell), [output, cell])

  const gates = [
    { name: '遗忘门 f', sub: '保留多少旧记忆', value: forget, color: 'var(--rust)', set: setForget },
    { name: '输入门 i', sub: '写入多少新信息', value: input, color: 'var(--accent)', set: setInput },
    { name: '候选 g', sub: '生成的新候选值', value: candidate, color: 'var(--ochre)', set: setCandidate, signed: true },
    { name: '输出门 o', sub: '暴露多少到 h_t', value: output, color: '#7c3aed', set: setOutput }
  ]

  return (
    <section className="lstm-demo">
      <style>{`
        .lstm-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden;box-shadow:var(--shadow-sm)}
        .lstm-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:linear-gradient(180deg,#fff,var(--paper))}
        .lstm-title{font-family:var(--font-serif);font-size:18px;font-weight:700;margin:0;color:var(--ink)}
        .lstm-note{font-size:12px;color:var(--ink-3);margin-top:2px}
        .lstm-body{padding:18px;display:grid;grid-template-columns:1fr 240px;gap:20px;align-items:start}
        .lstm-reset{border:1px solid var(--rule);background:var(--paper);color:var(--ink-2);border-radius:5px;padding:7px 10px;cursor:pointer;font-size:12px}
        .gate-row{margin:10px 0}
        .gate-label{display:flex;justify-content:space-between;font-size:12px;color:var(--ink-2);margin-bottom:4px}
        .gate-label b{font-family:var(--font-mono)}
        .track{height:18px;background:var(--rule-soft);border-radius:14px;overflow:hidden;position:relative}
        .gate-fill{height:100%;border-radius:14px}
        .gate-slider{margin-top:6px;width:100%}
        .cell-panel{border:1px solid var(--rule);border-radius:8px;background:#fff;padding:16px}
        .cell-panel h4{font-family:var(--font-serif);font-size:14px;margin:0 0 10px;color:var(--ink)}
        .cell-val{font-family:var(--font-mono);font-size:28px;font-weight:700;color:var(--accent);line-height:1.1}
        .cell-break{font-size:11px;color:var(--ink-3);margin-top:8px;line-height:1.6}
        .hidden-val{margin-top:12px;padding-top:10px;border-top:1px solid var(--rule-soft);font-size:13px}
        @media(max-width:760px){.lstm-body{grid-template-columns:1fr}}
      `}</style>

      <div className="lstm-head">
        <div>
          <h3 className="lstm-title">LSTM：门控决定记住什么、忘掉什么</h3>
          <div className="lstm-note">cₜ = f·cₜ₋₁ + i·g，hₜ = o·tanh(cₜ)。调节门控，观察细胞状态实时更新。</div>
        </div>
        <button className="lstm-reset"
          onClick={() => { setForget(0.72); setInput(0.55); setCandidate(0.8); setOutput(0.6) }}>默认值</button>
      </div>

      <div className="lstm-body">
        <div>
          {gates.map(g => <GateRow key={g.name} {...g} />)}
        </div>

        <div className="cell-panel">
          <h4>细胞状态 cₜ</h4>
          <CellVal value={cell} />
          <div className="cell-break">
            保留旧记忆：f·cₜ₋₁ = {(forget * prevCell).toFixed(3)}<br />
            写入新信息：i·g = {(input * candidate).toFixed(3)}
          </div>
          <div className="hidden-val">
            隐藏状态 hₜ = o·tanh(cₜ) = <b style={{ fontFamily: 'var(--font-mono)', color: 'var(--rust)' }}>{hidden.toFixed(3)}</b>
          </div>
        </div>
      </div>
    </section>
  )
}

// 细胞状态数值的动画文本
function CellVal({ value }: { value: number }) {
  const s = useSpring({ val: value, config: { tension: 180, friction: 22 } })
  return <animated.div className="cell-val">{s.val.to(v => v.toFixed(3))}</animated.div>
}

function GateRow({ name, sub, value, color, set, signed }: {
  name: string; sub: string; value: number; color: string; set: (v: number) => void; signed?: boolean
}) {
  const { w } = useSpring({
    w: signed ? Math.abs(value) * 100 : value * 100,
    config: { tension: 200, friction: 24 }
  })
  return (
    <div className="gate-row">
      <div className="gate-label">
        <span>{name} <span style={{ color: 'var(--ink-3)' }}>· {sub}</span></span>
        <b style={{ color }}>{value.toFixed(2)}</b>
      </div>
      <div className="track">
        <animated.div className="gate-fill" style={{
          width: w.to(v => `${v}%`),
          background: color
        }} />
      </div>
      <input className="gate-slider" type="range" min={signed ? -1 : 0} max="1" step="0.01" value={value}
        onChange={e => set(Number(e.target.value))} />
    </div>
  )
}
