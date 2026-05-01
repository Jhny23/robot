'use client'
import { useState, useEffect, useRef } from 'react'

const EVENTS = [
  { t:'KERNEL', m:'SYSCALL 59 EXECVE INTERCEPTED', c:'warn' },
  { t:'NET',    m:'TCP SYN → 197.248.3.41:443', c:'info' },
  { t:'AUTH',   m:'HMAC-SHA256 VERIFY OK', c:'success' },
  { t:'MEM',    m:'HEAP ALLOC 0x7fff3a2c CLEAN', c:'info' },
  { t:'DARAJA', m:'OAUTH2 TOKEN REFRESH OK', c:'success' },
  { t:'TX',     m:'INCOMING KES +12,500 // CAROL_M', c:'success' },
  { t:'PROC',   m:'FORK 4721 → CHILD 4722', c:'info' },
  { t:'SEC',    m:'IDS SCAN: 0 ANOMALIES DETECTED', c:'success' },
  { t:'NET',    m:'ESTABLISHED 10.0.0.1 → DARAJA', c:'success' },
  { t:'DISK',   m:'WRITE 4096B SECTOR 0xAF3C', c:'info' },
  { t:'TX',     m:'OUTGOING KES -5,000 // UNCLE_K', c:'warn' },
  { t:'CRYPTO', m:'AES-256 IV ROTATION COMPLETE', c:'success' },
  { t:'DNS',    m:'RESOLVE api.safaricom.co.ke OK', c:'success' },
  { t:'MEM',    m:'GC SWEEP: 12MB FREED', c:'info' },
  { t:'KERNEL', m:'IRQ 14 HANDLED // DISK INT', c:'info' },
  { t:'SEC',    m:'FIREWALL DROP: 45.33.32.156', c:'warn' },
  { t:'DARAJA', m:'STK PUSH CALLBACK RECEIVED', c:'success' },
  { t:'TX',     m:'RECEIPT QK8X2B SETTLED', c:'success' },
]

export default function TerminalLog() {
  const [lines, setLines] = useState<{t:string;m:string;c:string;id:number}[]>([])
  const [idx, setIdx] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const iv = setInterval(() => {
      setLines(p => [...p.slice(-60), { ...EVENTS[idx % EVENTS.length], id: Date.now() }])
      setIdx(i => i + 1)
    }, 1100 + Math.random() * 600)
    return () => clearInterval(iv)
  }, [idx])

  useEffect(() => { if (ref.current) ref.current.scrollTop = ref.current.scrollHeight }, [lines])

  const tc = (t: string) => ({ KERNEL:'#ff6600', NET:'#00ccff', AUTH:'#ffaa00', TX:'#00ff41', SEC:'#ff4400', DARAJA:'#aaff00', CRYPTO:'#cc88ff', MEM:'#007700', DISK:'#007700', PROC:'#006622', DNS:'#00aacc' }[t] || '#006622')
  const mc = (c: string) => ({ success:'#008822', warn:'#886600', error:'#880000', info:'#005522' }[c] || '#005522')

  return (
    <div className="panel" style={{ flex:1, display:'flex', flexDirection:'column', minHeight:200, animation:'fadeRight 0.5s ease 0.5s both' }}>
      <div className="panel-header">
        <span>SYS_LOG // STDOUT</span>
        <span className="blink" style={{ color:'#00ff41', fontSize:7 }}>● PIPE OPEN</span>
      </div>
      <div ref={ref} style={{ flex:1, overflowY:'auto', padding:'6px 10px', fontSize:8, fontFamily:"'Share Tech Mono',monospace" }}>
        {lines.map(l => (
          <div key={l.id} style={{ display:'flex', gap:5, padding:'1.5px 0', animation:'fadeUp 0.2s ease' }}>
            <span style={{ color:tc(l.t), minWidth:42, fontSize:7 }}>[{l.t}]</span>
            <span style={{ color:mc(l.c) }}>{l.m}</span>
          </div>
        ))}
        <span className="blink" style={{ color:'#00ff41', fontSize:9 }}>█</span>
      </div>
    </div>
  )
}
