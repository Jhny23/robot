'use client'
import { useState, useEffect } from 'react'
import Waveform from './Waveform'

const HACKER_METRICS = [
  { l:'THROUGHPUT', v:'2.4 MB/s', delta:'+8.3%', up:true },
  { l:'PACKET_LOSS', v:'0.002%', delta:'-0.001', up:true },
  { l:'ENTROPY_KEY', v:'7.998', delta:'STABLE', up:null },
  { l:'TX_SUCCESS', v:'99.97%', delta:'+0.01', up:true },
]

export default function DataGrid() {
  const [bars, setBars] = useState<number[]>(() => Array.from({length:28},()=>Math.random()*90+10))
  const [sparkline, setSparkline] = useState<number[]>(() => Array.from({length:40},()=>Math.random()*100))

  useEffect(() => {
    const t1 = setInterval(() => setBars(Array.from({length:28},()=>Math.random()*90+10)), 800)
    const t2 = setInterval(() => setSparkline(p => [...p.slice(1), Math.random()*100]), 400)
    return () => { clearInterval(t1); clearInterval(t2) }
  }, [])

  // SVG sparkline path
  const W = 220, H = 36
  const points = sparkline.map((v,i) => `${(i/(sparkline.length-1))*W},${H - (v/100)*H}`).join(' ')

  return (
    <div className="panel" style={{ animation:'fadeUp 0.5s ease 0.6s both' }}>
      <div className="panel-header">
        <span>NETWORK_TELEMETRY</span>
        <span style={{ color:'#007700', fontSize:7 }}>LIVE // 24H WINDOW</span>
      </div>
      <div style={{ padding:'10px' }}>
        {/* Metrics */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:5, marginBottom:10 }}>
          {HACKER_METRICS.map(m => (
            <div key={m.l} style={{ background:'rgba(0,255,65,0.03)', border:'1px solid rgba(0,255,65,0.1)', padding:'7px 6px', textAlign:'center' }}>
              <div style={{ fontSize:6, color:'#005522', letterSpacing:2, marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{m.l}</div>
              <div style={{ fontFamily:"'Orbitron',monospace", fontSize:11, fontWeight:700, color:'#00ff41', textShadow:'0 0 6px #00ff41' }}>{m.v}</div>
              <div style={{ fontSize:7, color: m.up===true?'#aaff00':m.up===false?'#ff3300':'#005522', marginTop:1 }}>{m.delta}</div>
            </div>
          ))}
        </div>

        {/* SVG sparkline */}
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:7, color:'#005522', letterSpacing:2, marginBottom:3 }}>PAYLOAD_THROUGHPUT // LIVE</div>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:'visible' }}>
            <defs>
              <linearGradient id="spfill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff41" stopOpacity="0.25"/>
                <stop offset="100%" stopColor="#00ff41" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <polygon points={`0,${H} ${points} ${W},${H}`} fill="url(#spfill)"/>
            <polyline points={points} fill="none" stroke="#00ff41" strokeWidth="1.5" style={{ filter:'drop-shadow(0 0 3px #00ff41)' }}/>
          </svg>
        </div>

        {/* Waveform signal */}
        <div style={{ marginBottom:8 }}>
          <div style={{ fontSize:7, color:'#005522', letterSpacing:2, marginBottom:3 }}>SIGNAL_SPECTRUM // RECV</div>
          <Waveform height={28} bars={44} color='#00ff4188'/>
        </div>

        {/* Bar chart */}
        <div style={{ fontSize:7, color:'#005522', letterSpacing:2, marginBottom:4 }}>TX_VOLUME // 24H INTERVALS</div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:'2px', height:44 }}>
          {bars.map((v,i) => (
            <div key={i} style={{
              flex:1, height:`${v}%`,
              background: v>80 ? 'linear-gradient(180deg,#aaff00,#446600)' : 'linear-gradient(180deg,#00ff41,#006622)',
              boxShadow: v>80 ? '0 0 5px #aaff0088' : '0 0 2px #00ff4155',
              transition: 'height 0.6s ease', borderRadius:'1px 1px 0 0',
            }}/>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:6, color:'#004411', marginTop:2 }}>
          {['00:00','04:00','08:00','12:00','16:00','20:00','NOW'].map(t=><span key={t}>{t}</span>)}
        </div>
      </div>
    </div>
  )
}
