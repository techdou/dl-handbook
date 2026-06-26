import React, { useMemo, useState } from 'react'
import { animated, useSpring } from '@react-spring/web'

/**
 * Seq2Seq + Attention：编码器压缩语义，解码器逐步生成。
 * 注意力权重对每步真实计算（基于对齐相似度 + softmax），连线透明度随权重平滑过渡。
 */
const src = ['I', 'love', 'AI']
const tgt = ['我', '爱', 'AI']
// 源-目标对齐相似度（模拟训练好的对齐矩阵）
const alignSim = [
  [2.1, 0.3, 0.2], // 我
  [0.4, 2.0, 0.3], // 爱
  [0.2, 0.3, 2.2]  // AI
]

function softmaxRow(row: number[]) {
  const exps = row.map(v => Math.exp(v))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sum)
}

const ENC_Y = 90
const DEC_Y = 250

export default function Seq2SeqDemo() {
  const [step, setStep] = useState(0)
  // 当前解码步对所有编码状态的注意力权重
  const weights = useMemo(() => softmaxRow(alignSim[step]), [step])

  const encX = (i: number) => 110 + i * 170
  const decX = (i: number) => 110 + i * 170

  return (
    <section className="s2s-demo">
      <style>{`
        .s2s-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden;box-shadow:var(--shadow-sm)}
        .s2s-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:linear-gradient(180deg,#fff,var(--paper))}
        .s2s-title{font-family:var(--font-serif);font-size:18px;font-weight:700;margin:0;color:var(--ink)}
        .s2s-note{font-size:12px;color:var(--ink-3);margin-top:2px}
        .s2s-ctrl{font-size:12px;color:var(--ink-2);display:flex;align-items:center;gap:8px;flex-shrink:0}
        .s2s-ctrl input{width:120px}
        .s2s-svg{display:block;width:calc(100% - 28px);margin:14px;background:#fff;border:1px solid var(--rule-soft);border-radius:6px}
        .s2s-legend{padding:0 18px 14px;font-size:11px;color:var(--ink-3);display:flex;gap:14px;flex-wrap:wrap}
      `}</style>

      <div className="s2s-head">
        <div>
          <h3 className="s2s-title">Seq2Seq + Attention：编码语义，按权重对齐解码</h3>
          <div className="s2s-note">拖动解码步，连线粗细=注意力权重（softmax 真实计算），高亮当前生成的目标词。</div>
        </div>
        <label className="s2s-ctrl">decode step {step + 1}/{tgt.length}
          <input type="range" min="0" max={tgt.length - 1} value={step} onChange={e => setStep(Number(e.target.value))} />
        </label>
      </div>

      <svg className="s2s-svg" viewBox="0 0 620 330">
        <defs>
          <marker id="s2s-a" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="var(--accent)" />
          </marker>
        </defs>
        <text x="310" y="40" textAnchor="middle" fontSize="12" fill="var(--ink-3)">Encoder 编码状态</text>
        <text x="310" y="310" textAnchor="middle" fontSize="12" fill="var(--ink-3)">Decoder 解码输出</text>

        {/* 注意力连线：透明度与粗细随权重动画过渡 */}
        {src.map((s, i) => (
          <AttLine
            key={i}
            x1={encX(i)} y1={ENC_Y + 23}
            x2={decX(step)} y2={DEC_Y - 23}
            weight={weights[i]}
          />
        ))}

        {/* 编码器节点 */}
        {src.map((s, i) => (
          <g key={s}>
            <rect x={encX(i) - 40} y={ENC_Y - 23} width="80" height="46" rx="6"
              fill={weights[i] > 0.4 ? 'var(--accent-soft)' : '#fff'}
              stroke={weights[i] > 0.4 ? 'var(--accent)' : 'var(--rule)'} strokeWidth={weights[i] > 0.4 ? 2 : 1} />
            <text x={encX(i)} y={ENC_Y + 4} textAnchor="middle" fontSize="13" fill="var(--ink)">{s}</text>
            <text x={encX(i)} y={ENC_Y + 38} textAnchor="middle" fontSize="10" fill="var(--accent)" fontFamily="var(--font-mono)">{weights[i].toFixed(2)}</text>
          </g>
        ))}

        {/* 解码器节点 */}
        {tgt.map((t, i) => (
          <g key={t}>
            <rect x={decX(i) - 40} y={DEC_Y - 23} width="80" height="46" rx="6"
              fill={i === step ? 'var(--accent)' : '#fff'}
              stroke={i === step ? 'var(--accent-dark)' : 'var(--rule)'} strokeWidth={i === step ? 2 : 1} />
            <text x={decX(i)} y={DEC_Y + 4} textAnchor="middle" fontSize="13"
              fill={i === step ? '#fff' : 'var(--ink-3)'} fontWeight={i === step ? 700 : 400}>{t}</text>
          </g>
        ))}
      </svg>
      <div className="s2s-legend">
        <span>解码步 {step + 1}：生成 "{tgt[step]}"</span>
        <span>← 注意力来源：我 {weights[0].toFixed(2)} / 爱 {weights[1].toFixed(2)} / AI {weights[2].toFixed(2)}</span>
      </div>
    </section>
  )
}

// 注意力连线：粗细与透明度由 react-spring 平滑过渡
function AttLine({ x1, y1, x2, y2, weight }: { x1: number; y1: number; x2: number; y2: number; weight: number }) {
  const { sw, op } = useSpring({
    sw: 1 + weight * 6,
    op: 0.2 + weight * 0.7,
    config: { tension: 200, friction: 22 }
  })
  return (
    <animated.line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke="var(--accent)"
      strokeWidth={sw}
      opacity={op}
    />
  )
}
