'use client'
import { useState, useEffect } from 'react'
import { playClick } from './SoundEngine'

const HACKER_TERMS = [
  'EXECUTING PAYLOAD', 'SCANNING PORTS', 'BYPASSING FIREWALL', 'INJECTING SHELLCODE',
  'DECRYPTING HASH', 'ENUMERATING NODES', 'PROXYING TRAFFIC', 'PATCHING KERNEL',
  'FORKING PROCESS', 'MOUNTING VOLUME', 'FLUSHING DNS', 'SPAWNING SHELL',
]

export default function StatusBar() {
  const [time, setTime] = useState({ date: '', clock: '', utc: '' })
  const [term, setTerm] = useState(HACKER_TERMS[0])
  const [tab, setTab] = useState('STAT')
  const [ping, setPing] = useState(23)
  const tabs = ['STAT', 'INV', 'DATA', 'MAP', 'RADIO']

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const days = ['SUN','MON','TUE','WED','THU','FRI','SAT']
      const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']
      setTime({
        date: `${days[now.getDay()]} ${String(now.getDate()).padStart(2,'0')} ${months[now.getMonth()]} ${now.getFullYear()}`,
        clock: `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`,
        utc: `UTC+${String(-now.getTimezoneOffset()/60).replace('-','').padStart(2,'0')}`,
      })
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setTerm(HACKER_TERMS[Math.floor(Math.random() * HACKER_TERMS.length)])
      setPing(16 + Math.floor(Math.random() * 14))
    }, 3200)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '44px', zIndex: 500,
      background: 'rgba(0,6,0,0.97)',
      borderBottom: '1px solid rgba(0,255,65,0.2)',
      display: 'flex', alignItems: 'stretch',
      fontFamily: "'Share Tech Mono', monospace",
    }}>
      {/* Logo */}
      <div style={{ padding: '0 16px', display:'flex', alignItems:'center', gap:'8px', borderRight:'1px solid rgba(0,255,65,0.1)', flexShrink:0 }}>
        <div style={{ width:6, height:6, background:'#00ff41', borderRadius:'50%', boxShadow:'0 0 8px #00ff41', animation:'blink 2s step-end infinite' }} />
        <span style={{ fontFamily:"'Orbitron',monospace", fontWeight:900, fontSize:13, color:'#00ff41', textShadow:'0 0 12px #00ff41', letterSpacing:2 }}>MR ROBOT</span>
        <span style={{ color:'#003a00', fontSize:8 }}>v2.4</span>
      </div>

      {/* Nav tabs */}
      <div style={{ display:'flex', alignItems:'stretch', borderRight:'1px solid rgba(0,255,65,0.1)' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => { setTab(t); playClick() }} style={{
            background: tab===t ? 'rgba(0,255,65,0.08)' : 'transparent',
            border: 'none', borderRight: '1px solid rgba(0,255,65,0.07)',
            color: tab===t ? '#00ff41' : '#006622',
            padding: '0 14px', cursor: 'crosshair',
            fontFamily: "'Share Tech Mono',monospace", fontSize: 9, letterSpacing: 2,
            textShadow: tab===t ? '0 0 8px #00ff41' : 'none',
            transition: 'all 0.15s',
          }}>
            {t}
          </button>
        ))}
      </div>

      {/* Hacker term ticker */}
      <div style={{ padding:'0 14px', display:'flex', alignItems:'center', borderRight:'1px solid rgba(0,255,65,0.07)', flexShrink:0 }}>
        <span style={{ fontSize:8, color:'#005522', letterSpacing:2 }}>{term}</span>
        <span className="blink" style={{ color:'#00ff41', marginLeft:4, fontSize:10 }}>▮</span>
      </div>

      {/* Right side */}
      <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:0, padding:'0 0 0 0', borderLeft:'1px solid rgba(0,255,65,0.07)' }}>
        {/* Live clock */}
        <div style={{ padding:'0 14px', borderRight:'1px solid rgba(0,255,65,0.07)', textAlign:'center' }}>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:14, fontWeight:700, color:'#00ff41', textShadow:'0 0 10px #00ff41', letterSpacing:2, lineHeight:1.2 }}>{time.clock}</div>
          <div style={{ fontSize:7, color:'#005522', letterSpacing:1 }}>{time.date} // {time.utc}</div>
        </div>

        <div style={{ padding:'0 12px', display:'flex', gap:14, alignItems:'center', fontSize:8, color:'#005522' }}>
          <span>PING:<span style={{ color:'#00ff41', marginLeft:3 }}>{ping}ms</span></span>
          <span>NODES:<span style={{ color:'#00ff41', marginLeft:3 }}>247</span></span>
          <span>GPS:<span style={{ color:'#00ff41', marginLeft:3 }}>-1.292°N</span></span>
          <span>ENC:<span style={{ color:'#aaff00', marginLeft:3 }}>AES-256</span></span>
        </div>

        {/* Gear */}
        <div style={{ padding:'0 12px', display:'flex', alignItems:'center', color:'#004411', fontSize:16, borderLeft:'1px solid rgba(0,255,65,0.07)' }}>
          <span style={{ display:'inline-block', animation:'spin 8s linear infinite' }}>⚙</span>
        </div>
      </div>
    </div>
  )
}
