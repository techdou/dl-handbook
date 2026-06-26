import React, { useMemo, useState } from 'react'

const digit = [
  '0011100',
  '0110010',
  '1100001',
  '1100111',
  '1111111',
  '0000011',
  '0000110'
]

export default function MnistDemo() {
  const [threshold, setThreshold] = useState(0.48)
  const [noise, setNoise] = useState(0.18)
  const pixels = useMemo(() => digit.flatMap((row, r) => row.split('').map((ch, c) => {
    const base = ch === '1' ? 0.82 : 0.08
    const n = Math.abs(Math.sin((r + 1) * 12.989 + (c + 2) * 78.233)) * noise
    return Math.min(1, base + n)
  })), [noise])
  const active = pixels.filter(v => v > threshold).length
  const prediction = active > 20 ? '8' : active > 14 ? '6' : '1'

  return (
    <section className="mnist-demo">
      <style>{`
        .mnist-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden}
        .mnist-head{display:flex;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:var(--paper)}
        .mnist-title{font-family:var(--font-serif);font-size:18px;font-weight:700;margin:0}.mnist-note{font-size:12px;color:var(--ink-3)}
        .mnist-controls{display:flex;gap:12px;align-items:center;flex-wrap:wrap;font-size:12px}.mnist-controls input{width:120px}
        .mnist-body{display:grid;grid-template-columns:260px 1fr;gap:22px;align-items:center;padding:18px}.mnist-grid{display:grid;grid-template-columns:repeat(7,28px);gap:4px}.pix{width:28px;height:28px;border-radius:4px;border:1px solid var(--rule-soft)}
        .pred{font-family:var(--font-serif);font-size:72px;color:var(--accent);line-height:1}.bar{height:10px;border-radius:10px;background:var(--rule-soft);overflow:hidden;margin:8px 0}.bar span{display:block;height:100%;background:var(--accent)}
      `}</style>
      <div className="mnist-head">
        <div><h3 className="mnist-title">MNIST：像素阈值与分类置信度</h3><div className="mnist-note">阈值改变二值化结果，噪声模拟手写数字采集偏差。</div></div>
        <div className="mnist-controls">
          <label>阈值 {threshold.toFixed(2)}<input type="range" min="0.1" max="0.9" step="0.01" value={threshold} onChange={e => setThreshold(Number(e.target.value))} /></label>
          <label>噪声 {noise.toFixed(2)}<input type="range" min="0" max="0.4" step="0.01" value={noise} onChange={e => setNoise(Number(e.target.value))} /></label>
        </div>
      </div>
      <div className="mnist-body">
        <div className="mnist-grid">{pixels.map((v, i) => <div key={i} className="pix" style={{ background: v > threshold ? `rgba(26,26,26,${v})` : '#fff' }} />)}</div>
        <div>
          <div className="pred">{prediction}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>激活像素：{active} / 49</div>
          <div className="bar"><span style={{ width: `${Math.min(100, active * 4)}%` }} /></div>
        </div>
      </div>
    </section>
  )
}
