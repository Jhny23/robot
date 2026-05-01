'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playBeep, playSuccess } from './SoundEngine'

interface ScenarioPoint { day: number; value: number }

const SCENARIOS = [
  {
    id: 'crypto',
    label: 'BTC_HODL',
    color: '#ff9900',
    description: 'Volatile. High reward. High regret.',
    simulate: (start: number) => {
      const pts: ScenarioPoint[] = [{ day: 0, value: start }]
      let v = start
      for (let d = 1; d <= 30; d++) {
        const shock = Math.random() > 0.85 ? (Math.random() - 0.3) * 0.18 : 0
        v = v * (1 + (Math.random() - 0.45) * 0.06 + shock)
        pts.push({ day: d, value: Math.max(v, start * 0.3) })
      }
      return pts
    }
  },
  {
    id: 'stocks',
    label: 'NSE_INDEX',
    color: '#00ccff',
    description: 'Slow grind. Dignified losses.',
    simulate: (start: number) => {
      const pts: ScenarioPoint[] = [{ day: 0, value: start }]
      let v = start
      for (let d = 1; d <= 30; d++) {
        v = v * (1 + (Math.random() - 0.47) * 0.025)
        pts.push({ day: d, value: v })
      }
      return pts
    }
  },
  {
    id: 'savings',
    label: 'M-SHWARI',
    color: '#aaff00',
    description: '7.35% p.a. Boring. Reliable.',
    simulate: (start: number) => {
      const dailyRate = 0.0735 / 365
      return Array.from({ length: 31 }, (_, d) => ({
        day: d,
        value: start * Math.pow(1 + dailyRate, d)
      }))
    }
  },
  {
    id: 'send',
    label: 'SEND_IT',
    color: '#ff3300',
    description: 'Gone. Beautiful. No regrets.',
    simulate: (start: number) => [
      { day: 0, value: start },
      { day: 0, value: 0 },
      ...Array.from({ length: 29 }, (_, d) => ({ day: d + 1, value: 0 }))
    ]
  }
]

export default function SimulationMode({ amount, onSend, onClose }: {
  amount: string
  onSend: () => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState('crypto')
  const [data, setData] = useState<ScenarioPoint[]>([])
  const [animated, setAnimated] = useState(0)
  const [finalValue, setFinalValue] = useState(0)
  const kes = parseFloat(amount.replace(/,/g, '')) || 1000

  const W = 340, H = 120

  useEffect(() => {
    const scenario = SCENARIOS.find(s => s.id === selected)!
    const pts = scenario.simulate(kes)
    setData(pts)
    setFinalValue(pts[pts.length - 1].value)
    setAnimated(0)
    playBeep(660, 0.06, 0.08)
    let i = 0
    const iv = setInterval(() => {
      i += 2
      setAnimated(Math.min(i, pts.length - 1))
      if (i >= pts.length - 1) clearInterval(iv)
    }, 40)
    return () => clearInterval(iv)
  }, [selected, kes])

  const scenario = SCENARIOS.find(s => s.id === selected)!
  const visibleData = data.slice(0, animated + 1)
  const maxVal = Math.max(...data.map(d => d.value), kes)
  const minVal = Math.min(...data.map(d => d.value), 0)
  const range = maxVal - minVal || 1

  const toSVG = (pt: ScenarioPoint) => ({
    x: (pt.day / 30) * (W - 20) + 10,
    y: H - 10 - ((pt.value - minVal) / range) * (H - 20)
  })

  const pathD = visibleData.length > 1
    ? visibleData.map((pt, i) => {
        const { x, y } = toSVG(pt)
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
      }).join(' ')
    : ''

  const areaD = visibleData.length > 1
    ? `${pathD} L ${toSVG(visibleData[visibleData.length-1]).x} ${H-10} L ${toSVG(visibleData[0]).x} ${H-10} Z`
    : ''

  const pnl = finalValue - kes
  const pnlPct = ((pnl / kes) * 100).toFixed(1)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1500,
        background: 'rgba(0,5,0,0.96)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        width: '100%', maxWidth: 480,
        background: '#000d00', border: '1px solid rgba(0,255,65,0.25)',
        boxShadow: '0 0 80px rgba(0,255,65,0.08)',
        overflow: 'hidden', fontFamily: "'Share Tech Mono', monospace"
      }}>
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,255,65,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: '#00ff41', textShadow: '0 0 8px #00ff41', letterSpacing: 3 }}>SIMULATION_MODE</div>
            <div style={{ fontSize: 8, color: '#005522', marginTop: 2 }}>THE WORLD IS A SIMULATION. WHAT IF YOU DIDN&apos;T SEND?</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #005522', color: '#005522', padding: '3px 8px', cursor: 'crosshair', fontFamily: "'Share Tech Mono',monospace", fontSize: 10, transition: 'all 0.15s' }}
            onMouseEnter={e => (e.target as HTMLElement).style.color = '#ff3300'}
            onMouseLeave={e => (e.target as HTMLElement).style.color = '#005522'}>[ESC]</button>
        </div>

        <div style={{ padding: 16 }}>
          {/* Amount display */}
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 9, color: '#005522', letterSpacing: 3, marginBottom: 4 }}>IF YOU KEPT</div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 28, fontWeight: 900, color: '#00ff41', textShadow: '0 0 15px #00ff41' }}>
              KES {kes.toLocaleString()}
            </div>
            <div style={{ fontSize: 8, color: '#005522', marginTop: 2 }}>FOR 30 DAYS</div>
          </div>

          {/* Scenario tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, marginBottom: 12 }}>
            {SCENARIOS.map(s => (
              <button key={s.id} onClick={() => setSelected(s.id)} style={{
                background: selected === s.id ? `rgba(${s.color === '#ff9900' ? '255,153,0' : s.color === '#00ccff' ? '0,204,255' : s.color === '#aaff00' ? '170,255,0' : '255,51,0'},0.12)` : 'transparent',
                border: `1px solid ${selected === s.id ? s.color : 'rgba(0,255,65,0.15)'}`,
                color: selected === s.id ? s.color : '#005522',
                padding: '6px 4px', cursor: 'crosshair',
                fontFamily: "'Share Tech Mono',monospace", fontSize: 7,
                letterSpacing: 1, textAlign: 'center', transition: 'all 0.15s',
                boxShadow: selected === s.id ? `0 0 10px ${s.color}44` : 'none'
              }}>
                {s.label}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 8, color: scenario.color, textAlign: 'center', marginBottom: 10, opacity: 0.8 }}>
            {scenario.description}
          </div>

          {/* Chart */}
          <div style={{ background: 'rgba(0,255,65,0.02)', border: '1px solid rgba(0,255,65,0.08)', padding: 6, marginBottom: 12 }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
              <defs>
                <linearGradient id={`fill-${selected}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={scenario.color} stopOpacity="0.25"/>
                  <stop offset="100%" stopColor={scenario.color} stopOpacity="0.02"/>
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[0.25, 0.5, 0.75].map(f => (
                <line key={f} x1="10" y1={10 + f*(H-20)} x2={W-10} y2={10 + f*(H-20)}
                  stroke="rgba(0,255,65,0.07)" strokeWidth="0.5" strokeDasharray="3,3"/>
              ))}

              {/* Baseline */}
              {(() => {
                const baseY = H - 10 - ((kes - minVal) / range) * (H - 20)
                return <line x1="10" y1={baseY} x2={W-10} y2={baseY} stroke="rgba(0,255,65,0.2)" strokeWidth="0.5" strokeDasharray="4,3"/>
              })()}

              {/* Area fill */}
              {areaD && <path d={areaD} fill={`url(#fill-${selected})`}/>}

              {/* Line */}
              {pathD && <path d={pathD} fill="none" stroke={scenario.color} strokeWidth="1.8" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 3px ${scenario.color})` }}/>}

              {/* Current dot */}
              {visibleData.length > 0 && (() => {
                const last = visibleData[visibleData.length - 1]
                const { x, y } = toSVG(last)
                return (
                  <g>
                    <circle cx={x} cy={y} r="4" fill={scenario.color} opacity="0.9"/>
                    <circle cx={x} cy={y} r="8" fill="none" stroke={scenario.color} strokeWidth="0.8" opacity="0.4"/>
                  </g>
                )
              })()}

              {/* Day labels */}
              {[0, 10, 20, 30].map(d => (
                <text key={d} x={(d/30)*(W-20)+10} y={H} fill="rgba(0,255,65,0.3)" fontSize="6" textAnchor="middle">D{d}</text>
              ))}
            </svg>
          </div>

          {/* Result */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
            {[
              { l: 'FINAL_VALUE', v: `KES ${Math.round(finalValue).toLocaleString()}`, c: scenario.color },
              { l: 'P_AND_L', v: `${pnl >= 0 ? '+' : ''}KES ${Math.round(pnl).toLocaleString()}`, c: pnl >= 0 ? '#00ff41' : '#ff3300' },
              { l: 'RETURN', v: `${pnl >= 0 ? '+' : ''}${pnlPct}%`, c: pnl >= 0 ? '#00ff41' : '#ff3300' },
            ].map(item => (
              <div key={item.l} style={{ background: 'rgba(0,255,65,0.03)', border: '1px solid rgba(0,255,65,0.1)', padding: '8px 6px', textAlign: 'center' }}>
                <div style={{ fontSize: 7, color: '#005522', letterSpacing: 1, marginBottom: 3 }}>{item.l}</div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 700, color: item.c, textShadow: `0 0 6px ${item.c}` }}>{item.v}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={onClose} style={{
              background: 'transparent', border: '1px solid rgba(0,255,65,0.3)',
              color: '#007700', padding: 12, cursor: 'crosshair',
              fontFamily: "'Share Tech Mono',monospace", fontSize: 10, letterSpacing: 2, transition: 'all 0.15s'
            }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = '#00ff41'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = '#007700'}>
              ← HOLD IT
            </button>
            <button onClick={() => { playSuccess(); onSend() }} style={{
              background: '#ff330022', border: '1px solid rgba(255,51,0,0.5)',
              color: '#ff3300', padding: 12, cursor: 'crosshair',
              fontFamily: "'Orbitron',monospace", fontSize: 10, fontWeight: 700, letterSpacing: 2,
              transition: 'all 0.15s', boxShadow: '0 0 15px rgba(255,51,0,0.1)'
            }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = '#ff330044'; (e.target as HTMLElement).style.boxShadow = '0 0 30px rgba(255,51,0,0.3)' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = '#ff330022'; (e.target as HTMLElement).style.boxShadow = '0 0 15px rgba(255,51,0,0.1)' }}>
              SEND ANYWAY ✕
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
