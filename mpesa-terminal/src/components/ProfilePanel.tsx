'use client'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const HACKER_STATUS = ['ROOT_ACCESS', 'ELEVATED', 'CLASSIFIED', 'KERNEL_MODE', 'SHADOW_MODE']

export default function ProfilePanel() {
  const [status, setStatus] = useState(HACKER_STATUS[0])
  const [entropy, setEntropy] = useState('A7F3...C12E')
  const [scanY, setScanY] = useState(0)

  useEffect(() => {
    const t1 = setInterval(() => setStatus(HACKER_STATUS[Math.floor(Math.random() * HACKER_STATUS.length)]), 5000)
    const t2 = setInterval(() => setEntropy(Math.random().toString(16).slice(2,6).toUpperCase()+'...'+Math.random().toString(16).slice(2,6).toUpperCase()), 2000)
    const t3 = setInterval(() => setScanY(p => (p + 2) % 100), 25)
    return () => { clearInterval(t1); clearInterval(t2); clearInterval(t3) }
  }, [])

  return (
    <div className="panel" style={{ animation:'fadeUp 0.5s ease 0.1s both' }}>
      <div className="panel-header">
        <span>SUBJECT_PROFILE</span>
        <span style={{ color:'#aaff00', fontSize:7 }}>TIER-4</span>
      </div>
      <div style={{ padding:'12px' }}>
        {/* Photo with corner brackets */}
        <div style={{ position:'relative', width:80, height:80, margin:'0 auto 10px' }}>
          <div style={{ position:'absolute', width:10, height:10, top:-3, left:-3, borderTop:'1px solid #00ff41', borderLeft:'1px solid #00ff41' }}/>
          <div style={{ position:'absolute', width:10, height:10, top:-3, right:-3, borderTop:'1px solid #00ff41', borderRight:'1px solid #00ff41' }}/>
          <div style={{ position:'absolute', width:10, height:10, bottom:-3, left:-3, borderBottom:'1px solid #00ff41', borderLeft:'1px solid #00ff41' }}/>
          <div style={{ position:'absolute', width:10, height:10, bottom:-3, right:-3, borderBottom:'1px solid #00ff41', borderRight:'1px solid #00ff41' }}/>
          <div style={{ width:80, height:80, overflow:'hidden', border:'1px solid rgba(0,255,65,0.3)', position:'relative' }}>
            <Image src="/images/profile.jpg" alt="Subject" fill style={{ objectFit:'cover', objectPosition:'center top', filter:'sepia(0.1) hue-rotate(65deg) saturate(0.55) brightness(0.75) contrast(1.15)' }}/>
            <div style={{ position:'absolute', left:0, right:0, height:2, background:'rgba(0,255,65,0.35)', top:`${scanY}%`, pointerEvents:'none' }}/>
            <div style={{ position:'absolute', inset:0, background:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.18) 3px,rgba(0,0,0,0.18) 4px)', pointerEvents:'none' }}/>
          </div>
        </div>

        <div style={{ textAlign:'center', marginBottom:10 }}>
          <div style={{ fontFamily:"'Orbitron',monospace", fontSize:13, fontWeight:900, color:'#00ff41', textShadow:'0 0 10px #00ff41', letterSpacing:2 }}>W. WHITE</div>
          <div style={{ fontSize:8, color:'#005522', letterSpacing:1, marginTop:1 }}>A.K.A. HEISENBERG</div>
          <div style={{ marginTop:5, display:'inline-block', background:'rgba(0,255,65,0.08)', border:'1px solid rgba(0,255,65,0.25)', padding:'2px 8px', fontSize:7, color:'#00ff41', letterSpacing:2 }}>
            ● {status}
          </div>
        </div>

        <div style={{ borderTop:'1px solid rgba(0,255,65,0.08)', paddingTop:8 }}>
          {[
            ['SUBNET', '10.0.0.1/24'],
            ['SESSION', entropy],
            ['CLEARANCE', 'ICN-007'],
            ['LOCATION', '[REDACTED]'],
          ].map(([k, v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:8, padding:'2px 0' }}>
              <span style={{ color:'#004411' }}>{k}</span>
              <span style={{ color: v.includes('REDACT') ? '#ff6600' : '#00cc33' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
