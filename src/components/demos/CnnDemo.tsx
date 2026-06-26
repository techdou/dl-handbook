import React, { useMemo, useState } from 'react'

const image = [
  [0, 0, 1, 1, 1, 0],
  [0, 1, 1, 0, 1, 0],
  [1, 1, 0, 0, 1, 1],
  [1, 0, 0, 1, 1, 0],
  [1, 1, 1, 1, 0, 0],
  [0, 0, 1, 0, 0, 0]
]

const kernels = {
  edge: [[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]],
  blur: [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
  vertical: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]
}

export default function CnnDemo() {
  const [kernelName, setKernelName] = useState<keyof typeof kernels>('edge')
  const [stride, setStride] = useState(1)
  const kernel = kernels[kernelName]
  const feature = useMemo(() => {
    const out: number[][] = []
    for (let r = 0; r <= image.length - 3; r += stride) {
      const row: number[] = []
      for (let c = 0; c <= image[0].length - 3; c += stride) {
        let sum = 0
        for (let kr = 0; kr < 3; kr++) for (let kc = 0; kc < 3; kc++) sum += image[r + kr][c + kc] * kernel[kr][kc]
        row.push(kernelName === 'blur' ? sum / 9 : sum)
      }
      out.push(row)
    }
    return out
  }, [kernel, kernelName, stride])

  return (
    <section className="cnn-demo">
      <style>{`
        .cnn-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden}
        .cnn-head{display:flex;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:var(--paper)}
        .cnn-title{font-family:var(--font-serif);font-size:18px;font-weight:700;margin:0}.cnn-note{font-size:12px;color:var(--ink-3)}
        .cnn-controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:12px}.cnn-controls button{border:1px solid var(--rule);background:white;border-radius:5px;padding:7px 9px;cursor:pointer}.cnn-controls button.active{border-color:var(--accent);color:white;background:var(--accent)}
        .cnn-body{display:grid;grid-template-columns:1fr 140px 1fr;gap:18px;align-items:center;padding:18px}.matrix{display:grid;gap:4px;justify-content:center}.cell{width:34px;height:34px;border-radius:4px;display:grid;place-items:center;font-size:11px;border:1px solid var(--rule-soft)}.arrow{text-align:center;color:var(--accent);font-size:26px}
      `}</style>
      <div className="cnn-head">
        <div><h3 className="cnn-title">卷积神经网络：卷积核提取局部特征</h3><div className="cnn-note">切换卷积核和步幅，右侧特征图按真实卷积结果更新。</div></div>
        <div className="cnn-controls">
          {(Object.keys(kernels) as Array<keyof typeof kernels>).map(k => <button key={k} className={kernelName === k ? 'active' : ''} onClick={() => setKernelName(k)}>{k}</button>)}
          <label>stride {stride}<input type="range" min="1" max="2" value={stride} onChange={e => setStride(Number(e.target.value))} /></label>
        </div>
      </div>
      <div className="cnn-body">
        <div className="matrix" style={{ gridTemplateColumns: `repeat(${image[0].length},34px)` }}>
          {image.flatMap((row, r) => row.map((v, c) => <div key={`${r}-${c}`} className="cell" style={{ background: v ? 'var(--accent)' : '#fff', color: v ? '#fff' : 'var(--ink-3)' }}>{v}</div>))}
        </div>
        <div className="matrix" style={{ gridTemplateColumns: 'repeat(3,34px)' }}>
          {kernel.flatMap((row, r) => row.map((v, c) => <div key={`${r}-${c}`} className="cell" style={{ background: 'var(--paper)', color: v < 0 ? 'var(--rust)' : 'var(--accent)' }}>{v}</div>))}
        </div>
        <div className="matrix" style={{ gridTemplateColumns: `repeat(${feature[0].length},34px)` }}>
          {feature.flatMap((row, r) => row.map((v, c) => {
            const t = Math.min(1, Math.abs(v) / 5)
            return <div key={`${r}-${c}`} className="cell" style={{ background: v >= 0 ? `rgba(44,82,130,${0.15 + t * 0.75})` : `rgba(156,66,33,${0.15 + t * 0.75})`, color: Math.abs(v) > 2 ? '#fff' : 'var(--ink)' }}>{v.toFixed(1)}</div>
          }))}
        </div>
      </div>
    </section>
  )
}
