import React, { useMemo, useState } from 'react'
import { animated, useSpring, config } from '@react-spring/web'

/**
 * Attention：查询与键的相似度经 softmax 归一化为注意力权重。
 * 数学真实：score = exp(sim / temp)，weight = score / Σscore。
 * 热力格背景透明度随权重平滑过渡（react-spring）。
 */
const q = ['it', 'is', 'good']
const k = ['它', '很', '好']
// 真实的 Q·K 相似度矩阵（对角更相似，模拟对齐）
const sim = [
  [2.0, 0.4, 0.3],
  [0.3, 1.8, 0.5],
  [0.2, 0.4, 2.1]
]

function softmax(scores: number[], temp: number) {
  const exps = scores.map(s => Math.exp(s / temp))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sum)
}

export default function AttentionDemo() {
  const [temp, setTemp] = useState(0.8)
  const scores = useMemo(() => q.map((_, i) => softmax(sim[i], temp)), [temp])

  return (
    <section className="att-demo">
      <style>{`
        .att-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden;box-shadow:var(--shadow-sm)}
        .att-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:linear-gradient(180deg,#fff,var(--paper))}
        .att-title{font-family:var(--font-serif);font-size:18px;font-weight:700;margin:0;color:var(--ink)}
        .att-note{font-size:12px;color:var(--ink-3);margin-top:2px}
        .att-ctrl{font-size:12px;color:var(--ink-2);display:flex;align-items:center;gap:8px;flex-shrink:0}
        .att-ctrl input{width:110px}
        .att-body{padding:18px}
        .att-grid{display:grid;grid-template-columns:90px repeat(${k.length},1fr);gap:6px}
        .att-cell{min-height:60px;border:1px solid var(--rule-soft);border-radius:5px;display:grid;place-items:center;font-size:13px;font-family:var(--font-mono);color:var(--ink);position:relative;overflow:hidden}
        .att-cell.head{font-family:var(--font-serif);font-weight:700;background:var(--paper)}
        .att-fill{position:absolute;inset:0;border-radius:4px}
        .att-val{position:relative;z-index:1;font-weight:600}
        .att-formula{margin-top:14px;padding:10px 12px;background:var(--paper-soft);border-radius:5px;font-size:12px;color:var(--ink-3)}
      `}</style>

      <div className="att-head">
        <div>
          <h3 className="att-title">Attention：查询与键的相似度分布</h3>
          <div className="att-note">score = Q·K，权重 = softmax(score / T)。温度越低注意力越尖锐，越高越平均。</div>
        </div>
        <label className="att-ctrl">temperature {temp.toFixed(2)}
          <input type="range" min="0.2" max="2" step="0.05" value={temp} onChange={e => setTemp(Number(e.target.value))} />
        </label>
      </div>

      <div className="att-body">
        <div className="att-grid">
          <div />
          {k.map(t => <b className="att-cell head" key={t}>key: {t}</b>)}
          {q.map((token, i) => (
            <React.Fragment key={token}>
              <b className="att-cell head">query: {token}</b>
              {scores[i].map((v, j) => (
                <HeatCell key={j} value={v} />
              ))}
            </React.Fragment>
          ))}
        </div>
        <div className="att-formula">
          示例：query="it" 的注意力 → 它 {scores[0][0].toFixed(2)} / 很 {scores[0][1].toFixed(2)} / 好 {scores[0][2].toFixed(2)}，每行之和恒为 1。
        </div>
      </div>
    </section>
  )
}

// 单个热力格：背景透明度由 react-spring 平滑过渡
function HeatCell({ value }: { value: number }) {
  const { bg } = useSpring({
    bg: `rgba(44,82,130,${0.1 + value * 0.8})`,
    config: { ...config.default, clamp: true }
  })
  const color = value > 0.45 ? '#fff' : 'var(--ink)'
  return (
    <div className="att-cell">
      <animated.div className="att-fill" style={{ background: bg }} />
      <animated.span className="att-val" style={{ color }}>{value.toFixed(2)}</animated.span>
    </div>
  )
}
