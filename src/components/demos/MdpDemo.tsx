import React, { useMemo, useState } from 'react'

export default function MdpDemo() {
  const [p, setP] = useState(0.7)
  const gamma = 0.9
  const values = useMemo(() => {
    const terminal = 1
    const s2 = p * (0.2 + gamma * terminal) + (1 - p) * (-0.1)
    const s1 = 0.4 * (0.1 + gamma * s2) + 0.6 * (0 + gamma * 0.2)
    return { s1, s2, terminal }
  }, [p])
  return (
    <section className="mdp-demo">
      <style>{`.mdp-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden}.mdp-head{display:flex;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:var(--paper)}.mdp-title{font-family:var(--font-serif);font-size:18px;font-weight:700;margin:0}.mdp-note{font-size:12px;color:var(--ink-3)}.mdp-svg{width:calc(100% - 28px);margin:14px;background:#fff;border:1px solid var(--rule-soft);border-radius:6px}`}</style>
      <div className="mdp-head"><div><h3 className="mdp-title">MDP：转移概率改变状态价值</h3><div className="mdp-note">调节 S2 到终止态的概率，贝尔曼期望值同步更新。</div></div><label style={{ fontSize: 12 }}>P(S2→Goal) {p.toFixed(2)}<input type="range" min="0" max="1" step="0.01" value={p} onChange={e => setP(Number(e.target.value))} /></label></div>
      <svg className="mdp-svg" viewBox="0 0 720 330"><defs><marker id="mdp-a" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="var(--accent)" /></marker></defs>{[[130,170,310,100,`p=.4,r=.1`],[130,170,310,240,`p=.6,r=0`],[310,100,540,170,`p=${p.toFixed(2)},r=.2`]].map((e, i) => <g key={i}><line x1={e[0] as number} y1={e[1] as number} x2={e[2] as number} y2={e[3] as number} stroke="var(--accent)" strokeWidth="2" markerEnd="url(#mdp-a)" /><text x={((e[0] as number)+(e[2] as number))/2} y={((e[1] as number)+(e[3] as number))/2 - 8} textAnchor="middle" fontSize="12" fill="var(--ink-3)">{e[4]}</text></g>)}{[{x:130,y:170,t:'S1',v:values.s1},{x:310,y:100,t:'S2',v:values.s2},{x:310,y:240,t:'S3',v:0.2},{x:540,y:170,t:'Goal',v:values.terminal}].map(n => <g key={n.t}><circle cx={n.x} cy={n.y} r="42" fill={n.t==='Goal'?'var(--accent-soft)':'#fff'} stroke="var(--accent)" strokeWidth="2" /><text x={n.x} y={n.y-4} textAnchor="middle" fontSize="15" fontWeight="700">{n.t}</text><text x={n.x} y={n.y+16} textAnchor="middle" fontSize="12" fill="var(--accent)">V={n.v.toFixed(2)}</text></g>)}</svg>
    </section>
  )
}
