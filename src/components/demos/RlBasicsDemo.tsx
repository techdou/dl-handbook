import React, { useMemo, useState } from 'react'
import { animated, useSpring } from '@react-spring/web'

/**
 * 强化学习基础：状态、动作、奖励。
 * 用户手动选动作，环境返回新状态与奖励；底部实时展示累计奖励与访问轨迹。
 * 网格保持真实 MDP：撞墙负奖励、陷阱终止、目标正奖励。
 */
const actions = ['上', '右', '下', '左']
const delta = [[0, -1], [1, 0], [0, 1], [-1, 0]]
const GOAL = [3, 0]
const TRAP = [1, 1]
const START = [0, 2]

export default function RlBasicsDemo() {
  const [pos, setPos] = useState<number[]>(START)
  const [action, setAction] = useState(1)
  const [reward, setReward] = useState(-0.04)
  const [total, setTotal] = useState(0)
  const [trail, setTrail] = useState<number[]>([posToIdx(START)])
  const [done, setDone] = useState(false)

  const next = useMemo(() => {
    const nx = Math.max(0, Math.min(3, pos[0] + delta[action][0]))
    const ny = Math.max(0, Math.min(3, pos[1] + delta[action][1]))
    return [nx, ny]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, action])

  function step() {
    if (done) return
    const [nx, ny] = next
    let r: number
    if (nx === pos[0] && ny === pos[1]) r = -0.6 // 撞墙
    else if (nx === GOAL[0] && ny === GOAL[1]) r = 1
    else if (nx === TRAP[0] && ny === TRAP[1]) r = -1
    else r = -0.04
    setPos([nx, ny])
    setReward(r)
    setTotal(t => +(t + r).toFixed(3))
    setTrail(t => t.length > 30 ? [...t.slice(1), posToIdx([nx, ny])] : [...t, posToIdx([nx, ny])])
    if (r === 1 || r === -1) setDone(true)
  }
  function reset() {
    setPos(START); setReward(-0.04); setTotal(0); setTrail([posToIdx(START)]); setDone(false)
  }

  // agent 位置的平滑动画
  const agentSpring = useSpring({
    to: { left: `${pos[0] * 25 + 37.5}%`, top: `${pos[1] * 25 + 37.5}%` },
    config: { tension: 200, friction: 22 }
  })

  return (
    <section className="rl-demo">
      <style>{`
        .rl-demo{font-family:var(--font-sans);background:var(--paper-card);border:1px solid var(--rule);border-radius:8px;overflow:hidden;box-shadow:var(--shadow-sm)}
        .rl-head{display:flex;justify-content:space-between;gap:16px;padding:16px 18px;border-bottom:1px solid var(--rule-soft);background:linear-gradient(180deg,#fff,var(--paper))}
        .rl-title{font-family:var(--font-serif);font-size:18px;font-weight:700;margin:0;color:var(--ink)}
        .rl-note{font-size:12px;color:var(--ink-3);margin-top:2px}
        .rl-controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
        .rl-controls button{border:1px solid var(--rule);background:#fff;border-radius:5px;padding:7px 9px;cursor:pointer;font-size:12px}
        .rl-controls button.active,.rl-controls button.primary{background:var(--accent);color:#fff;border-color:var(--accent)}
        .rl-controls button.ghost{background:#fff;color:var(--accent)}
        .rl-body{display:grid;grid-template-columns:260px 1fr;gap:20px;align-items:center;padding:18px}
        .grid{position:relative;display:grid;grid-template-columns:repeat(4,54px);grid-template-rows:repeat(4,54px);gap:6px}
        .tile{border:1px solid var(--rule-soft);border-radius:5px;display:grid;place-items:center;background:#fff;font-size:11px;color:var(--ink-3)}
        .trail-dot{position:absolute;width:10px;height:10px;border-radius:50%;background:var(--accent);opacity:.3;transform:translate(-50%,-50%);pointer-events:none}
        .agent-ball{position:absolute;width:28px;height:28px;border-radius:50%;background:var(--ink);color:#fff;display:grid;place-items:center;font-weight:700;font-size:13px;transform:translate(-50%,-50%);box-shadow:0 2px 6px rgba(0,0,0,.25);z-index:2}
        .info-card{font-family:var(--font-sans)}
        .info-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--rule-soft);font-size:13px}
        .info-row span:first-child{color:var(--ink-3)}
        .info-row b{font-family:var(--font-mono);color:var(--ink)}
        @media(max-width:760px){.rl-body{grid-template-columns:1fr}}
      `}</style>

      <div className="rl-head">
        <div>
          <h3 className="rl-title">强化学习基础：状态、动作、奖励</h3>
          <div className="rl-note">选择动作并执行一步，环境返回新状态 s' 与奖励 r。撞墙/陷阱有惩罚，目标 +1。</div>
        </div>
        <div className="rl-controls">
          {actions.map((a, i) => <button key={a} className={action === i ? 'active' : ''} onClick={() => setAction(i)}>{a}</button>)}
          <button className="primary" onClick={step} disabled={done}>执行</button>
          <button className="ghost" onClick={reset}>重置</button>
        </div>
      </div>

      <div className="rl-body">
        <div className="grid">
          {Array.from({ length: 16 }, (_, i) => {
            const x = i % 4, y = Math.floor(i / 4)
            const isGoal = x === GOAL[0] && y === GOAL[1]
            const isTrap = x === TRAP[0] && y === TRAP[1]
            return <div key={i} className="tile" style={{ background: isGoal ? '#cbe6cb' : isTrap ? '#f3d4cc' : '#fff' }}>
              {isGoal ? '+1' : isTrap ? '−1' : ''}
            </div>
          })}
          {trail.slice(0, -1).map((idx, i) => (
            <div key={i} className="trail-dot" style={{
              left: `${(idx % 4) * 25 + 12.5}%`, top: `${Math.floor(idx / 4) * 25 + 12.5}%`
            }} />
          ))}
          <animated.div className="agent-ball" style={agentSpring}>A</animated.div>
        </div>

        <div className="info-card">
          <div className="info-row"><span>当前状态 s</span><b>({pos[0]},{pos[1]})</b></div>
          <div className="info-row"><span>选择动作 a</span><b>{actions[action]}</b></div>
          <div className="info-row"><span>下一状态 s'</span><b>({next[0]},{next[1]})</b></div>
          <div className="info-row">
            <span>即时奖励 r</span>
            <b style={{ color: reward > 0 ? 'var(--accent)' : reward < -0.05 ? 'var(--rust)' : 'var(--ink-3)' }}>{reward.toFixed(2)}</b>
          </div>
          <div className="info-row"><span>累计奖励 G</span><b>{total.toFixed(3)}</b></div>
          {done && <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 5, background: reward > 0 ? 'var(--accent-soft)' : '#f8e9e2', color: reward > 0 ? 'var(--accent)' : 'var(--rust)', fontSize: 13 }}>
            {reward > 0 ? '🎉 到达目标！累计奖励为正。' : '💀 落入陷阱，回合结束。'}
          </div>}
        </div>
      </div>
    </section>
  )
}

function posToIdx([x, y]: number[]) { return y * 4 + x }
